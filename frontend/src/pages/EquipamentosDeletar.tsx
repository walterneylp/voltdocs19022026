import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { Equipamentos } from "./Equipamentos";
import { LucideIcon } from "../components/LucideIcon";
import { deleteAsset, listAssets } from "../lib/api";
import "../styles/equipamentos.css";
import "../styles/equipamentos-novo.css";

export function EquipamentosDeletar() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const assetId = params.get("id");
  const [assetLabel, setAssetLabel] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    let isMounted = true;
    if (!assetId) {
      setError("Equipamento nao identificado.");
      return;
    }

    listAssets()
      .then((assets) => {
        if (!isMounted) return;
        const asset = assets.find((item) => item.id === assetId);
        if (!asset) {
          setError("Equipamento nao encontrado.");
          return;
        }
        setAssetLabel(`${asset.tag} - ${asset.name}`);
      })
      .catch((err) => {
        if (!isMounted) return;
        setError(err instanceof Error ? err.message : "Falha ao carregar equipamento.");
      });

    return () => {
      isMounted = false;
    };
  }, [assetId]);

  const handleDelete = async () => {
    if (!assetId) {
      setError("Equipamento nao identificado.");
      return;
    }
    setError("");
    setIsDeleting(true);
    try {
      await deleteAsset(assetId);
      navigate("/equipamentos");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao deletar equipamento.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="equip-novo">
      <Equipamentos />

      <div className="equip-modal-backdrop" aria-hidden="true" />

      <section className="equip-modal" role="dialog" aria-label="Excluir Equipamento">
        <header className="equip-modal-header">
          <h2>Excluir Equipamento</h2>
          <Link className="equip-modal-close" to="/equipamentos" aria-label="Fechar">
            <LucideIcon name="x" className="equip-modal-close-icon" />
          </Link>
        </header>

        <div className="equip-modal-body">
          <p className="equip-delete-text">
            Tem certeza que deseja excluir o equipamento
            <strong> {assetLabel ?? "—"}</strong>?
          </p>
          <p className="equip-delete-note">Essa ação não poderá ser desfeita.</p>
          {error ? <p className="equip-error">{error}</p> : null}
        </div>

        <footer className="equip-modal-footer">
          <Link className="equip-modal-cancel" to="/equipamentos">
            Cancelar
          </Link>
          <button
            className="equip-modal-save equip-delete-confirm"
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
