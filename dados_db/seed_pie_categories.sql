-- Preencha o tenant_id antes de executar.
-- Exemplo: substitua o valor abaixo pelo seu tenant_id real.
-- tenant_id: '97de1153-6c9a-4640-a953-0dffd70253b8'

-- Categorias base para atender itens do PIE/NR-10.
insert into public.document_categories (code, name, tenant_id)
select 'DIAGRAMA_UNIFILAR', 'Diagrama Unifilar', '97de1153-6c9a-4640-a953-0dffd70253b8'
where not exists (
  select 1
  from public.document_categories
  where tenant_id = '97de1153-6c9a-4640-a953-0dffd70253b8'
    and code = 'DIAGRAMA_UNIFILAR'
);

insert into public.document_categories (code, name, tenant_id)
select 'MANUAL', 'Manual', '97de1153-6c9a-4640-a953-0dffd70253b8'
where not exists (
  select 1
  from public.document_categories
  where tenant_id = '97de1153-6c9a-4640-a953-0dffd70253b8'
    and code = 'MANUAL'
);

insert into public.document_categories (code, name, tenant_id)
select 'PROCEDIMENTO', 'Procedimento', '97de1153-6c9a-4640-a953-0dffd70253b8'
where not exists (
  select 1
  from public.document_categories
  where tenant_id = '97de1153-6c9a-4640-a953-0dffd70253b8'
    and code = 'PROCEDIMENTO'
);

insert into public.document_categories (code, name, tenant_id)
select 'ART', 'ART', '97de1153-6c9a-4640-a953-0dffd70253b8'
where not exists (
  select 1
  from public.document_categories
  where tenant_id = '97de1153-6c9a-4640-a953-0dffd70253b8'
    and code = 'ART'
);

insert into public.document_categories (code, name, tenant_id)
select 'LAUDO_SPDA', 'Laudo SPDA', '97de1153-6c9a-4640-a953-0dffd70253b8'
where not exists (
  select 1
  from public.document_categories
  where tenant_id = '97de1153-6c9a-4640-a953-0dffd70253b8'
    and code = 'LAUDO_SPDA'
);

insert into public.document_categories (code, name, tenant_id)
select 'LAUDO_ATERRAMENTO', 'Laudo Aterramento', '97de1153-6c9a-4640-a953-0dffd70253b8'
where not exists (
  select 1
  from public.document_categories
  where tenant_id = '97de1153-6c9a-4640-a953-0dffd70253b8'
    and code = 'LAUDO_ATERRAMENTO'
);

insert into public.document_categories (code, name, tenant_id)
select 'MEMORIAL_DESCRITIVO', 'Memorial Descritivo', '97de1153-6c9a-4640-a953-0dffd70253b8'
where not exists (
  select 1
  from public.document_categories
  where tenant_id = '97de1153-6c9a-4640-a953-0dffd70253b8'
    and code = 'MEMORIAL_DESCRITIVO'
);

insert into public.document_categories (code, name, tenant_id)
select 'ATERRAMENTO_ESPEC', 'Especificação de Aterramento', '97de1153-6c9a-4640-a953-0dffd70253b8'
where not exists (
  select 1
  from public.document_categories
  where tenant_id = '97de1153-6c9a-4640-a953-0dffd70253b8'
    and code = 'ATERRAMENTO_ESPEC'
);

insert into public.document_categories (code, name, tenant_id)
select 'PLANTAS_ELETRICAS', 'Plantas Elétricas', '97de1153-6c9a-4640-a953-0dffd70253b8'
where not exists (
  select 1
  from public.document_categories
  where tenant_id = '97de1153-6c9a-4640-a953-0dffd70253b8'
    and code = 'PLANTAS_ELETRICAS'
);

insert into public.document_categories (code, name, tenant_id)
select 'LISTA_PAINEIS', 'Lista de Painéis/Quadros', '97de1153-6c9a-4640-a953-0dffd70253b8'
where not exists (
  select 1
  from public.document_categories
  where tenant_id = '97de1153-6c9a-4640-a953-0dffd70253b8'
    and code = 'LISTA_PAINEIS'
);

