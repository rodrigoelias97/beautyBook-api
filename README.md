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

## Observacao importante

Os dados ficam apenas em memoria. Quando a aplicacao for reiniciada, tudo volta para o estado inicial.
