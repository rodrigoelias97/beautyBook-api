# Teste Baseado em Riscos

## Escala

| Valor | Probabilidade | Impacto |
|---|---|---|
| 1 | Baixa | Baixo |
| 2 | Media | Medio |
| 3 | Alta | Alto |

Exposicao ao risco = probabilidade x impacto.

## Matriz de riscos

| ID | Risco | Prob. | Impacto | Exposicao | Prioridade | Mitigacao / cobertura |
|---|---|---:|---:|---:|---|---|
| R-001 | Cliente conseguir agendar para outro cliente. | 2 | 3 | 6 | Alta | Testes CT-AGD-002 e autorizacao por perfil. |
| R-002 | ADMIN nao conseguir criar agenda para cliente. | 2 | 3 | 6 | Alta | Testes CT-AGD-004 e CT-AGD-005. |
| R-003 | Dois agendamentos ocuparem o mesmo horario. | 3 | 3 | 9 | Critica | CT-AGD-007 e CT-AVL-006. |
| R-004 | Disponibilidade mostrar horario dentro de intervalo ou fora do expediente. | 2 | 3 | 6 | Alta | CT-BR-005, CT-BR-006, CT-AVL-005 e CT-AVL-006. |
| R-005 | Servico com avaliacao ser agendado automaticamente como confirmado. | 2 | 3 | 6 | Alta | CT-AGD-003, CT-AGD-005 e CT-AVL-004. |
| R-006 | Usuario cliente cadastrar, editar ou excluir servicos. | 2 | 3 | 6 | Alta | CT-SRV-006, CT-SRV-013 e CT-SRV-015. |
| R-007 | Validacoes aceitarem dados invalidos. | 3 | 2 | 6 | Alta | Casos de formato para data, hora, telefone, valor e tempo. |
| R-008 | Login aceitar credenciais invalidas. | 2 | 3 | 6 | Alta | CT-AUTH-005 a CT-AUTH-010. |
| R-009 | Alteracao de regras permitir dias inexistentes. | 2 | 2 | 4 | Media | CT-BR-008. |
| R-010 | API degradar em carga simples. | 2 | 2 | 4 | Media | Testes K6 smoke, load, stress e spike. |
| R-011 | Banco em memoria gerar resultado diferente entre execucoes. | 2 | 2 | 4 | Media | Reset antes de cada teste de API. |
| R-012 | Documentacao divergir da API. | 2 | 2 | 4 | Media | Revisar Swagger e Wiki a cada mudanca de rota. |

## Priorizacao

| Prioridade | Criterio | Acao |
|---|---|---|
| Critica | Exposicao 8-9 | Automatizar, revisar a cada mudanca e bloquear entrega se falhar. |
| Alta | Exposicao 6 | Automatizar e executar em regressao. |
| Media | Exposicao 3-5 | Cobrir por teste automatizado ou exploratorio. |
| Baixa | Exposicao 1-2 | Registrar e acompanhar. |

## Cobertura atual por risco

| Area | Cobertura |
|---|---|
| Autenticacao | Alta |
| Autorizacao | Alta |
| Servicos | Alta |
| Regras de negocio | Alta |
| Disponibilidade | Alta |
| Agendamentos | Alta |
| Performance | Media |
| Persistencia | Baixa, pois o banco ainda e em memoria |