insert into public.document_categories (code, name, tenant_id)
select 'REGISTRO_ALTERACOES', 'Registro de Alterações', '97de1153-6c9a-4640-a953-0dffd70253b8'
where not exists (
  select 1
  from public.document_categories
  where tenant_id = '97de1153-6c9a-4640-a953-0dffd70253b8'
    and code = 'REGISTRO_ALTERACOES'
);

insert into public.document_categories (code, name, tenant_id)
select 'POLITICA_SEGURANCA', 'Política de Segurança Elétrica', '97de1153-6c9a-4640-a953-0dffd70253b8'
where not exists (
  select 1
  from public.document_categories
  where tenant_id = '97de1153-6c9a-4640-a953-0dffd70253b8'
    and code = 'POLITICA_SEGURANCA'
);

insert into public.document_categories (code, name, tenant_id)
select 'APR', 'APR', '97de1153-6c9a-4640-a953-0dffd70253b8'
where not exists (
  select 1
  from public.document_categories
  where tenant_id = '97de1153-6c9a-4640-a953-0dffd70253b8'
    and code = 'APR'
);

insert into public.document_categories (code, name, tenant_id)
select 'PT', 'Permissão de Trabalho (PT)', '97de1153-6c9a-4640-a953-0dffd70253b8'
where not exists (
  select 1
  from public.document_categories
  where tenant_id = '97de1153-6c9a-4640-a953-0dffd70253b8'
    and code = 'PT'
);

insert into public.document_categories (code, name, tenant_id)
select 'LOTO', 'Bloqueio e Etiquetagem (LOTO)', '97de1153-6c9a-4640-a953-0dffd70253b8'
where not exists (
  select 1
  from public.document_categories
  where tenant_id = '97de1153-6c9a-4640-a953-0dffd70253b8'
    and code = 'LOTO'
);

insert into public.document_categories (code, name, tenant_id)
select 'SECCIONAMENTO', 'Seccionamento e Delimitação', '97de1153-6c9a-4640-a953-0dffd70253b8'
where not exists (
  select 1
  from public.document_categories
  where tenant_id = '97de1153-6c9a-4640-a953-0dffd70253b8'
    and code = 'SECCIONAMENTO'
);

insert into public.document_categories (code, name, tenant_id)
select 'CONTROLE_ACESSO', 'Controle de Acesso e Sinalização', '97de1153-6c9a-4640-a953-0dffd70253b8'
where not exists (
  select 1
  from public.document_categories
  where tenant_id = '97de1153-6c9a-4640-a953-0dffd70253b8'
    and code = 'CONTROLE_ACESSO'
);

insert into public.document_categories (code, name, tenant_id)
select 'REGISTRO_CORRECOES', 'Registro de Correções', '97de1153-6c9a-4640-a953-0dffd70253b8'
where not exists (
  select 1
  from public.document_categories
  where tenant_id = '97de1153-6c9a-4640-a953-0dffd70253b8'
    and code = 'REGISTRO_CORRECOES'
);

insert into public.document_categories (code, name, tenant_id)
select 'EPC', 'EPC', '97de1153-6c9a-4640-a953-0dffd70253b8'
where not exists (
  select 1
  from public.document_categories
  where tenant_id = '97de1153-6c9a-4640-a953-0dffd70253b8'
    and code = 'EPC'
);

insert into public.document_categories (code, name, tenant_id)
select 'EPI', 'EPI', '97de1153-6c9a-4640-a953-0dffd70253b8'
where not exists (
  select 1
  from public.document_categories
  where tenant_id = '97de1153-6c9a-4640-a953-0dffd70253b8'
    and code = 'EPI'
);

insert into public.document_categories (code, name, tenant_id)
select 'FERRAMENTAL_ISOLADO', 'Ferramental Isolado', '97de1153-6c9a-4640-a953-0dffd70253b8'
where not exists (
  select 1
  from public.document_categories
  where tenant_id = '97de1153-6c9a-4640-a953-0dffd70253b8'
    and code = 'FERRAMENTAL_ISOLADO'
);

