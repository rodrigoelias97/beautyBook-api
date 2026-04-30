# Teste Charter

Inspirado em Session-Based Test Management, o charter abaixo guia sessoes exploratorias complementares aos testes automatizados.

## Charter principal

| Campo | Valor |
|---|---|
| Test Charter | Explore a jornada de agendamento da BeautyBook API. |
| Com | Heuristicas de permissao, validacao de dados, conflito de agenda, limites de horario e comportamento sob carga. |
| Para descobrir | Se a API impede agendamentos indevidos, preserva as regras do salao e retorna mensagens claras para consumidores da API. |
| Tamanho sugerido | 30 minutos |
| Modulos | Auth, Services, Business Rules, Availability e Appointments |
| Testador | QA / Desenvolvedor responsavel |

## Missoes exploratorias

| ID | Missao | Foco | Resultado esperado |
|---|---|---|---|
| CH-001 | Explorar criacao de agendamentos com dados proximos ao limite. | Datas, horarios, telefones e servicos. | Identificar falhas de validacao nao cobertas por testes automatizados. |
| CH-002 | Explorar permissoes entre ADMIN e CLIENT. | Criar, editar, excluir e consultar recursos. | Confirmar que perfis nao conseguem acessar funcoes indevidas. |
| CH-003 | Explorar disponibilidade apos alteracao de regras. | Dias, intervalos e expediente. | Confirmar que horarios disponiveis refletem a regra atual. |
| CH-004 | Explorar servicos que exigem avaliacao. | Agendamento pendente e disponibilidade automatica. | Verificar consistencia entre servicos, disponibilidade e agendamento. |
| CH-005 | Explorar comportamento sob carga leve. | Smoke K6 e jornada principal. | Observar erros intermitentes e tempos fora do esperado. |

## Notas esperadas durante a sessao

Use prefixos simples:

- `(I)` Informacao observada.
- `(R)` Risco identificado.
- `(D)` Defeito encontrado.
- `(P)` Pergunta aberta para negocio ou produto.

## Exemplo de registro

| Tipo | Nota |
|---|---|
| I | Ao alterar dias de funcionamento para incluir domingo, a disponibilidade deve respeitar a nova regra. |
| R | Como os dados ficam em memoria, execucoes de performance podem interferir em execucoes manuais se a API nao for reiniciada. |
| D | Registrar aqui qualquer retorno inesperado, status code incorreto ou mensagem confusa. |
| P | O cliente deve poder cancelar uma solicitacao pendente de avaliacao com as mesmas regras de um agendamento confirmado? |

