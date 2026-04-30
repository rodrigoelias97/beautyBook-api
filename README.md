# BeautyBook API

API REST simples em JavaScript com Express e banco de dados em memoria.

## Como rodar

1. Instale as dependencias:

```bash
npm install
```

2. Inicie a API:

```bash
npm run dev
```

3. Acesse:

- API base: `http://localhost:3000/api`
- Health check: `http://localhost:3000/health`
- Swagger UI: `http://localhost:3000/api-docs`

## Usuarios de teste

### Admin
- login: `admin@beautybook.com`
- senha: `admin123`

### Cliente
- login: `cliente@beautybook.com`
- senha: `cliente123`

## Fluxo simples para testar

1. Fazer login em `POST /api/auth/login`
2. Copiar o `accessToken`
3. Enviar o token no header:

```http
Authorization: Bearer SEU_TOKEN
```

4. Testar os endpoints da API

## Testes automatizados

### API

```bash
npm test
```

### Performance com K6

Os testes de performance ficaram organizados de forma semelhante ao projeto de referencia, com pastas `config`, `fixtures`, `helpers`, `tests` e `utils` dentro de [test/performance](C:/Projetos/beautyBook/test/performance).

Os cenarios usam a API rodando em `http://localhost:3000` por padrao, lendo esse valor de [config.local.json](C:/Projetos/beautyBook/test/performance/config/config.local.json). Se quiser apontar para outra URL, defina `BASE_URL`.

Os cenarios exercitam a jornada principal da aplicacao: `GET /health`, `POST /api/auth/login`, `GET /api/services`, `GET /api/availability` e `POST /api/appointments`.

```bash
npm run test:performance:smoke
npm run test:performance:load
npm run test:performance:stress
npm run test:performance:spike
```

## Observacao importante

Os dados ficam apenas em memoria. Quando a aplicacao for reiniciada, tudo volta para o estado inicial.