insert into public.document_categories (code, name, tenant_id)
select 'RASTREABILIDADE_EPI_EPC', 'Rastreabilidade EPI/EPC', '97de1153-6c9a-4640-a953-0dffd70253b8'
where not exists (
  select 1
  from public.document_categories
  where tenant_id = '97de1153-6c9a-4640-a953-0dffd70253b8'
    and code = 'RASTREABILIDADE_EPI_EPC'
);

insert into public.document_categories (code, name, tenant_id)
select 'MATRIZ_COMPETENCIAS', 'Matriz de Competências', '97de1153-6c9a-4640-a953-0dffd70253b8'
where not exists (
  select 1
  from public.document_categories
  where tenant_id = '97de1153-6c9a-4640-a953-0dffd70253b8'
    and code = 'MATRIZ_COMPETENCIAS'
);

insert into public.document_categories (code, name, tenant_id)
select 'AUTORIZADOS', 'Lista de Autorizados', '97de1153-6c9a-4640-a953-0dffd70253b8'
where not exists (
  select 1
  from public.document_categories
  where tenant_id = '97de1153-6c9a-4640-a953-0dffd70253b8'
    and code = 'AUTORIZADOS'
);

insert into public.document_categories (code, name, tenant_id)
select 'TREINAMENTO_NR10', 'Treinamento NR-10', '97de1153-6c9a-4640-a953-0dffd70253b8'
where not exists (
  select 1
  from public.document_categories
  where tenant_id = '97de1153-6c9a-4640-a953-0dffd70253b8'
    and code = 'TREINAMENTO_NR10'
);

insert into public.document_categories (code, name, tenant_id)
select 'INTEGRACAO_TERCEIROS', 'Integração de Terceiros', '97de1153-6c9a-4640-a953-0dffd70253b8'
where not exists (
  select 1
  from public.document_categories
  where tenant_id = '97de1153-6c9a-4640-a953-0dffd70253b8'
    and code = 'INTEGRACAO_TERCEIROS'
);

insert into public.document_categories (code, name, tenant_id)
select 'ENSAIO_DIELETRICO', 'Ensaio Dielétrico', '97de1153-6c9a-4640-a953-0dffd70253b8'
where not exists (
  select 1
  from public.document_categories
  where tenant_id = '97de1153-6c9a-4640-a953-0dffd70253b8'
    and code = 'ENSAIO_DIELETRICO'
);

insert into public.document_categories (code, name, tenant_id)
select 'INSPECAO_EPI_EPC', 'Inspeção EPI/EPC', '97de1153-6c9a-4640-a953-0dffd70253b8'
where not exists (
  select 1
  from public.document_categories
  where tenant_id = '97de1153-6c9a-4640-a953-0dffd70253b8'
    and code = 'INSPECAO_EPI_EPC'
);

insert into public.document_categories (code, name, tenant_id)
select 'AREAS_CLASSIFICADAS', 'Áreas Classificadas', '97de1153-6c9a-4640-a953-0dffd70253b8'
where not exists (
  select 1
  from public.document_categories
  where tenant_id = '97de1153-6c9a-4640-a953-0dffd70253b8'
    and code = 'AREAS_CLASSIFICADAS'
);

insert into public.document_categories (code, name, tenant_id)
select 'CERTIFICACAO_EX', 'Certificação Ex', '97de1153-6c9a-4640-a953-0dffd70253b8'
where not exists (
  select 1
  from public.document_categories
  where tenant_id = '97de1153-6c9a-4640-a953-0dffd70253b8'
    and code = 'CERTIFICACAO_EX'
);

insert into public.document_categories (code, name, tenant_id)
select 'INTEGRIDADE_EX', 'Integridade Ex', '97de1153-6c9a-4640-a953-0dffd70253b8'
where not exists (
  select 1
  from public.document_categories
  where tenant_id = '97de1153-6c9a-4640-a953-0dffd70253b8'
    and code = 'INTEGRIDADE_EX'
);

insert into public.document_categories (code, name, tenant_id)
select 'RTI', 'RTI', '97de1153-6c9a-4640-a953-0dffd70253b8'
where not exists (
  select 1
  from public.document_categories
  where tenant_id = '97de1153-6c9a-4640-a953-0dffd70253b8'
    and code = 'RTI'
);

