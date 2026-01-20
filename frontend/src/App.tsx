import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Dashboard } from "./pages/Dashboard";
import { Equipamentos } from "./pages/Equipamentos";
import { EquipamentosDeletar } from "./pages/EquipamentosDeletar";
import { EquipamentosDetalhes } from "./pages/EquipamentosDetalhes";
import { EquipamentosEditar } from "./pages/EquipamentosEditar";
import { EquipamentosNovo } from "./pages/EquipamentosNovo";
import { EquipamentosQr } from "./pages/EquipamentosQr";
import { EquipamentosVincularDocumentos } from "./pages/EquipamentosVincularDocumentos";
import { Login } from "./pages/Login";
import { Locais } from "./pages/Locais";
import { LocaisDeletar } from "./pages/LocaisDeletar";
import { LocaisEditar } from "./pages/LocaisEditar";
import { LocaisNovo } from "./pages/LocaisNovo";
import { Documentos } from "./pages/Documentos";
import { DocumentosCategorias } from "./pages/DocumentosCategorias";
import { DocumentosCategoriasNovo } from "./pages/DocumentosCategoriasNovo";
import { DocumentosCategoriasEditar } from "./pages/DocumentosCategoriasEditar";
import { DocumentosFiltro } from "./pages/DocumentosFiltro";
import { DocumentosNovo } from "./pages/DocumentosNovo";
import { DocumentosEditar } from "./pages/DocumentosEditar";
import { DocumentosVincular } from "./pages/DocumentosVincular";
import { Chamados } from "./pages/Chamados";
import { ChamadosAtualizar } from "./pages/ChamadosAtualizar";
import { ChamadosEquipamento } from "./pages/ChamadosEquipamento";
import { ChamadosNovo } from "./pages/ChamadosNovo";
import { ChamadosPrioridade } from "./pages/ChamadosPrioridade";
import { ChamadosTecnico } from "./pages/ChamadosTecnico";
import { Relatorios } from "./pages/Relatorios";
import { RelatoriosAuditoria } from "./pages/RelatoriosAuditoria";
import { RelatoriosComplemento } from "./pages/RelatoriosComplemento";
import { Pie } from "./pages/Pie";
import { PieContinuacao } from "./pages/PieContinuacao";
import { PieContinuacao2 } from "./pages/PieContinuacao2";
import { RegistrosCampo } from "./pages/RegistrosCampo";
import { RegistrosCampoContinuacao } from "./pages/RegistrosCampoContinuacao";
import { RegistrosCampoContinuacao2 } from "./pages/RegistrosCampoContinuacao2";
import { RegistrosCampoProcessados } from "./pages/RegistrosCampoProcessados";
import { Usuarios } from "./pages/Usuarios";
import { UsuariosFuncao } from "./pages/UsuariosFuncao";
import { UsuariosNovo } from "./pages/UsuariosNovo";
import { AlterarSenha } from "./pages/AlterarSenha";
import { DadosEmpresa } from "./pages/DadosEmpresa";
import { Grupos } from "./pages/Grupos";
import { GruposEditar } from "./pages/GruposEditar";
import { GruposMembros } from "./pages/GruposMembros";
import { GruposNovo } from "./pages/GruposNovo";
import { MobileApp } from "./pages/MobileApp";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/equipamentos" element={<Equipamentos />} />
        <Route path="/equipamentos/novo" element={<EquipamentosNovo />} />
        <Route path="/equipamentos/qr" element={<EquipamentosQr />} />
        <Route path="/equipamentos/editar" element={<EquipamentosEditar />} />
        <Route path="/equipamentos/deletar" element={<EquipamentosDeletar />} />
        <Route path="/equipamentos/detalhes" element={<EquipamentosDetalhes />} />
        <Route
          path="/equipamentos/vincular"
          element={<EquipamentosVincularDocumentos />}
        />
        <Route path="/locais" element={<Locais />} />
        <Route path="/locais/novo" element={<LocaisNovo />} />
        <Route path="/locais/editar" element={<LocaisEditar />} />
        <Route path="/locais/deletar" element={<LocaisDeletar />} />
        <Route path="/documentos" element={<Documentos />} />
        <Route path="/documentos/novo" element={<DocumentosNovo />} />
        <Route path="/documentos/editar/:id" element={<DocumentosEditar />} />
        <Route path="/documentos/filtro" element={<DocumentosFiltro />} />
        <Route path="/documentos/vincular/:id" element={<DocumentosVincular />} />
        <Route path="/documentos/categorias" element={<DocumentosCategorias />} />
        <Route path="/documentos/categorias/novo" element={<DocumentosCategoriasNovo />} />
        <Route path="/documentos/categorias/:id" element={<DocumentosCategoriasEditar />} />
        <Route path="/chamados" element={<Chamados />} />
        <Route path="/chamados/novo" element={<ChamadosNovo />} />
        <Route path="/chamados/tecnico" element={<ChamadosTecnico />} />
        <Route path="/chamados/equipamento" element={<ChamadosEquipamento />} />
        <Route path="/chamados/prioridade" element={<ChamadosPrioridade />} />
        <Route path="/chamados/atualizar" element={<ChamadosAtualizar />} />
        <Route path="/relatorios" element={<Relatorios />} />
        <Route path="/relatorios/complemento" element={<RelatoriosComplemento />} />
        <Route path="/relatorios/auditoria" element={<RelatoriosAuditoria />} />
        <Route path="/pie" element={<Pie />} />
        <Route path="/pie/continua" element={<PieContinuacao />} />
        <Route path="/pie/continua-2" element={<PieContinuacao2 />} />
        <Route path="/registros" element={<RegistrosCampo />} />
        <Route path="/registros/processados" element={<RegistrosCampoProcessados />} />
        <Route path="/registros/continua" element={<RegistrosCampoContinuacao />} />
        <Route path="/registros/continua-2" element={<RegistrosCampoContinuacao2 />} />
        <Route path="/usuarios" element={<Usuarios />} />
        <Route path="/usuarios/novo" element={<UsuariosNovo />} />
        <Route path="/usuarios/funcao" element={<UsuariosFuncao />} />
        <Route path="/alterar-senha" element={<AlterarSenha />} />
        <Route path="/dados-empresa" element={<DadosEmpresa />} />
        <Route path="/grupos" element={<Grupos />} />
        <Route path="/grupos/novo" element={<GruposNovo />} />
        <Route path="/grupos/editar/:id" element={<GruposEditar />} />
        <Route path="/grupos/membros" element={<GruposMembros />} />
        <Route path="/mobile" element={<MobileApp />} />
      </Routes>
    </BrowserRouter>
  );
}
