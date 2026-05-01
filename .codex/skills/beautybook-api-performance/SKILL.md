---
name: beautybook-api-performance
description: Criar, atualizar e interpretar a cobertura de performance com K6 da BeautyBook API. Use quando o Codex precisar trabalhar em test/performance, ajustar cenarios smoke/load/stress/spike, alterar thresholds ou dados de teste, ou manter scripts de performance alinhados com a API e o CI.
---

# BeautyBook API Performance

## Visao Geral

Use esta skill para trabalhos com K6 neste repositorio. Mantenha os cenarios realistas, reaproveite helpers e fixtures ja existentes, e evolua de smoke para suites mais pesadas apenas quando a mudanca justificar isso.

## Mapa De Performance

- Configuracao: `test/performance/config/config.local.json`
- Entradas dos cenarios: `test/performance/tests/*.test.js`
- Helper de auth: `test/performance/helpers/autenticacao.js`
- Utilitarios compartilhados: `test/performance/utils/*.js`
- Fixtures de payload: `test/performance/fixtures/*.json`
- Workflow de CI: `.github/workflows/ci.yml`

## Fluxo De Trabalho

1. Inspecione o cenario alvo e os utilitarios compartilhados antes de alterar codigo K6.
2. Confirme qual jornada do usuario esta sendo testada: health, login, services, availability ou appointments.
3. Reaproveite `autenticacao.js`, `agendamento.js`, `opcoes.js` e `variaveis.js` em vez de duplicar a configuracao das requisicoes.
4. Comece por `smoke`, a menos que a tarefa peça explicitamente comportamento de load, stress ou spike.
5. Se voce alterar nome de script ou contrato de suite, atualize o script relacionado em `package.json` e `.github/workflows/ci.yml`.

## Orientacoes De Execucao

- O alvo local padrao e `http://localhost:3000`.
- Garanta que a API esteja em execucao antes de rodar K6 localmente.
- Mantenha fixtures representativos de payloads reais da API que ja sao aceitos pelos testes e pela documentacao.
- Use thresholds e checks que ajudem a explicar regresses, nao apenas gerar carga bruta.
- Ao relatar resultados, destaque qual endpoint ou etapa provavelmente causou lentidao ou falha.

## Comandos Uteis

- Smoke: `npm run test:performance:smoke`
- Load: `npm run test:performance:load`
- Stress: `npm run test:performance:stress`
- Spike: `npm run test:performance:spike`

## Criterios De Conclusao

- O cenario de K6 continua coerente com a jornada atual da API.
- Scripts, comandos do package e referencias de CI permanecem sincronizados.
- O resumo final inclui a suite executada, o risco observado e se os resultados vieram de execucao local ou de revisao estatica.
