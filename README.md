# BeautyBook API

O BeautyBook é uma API REST para agendamentos de horários em salão de beleza. A aplicação centraliza autenticação, catálogo de serviços, regras de funcionamento do salão, consulta de disponibilidade e gestão de agendamentos, incluindo serviços que dependem de avaliação prévia.

Atualmente o projeto foi desenvolvido em JavaScript com Express e utiliza armazenamento em memória, o que facilita a execução local e os testes da regra de negócio.

## Ferramentas e tecnologias utilizadas

### Desenvolvimento da API

- `JavaScript` como linguagem principal da aplicação.
- `Node.js` como ambiente de execução.
- `Express` como framework para construção da API REST.
- `ES Modules` com `type: module` para organização dos módulos JavaScript.
- Banco de dados em memória para armazenamento temporário de usuários, serviços, sessões, regras operacionais e agendamentos.

### Documentação

- `OpenAPI 3.0.3` para definição do contrato da API.
- `Swagger UI` para documentação interativa dos endpoints.
- `swagger-ui-express` para servir a documentação na aplicação.
- `YAML` com `yamljs` para leitura do arquivo `openapi.yaml`.

### Testes e qualidade

- `Mocha` como test runner da suíte de API.
- `Chai` para asserções dos testes automatizados.
- `Supertest` para testes HTTP dos endpoints.
- `Mochawesome` para geração de relatório HTML dos testes.
- `K6` para testes de performance nos cenários smoke, load, stress e spike.

## Funcionalidades

- Autenticação com login por e-mail ou nome de usuário.
- Controle de acesso por perfil `ADMIN` e `CLIENT`.
- Cadastro, consulta, edição e remoção de serviços.
- Consulta e atualização das regras operacionais do salão.
- Cálculo de horários disponíveis com base em expediente, intervalos e conflitos de agenda.
- Criação, consulta, cancelamento e exclusão de agendamentos.
- Documentação interativa com Swagger.

## Regras atuais da aplicação

### Horário de funcionamento

- Abertura: `13:30`
- Fechamento: `22:00`
- Dias de funcionamento: `TUESDAY`, `WEDNESDAY`, `THURSDAY`, `FRIDAY` e `SATURDAY`
- Intervalo indisponível: `17:00` às `18:00`

### Serviços cadastrados por padrão

- `Corte feminino`: duração de `01:00`, valor `R$ 120,00`
- `Escova`: duração de `01:00`, valor `R$ 80,00`
- `Coloração personalizada`: exige avaliação prévia

### Perfis de acesso de teste

#### Administrador

- login: `admin@beautybook.com` ou `admin`
- senha: `admin123`

#### Clientes

- `cliente@beautybook.com` ou `cliente` / senha: `cliente123`
- `clienteteste@beautybook.com` ou `clienteTeste` / senha: `cliente123`

## Como executar

1. Instale as dependências:

```bash
npm install
```

2. Inicie a API em modo de desenvolvimento:

```bash
npm run dev
```

Se preferir executar sem modo de observação:

```bash
npm start
```

## Endereços locais

- API base: `http://localhost:3000/api`
- Health check: `http://localhost:3000/health`
- Swagger UI: `http://localhost:3000/api-docs`

## Endpoints principais

### Autenticação

- `POST /api/auth/login`

### Serviços

- `GET /api/services`
- `GET /api/services/:nomeServico`
- `POST /api/services`
- `PUT /api/services/:nomeServico`
- `DELETE /api/services/:nomeServico`

### Regras operacionais

- `GET /api/business-rules`
- `PUT /api/business-rules`

### Disponibilidade

- `GET /api/availability?data=YYYY-MM-DD&nomeServico=Nome%20do%20Serviço`

### Agendamentos

- `POST /api/appointments`
- `GET /api/appointments?data=YYYY-MM-DD`
- `GET /api/appointments/:appointmentId`
- `PATCH /api/appointments/:appointmentId/cancel`
- `DELETE /api/appointments/:appointmentId`

## Fluxo básico para teste

1. Faça login em `POST /api/auth/login`.
2. Copie o `accessToken` retornado pela API.
3. Envie o token no cabeçalho das rotas protegidas:

```http
Authorization: Bearer SEU_TOKEN
```

4. Consulte os serviços, as regras de negócio, a disponibilidade e crie agendamentos conforme necessário.

## Regras de negócio importantes

- Todos os recursos, exceto login e `health`, exigem autenticação.
- Apenas usuários `ADMIN` podem gerenciar serviços, atualizar regras operacionais, listar a agenda do dia e excluir agendamentos.
- Usuários `CLIENT` só podem criar e consultar os próprios agendamentos.
- Serviços com `necessitaAvaliacao = true` geram agendamentos com status `PENDENTE_AVALIACAO`.
- A disponibilidade é calculada em intervalos de 30 minutos.
- Não é permitido agendar fora do expediente ou durante intervalos bloqueados.
- Cada cliente pode ter no máximo 2 agendamentos ativos na mesma data.
- O cancelamento só é permitido com antecedência mínima de 48 horas.

## Testes automatizados

### Testes de API

```bash
npm test
```

Também estão disponíveis os scripts:

```bash
npm run test:api
npm run test:report
```

### Testes de performance com K6

Os testes de performance estão organizados em [test/performance](C:/Projetos/beautyBook/test/performance) e utilizam `http://localhost:3000` como base padrão, com configuração em [config.local.json](C:/Projetos/beautyBook/test/performance/config/config.local.json).

Os cenários exercitam a jornada principal da aplicação:

- `GET /health`
- `POST /api/auth/login`
- `GET /api/services`
- `GET /api/availability`
- `POST /api/appointments`

Execute com:

```bash
npm run test:performance:smoke
npm run test:performance:load
npm run test:performance:stress
npm run test:performance:spike
```

## Observação importante

Os dados ficam apenas em memória. Sempre que a aplicação for reiniciada, os usuários, serviços, regras operacionais, sessões e agendamentos retornam ao estado inicial definido no projeto.
