import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { Documentos } from "./Documentos";
import { LucideIcon } from "../components/LucideIcon";
import { createDocumentCategory, getMe } from "../lib/api";
import "../styles/documentos.css";
import "../styles/documentos-categorias.css";

export function DocumentosCategoriasNovo() {
  const navigate = useNavigate();
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [tenantId, setTenantId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const loadTenant = async () => {
    if (tenantId) return tenantId;
    const me = await getMe();
    const tid = me.profile?.tenant_id ?? null;
    setTenantId(tid);
    return tid;
  };

  const handleSave = async () => {
    if (!code || !name) {
      setError("Preencha codigo e categoria.");
      return;
    }
    setError("");
    setIsSaving(true);
    try {
      const tid = await loadTenant();
      if (!tid) {
        setError("Tenant nao encontrado no perfil.");
        return;
      }
      await createDocumentCategory({
        code: code.trim().toUpperCase(),
        name: name.trim(),
        tenant_id: tid
      });
      navigate("/documentos/categorias");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao salvar categoria.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="documentos-categorias">
      <Documentos />

      <div className="documentos-modal-backdrop" aria-hidden="true" />

      <section className="documentos-modal" role="dialog" aria-label="Nova Categoria">
        <header className="documentos-modal-header">
          <h2>Nova Categoria</h2>
          <Link
            className="documentos-modal-close"
            to="/documentos/categorias"
            aria-label="Fechar"
          >
            <LucideIcon name="x" className="documentos-modal-close-icon" />
          </Link>
        </header>

        <div className="documentos-modal-body">
          <div className="documentos-field">
            <label htmlFor="doc-cat-code">Código</label>
            <input
              id="doc-cat-code"
              type="text"
              placeholder="Ex: DIAG"
              value={code}
              onChange={(event) => setCode(event.target.value)}
            />
          </div>
          <div className="documentos-field">
            <label htmlFor="doc-cat-name">Categoria</label>
            <input
              id="doc-cat-name"
              type="text"
              placeholder="Ex: Diagrama"
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
          </div>
          {error ? <p className="documentos-error">{error}</p> : null}
        </div>

        <footer className="documentos-modal-footer">
          <Link className="documentos-modal-cancel" to="/documentos/categorias">
            Cancelar
          </Link>
          <button
            className="documentos-modal-save"
            type="button"
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? "Salvando..." : "Salvar"}
          </button>
        </footer>
      </section>
    </div>
  );
}
