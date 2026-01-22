import type { Request, Response } from "express";
import { z } from "zod";
import { loadAuditConfig } from "../lib/audit-config.js";
import { chunkText, createEmbeddings } from "../lib/embeddings.js";
import {
  createAuditRun,
  finishAuditRun,
  getAuditConfigMeta,
  insertAuditItemEvidenceExclusion,
  insertAuditItemEvidence,
  insertAuditResults,
  listAuditConfigItems,
  listAuditEvidencesForItems,
  listAuditItemEvidences,
  listAuditItemEvidenceIds,
  listAuditItemEvidenceExclusions,
  listLatestAuditResults,
  upsertAuditConfigItems,
  upsertAuditConfigMeta
} from "../repositories/audit-pasta1-repo.js";
import {
  clearDocumentChunks,
  insertDocumentChunks,
  searchDocumentChunks
} from "../repositories/document-chunks-repo.js";

const evidenceSchema = z.object({
  item_id: z.string(),
  document_id: z.string().uuid(),
  tipo_evidencia: z.string().min(1),
  observacao: z.string().optional().nullable()
});

const evidenceDeleteSchema = z.object({
  id: z.string().uuid()
});

const normalize = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

const includesKeyword = (text: string, keywords: string[]) => {
  const normalized = normalize(text);
  return keywords.some((keyword) => normalized.includes(normalize(keyword)));
};

const scoreToStatus = (score: number) => {
  if (score >= 80) return "PROVAVELMENTE_ATENDIDO";
  if (score >= 40) return "PROVAVELMENTE_PARCIAL";
  if (score === 0) return "PROVAVELMENTE_PENDENTE";
  return "INCONCLUSIVO";
};

const getTenantId = async (req: Request) => {
  const client = req.supabase;
  if (!client) return null;
  const { data: userData } = await client.auth.getUser();
  if (!userData?.user) return null;
  const { data: profile } = await client
    .from("profiles")
    .select("tenant_id")
    .eq("id", userData.user.id)
    .single();
  return profile?.tenant_id ?? null;
};

const syncConfig = async (req: Request) => {
  const client = req.supabase;
  if (!client) throw new Error("Missing supabase client");
  const config = await loadAuditConfig();
  const existingMeta = await getAuditConfigMeta(client);
  if (!existingMeta || existingMeta.config_hash !== config.config_hash) {
    await upsertAuditConfigMeta(client, {
      config_hash: config.config_hash,
      config_version: config.config_version,
      engine: config.engine
    });
    const items = config.items.map((item) => ({
      item_id: item.item_id,
      pasta: item.pasta,
      categoria: item.categoria,
      nome: item.nome,
      requisitos_minimos: item.requisitos_minimos ?? [],
      campos_obrigatorios: item.campos_obrigatorios ?? [],
      evidencias_esperadas: item.evidencias_esperadas ?? [],
      palavras_chave: item.palavras_chave ?? [],
      raw: item,
      config_hash: config.config_hash
    }));
    await upsertAuditConfigItems(client, items);
  }
  return listAuditConfigItems(client);
};

