# BeautyBook API - Wiki de Testes

Esta Wiki documenta o fluxo funcional e de testes da BeautyBook API. O objetivo e deixar o projeto completo tanto em automacao quanto em documentacao: escopo, estrategia, riscos, condicoes de teste, casos de teste, charter exploratorio, execucao e registro de defeitos.

## Visao geral da API

A BeautyBook API e uma API REST em Express para apoiar o fluxo de um salao de beleza. A aplicacao usa banco em memoria e expoe endpoints para autenticacao, servicos, regras de negocio, disponibilidade e agendamentos.

## Modulos cobertos

| Modulo | Rotas principais | Objetivo |
|---|---|---|
| Autenticacao | `POST /api/auth/login` | Validar acesso de usuarios `ADMIN` e `CLIENT`. |
| Servicos | `/api/services` | Consultar, cadastrar, editar e excluir servicos do salao. |
| Regras de negocio | `/api/business-rules` | Consultar e configurar horario, dias de funcionamento e intervalos. |
| Disponibilidade | `/api/availability` | Consultar horarios disponiveis conforme regras, servico e agenda. |
| Agendamentos | `/api/appointments` | Criar, listar, consultar, cancelar e excluir agendamentos. |
| Performance | `test/performance` | Validar comportamento sob smoke, carga, stress e pico com K6. |

## Estrutura da documentacao

- [Plano de Teste](Plano-de-Teste): escopo, objetivos, ambiente, entradas, saidas e criterios.
- [Estrategia de Teste](Estrategia-de-Teste): abordagem, tipos de teste, ferramentas e execucao.
- [Condicoes de Teste](Condicoes-de-Teste): condicoes derivadas das regras de negocio e riscos.
- [Casos de Teste](Casos-de-Teste): catalogo dos cenarios automatizados por rota.
- [Teste Charter](Teste-Charter): sessoes exploratorias orientadas por objetivo.
- [Teste Baseado em Riscos](Teste-Baseado-em-Riscos): riscos, impacto, probabilidade e cobertura.
- [Relatorio de Sessao](Relatorio-de-Sessao): modelo de registro das sessoes exploratorias.
- [Defeitos](Defeitos): modelo para relato e acompanhamento de defeitos.
- [Guia de Execucao](Guia-de-Execucao): comandos para rodar API, testes de API e testes de performance.

## Estado atual da automacao

| Tipo | Ferramenta | Local | Status |
|---|---|---|---|
| Teste de API | Mocha, Chai, Supertest | `test/api` | Automatizado |
| Relatorio HTML | Mochawesome | `mochawesome-report` | Configurado |
| Teste de performance | K6 | `test/performance` | Estruturado |
| Documentacao Swagger | Swagger UI | `docs/openapi.yaml` | Disponivel em `/api-docs` |

## Resultado de referencia

Ultima validacao executada localmente:

```bash
npm test
```

Resultado: `72 passing`.

