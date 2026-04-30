# Defeitos

Modelo de relato de defeito baseado em ISO-29119-3 e ferramentas de gestao de defeitos.

## Template

| Campo | Descricao |
|---|---|
| ID | Identificador unico do defeito. |
| Titulo | Descricao breve e objetiva. |
| Testador | Pessoa que encontrou o defeito. |
| Data e hora | Momento da identificacao. |
| Ambiente | Local, branch, commit, navegador/ferramenta se aplicavel. |
| Resultado esperado | Como a API deveria se comportar. |
| Resultado atual | O que aconteceu de fato. |
| Passos para reproduzir | Sequencia minima para reproduzir. |
| Evidencias | Payload, resposta HTTP, log, print ou relatorio. |
| Prioridade | Ordem sugerida de correcao. |
| Severidade | Impacto para usuario ou negocio. |
| Rastreabilidade | Caso de teste, condicao, risco ou requisito relacionado. |
| Status | Novo, Em analise, Em correcao, Corrigido, Reaberto, Fechado. |

## Exemplo

| Campo | Valor |
|---|---|
| ID | DEF-AGD-001 |
| Titulo | API permite criar agendamento em horario conflitante. |
| Resultado esperado | Retornar `409 TIME_SLOT_OVERLAP`. |
| Resultado atual | Retornou `201 CONFIRMED`. |
| Evidencias | Payload de criacao e resposta HTTP. |
| Prioridade | Alta |
| Severidade | Alta |
| Rastreabilidade | CT-AGD-007, R-003 |
| Status | Novo |

