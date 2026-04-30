# Condicoes de Teste

As condicoes abaixo foram derivadas das regras de negocio, criterios de aceitacao e riscos da API.

| ID | Condicao de teste | Rastreabilidade | Prioridade |
|---|---|---|---|
| CTD-001 | Autenticar administrador por username. | AUTH-RN-01 | Alta |
| CTD-002 | Autenticar administrador por e-mail. | AUTH-RN-01 | Alta |
| CTD-003 | Autenticar cliente por username. | AUTH-RN-01 | Alta |
| CTD-004 | Autenticar cliente por e-mail. | AUTH-RN-01 | Alta |
| CTD-005 | Rejeitar login/senha invalidos ou vazios. | AUTH-RN-02 | Alta |
| CTD-006 | Listar servicos somente para usuario autenticado. | SRV-RN-01 | Alta |
| CTD-007 | Permitir cadastro, edicao e exclusao de servicos apenas para ADMIN. | SRV-RN-02 | Alta |
| CTD-008 | Validar nome obrigatorio, tamanho maximo e duplicidade de servico. | SRV-RN-03 | Alta |
| CTD-009 | Validar `necessitaAvaliacao`, `tempoServico` e `valor`. | SRV-RN-04 | Alta |
| CTD-010 | Consultar regras de negocio para ADMIN e CLIENT autenticados. | BR-RN-01 | Media |
| CTD-011 | Permitir atualizacao de regras somente para ADMIN. | BR-RN-02 | Alta |
| CTD-012 | Validar horario de abertura, fechamento e intervalos. | BR-RN-03 | Alta |
| CTD-013 | Permitir qualquer dia valido da semana e rejeitar strings invalidas. | BR-RN-04 | Media |
| CTD-014 | Consultar disponibilidade com parametros obrigatorios. | AVL-RN-01 | Alta |
| CTD-015 | Rejeitar servicos inexistentes ou que exigem avaliacao na disponibilidade automatica. | AVL-RN-02 | Alta |
| CTD-016 | Exibir horarios livres sem conflitos com agenda, intervalos e expediente. | AVL-RN-03 | Alta |
| CTD-017 | Criar agendamento confirmado para servico comum. | AGD-RN-01 | Alta |
| CTD-018 | Criar solicitacao pendente para servico que exige avaliacao. | AGD-RN-02 | Alta |
| CTD-019 | Impedir cliente de criar agendamento para outro cliente. | AGD-RN-03 | Alta |
| CTD-020 | Permitir ADMIN criar agendamento para cliente. | AGD-RN-04 | Alta |
| CTD-021 | Bloquear terceiro agendamento do mesmo cliente no mesmo dia. | AGD-RN-05 | Media |
| CTD-022 | Bloquear conflito de horario com agendamento confirmado. | AGD-RN-06 | Alta |
| CTD-023 | Validar campos de data, hora, telefone, cliente e servico. | AGD-RN-07 | Alta |
| CTD-024 | Permitir cancelamento com antecedencia minima de 48 horas. | AGD-RN-08 | Alta |
| CTD-025 | Restringir exclusao de agendamento ao ADMIN. | AGD-RN-09 | Alta |
| CTD-026 | Verificar jornada principal sob smoke/load/stress/spike. | PERF-RN-01 | Media |

