# Casos de Teste

Os casos de teste seguem o padrao dos modelos baseados na ISO-29119-3: identificacao, titulo, prioridade, rastreabilidade, pre-condicoes, acao e resultado esperado.

## Pre-condicoes gerais

- API disponivel em `http://localhost:3000`.
- Dependencias instaladas com `npm install`.
- Banco em memoria carregado com usuarios, servicos e regras padrao.
- Usuario ADMIN: `admin` / `admin123`.
- Usuario CLIENT: `cliente` / `cliente123`.
- Token enviado no header `Authorization: Bearer <token>` para rotas protegidas.

## Autenticacao

| ID | Titulo | Prioridade | Resultado esperado |
|---|---|---|---|
| CT-AUTH-001 | Autenticar administrador usando username. | Alta | Retorna `200`, token Bearer e dados do usuario ADMIN. |
| CT-AUTH-002 | Autenticar administrador usando e-mail. | Alta | Retorna `200`, token Bearer e dados do usuario ADMIN. |
| CT-AUTH-003 | Autenticar cliente usando username. | Alta | Retorna `200`, token Bearer e dados do usuario CLIENT. |
| CT-AUTH-004 | Autenticar cliente usando e-mail. | Alta | Retorna `200`, token Bearer e dados do usuario CLIENT. |
| CT-AUTH-005 | Rejeitar acesso com login incorreto. | Alta | Retorna `401 UNAUTHORIZED`. |
| CT-AUTH-006 | Rejeitar acesso com login vazio. | Alta | Retorna `401 UNAUTHORIZED`. |
| CT-AUTH-007 | Rejeitar acesso com senha incorreta. | Alta | Retorna `401 UNAUTHORIZED`. |
| CT-AUTH-008 | Rejeitar acesso com senha vazia. | Alta | Retorna `401 UNAUTHORIZED`. |
| CT-AUTH-009 | Rejeitar acesso com login e senha incorretos. | Alta | Retorna `401 UNAUTHORIZED`. |
| CT-AUTH-010 | Rejeitar acesso com login e senha vazios. | Alta | Retorna `401 UNAUTHORIZED`. |

## Servicos

| ID | Titulo | Prioridade | Resultado esperado |
|---|---|---|---|
| CT-SRV-001 | Bloquear listagem quando usuario nao estiver autenticado. | Alta | Retorna `401 UNAUTHORIZED`. |
| CT-SRV-002 | Listar servicos para administrador autenticado. | Alta | Retorna lista de servicos. |
| CT-SRV-003 | Listar servicos para cliente autenticado. | Alta | Retorna lista de servicos. |
| CT-SRV-004 | Permitir administrador cadastrar novo servico. | Alta | Retorna `201` com servico criado. |
| CT-SRV-005 | Permitir servico com avaliacao sem valor e tempo. | Alta | Retorna `201`, `tempoServico` e `valor` como `null`. |
| CT-SRV-006 | Impedir cliente de cadastrar servico. | Alta | Retorna `403 FORBIDDEN`. |
| CT-SRV-007 | Rejeitar nome duplicado. | Alta | Retorna `409 SERVICE_NAME_ALREADY_EXISTS`. |
| CT-SRV-008 | Bloquear cadastro sem nome. | Alta | Retorna `400 VALIDATION_ERROR`. |
| CT-SRV-009 | Retornar erro ao buscar servico inexistente. | Media | Retorna `404 RESOURCE_NOT_FOUND`. |
| CT-SRV-010 | Permitir administrador atualizar servico. | Alta | Retorna `200` com dados atualizados. |
| CT-SRV-011 | Permitir atualizar servico para exigir avaliacao. | Alta | Retorna `200`, valor e tempo removidos. |
| CT-SRV-012 | Bloquear atualizacao com nome duplicado. | Alta | Retorna `409 SERVICE_NAME_ALREADY_EXISTS`. |
| CT-SRV-013 | Bloquear cliente de atualizar servico. | Alta | Retorna `403 FORBIDDEN`. |
| CT-SRV-014 | Permitir administrador excluir servico. | Alta | Retorna `204`. |
| CT-SRV-015 | Bloquear cliente de excluir servico. | Alta | Retorna `403 FORBIDDEN`. |
| CT-SRV-016 | Bloquear nome com mais de 44 caracteres. | Media | Retorna `400 VALIDATION_ERROR`. |
| CT-SRV-017 | Bloquear servico sem valor e tempo quando nao exige avaliacao. | Alta | Retorna `400 VALIDATION_ERROR`. |
| CT-SRV-018 | Bloquear valor negativo. | Alta | Retorna `400 VALIDATION_ERROR`. |
| CT-SRV-019 | Bloquear valor zero. | Alta | Retorna `400 VALIDATION_ERROR`. |
| CT-SRV-020 | Bloquear valor em string. | Media | Retorna `400 VALIDATION_ERROR`. |
| CT-SRV-021 | Bloquear tempo menor que `00:15`. | Media | Retorna `400 VALIDATION_ERROR`. |
| CT-SRV-022 | Permitir tempo no limite minimo `00:15`. | Media | Retorna `201`. |
| CT-SRV-023 | Permitir tempo no limite maximo `08:00`. | Media | Retorna `201`. |
| CT-SRV-024 | Bloquear tempo maior que `08:00`. | Media | Retorna `400 VALIDATION_ERROR`. |
| CT-SRV-025 | Bloquear hora fora do formato. | Alta | Retorna `400 VALIDATION_ERROR`. |

