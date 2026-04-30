# Plano de Teste

## Identificacao

| Campo | Valor |
|---|---|
| Projeto | BeautyBook API |
| Produto em teste | API REST para agendamento de servicos de beleza |
| Tipo de teste | API, funcional, validacao, autorizacao, regras de negocio e performance |
| Responsavel | Equipe BeautyBook |
| Base documental | Regras de negocio, Swagger, testes automatizados e modelos ISO-29119-3 |

## Objetivo

Garantir que a BeautyBook API permita autenticar usuarios, gerenciar servicos, configurar regras de funcionamento, consultar disponibilidade e operar agendamentos respeitando permissoes, validacoes e regras do negocio.

## Escopo

| Dentro do escopo | Fora do escopo neste momento |
|---|---|
| Validacao dos endpoints REST implementados. | Persistencia em banco real. |
| Regras de negocio de servico, disponibilidade e agendamento. | Interface grafica web/mobile. |
| Autorizacao por perfil `ADMIN` e `CLIENT`. | Integracoes externas de pagamento, notificacao ou calendario. |
| Relatorio HTML de testes de API. | Testes de seguranca aprofundados, como pentest. |
| Smoke, carga, stress e spike com K6. | Testes de recuperacao de desastre. |

## Itens de teste

| ID | Item | Descricao | Prioridade |
|---|---|---|---|
| IT-01 | Autenticacao | Login por username/e-mail e rejeicoes de credenciais invalidas. | Alta |
| IT-02 | Servicos | CRUD de servicos, permissao ADMIN e validacoes de campos. | Alta |
| IT-03 | Regras de negocio | Horario, dias de funcionamento e intervalos. | Alta |
| IT-04 | Disponibilidade | Geracao de horarios livres conforme agenda e regras. | Alta |
| IT-05 | Agendamentos | Criacao, consulta, cancelamento e exclusao. | Alta |
| IT-06 | Performance | Jornada principal sob diferentes perfis de carga. | Media |

## Ambiente

| Recurso | Configuracao |
|---|---|
| Runtime | Node.js |
| Framework API | Express |
| Banco | Memoria |
| Porta padrao | `3000` |
| URL local | `http://localhost:3000` |
| Documentacao API | `http://localhost:3000/api-docs` |
| Relatorio HTML | `npm run test:report` |

## Ferramentas

| Ferramenta | Uso |
|---|---|
| Mocha | Runner dos testes automatizados de API. |
| Chai | Assercoes dos resultados esperados. |
| Supertest | Chamadas HTTP contra a aplicacao Express. |
| Mochawesome | Relatorio HTML dos testes de API. |
| K6 | Testes de performance. |
| Swagger UI | Consulta e validacao da especificacao OpenAPI. |

## Criterios de entrada

- API executando localmente ou importavel via `src/app.js`.
- Dependencias instaladas com `npm install`.
- Dados iniciais disponiveis no banco em memoria.
- Usuarios de teste `admin` e `cliente` disponiveis.
- Rotas documentadas e acessiveis.

## Criterios de saida

- Todos os testes de API passando.
- Relatorio HTML gerado quando solicitado.
- Cenarias criticos de negocio cobertos por testes automatizados.
- Testes de performance estruturados e executaveis.
- Defeitos encontrados registrados com evidencias e rastreabilidade.

## Riscos do plano

| Risco | Impacto | Mitigacao |
|---|---|---|
| Banco em memoria mascara problemas de persistencia. | Medio | Registrar limitacao e revisar quando houver banco real. |
| Datas dependem do dia atual. | Medio | Helpers calculam datas futuras validas. |
| Testes de performance criam dados repetidos. | Medio | Usar massa controlada e reiniciar API entre execucoes quando necessario. |
| Wiki do GitHub pode estar desabilitado. | Baixo | Manter paginas em Markdown prontas para publicacao. |

