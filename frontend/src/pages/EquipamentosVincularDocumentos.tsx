import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { LucideIcon } from "../components/LucideIcon";
import { getAuthUser } from "../lib/auth";
import {
  getMe,
  linkDocumentEquipment,
  listDocumentEquipments,
  listDocuments,
  unlinkDocumentEquipment
} from "../lib/api";
import { Equipamentos } from "./Equipamentos";
import "../styles/documentos.css";
import "../styles/documentos-vincular.css";

export function EquipamentosVincularDocumentos() {
  const authUser = getAuthUser();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const equipmentId = searchParams.get("id") ?? "";
  const [documents, setDocuments] = useState<
    Array<{ id: string; title: string; category: string }>
  >([]);
  const [links, setLinks] = useState<Array<{ document_id: string; equipment_id: string }>>(
    []
  );
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [query, setQuery] = useState("");
  const [categoryQuery, setCategoryQuery] = useState("");
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [tenantId, setTenantId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    let isMounted = true;
    Promise.all([getMe(), listDocuments(), listDocumentEquipments()])
      .then(([me, docs, linkList]) => {
        if (!isMounted) return;
        setTenantId(me.profile?.tenant_id ?? null);
        setDocuments(docs);
        setLinks(
          linkList.map((link) => ({
            document_id: link.document_id,
            equipment_id: link.equipment_id
          }))
        );
      })
      .catch((err) => {
        if (!isMounted) return;
        setError(err instanceof Error ? err.message : "Falha ao carregar dados.");
      });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!equipmentId) return;
    const selected = links
      .filter((link) => link.equipment_id === equipmentId)
      .map((link) => link.document_id);
    setSelectedIds(selected);
  }, [equipmentId, links]);

  const categoryOptions = useMemo(() => {
    const unique = Array.from(new Set(documents.map((doc) => doc.category))).sort();
    return unique;
  }, [documents]);

  const filteredDocuments = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    const categoryNormalized = categoryQuery.trim().toLowerCase();
    return documents.filter((doc) => {
      const haystack = `${doc.title} ${doc.category}`.toLowerCase();
      const matchesQuery = normalized ? haystack.includes(normalized) : true;
      const matchesCategory = categoryNormalized
        ? doc.category.toLowerCase().includes(categoryNormalized)
        : true;
      return matchesQuery && matchesCategory;
    });
  }, [documents, query, categoryQuery]);

  const toggleDocument = (documentId: string) => {
    setSelectedIds((prev) =>
      prev.includes(documentId)
        ? prev.filter((item) => item !== documentId)
        : [...prev, documentId]
    );
  };

  const handleSave = async () => {
    if (!equipmentId) return;
    if (!tenantId) {
      setError("Tenant nao encontrado no perfil.");
      return;
    }
    setError("");
    setIsSaving(true);
    try {
      const existingIds = links
        .filter((link) => link.equipment_id === equipmentId)
        .map((link) => link.document_id);
      const toAdd = selectedIds.filter((documentId) => !existingIds.includes(documentId));
      const toRemove = existingIds.filter((documentId) => !selectedIds.includes(documentId));

      if (toRemove.length > 0) {
        await Promise.all(
          toRemove.map((documentId) =>
            unlinkDocumentEquipment({ document_id: documentId, equipment_ids: [equipmentId] })
          )
        );
      }
      if (toAdd.length > 0) {
        await Promise.all(
          toAdd.map((documentId) =>
            linkDocumentEquipment({
              document_id: documentId,
              equipment_id: equipmentId,
              tenant_id: tenantId
            })
          )
        );
      }
      navigate(`/equipamentos/detalhes?id=${equipmentId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao salvar vinculos.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="documentos-vincular">
      <Equipamentos />

      <div className="documentos-modal-backdrop" aria-hidden="true" />

      <section
        className="documentos-vincular-modal"
        role="dialog"
        aria-label="Vincular documentos"
      >
        <header className="documentos-vincular-header">
          <h2>Vincular documentos ao equipamento</h2>
          <Link
            className="documentos-modal-close"
            to={`/equipamentos/detalhes?id=${equipmentId}`}
            aria-label="Fechar"
          >
            <LucideIcon name="x" className="documentos-modal-close-icon" />
          </Link>
        </header>

        <div className="documentos-vincular-body">
          <p className="documentos-vincular-text">
            Selecione um ou mais documentos para vincular ao equipamento.
          </p>
          <div className="documentos-vincular-search">
            <LucideIcon name="search" className="documentos-vincular-search-icon" />
            <input
              type="text"
              placeholder="Buscar por titulo ou categoria"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </div>
          <div className="documentos-vincular-search documentos-vincular-search-dropdown">
            <LucideIcon name="search" className="documentos-vincular-search-icon" />
            <input
              type="text"
              placeholder="Filtrar por categoria"
              value={categoryQuery}
              onChange={(event) => setCategoryQuery(event.target.value)}
              onFocus={() => setShowCategoryDropdown(true)}
              onBlur={() => setTimeout(() => setShowCategoryDropdown(false), 120)}
            />
          </div>
          {showCategoryDropdown ? (
            <div className="documentos-vincular-dropdown">
              <button
                className="documentos-vincular-dropdown-item"
                type="button"
                onMouseDown={() => setCategoryQuery("")}
              >
                Todas as categorias
              </button>
              {categoryOptions
                .filter((category) =>
                  category.toLowerCase().includes(categoryQuery.toLowerCase())
                )
                .map((category) => (
                  <button
                    className="documentos-vincular-dropdown-item"
                    type="button"
                    key={category}
                    onMouseDown={() => setCategoryQuery(category)}
                  >
                    {category}
                  </button>
                ))}
              {categoryOptions.length === 0 ? (
                <span className="documentos-vincular-empty">Nenhuma categoria encontrada.</span>
              ) : null}
            </div>
          ) : null}
          <div className="documentos-vincular-options">
            {filteredDocuments.map((doc) => (
              <label className="documentos-check" key={doc.id}>
                <input
                  type="checkbox"
                  checked={selectedIds.includes(doc.id)}
                  onChange={() => toggleDocument(doc.id)}
                />
                {doc.title} <span className="documentos-check-muted">({doc.category})</span>
              </label>
            ))}
            {filteredDocuments.length === 0 ? (
              <span className="documentos-vincular-empty">Nenhum documento encontrado.</span>
            ) : null}
          </div>
          {error ? <p className="documentos-error">{error}</p> : null}
        </div>

        <footer className="documentos-vincular-footer">
          <Link className="documentos-modal-cancel" to={`/equipamentos/detalhes?id=${equipmentId}`}>
            Cancelar
          </Link>
          <button
            className="documentos-vincular-save"
            type="button"
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? "Salvando..." : "Salvar vinculos"}
          </button>
        </footer>
      </section>
    </div>
  );
}
