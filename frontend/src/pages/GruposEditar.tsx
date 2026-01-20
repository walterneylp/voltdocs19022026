import { Link, useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { LucideIcon } from "../components/LucideIcon";
import { listUserGroups, updateUserGroup } from "../lib/api";
import { Grupos } from "./Grupos";
import "../styles/grupos.css";
import "../styles/grupos-novo.css";

export function GruposEditar() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    let isMounted = true;
    listUserGroups()
      .then((groups) => {
        if (!isMounted) return;
        const group = groups.find((item) => item.id === id);
        if (!group) {
          setError("Grupo nao encontrado.");
          return;
        }
        setName(group.name);
        setDescription(group.description ?? "");
      })
      .catch((err) => {
        if (!isMounted) return;
        setError(err instanceof Error ? err.message : "Falha ao carregar grupo.");
      });

    return () => {
      isMounted = false;
    };
  }, [id]);

  const handleSave = async () => {
    if (!id) return;
    setError("");
    setIsSaving(true);
    try {
      await updateUserGroup(id, {
        description: description.trim() || null
      });
      navigate("/grupos");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao salvar grupo.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="grupos-novo">
      <Grupos />

      <div className="grupos-modal-backdrop" aria-hidden="true" />

      <section className="grupos-modal" role="dialog" aria-label="Editar Grupo">
        <header className="grupos-modal-header">
          <h2>Editar Grupo</h2>
          <Link className="grupos-modal-close" to="/grupos" aria-label="Fechar">
            <LucideIcon name="x" className="grupos-modal-close-icon" />
          </Link>
        </header>

        <div className="grupos-modal-body">
          <div className="grupos-field">
            <label htmlFor="grupo-nome">Nome do Grupo</label>
            <input id="grupo-nome" type="text" value={name} disabled />
          </div>
          <div className="grupos-field">
            <label htmlFor="grupo-desc">Descrição</label>
            <textarea
              id="grupo-desc"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Descrição da função deste grupo..."
            />
          </div>
          {error ? <p className="grupos-error">{error}</p> : null}
        </div>

        <footer className="grupos-modal-footer">
          <Link className="grupos-modal-cancel" to="/grupos">
            Cancelar
          </Link>
          <button
            className="grupos-modal-save"
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
