---
name: beautybook-api-tests
description: Criar, atualizar e revisar testes automatizados da BeautyBook API. Use quando o Codex precisar adicionar ou corrigir cobertura com Mocha, Chai ou Supertest, expandir fixtures e helpers, cobrir regras de negocio nos endpoints, ou verificar regresses em test/api, test/helpers ou test/fixtures.
---

# BeautyBook API Tests

## Visao Geral

Use esta skill para manter a cobertura dos endpoints alinhada com as regras de negocio da API. Prefira testes legiveis que reaproveitem os helpers, geradores de fixture e o fluxo de setup ja existentes no repositorio.

## Mapa De Testes

- Especificacoes de rota: `test/api/*.test.js`
- Fixtures: `test/fixtures/*.js`
- Helpers compartilhados: `test/helpers/*.js`
- Setup global: `test/helpers/test-setup.js`

## Fluxo De Trabalho

1. Abra a implementacao da rota e o arquivo `*.test.js` existente mais proximo antes de adicionar cobertura.
2. Reaproveite factories de fixture e helpers sempre que possivel em vez de fixar payloads manualmente em cada teste.
3. Cubra o menor conjunto completo de comportamento para a mudanca: caminho feliz, restricoes de auth ou papel, falhas de validacao e casos de borda das regras de negocio.
4. Mantenha as assercoes especificas ao contrato publico: status, body, mensagem de erro e efeito no estado.
5. Rode o comando de teste mais focado que fizer sentido e so amplie se a alteracao tocar comportamento compartilhado.

## Orientacoes Especificas Do Projeto

- `test/helpers/test-setup.js` deve continuar como ponto de entrada compartilhado para as execucoes do Mocha.
- Prefira seguir os padroes de nomenclatura ja existentes, como blocos `describe` por endpoint ou operacao.
- Use os helpers de auth e de agendamento em vez de recriar inline a logica de login e agendamento.
- Considere as regras de negocio ja aplicadas pela app: permissoes por papel, horario do salao, intervalo bloqueado, limites de agendamento, fluxos com avaliacao previa e janela de cancelamento.
- Quando o comportamento de uma rota mudar, atualize primeiro o arquivo de teste mais proximo antes de criar uma nova suite.

## Comandos Uteis

- Full API suite: `npm test`
- Explicit API suite: `npm run test:api`
- HTML report: `npm run test:report`
- Focused Mocha run: `npx mocha --file test/helpers/test-setup.js "test/api/<arquivo>.test.js"`

## Criterios De Conclusao

- O comportamento novo ou alterado esta coberto por testes estaveis.
- As assercoes documentam claramente o contrato esperado.
- A nota final menciona exatamente qual comando de teste foi executado e qualquer lacuna que tenha ficado sem verificacao.