insert into public.document_categories (code, name, tenant_id)
select 'HISTORICO_RTI', 'Histórico de RTIs', '97de1153-6c9a-4640-a953-0dffd70253b8'
where not exists (
  select 1
  from public.document_categories
  where tenant_id = '97de1153-6c9a-4640-a953-0dffd70253b8'
    and code = 'HISTORICO_RTI'
);

insert into public.document_categories (code, name, tenant_id)
select 'PLANO_ACAO', 'Plano de Ação', '97de1153-6c9a-4640-a953-0dffd70253b8'
where not exists (
  select 1
  from public.document_categories
  where tenant_id = '97de1153-6c9a-4640-a953-0dffd70253b8'
    and code = 'PLANO_ACAO'
);

insert into public.document_categories (code, name, tenant_id)
select 'EVIDENCIA_ENCERRAMENTO', 'Evidência de Encerramento', '97de1153-6c9a-4640-a953-0dffd70253b8'
where not exists (
  select 1
  from public.document_categories
  where tenant_id = '97de1153-6c9a-4640-a953-0dffd70253b8'
    and code = 'EVIDENCIA_ENCERRAMENTO'
);

insert into public.document_categories (code, name, tenant_id)
select 'EMERGENCIA', 'Procedimentos de Emergência', '97de1153-6c9a-4640-a953-0dffd70253b8'
where not exists (
  select 1
  from public.document_categories
  where tenant_id = '97de1153-6c9a-4640-a953-0dffd70253b8'
    and code = 'EMERGENCIA'
);

insert into public.document_categories (code, name, tenant_id)
select 'CERTIFICACAO_SEP', 'Certificações SEP', '97de1153-6c9a-4640-a953-0dffd70253b8'
where not exists (
  select 1
  from public.document_categories
  where tenant_id = '97de1153-6c9a-4640-a953-0dffd70253b8'
    and code = 'CERTIFICACAO_SEP'
);

insert into public.document_categories (code, name, tenant_id)
select 'SIMULADOS', 'Simulados e Registros', '97de1153-6c9a-4640-a953-0dffd70253b8'
where not exists (
  select 1
  from public.document_categories
  where tenant_id = '97de1153-6c9a-4640-a953-0dffd70253b8'
    and code = 'SIMULADOS'
);

insert into public.document_categories (code, name, tenant_id)
select 'INVENTARIO_RISCO_ELETRICO', 'Inventário de Risco Elétrico', '97de1153-6c9a-4640-a953-0dffd70253b8'
where not exists (
  select 1
  from public.document_categories
  where tenant_id = '97de1153-6c9a-4640-a953-0dffd70253b8'
    and code = 'INVENTARIO_RISCO_ELETRICO'
);

insert into public.document_categories (code, name, tenant_id)
select 'ENERGIA_INCIDENTE', 'Energia Incidente', '97de1153-6c9a-4640-a953-0dffd70253b8'
where not exists (
  select 1
  from public.document_categories
  where tenant_id = '97de1153-6c9a-4640-a953-0dffd70253b8'
    and code = 'ENERGIA_INCIDENTE'
);

insert into public.document_categories (code, name, tenant_id)
select 'CRONOGRAMA_INSPECOES', 'Cronograma Mestre de Inspeções', '97de1153-6c9a-4640-a953-0dffd70253b8'
where not exists (
  select 1
  from public.document_categories
  where tenant_id = '97de1153-6c9a-4640-a953-0dffd70253b8'
    and code = 'CRONOGRAMA_INSPECOES'
);

insert into public.document_categories (code, name, tenant_id)
select 'REVISAO_PIE', 'Controle de Revisões do PIE', '97de1153-6c9a-4640-a953-0dffd70253b8'
where not exists (
  select 1
  from public.document_categories
  where tenant_id = '97de1153-6c9a-4640-a953-0dffd70253b8'
    and code = 'REVISAO_PIE'
);

-- Categoria especial para marcar itens como "Não aplicável"
insert into public.document_categories (code, name, tenant_id)
select 'PIE_STATUS', 'Status PIE', '97de1153-6c9a-4640-a953-0dffd70253b8'
where not exists (
  select 1
  from public.document_categories
  where tenant_id = '97de1153-6c9a-4640-a953-0dffd70253b8'
    and code = 'PIE_STATUS'
);
