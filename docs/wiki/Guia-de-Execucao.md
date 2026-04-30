# Guia de Execucao

## Instalar dependencias

```bash
npm install
```

## Rodar API

```bash
npm run dev
```

URLs:

- API base: `http://localhost:3000/api`
- Health check: `http://localhost:3000/health`
- Swagger UI: `http://localhost:3000/api-docs`

## Rodar testes de API

```bash
npm test
```

Ou explicitamente:

```bash
npm run test:api
```

## Gerar relatorio HTML

```bash
npm run test:report
```

Saida esperada:

- `mochawesome-report/resultado-testes.html`
- `mochawesome-report/resultado-testes.json`

## Rodar testes de performance

A API deve estar rodando antes da execucao dos testes K6.

```bash
npm run test:performance:smoke
npm run test:performance:load
npm run test:performance:stress
npm run test:performance:spike
```

## Configuracao de performance

| Arquivo | Objetivo |
|---|---|
| `test/performance/config/config.local.json` | URL base padrao. |
| `test/performance/fixtures/post-login.json` | Payload de login. |
| `test/performance/fixtures/post-appointment.json` | Payload base de agendamento. |
| `test/performance/helpers/autenticacao.js` | Obter token. |
| `test/performance/utils/agendamento.js` | Montar payload dinamico. |
| `test/performance/utils/opcoes.js` | Criar configuracoes K6. |
| `test/performance/utils/variaveis.js` | Resolver variaveis de ambiente. |

## Checklist antes de uma entrega

- `npm test` executado com sucesso.
- Swagger revisado quando houver alteracao de contrato.
- Wiki atualizada quando houver nova regra, rota ou risco.
- Relatorio HTML gerado quando solicitado.
- Defeitos encontrados registrados com evidencia.

