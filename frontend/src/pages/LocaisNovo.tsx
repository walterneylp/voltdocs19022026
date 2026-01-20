import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { LucideIcon } from "../components/LucideIcon";
import { getAuthUser } from "../lib/auth";
import { createSite, getMe } from "../lib/api";
import { Locais } from "./Locais";
import "../styles/locais.css";
import "../styles/locais-novo.css";

export function LocaisNovo() {
  const authUser = getAuthUser();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
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
    if (!name) {
      setError("Preencha o nome da unidade.");
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
      await createSite({
        name,
        address: address || null,
        tenant_id: tid
      });
      navigate("/locais");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao salvar local.");
    } finally {
      setIsSaving(false);
    }
  };
  return (
    <div className="locais-novo">
      <Locais />

      <div className="locais-modal-backdrop" aria-hidden="true" />

      <section className="locais-modal" role="dialog" aria-label="Novo Local">
        <header className="locais-modal-header">
          <h2>Novo Local</h2>
          <Link className="locais-modal-close" to="/locais" aria-label="Fechar">
            <LucideIcon name="x" className="locais-modal-close-icon" />
          </Link>
        </header>

        <div className="locais-modal-body">
          <div className="locais-field">
            <label htmlFor="locais-nome">Nome da Unidade</label>
            <input
              id="locais-nome"
              type="text"
              placeholder="Ex: Fábrica 01"
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
          </div>
          <div className="locais-field">
            <label htmlFor="locais-endereco">Localização Completa</label>
            <input
              id="locais-endereco"
              type="text"
              placeholder="Rua, Número, Cidade..."
              value={address}
              onChange={(event) => setAddress(event.target.value)}
            />
          </div>
          {error ? <p className="locais-error">{error}</p> : null}
        </div>

        <footer className="locais-modal-footer">
          <Link className="locais-modal-cancel" to="/locais">
            Cancelar
          </Link>
          <button
            className="locais-modal-save"
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
