# Relatorio de Sessao

Modelo para registrar execucoes exploratorias da BeautyBook API.

## Identificacao

| Campo | Valor |
|---|---|
| Data e hora do inicio | Preencher durante a execucao |
| Nome do testador | Preencher |
| Modulo | Auth / Services / Business Rules / Availability / Appointments / Performance |
| Duracao | 30 minutos |
| Ambiente | Localhost ou ambiente informado |

## Charter

Explore `<alvo>` com `<recursos/heuristicas>` para descobrir `<informacao ou risco>`.

Exemplo:

Explore a criacao de agendamentos com regras de funcionamento alteradas, usando dados validos, invalidos e proximos aos limites, para descobrir se a API impede conflitos e retorna mensagens claras.

## Notas

| Tipo | Descricao |
|---|---|
| I | Informacao observada durante a sessao. |
| R | Risco identificado. |
| D | Defeito encontrado. |
| P | Pergunta aberta. |

## Defeitos encontrados

| ID | Resumo | Severidade | Evidencia |
|---|---|---|---|
| DEF-001 | Preencher se houver defeito. | Alta/Media/Baixa | Print, log, payload ou resposta HTTP. |

## Perguntas

| ID | Pergunta | Destino |
|---|---|---|
| P-001 | A regra de cancelamento de 48 horas vale tambem para solicitacoes pendentes? | Produto |
| P-002 | O limite de dois agendamentos por dia deve considerar agendamentos pendentes? | Produto |
| P-003 | O telefone deve aceitar mascara ou apenas 11 digitos numericos? | Produto |

## Encerramento

| Campo | Valor |
|---|---|
| Cobertura percebida | Alta / Media / Baixa |
| Riscos novos | Preencher |
| Proximas acoes | Preencher |