const autoLinkDocuments = async (req: Request, items: Awaited<ReturnType<typeof listAuditConfigItems>>) => {
  const client = req.supabase;
  if (!client) throw new Error("Missing supabase client");
  const tenantId = await getTenantId(req);
  if (!tenantId) return;

  const { data: documents } = await client
    .from("documents")
    .select("id,title,category,tenant_id")
    .eq("tenant_id", tenantId);

  type DocumentRow = { id: string; title: string | null; category: string | null; tenant_id: string };
  const documentsById = new Map((documents ?? []).map((doc) => [doc.id, doc as DocumentRow]));

  const { data: versions } = await client
    .from("document_versions")
    .select("document_id,file_name")
    .eq("tenant_id", tenantId);

  const fileNameByDoc = new Map<string, string>();
  (versions ?? []).forEach((version) => {
    if (version.file_name) fileNameByDoc.set(version.document_id, version.file_name);
  });

  await Promise.all(
    items.map(async (item) => {
      const existingDocIds = new Set(await listAuditItemEvidenceIds(client, item.item_id));
      const excludedDocIds = new Set(
        await listAuditItemEvidenceExclusions(client, tenantId, item.item_id)
      );
      const keywordsToMatch =
        item.palavras_chave && item.palavras_chave.length > 0
          ? item.palavras_chave
          : [item.nome];

      const matches = (documents ?? []).filter((doc) => {
        const fileName = fileNameByDoc.get(doc.id) ?? "";
        const blob = `${doc.title ?? ""} ${doc.category ?? ""} ${fileName}`;
        return !excludedDocIds.has(doc.id) && includesKeyword(blob, keywordsToMatch);
      });

      const ragDocIds = new Set<string>();
      try {
        const query = `${item.nome}. ${item.categoria}. ${item.palavras_chave?.join(", ") ?? ""}`;
        const [embedding] = await createEmbeddings([query]);
        const chunks = await searchDocumentChunks(client, tenantId, embedding, 5);
        chunks
          .filter((chunk) => chunk.similarity >= 0.75)
          .forEach((chunk) => {
            if (!excludedDocIds.has(chunk.document_id)) ragDocIds.add(chunk.document_id);
          });
      } catch {
        // ignore rag fallback
      }

      const matchedDocs = new Map<string, DocumentRow>();
      matches.forEach((doc) => matchedDocs.set(doc.id, doc));
      ragDocIds.forEach((docId) => {
        const doc = documentsById.get(docId);
        if (doc) matchedDocs.set(doc.id, doc);
      });

      if (matchedDocs.size === 0) return;

      const inserts = Array.from(matchedDocs.values())
        .filter((doc) => !existingDocIds.has(doc.id))
        .map((doc) => ({
          item_id: item.item_id,
          document_id: doc.id,
          tipo_evidencia: "Auto",
          observacao: "Vinculo automatico por nome/categoria/conteudo.",
          tenant_id: tenantId
        }));
      if (inserts.length === 0) return;
      await client.from("audit_item_evidences").insert(inserts);
    })
  );
};

export const getAuditPasta1Config = async (req: Request, res: Response) => {
  const client = req.supabase;
  if (!client) return res.status(500).json({ error: "Missing supabase client" });
  const items = await syncConfig(req);
  await autoLinkDocuments(req, items);
  const meta = await getAuditConfigMeta(client);
  res.json({ data: { meta, items } });
};

export const getAuditPasta1Results = async (req: Request, res: Response) => {
  const client = req.supabase;
  if (!client) return res.status(500).json({ error: "Missing supabase client" });
  const tenantId = await getTenantId(req);
  if (!tenantId) return res.status(400).json({ error: "Tenant nao encontrado." });
  const data = await listLatestAuditResults(client, tenantId);
  res.json({ data });
};

export const postAuditPasta1Evidence = async (req: Request, res: Response) => {
  const client = req.supabase;
  if (!client) return res.status(500).json({ error: "Missing supabase client" });
  const tenantId = await getTenantId(req);
  if (!tenantId) return res.status(400).json({ error: "Tenant nao encontrado." });
  const payload = evidenceSchema.parse(req.body);
  const evidence = await insertAuditItemEvidence(client, {
    item_id: payload.item_id,
    document_id: payload.document_id,
    tipo_evidencia: payload.tipo_evidencia,
    observacao: payload.observacao ?? null,
    tenant_id: tenantId
  });
  res.status(201).json({ data: evidence });
};

export const deleteAuditPasta1Evidence = async (req: Request, res: Response) => {
  const client = req.supabase;
  if (!client) return res.status(500).json({ error: "Missing supabase client" });
  const tenantId = await getTenantId(req);
  if (!tenantId) return res.status(400).json({ error: "Tenant nao encontrado." });
  const payload = evidenceDeleteSchema.parse({
    id: req.body?.id ?? req.query?.id
  });
  const { data, error } = await client
    .from("audit_item_evidences")
    .delete()
    .eq("id", payload.id)
    .eq("tenant_id", tenantId)
    .select("id,item_id,document_id,tipo_evidencia")
    .maybeSingle();
  if (error) return res.status(400).json({ error: error.message });
  if (!data) return res.status(404).json({ error: "Vinculo nao encontrado." });
  if (data.tipo_evidencia?.toLowerCase() === "auto") {
    await insertAuditItemEvidenceExclusion(client, {
      tenant_id: tenantId,
      item_id: data.item_id,
      document_id: data.document_id,
      reason: "Removido manualmente"
    });
  }
  res.status(204).send();
};

