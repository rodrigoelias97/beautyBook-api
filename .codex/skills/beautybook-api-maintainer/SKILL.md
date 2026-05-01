---
name: beautybook-api-maintainer
description: Manter e evoluir a base da BeautyBook API. Use quando o Codex precisar implementar funcionalidades, corrigir bugs, refatorar rotas ou middlewares do Express, atualizar regras de negocio em memoria, manter OpenAPI e README alinhados com mudancas no codigo, ou fazer alteracoes gerais neste repositorio.
---

# BeautyBook API Maintainer

## Visao Geral

Use esta skill para fazer mudancas na BeautyBook API sem perder o alinhamento entre implementacao, testes e documentacao. Prefira a menor alteracao possivel que respeite a estrutura atual do repositorio e as regras de negocio existentes.

## Mapa Do Projeto

- Pontos de entrada: `src/app.js`, `src/server.js`
- Dados em memoria: `src/data/store.js`
- Middlewares: `src/middleware/auth.js`, `src/middleware/error-handler.js`
- Rotas: `src/routes/*.js`
- Utilitarios compartilhados: `src/utils/*.js`
- Testes de API: `test/api/*.test.js`
- Testes de performance: `test/performance/**`
- Contrato e docs: `docs/openapi.yaml`, `docs/regraDeNegocio.md`, `README.md`, `.wiki/`, `docs/wiki/`

## Fluxo De Trabalho

1. Leia `package.json`, o arquivo de rota ou utilitario alvo e o teste existente mais proximo antes de editar.
2. Rastreie o fluxo por `src/app.js` e pelo arquivo de rota relevante para que a mudanca encaixe na estrutura atual do Express.
3. Reaproveite helpers e padroes ja existentes em vez de introduzir uma nova camada arquitetural.
4. Se um payload, rota, regra de autenticacao ou regra de negocio mudar, atualize os testes afetados e sincronize `docs/openapi.yaml` com a documentacao mais relevante para o usuario.
5. Valide primeiro com o comando mais enxuto possivel e so amplie a execucao se necessario.

## Convencoes Do Repositorio

- Mantenha o codigo em JavaScript com ES Modules e preserve o estilo enxuto de Express ja usado no repositorio.
- Trate `src/data/store.js` como o estado canonico da aplicacao para execucao local e testes.
- Preserve o modelo atual de autorizacao: apenas `POST /api/auth/login` e `GET /health` sao publicos.
- Respeite a separacao de papeis entre `ADMIN` e `CLIENT` ao alterar rotas protegidas.
- Preserve as regras do salao ja documentadas, a menos que a tarefa mude isso explicitamente: dias de funcionamento, intervalo bloqueado, slots de 30 minutos, dois agendamentos ativos por cliente na mesma data e cancelamento minimo de 48 horas.
- Prefira atualizar um par de arquivos ja existente, como rota e testes, em vez de espalhar logica em novas pastas.

## Validacao

- Mudancas na API: rode `npm test` ou um comando focado de Mocha quando fizer sentido.
- Mudancas de contrato ou documentacao: verifique se exemplos, nomes de endpoints e exigencias de autenticacao batem com o codigo.
- Mudancas sensiveis a performance: confira se `test/performance/**` ou `.github/workflows/ci.yml` tambem precisam acompanhar a alteracao.

## Criterios De Conclusao

- O caminho do codigo continua coerente com a arquitetura atual.
- Testes e documentacao acompanham mudancas de comportamento.
- O resumo final destaca impacto visivel para o usuario, validacao executada e qualquer lacuna restante.
