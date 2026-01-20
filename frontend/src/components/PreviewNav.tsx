import { Link } from "react-router-dom";
import "../styles/preview-nav.css";

export function PreviewNav() {
  return (
    <nav className="preview-nav" aria-label="Navegação de telas">
      <p className="preview-title">Telas</p>
      <Link to="/login">Login</Link>
      <Link to="/dashboard">Dashboard</Link>
      <Link to="/equipamentos">Equipamentos</Link>
      <Link to="/equipamentos/novo">Equipamentos - Novo</Link>
      <Link to="/equipamentos/qr">Equipamentos - QR</Link>
      <Link to="/equipamentos/editar">Equipamentos - Editar</Link>
      <Link to="/locais">Locais</Link>
      <Link to="/locais/novo">Locais - Novo</Link>
      <Link to="/locais/editar">Locais - Editar</Link>
      <Link to="/documentos">Documentos</Link>
      <Link to="/documentos/novo">Documentos - Novo</Link>
      <Link to="/documentos/filtro">Documentos - Filtro</Link>
      <Link to="/documentos/vincular">Documentos - Vincular</Link>
      <Link to="/chamados">Chamados</Link>
      <Link to="/chamados/novo">Chamados - Novo</Link>
      <Link to="/chamados/tecnico">Chamados - Técnico</Link>
      <Link to="/chamados/equipamento">Chamados - Equipamento</Link>
      <Link to="/chamados/prioridade">Chamados - Prioridade</Link>
      <Link to="/chamados/atualizar">Chamados - Atualizar</Link>
      <Link to="/relatorios">Relatórios</Link>
      <Link to="/relatorios/complemento">Relatórios - Complemento</Link>
      <Link to="/relatorios/auditoria">Relatórios - Auditoria</Link>
      <Link to="/pie">PIE</Link>
      <Link to="/pie/continua">PIE - Continuação</Link>
      <Link to="/pie/continua-2">PIE - Continuação 2</Link>
      <Link to="/registros">Registros de Campo</Link>
      <Link to="/registros/processados">Registros - Processados</Link>
      <Link to="/registros/continua">Registros - Continuação</Link>
      <Link to="/registros/continua-2">Registros - Continuação 2</Link>
      <Link to="/usuarios">Usuários</Link>
      <Link to="/usuarios/novo">Usuários - Novo</Link>
      <Link to="/usuarios/funcao">Usuários - Função</Link>
      <Link to="/dados-empresa">Dados Empresa</Link>
      <Link to="/grupos">Grupos</Link>
      <Link to="/grupos/novo">Grupos - Novo</Link>
      <Link to="/grupos/membros">Grupos - Membros</Link>
    </nav>
  );
}
