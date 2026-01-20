import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { Locais } from "./Locais";
import { LucideIcon } from "../components/LucideIcon";
import { deleteSite, listSites } from "../lib/api";
import "../styles/locais.css";
import "../styles/locais-novo.css";

export function LocaisDeletar() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const siteId = params.get("id");
  const [siteLabel, setSiteLabel] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

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
        setSiteLabel(site.name);
      })
      .catch((err) => {
        if (!isMounted) return;
        setError(err instanceof Error ? err.message : "Falha ao carregar local.");
      });

    return () => {
      isMounted = false;
    };
  }, [siteId]);

  const handleDelete = async () => {
    if (!siteId) {
      setError("Local nao identificado.");
      return;
    }
    setError("");
    setIsDeleting(true);
    try {
      await deleteSite(siteId);
      navigate("/locais");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao deletar local.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="locais-novo">
      <Locais />

      <div className="locais-modal-backdrop" aria-hidden="true" />

      <section className="locais-modal" role="dialog" aria-label="Excluir Local">
        <header className="locais-modal-header">
          <h2>Excluir Local</h2>
          <Link className="locais-modal-close" to="/locais" aria-label="Fechar">
            <LucideIcon name="x" className="locais-modal-close-icon" />
          </Link>
        </header>

        <div className="locais-modal-body">
          <p className="locais-delete-text">
            Tem certeza que deseja excluir o local <strong>{siteLabel ?? "—"}</strong>?
          </p>
          <p className="locais-delete-note">Essa ação não poderá ser desfeita.</p>
          {error ? <p className="locais-error">{error}</p> : null}
        </div>

        <footer className="locais-modal-footer">
          <Link className="locais-modal-cancel" to="/locais">
            Cancelar
          </Link>
          <button
            className="locais-modal-save locais-delete-confirm"
            type="button"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? "Excluindo..." : "Excluir"}
          </button>
        </footer>
      </section>
    </div>
  );
}