export const getAuditPasta1Evidences = async (req: Request, res: Response) => {
  const client = req.supabase;
  if (!client) return res.status(500).json({ error: "Missing supabase client" });
  const itemId = z.string().parse(req.query.item_id);
  const evidences = await listAuditItemEvidences(client, itemId);
  res.json({ data: evidences });
};

export const runAuditPasta1 = async (req: Request, res: Response) => {
  const client = req.supabase;
  if (!client) return res.status(500).json({ error: "Missing supabase client" });
  const tenantId = await getTenantId(req);
  if (!tenantId) return res.status(400).json({ error: "Tenant nao encontrado." });

  const items = await syncConfig(req);
  const itemIds = items.map((item) => item.item_id);
  const evidences = await listAuditEvidencesForItems(client, itemIds);
  const { data: allDocuments } = await client
    .from("documents")
    .select("id,title,category,tenant_id")
    .eq("tenant_id", tenantId);
  const { data: companyProfile } = await client
    .from("company_profiles")
    .select("*")
    .eq("tenant_id", tenantId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const startedAt = new Date().toISOString();
  const run = await createAuditRun(client, {
    tenant_id: tenantId,
    status: "executando",
    started_at: startedAt,
    finished_at: null
  });

  const results = await Promise.all(
    items.map(async (item) => {
    if (item.item_id === "1.1") {
      const requiredMap: Record<string, boolean> = {
        empresa: Boolean(companyProfile?.legal_name || companyProfile?.trade_name),
        cnpj: Boolean(companyProfile?.cnpj),
        endereco: Boolean(
          companyProfile?.address_street ||
            companyProfile?.address_city ||
            companyProfile?.address_state ||
            companyProfile?.address_zip
        ),
        unidade: Boolean(companyProfile?.trade_name || companyProfile?.address_city),
        contato: Boolean(companyProfile?.email || companyProfile?.phone)
      };
      const itensAtendidos = item.campos_obrigatorios.filter((field) => requiredMap[field]);
      const itensFaltantes = item.campos_obrigatorios.filter((field) => !requiredMap[field]);
      const score = Math.round((itensAtendidos.length / item.campos_obrigatorios.length) * 100);
      return {
        run_id: run.id,
        item_id: item.item_id,
        status: scoreToStatus(score),
        score_percentual: Number.isFinite(score) ? score : 0,
        itens_atendidos: itensAtendidos,
        itens_faltantes: itensFaltantes,
        riscos_identificados: [],
        inconsistencias: companyProfile ? [] : ["Cadastro de empresa nao encontrado."],
        recomendacoes: itensFaltantes.length
          ? ["Completar dados cadastrais obrigatorios."]
          : [],
        trechos_evidencia: companyProfile
          ? ["Cadastro de empresa registrado no sistema."]
          : []
      };
    }

    const itemEvidences = evidences.filter((evidence) => evidence.item_id === item.item_id);
    const keywordMatches = (allDocuments ?? []).filter((doc) =>
      includesKeyword(`${doc.title ?? ""} ${doc.category ?? ""}`, item.palavras_chave ?? [])
    );
    let ragMatches: string[] = [];
    try {
      const query = `${item.nome}. ${item.categoria}. ${item.palavras_chave?.join(", ") ?? ""}`;
      const [embedding] = await createEmbeddings([query]);
      const chunks = await searchDocumentChunks(client, tenantId, embedding, 3);
      ragMatches = chunks.map((chunk) => chunk.content.slice(0, 220));
    } catch {
      ragMatches = [];
    }
    const combinedEvidenceCount = itemEvidences.length + keywordMatches.length + ragMatches.length;
    if (itemEvidences.length === 0) {
      if (keywordMatches.length === 0 && ragMatches.length === 0) {
        return {
          run_id: run.id,
          item_id: item.item_id,
          status: "PROVAVELMENTE_PENDENTE",
          score_percentual: 0,
          itens_atendidos: [],
          itens_faltantes: item.requisitos_minimos,
          riscos_identificados: [],
          inconsistencias: [],
          recomendacoes: ["Vincular pelo menos uma evidência para este item."],
          trechos_evidencia: []
        };
      }
    }

    const keywords = item.palavras_chave ?? [];
    const matchedKeywords = new Set<string>();
    const trechoList = [
      ...itemEvidences.map((evidence) => {
        const doc = evidence.documents;
        if (doc?.title && includesKeyword(doc.title, keywords)) {
          keywords.forEach((keyword) => {
            if (includesKeyword(doc.title ?? "", [keyword])) matchedKeywords.add(keyword);
          });
        }
        if (doc?.category && includesKeyword(doc.category, keywords)) {
          keywords.forEach((keyword) => {
            if (includesKeyword(doc.category ?? "", [keyword])) matchedKeywords.add(keyword);
          });
        }
        return `Documento: ${doc?.title ?? evidence.document_id} (${evidence.tipo_evidencia})`;
      }),
      ...keywordMatches.map((doc) => {
        if (doc.title && includesKeyword(doc.title, keywords)) {
          keywords.forEach((keyword) => {
            if (includesKeyword(doc.title ?? "", [keyword])) matchedKeywords.add(keyword);
          });
        }
        if (doc.category && includesKeyword(doc.category, keywords)) {
          keywords.forEach((keyword) => {
            if (includesKeyword(doc.category ?? "", [keyword])) matchedKeywords.add(keyword);
          });
        }
        return `Documento: ${doc.title} (palavra-chave)`;
      }),
      ...ragMatches.map((chunk) => `Trecho encontrado: ${chunk}`)
    ];

    const keywordScore = keywords.length
      ? Math.round((matchedKeywords.size / keywords.length) * 30)
      : 0;
    const baseScore = combinedEvidenceCount > 0 ? 60 : 0;
    const score = Math.min(100, baseScore + keywordScore);
    return {
      run_id: run.id,
      item_id: item.item_id,
      status: scoreToStatus(score),
      score_percentual: score,
      itens_atendidos: item.evidencias_esperadas,
      itens_faltantes: [],
      riscos_identificados: [],
      inconsistencias: matchedKeywords.size === 0 ? ["Evidencias sem palavras-chave."] : [],
      recomendacoes:
        matchedKeywords.size === 0
          ? ["Revisar tags/nomes para refletir palavras-chave do item."]
          : [],
      trechos_evidencia: trechoList
    };
    })
  );

  const finishedAt = new Date().toISOString();
  await finishAuditRun(client, run.id, { status: "finalizado", finished_at: finishedAt });
  const saved = await insertAuditResults(client, results);

  res.json({ data: { run_id: run.id, results: saved } });
};

export const postAuditPasta1Index = async (req: Request, res: Response) => {
  const client = req.supabase;
  if (!client) return res.status(500).json({ error: "Missing supabase client" });
  const tenantId = await getTenantId(req);
  if (!tenantId) return res.status(400).json({ error: "Tenant nao encontrado." });
  const { data: documents, error } = await client
    .from("documents")
    .select("id,title,category,tenant_id")
    .eq("tenant_id", tenantId);
  if (error) return res.status(400).json({ error: error.message });

  const { data: versions } = await client
    .from("document_versions")
    .select("document_id,file_name")
    .eq("tenant_id", tenantId);

  const versionByDoc = new Map<string, string>();
  (versions ?? []).forEach((version) => {
    if (version.file_name) versionByDoc.set(version.document_id, version.file_name);
  });

  await clearDocumentChunks(client, tenantId);

  const chunkRows: Array<{
    tenant_id: string;
    document_id: string;
    chunk_index: number;
    content: string;
    embedding: number[];
    source: Record<string, unknown>;
  }> = [];

  const texts = (documents ?? []).map((doc) => {
    const fileName = versionByDoc.get(doc.id) ?? "";
    return `${doc.title ?? ""}\n${doc.category ?? ""}\n${fileName}`.trim();
  });

  const embeddings = await createEmbeddings(texts);

  (documents ?? []).forEach((doc, index) => {
    const fileName = versionByDoc.get(doc.id) ?? "";
    const baseText = `${doc.title ?? ""}\n${doc.category ?? ""}\n${fileName}`.trim();
    const chunks = chunkText(baseText);
    if (chunks.length === 0) return;
    chunks.forEach((chunk, chunkIndex) => {
      chunkRows.push({
        tenant_id: tenantId,
        document_id: doc.id,
        chunk_index: chunkIndex,
        content: chunk,
        embedding: embeddings[index],
        source: {
          title: doc.title,
          category: doc.category,
          file_name: fileName
        }
      });
    });
  });

  await insertDocumentChunks(client, chunkRows);
  res.json({ data: { indexed: chunkRows.length } });
};
