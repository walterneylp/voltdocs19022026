import { Link } from "react-router-dom";
import { LucideIcon } from "../components/LucideIcon";
import { getAuthUser, clearAuthUser } from "../lib/auth";
import { clearToken } from "../lib/api";
import "../styles/relatorios.css";

export function Relatorios() {
  const authUser = getAuthUser();
  return (
    <div className="relatorios">
      <aside className="relatorios-sidebar">
        <div className="relatorios-brand">
          <div className="relatorios-logo" aria-hidden="true" />
          <span className="relatorios-title">VoltDocs</span>
        </div>

        <nav className="relatorios-nav">
          <div className="relatorios-section">
            <p className="relatorios-label">GESTÃO</p>
            <Link className="relatorios-item" to="/dashboard">
              <LucideIcon name="layout-dashboard" className="relatorios-icon" />
              Visão Geral
            </Link>
            <Link className="relatorios-item" to="/equipamentos">
              <LucideIcon name="cpu" className="relatorios-icon" />
              Equipamentos
            </Link>
            <Link className="relatorios-item" to="/locais">
              <LucideIcon name="map-pin" className="relatorios-icon" />
              Locais
            </Link>
            <Link className="relatorios-item" to="/documentos">
              <LucideIcon name="file-text" className="relatorios-icon" />
              Documentos
            </Link>
            <Link className="relatorios-item" to="/chamados">
              <LucideIcon name="life-buoy" className="relatorios-icon" />
              Chamados
            </Link>
          </div>

          <div className="relatorios-section">
            <p className="relatorios-label">ANÁLISE</p>
            <Link className="relatorios-item is-active" to="/relatorios">
              <LucideIcon name="bar-chart-3" className="relatorios-icon" />
              Relatórios
            </Link>
          </div>

          <div className="relatorios-section">
            <p className="relatorios-label">PIE</p>
            <Link className="relatorios-item" to="/pie">
              <LucideIcon name="shield" className="relatorios-icon" />
              PIE
            </Link>
          </div>

          <div className="relatorios-section">
            <p className="relatorios-label">CAMPO</p>
            <Link className="relatorios-item" to="/registros">
              <LucideIcon name="clipboard-check" className="relatorios-icon" />
              Registros de Campo
            </Link>
          </div>

          <div className="relatorios-section">
            <p className="relatorios-label">SISTEMA</p>
            <Link className="relatorios-item" to="/usuarios">
              <LucideIcon name="users" className="relatorios-icon" />
              Usuários
            </Link>

            <Link className="relatorios-item" to="/dados-empresa">
              <LucideIcon name="file-text" className="relatorios-icon" />
              Dados Empresa
            </Link>
            <Link className="relatorios-item" to="/grupos">
              <LucideIcon name="users-2" className="relatorios-icon" />
              Grupos
            </Link>
          </div>
        </nav>

        <div className="relatorios-user">
          <div className="relatorios-user-meta">
            <p className="relatorios-user-name">{authUser?.name ?? "—"}</p>
            <p className="relatorios-user-email">{authUser?.email ?? "—"}</p>
          </div>
        </div>
      </aside>

      <main className="relatorios-content">
        <header className="relatorios-topbar">
          <span className="relatorios-org">Apogeu Automação</span>
          <div className="relatorios-actions">
            <LucideIcon name="bell" className="relatorios-bell" />
            <Link className="relatorios-logout" to="/alterar-senha">
              <LucideIcon name="lock" className="relatorios-logout-icon" />
              Alterar senha
            </Link>
            <Link className="relatorios-logout" to="/login" onClick={() => { clearToken(); clearAuthUser(); }} >
              <LucideIcon name="log-out" className="relatorios-logout-icon" />
              Sair
            </Link>
          </div>
        </header>

        <section className="relatorios-main">
          <div className="relatorios-header">
            <div>
              <h1>Relatórios Gerenciais</h1>
              <p>Análise de conformidade NR-10 e histórico de auditoria.</p>
            </div>
            <div className="relatorios-header-actions">
              <Link className="relatorios-tab is-active" to="/relatorios">
                <LucideIcon name="check-square" className="relatorios-tab-icon" />
                Conformidade
              </Link>
              <Link className="relatorios-tab" to="/relatorios/auditoria">
                <LucideIcon name="history" className="relatorios-tab-icon" />
                Auditoria
              </Link>
              <button className="relatorios-export" type="button">
                <LucideIcon name="download" className="relatorios-tab-icon" />
                Exportar PDF
              </button>
            </div>
          </div>

          <div className="relatorios-cards">
            <article className="relatorios-card is-highlight">
              <p className="relatorios-card-label">Score Geral de Conformidade</p>
              <p className="relatorios-card-value">85%</p>
              <p className="relatorios-card-sub">Meta ideal: 100%</p>
            </article>
            <article className="relatorios-card">
              <p className="relatorios-card-label">Ativos Irregulares</p>
              <p className="relatorios-card-value">15</p>
              <p className="relatorios-card-sub">De um total de 100 ativos</p>
            </article>
            <article className="relatorios-card">
              <p className="relatorios-card-label">Pendências Críticas</p>
              <p className="relatorios-card-value">0</p>
              <p className="relatorios-card-sub">Documentos vencidos ou ausentes</p>
            </article>
          </div>

          <div className="relatorios-grid">
            <div className="relatorios-panel">
              <h2>Status Global</h2>
              <div className="relatorios-donut">
                <div className="relatorios-donut-ring">
                  <span className="relatorios-donut-gap" />
                </div>
              </div>
              <div className="relatorios-legend">
                <span className="relatorios-legend-item">
                  <span className="relatorios-legend-dot is-ok" /> Conforme
                </span>
                <span className="relatorios-legend-item">
                  <span className="relatorios-legend-dot is-bad" /> Irregular
                </span>
              </div>
            </div>
            <div className="relatorios-panel">
              <h2>Conformidade por Local</h2>
              <div className="relatorios-placeholder" />
            </div>
          </div>

          <div className="relatorios-panel relatorios-alert">
            <h2>
              <LucideIcon name="alert-triangle" className="relatorios-alert-icon" />
              Lista de Não-Conformidades (Ação Necessária)
            </h2>
          </div>
        </section>
      </main>
    </div>
  );
}
