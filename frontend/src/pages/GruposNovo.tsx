import { Link } from "react-router-dom";
import { LucideIcon } from "../components/LucideIcon";
import { getAuthUser } from "../lib/auth";
import { Grupos } from "./Grupos";
import "../styles/grupos.css";
import "../styles/grupos-novo.css";

export function GruposNovo() {
  const authUser = getAuthUser();
  return (
    <div className="grupos-novo">
      <Grupos />

      <div className="grupos-modal-backdrop" aria-hidden="true" />

      <section className="grupos-modal" role="dialog" aria-label="Novo Grupo">
        <header className="grupos-modal-header">
          <h2>Novo Grupo</h2>
          <Link className="grupos-modal-close" to="/grupos" aria-label="Fechar">
            <LucideIcon name="x" className="grupos-modal-close-icon" />
          </Link>
        </header>

        <div className="grupos-modal-body">
          <div className="grupos-field">
            <label htmlFor="grupo-nome">Nome do Grupo</label>
            <input id="grupo-nome" type="text" placeholder="Ex: Elétrica Turno A" />
          </div>
          <div className="grupos-field">
            <label htmlFor="grupo-desc">Descrição</label>
            <textarea id="grupo-desc" placeholder="Descrição da função deste grupo..." />
          </div>
        </div>

        <footer className="grupos-modal-footer">
          <Link className="grupos-modal-cancel" to="/grupos">
            Cancelar
          </Link>
          <button className="grupos-modal-save" type="button">
            Salvar
          </button>
        </footer>
      </section>
    </div>
  );
}
