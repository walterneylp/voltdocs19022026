import { Relatorios } from "./Relatorios";
import { LucideIcon } from "../components/LucideIcon";
import { getAuthUser } from "../lib/auth";
import "../styles/relatorios.css";
import "../styles/relatorios-complemento.css";

export function RelatoriosComplemento() {
  const authUser = getAuthUser();
  return (
    <div className="relatorios-complemento">
      <Relatorios />
      <div className="relatorios-complemento-panel">
        <h2>
          <LucideIcon name="alert-triangle" className="relatorios-alert-icon" />
          Lista de Não-Conformidades (Ação Necessária)
        </h2>
        <div className="relatorios-complemento-body">
          <div className="relatorios-complemento-icon">
            <LucideIcon name="check-circle" className="relatorios-ok-icon" />
          </div>
          <p>Parabéns! Todos os ativos estão conformes.</p>
        </div>
      </div>
    </div>
  );
}
