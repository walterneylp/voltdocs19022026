import { Documentos } from "./Documentos";
import { LucideIcon } from "../components/LucideIcon";
import { getAuthUser } from "../lib/auth";
import "../styles/documentos.css";

export function DocumentosFiltro() {
  const authUser = getAuthUser();
  return (
    <div className="documentos-filtro">
      <Documentos />

      <div className="documentos-filter-overlay">
        <div className="documentos-filter-panel">
          <div className="documentos-dropdown-search">
            <LucideIcon name="search" className="documentos-input-icon" />
            <input type="text" placeholder="Buscar..." />
          </div>
          <div className="documentos-dropdown-item">GMG-023-A - GMG</div>
          <div className="documentos-dropdown-item">MC-AC-22 - Motor Central AC</div>
        </div>
      </div>
    </div>
  );
}
