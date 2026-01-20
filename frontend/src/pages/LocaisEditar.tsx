import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { LucideIcon } from "../components/LucideIcon";
import { getAuthUser } from "../lib/auth";
import { listSites, updateSite } from "../lib/api";
import { Locais } from "./Locais";
import "../styles/locais.css";
import "../styles/locais-novo.css";

export function LocaisEditar() {
  const authUser = getAuthUser();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const siteId = params.get("id");
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    let isMounted = true;
    if (!siteId) {
      setError("Local nao identificado.");
      return;
    }

    listSites()
      .then((sites) => {
        if (!isMounted) return;
        const site = sites.find((item) => item.id === siteId);
        if (!site) {
          setError("Local nao encontrado.");
          return;
        }
        setName(site.name);
        setAddress(site.address ?? "");
      })
      .catch((err) => {
        if (!isMounted) return;
        setError(err instanceof Error ? err.message : "Falha ao carregar local.");
      });

    return () => {
      isMounted = false;
    };
  }, [siteId]);

  const handleSave = async () => {
    if (!siteId) {
      setError("Local nao identificado.");
      return;
    }
    if (!name) {
      setError("Preencha o nome da unidade.");
      return;
    }
    setError("");
    setIsSaving(true);
    try {
      await updateSite(siteId, { name, address: address || null });
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

      <section className="locais-modal" role="dialog" aria-label="Editar Local">
        <header className="locais-modal-header">
          <h2>Editar Local</h2>
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
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
          </div>
          <div className="locais-field">
            <label htmlFor="locais-endereco">Localização Completa</label>
            <input
              id="locais-endereco"
              type="text"
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
