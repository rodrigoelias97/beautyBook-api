---
name: beautybook-api-ci
description: Manter o workflow de GitHub Actions da BeautyBook API. Use quando o Codex precisar criar ou atualizar o comportamento de CI em .github/workflows/ci.yml, manter os passos alinhados com os scripts do package.json, ajustar opcoes manuais de disparo de performance, ou diagnosticar mudancas na automacao do repositorio.
---

# BeautyBook API CI

## Visao Geral

Use esta skill para alterar o CI com seguranca e manter a automacao alinhada com a forma como o projeto ja roda localmente. Prefira pequenas edicoes no workflow, preserve a legibilidade e evite introduzir passos que dupliquem scripts npm ja existentes.

## Mapa Do Workflow

- Workflow principal: `.github/workflows/ci.yml`
- Fonte da verdade dos scripts: `package.json`
- Alvo de inicializacao da API: `src/server.js`
- Suites de performance: `test/performance/tests/*.test.js`

## Fluxo De Trabalho

1. Leia `.github/workflows/ci.yml` e `package.json` em conjunto antes de alterar a automacao.
2. Preserve a divisao atual entre testes de API e testes de performance, a menos que a tarefa mude isso explicitamente.
3. Prefira invocar scripts npm ja existentes em vez de embutir comandos longos inline.
4. Mantenha o fluxo de inicializacao da API e healthcheck coerente com o comportamento local na porta `3000`.
5. Se uma entrada do workflow ou lista de suites mudar, atualize todas as condicoes `if` dependentes no arquivo.

## Orientacoes Especificas Do Projeto

- O workflow atualmente roda em `pull_request`, `push` para `main` e `workflow_dispatch`.
- O disparo manual inclui `performance_suite` com `smoke`, `load`, `stress`, `spike` e `all`.
- `performance-tests` depende de `api-tests`; preserve essa dependencia, a menos que exista uma razao clara para mudar o encadeamento.
- `grafana/setup-k6-action@v1` faz parte do toolchain atual; mantenha o setup do K6 explicito.
- Ao renomear ou remover uma suite, atualize juntos a logica do workflow e os scripts npm.

## Validacao

- Releia o YAML para conferir indentacao, condicoes duplicadas e cobertura de branches ou eventos.
- Verifique se todo comando em `run:` existe localmente ou em `package.json`.
- Se o comportamento do CI mudar de forma material, anote quais pontos ainda dependem de execucao real no GitHub para confirmar.

## Criterios De Conclusao

- O workflow continua compativel com os scripts locais e com os eventos esperados.
- Toda suite alterada ou opcao de disparo modificada esta completamente conectada.
- A nota final diferencia claramente validacao local de execucao hospedada no GitHub.
