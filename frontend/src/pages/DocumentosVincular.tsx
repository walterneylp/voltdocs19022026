import { Link, useNavigate, useParams } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { LucideIcon } from "../components/LucideIcon";
import { getAuthUser } from "../lib/auth";
import {
  getMe,
  linkDocumentEquipment,
  listAssets,
  listDocumentEquipments,
  listDocuments,
  unlinkDocumentEquipment
} from "../lib/api";
import { Documentos } from "./Documentos";
import "../styles/documentos.css";
import "../styles/documentos-vincular.css";

export function DocumentosVincular() {
  const authUser = getAuthUser();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [documents, setDocuments] = useState<
    Array<{ id: string; title: string; category: string }>
  >([]);
  const [assets, setAssets] = useState<Array<{ id: string; tag: string; name: string }>>(
    []
  );
  const [links, setLinks] = useState<Array<{ document_id: string; equipment_id: string }>>(
    []
  );
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [query, setQuery] = useState("");
  const [tenantId, setTenantId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    let isMounted = true;
    Promise.all([getMe(), listDocuments(), listAssets(), listDocumentEquipments()])
      .then(([me, docs, assetList, linkList]) => {
        if (!isMounted) return;
        setTenantId(me.profile?.tenant_id ?? null);
        setDocuments(docs);
        setAssets(assetList);
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
    if (!id) return;
    const selected = links
      .filter((link) => link.document_id === id)
      .map((link) => link.equipment_id);
    setSelectedIds(selected);
  }, [id, links]);

  const doc = useMemo(
    () => documents.find((item) => item.id === id),
    [documents, id]
  );

  const filteredAssets = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return assets;
    return assets.filter((asset) => {
      const haystack = `${asset.tag} ${asset.name}`.toLowerCase();
      return haystack.includes(normalized);
    });
  }, [assets, query]);

  const toggleEquipment = (equipmentId: string) => {
    setSelectedIds((prev) =>
      prev.includes(equipmentId)
        ? prev.filter((item) => item !== equipmentId)
        : [...prev, equipmentId]
    );
  };

  const handleSave = async () => {
    if (!id) return;
    if (!tenantId) {
      setError("Tenant nao encontrado no perfil.");
      return;
    }
    setError("");
    setIsSaving(true);
    try {
      const existingIds = links
        .filter((link) => link.document_id === id)
        .map((link) => link.equipment_id);
      const toAdd = selectedIds.filter((equipmentId) => !existingIds.includes(equipmentId));
      const toRemove = existingIds.filter(
        (equipmentId) => !selectedIds.includes(equipmentId)
      );

      if (toRemove.length > 0) {
        await unlinkDocumentEquipment({ document_id: id, equipment_ids: toRemove });
      }
      if (toAdd.length > 0) {
        await Promise.all(
          toAdd.map((equipmentId) =>
            linkDocumentEquipment({
              document_id: id,
              equipment_id: equipmentId,
              tenant_id: tenantId
            })
          )
        );
      }
      navigate("/documentos");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao salvar vinculos.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="documentos-vincular">
      <Documentos />

      <div className="documentos-modal-backdrop" aria-hidden="true" />

      <section
        className="documentos-vincular-modal"
        role="dialog"
        aria-label="Vincular equipamentos"
      >
        <header className="documentos-vincular-header">
          <h2>Vincular equipamentos • {doc?.title ?? "Documento"}</h2>
          <Link className="documentos-modal-close" to="/documentos" aria-label="Fechar">
            <LucideIcon name="x" className="documentos-modal-close-icon" />
          </Link>
        </header>

        <div className="documentos-vincular-body">
          <p className="documentos-vincular-text">
            Selecione um ou mais equipamentos para vincular a este documento.
          </p>
          <div className="documentos-vincular-search">
            <LucideIcon name="search" className="documentos-vincular-search-icon" />
            <input
              type="text"
              placeholder="Buscar por tag ou nome"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </div>
          <div className="documentos-vincular-options">
            {filteredAssets.map((asset) => (
              <label className="documentos-check" key={asset.id}>
                <input
                  type="checkbox"
                  checked={selectedIds.includes(asset.id)}
                  onChange={() => toggleEquipment(asset.id)}
                />
                {asset.tag} <span className="documentos-check-muted">({asset.name})</span>
              </label>
            ))}
            {filteredAssets.length === 0 ? (
              <span className="documentos-vincular-empty">Nenhum equipamento encontrado.</span>
            ) : null}
          </div>
          {error ? <p className="documentos-error">{error}</p> : null}
        </div>

        <footer className="documentos-vincular-footer">
          <Link className="documentos-modal-cancel" to="/documentos">
            Cancelar
          </Link>
          <button
            className="documentos-vincular-save"
            type="button"
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? "Salvando..." : "Salvar vínculos"}
          </button>
        </footer>
      </section>
    </div>
  );
}
