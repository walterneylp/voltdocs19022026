import { Link } from "react-router-dom";
import { LucideIcon } from "../components/LucideIcon";
import { getAuthUser } from "../lib/auth";
import { Usuarios } from "./Usuarios";
import "../styles/usuarios.css";
import "../styles/usuarios-novo.css";

export function UsuariosFuncao() {
  const authUser = getAuthUser();
  return (
    <div className="usuarios-novo">
      <Usuarios />

      <div className="usuarios-modal-backdrop" aria-hidden="true" />

      <section className="usuarios-modal" role="dialog" aria-label="Novo Usuário">
        <header className="usuarios-modal-header">
          <h2>Novo Usuário</h2>
          <Link className="usuarios-modal-close" to="/usuarios/novo" aria-label="Fechar">
            <LucideIcon name="x" className="usuarios-modal-close-icon" />
          </Link>
        </header>

        <div className="usuarios-modal-body">
          <div className="usuarios-field">
            <label htmlFor="usuario-nome">Nome Completo</label>
            <input id="usuario-nome" type="text" />
          </div>
          <div className="usuarios-field">
            <label htmlFor="usuario-email">E-mail</label>
            <input id="usuario-email" type="email" />
          </div>
            <div className="usuarios-field">
            <label htmlFor="usuario-funcao">Função (Nível de Acesso)</label>
            <div className="usuarios-select">
              <select id="usuario-funcao">
                <option>Técnico</option>
              </select>
              <LucideIcon name="chevron-down" className="usuarios-select-icon" />
              <div className="usuarios-dropdown">
                <div className="usuarios-option">Administrador Global</div>
                <div className="usuarios-option is-active">Administrador</div>
                <div className="usuarios-option">Técnico</div>
              </div>
            </div>
          </div>
          <div className="usuarios-field">
            <label>Grupos de Manutenção</label>
            <label className="usuarios-check">
              <input type="checkbox" />
              Grupo de Suporte
            </label>
          </div>
        </div>

        <footer className="usuarios-modal-footer">
          <Link className="usuarios-modal-cancel" to="/usuarios/novo">
            Cancelar
          </Link>
          <button className="usuarios-modal-save" type="button">
            Salvar
          </button>
        </footer>
      </section>
    </div>
  );
}
