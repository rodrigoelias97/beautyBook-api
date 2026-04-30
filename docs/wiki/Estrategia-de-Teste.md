# Estrategia de Teste

## Abordagem geral

A estrategia combina testes automatizados de API, validacoes de regras de negocio, testes baseados em risco e sessoes exploratorias. A automacao cobre os fluxos deterministas e repetitivos; o charter exploratorio cobre perguntas, comportamentos inesperados e riscos que nao aparecem facilmente em tabelas de decisao.

## Piramide aplicada

| Camada | Como foi aplicada |
|---|---|
| API funcional | Testes com Supertest exercitando diretamente os endpoints Express. |
| Regras de negocio | Validacoes de horario, dias, intervalos, servicos e agendamentos. |
| Autorizacao | Verificacao de permissoes por perfil `ADMIN` e `CLIENT`. |
| Performance | Scripts K6 para smoke, load, stress e spike. |
| Exploratorio | Charter e relatorio de sessao para descoberta de riscos e defeitos. |

## Padroes usados nos testes

- Um arquivo por rota dentro de `test/api`.
- Descricoes dos testes em portugues.
- Cada cenario em um `it` separado.
- Fixtures em `test/fixtures`.
- Helpers em `test/helpers`.
- Reset do banco em memoria antes de cada teste.
- Uso de `supertest` para simular chamadas reais HTTP.
- Uso de `chai` para validar status, payload e regras esperadas.

## Estrategia por rota

| Rota | Foco dos testes | Prioridade |
|---|---|---|
| Auth | Login valido e rejeicao de credenciais invalidas. | Alta |
| Services | CRUD, permissao ADMIN, validacao de nome, valor e tempo. | Alta |
| Business rules | Horario, dias de funcionamento e intervalos. | Alta |
| Availability | Calculo de horarios livres e bloqueios por regra. | Alta |
| Appointments | Criacao, conflitos, limites diarios, consulta, cancelamento e exclusao. | Alta |

## Estrategia de performance

| Cenario | Objetivo | Thresholds principais |
|---|---|---|
| Smoke | Confirmar que a jornada principal funciona com carga minima. | Falha `0`, p95 `< 500ms`. |
| Load | Validar comportamento com carga sustentada moderada. | Falha `< 1%`, p95 `< 800ms`. |
| Stress | Observar limites com aumento progressivo de usuarios virtuais. | Falha `< 5%`, p95 `< 1500ms`. |
| Spike | Avaliar reacao a pico brusco de usuarios. | Falha `< 10%`, p95 `< 2000ms`. |

## Dados e massa de teste

| Tipo | Origem |
|---|---|
| Usuarios | `src/data/store.js` |
| Servicos | `src/data/store.js` |
| Regras padrao | `src/data/store.js` |
| Payloads API | `test/fixtures` |
| Payloads performance | `test/performance/fixtures` |

## Relatorios

- Execucao simples: `npm test`.
- Relatorio HTML: `npm run test:report`.
- Performance: comandos `npm run test:performance:*`.