## Regras de negocio

| ID | Titulo | Prioridade | Resultado esperado |
|---|---|---|---|
| CT-BR-001 | Retornar regras atuais para administrador autenticado. | Media | Retorna horario padrao e dias terca a sabado. |
| CT-BR-002 | Retornar regras atuais para cliente autenticado. | Media | Retorna horario padrao e dias terca a sabado. |
| CT-BR-003 | Permitir atualizacao por administrador. | Alta | Retorna regras atualizadas. |
| CT-BR-004 | Impedir atualizacao por cliente. | Alta | Retorna `403 FORBIDDEN`. |
| CT-BR-005 | Validar fechamento maior que abertura. | Alta | Retorna `400 VALIDATION_ERROR`. |
| CT-BR-006 | Validar fim de intervalo maior que inicio. | Alta | Retorna `400 VALIDATION_ERROR`. |
| CT-BR-007 | Permitir qualquer dia valido da semana. | Media | Retorna dias informados. |
| CT-BR-008 | Validar dia da semana invalido. | Media | Retorna `400 VALIDATION_ERROR`. |
| CT-BR-009 | Validar horarios em formato incorreto. | Alta | Retorna `400 VALIDATION_ERROR`. |

## Disponibilidade

| ID | Titulo | Prioridade | Resultado esperado |
|---|---|---|---|
| CT-AVL-001 | Exigir parametros obrigatorios. | Alta | Retorna `400 VALIDATION_ERROR`. |
| CT-AVL-002 | Validar formato do horario informado. | Alta | Retorna `400 VALIDATION_ERROR`. |
| CT-AVL-003 | Informar erro para servico inexistente. | Alta | Retorna `404 RESOURCE_NOT_FOUND`. |
| CT-AVL-004 | Recusar agenda automatica para servico com avaliacao. | Alta | Retorna `400 SERVICE_REQUIRES_EVALUATION`. |
| CT-AVL-005 | Retornar lista vazia fora do funcionamento. | Media | Retorna `horariosDisponiveis: []`. |
| CT-AVL-006 | Ocultar horarios com conflito existente. | Alta | Horario ocupado nao aparece na lista. |
| CT-AVL-007 | Retornar horarios apenas de meia em meia hora. | Media | Minutos sempre `00` ou `30`. |

## Agendamentos

| ID | Titulo | Prioridade | Resultado esperado |
|---|---|---|---|
| CT-AGD-001 | Cliente cria agendamento confirmado. | Alta | Retorna `201 CONFIRMED`. |
| CT-AGD-002 | Impedir cliente de agendar para outro cliente. | Alta | Retorna `403 FORBIDDEN`. |
| CT-AGD-003 | Criar pendencia para servico com avaliacao. | Alta | Retorna `PENDENTE_AVALIACAO`. |
| CT-AGD-004 | Administrador cria agendamento confirmado para cliente. | Alta | Retorna `201 CONFIRMED`. |
| CT-AGD-005 | Administrador cria solicitacao pendente. | Alta | Retorna `PENDENTE_AVALIACAO`. |
| CT-AGD-006 | Bloquear terceiro agendamento no mesmo dia. | Media | Retorna `400 DAILY_APPOINTMENT_LIMIT_REACHED`. |
| CT-AGD-007 | Bloquear conflito de horario. | Alta | Retorna `409 TIME_SLOT_OVERLAP`. |
| CT-AGD-008 | Exigir data na listagem administrativa. | Media | Retorna `400 VALIDATION_ERROR`. |
| CT-AGD-009 | Listar agendamentos do dia para administrador. | Alta | Retorna lista ordenada. |
| CT-AGD-010 | Permitir cliente consultar proprio agendamento. | Alta | Retorna agendamento solicitado. |
| CT-AGD-011 | Cancelar com antecedencia minima de 48 horas. | Alta | Retorna status `CANCELLED`. |
| CT-AGD-012 | Impedir cancelamento fora da janela de 48 horas. | Alta | Retorna `400 CANCELLATION_WINDOW_EXPIRED`. |
| CT-AGD-013 | Permitir administrador excluir agendamento. | Alta | Retorna `204`. |
| CT-AGD-014 | Impedir cliente de excluir agendamento. | Alta | Retorna `403 FORBIDDEN`. |
| CT-AGD-015 | Impedir data fora do formato. | Alta | Retorna `400 VALIDATION_ERROR`. |
| CT-AGD-016 | Impedir hora fora do formato. | Alta | Retorna `400 VALIDATION_ERROR`. |
| CT-AGD-017 | Impedir telefone fora do formato. | Alta | Retorna `400 VALIDATION_ERROR`. |
| CT-AGD-018 | Impedir telefone com texto. | Alta | Retorna `400 VALIDATION_ERROR`. |
| CT-AGD-019 | Impedir cliente inexistente. | Alta | Retorna `404 RESOURCE_NOT_FOUND`. |
| CT-AGD-020 | Impedir servico inexistente. | Alta | Retorna `404 RESOURCE_NOT_FOUND`. |
| CT-AGD-021 | Impedir telefone fora do padrao. | Alta | Retorna `400 VALIDATION_ERROR`. |

