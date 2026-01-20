import { Link } from "react-router-dom";
import { Chamados } from "./Chamados";
import { LucideIcon } from "../components/LucideIcon";
import { getAuthUser } from "../lib/auth";
import "../styles/chamados.css";
import "../styles/chamados-novo.css";

export function ChamadosTecnico() {
  const authUser = getAuthUser();
  return (
    <div className="chamados-novo">
      <Chamados />

      <div className="chamados-modal-backdrop" aria-hidden="true" />

      <section className="chamados-modal" role="dialog" aria-label="Novo Chamado">
        <header className="chamados-modal-header">
          <h2>Novo Chamado</h2>
          <Link className="chamados-modal-close" to="/chamados/novo" aria-label="Fechar">
            <LucideIcon name="x" className="chamados-modal-close-icon" />
          </Link>
        </header>

        <div className="chamados-modal-body">
          <div className="chamados-field">
            <label htmlFor="chamado-titulo">Título</label>
            <input id="chamado-titulo" type="text" />
          </div>

          <div className="chamados-field">
            <label htmlFor="chamado-descricao">Descrição do Problema</label>
            <input id="chamado-descricao" type="text" />
          </div>

          <div className="chamados-grid">
            <div className="chamados-field">
              <label htmlFor="chamado-equipamento">Equipamento Afetado</label>
              <div className="chamados-select">
                <select id="chamado-equipamento">
                  <option>GMG-023-A - GMG</option>
                </select>
                <LucideIcon name="chevron-down" className="chamados-select-icon" />
              </div>
            </div>
            <div className="chamados-field">
              <label htmlFor="chamado-prioridade">Prioridade</label>
              <div className="chamados-select">
                <select id="chamado-prioridade">
                  <option>MÉDIA</option>
                </select>
                <LucideIcon name="chevron-down" className="chamados-select-icon" />
              </div>
            </div>
          </div>

          <div className="chamados-atribuir">
            <p className="chamados-atribuir-title">ATRIBUIÇÃO (QUEM RESOLVE?)</p>
            <div className="chamados-field">
              <label htmlFor="chamado-tecnico">Técnico Responsável (Opcional)</label>
              <div className="chamados-select">
                <select id="chamado-tecnico">
                  <option>-- Ninguém atribuído --</option>
                </select>
                <LucideIcon name="chevron-down" className="chamados-select-icon" />
                <div className="chamados-select-dropdown">
                  <div className="chamados-select-option is-active">
                    -- Ninguém atribuído --
                  </div>
                  <div className="chamados-select-option">
                    Walternet L Pinto (ADMIN_GLOBAL)
                  </div>
                </div>
              </div>
            </div>
            <div className="chamados-field">
              <label>Grupos Responsáveis (Opcional)</label>
              <label className="chamados-check">
                <input type="checkbox" />
                Grupo de Suporte
              </label>
            </div>
            <p className="chamados-help">
              O sistema enviará notificações para o usuário e/ou todos os membros dos grupos
              selecionados.
            </p>
          </div>
        </div>

        <footer className="chamados-modal-footer">
          <Link className="chamados-modal-cancel" to="/chamados/novo">
            Cancelar
          </Link>
          <button className="chamados-modal-save" type="button">
            Salvar
          </button>
        </footer>
      </section>
    </div>
  );
}
