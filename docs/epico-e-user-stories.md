# Epico e User Stories - BeautyBook

## Visao geral

Este documento organiza as regras de negocio do BeautyBook em um epico principal e user stories para apoiar a implementacao do app e a preparacao de cenarios de teste.

## Epico

**EP01 - Gerenciar agendamentos de um salao de beleza com controle por perfil**

Como salao de beleza, quero disponibilizar um sistema de agendamento com perfis de administrador e cliente, para controlar servicos, horarios disponiveis, reservas e cancelamentos de forma segura e organizada.

## User Stories

### US01 - Autenticacao de usuarios

Como usuario do sistema, quero realizar login com email ou usuario e senha, para acessar apenas as funcionalidades permitidas ao meu perfil.

**Criterios de aceitacao**
- O sistema deve autenticar com email/usuario e senha.
- O sistema deve retornar o perfil do usuario autenticado.
- O perfil retornado deve ser `ADMIN` ou `CLIENT`.
- Apenas usuarios autenticados podem acessar a API.
- O sistema deve aplicar controle de acesso baseado em perfil.

### US02 - Administrar servicos

Como administrador, quero cadastrar, editar e excluir servicos, para manter o catalogo do salao atualizado.

**Criterios de aceitacao**
- Apenas usuarios com perfil `ADMIN` podem cadastrar, editar e excluir servicos.
- O nome do servico deve ser obrigatorio e ter no maximo 44 caracteres.
- O sistema nao deve permitir nomes de servico duplicados.
- Quando `necessitaAvaliacao = false`, os campos `tempoServico` e `valor` devem ser obrigatorios.
- Quando `necessitaAvaliacao = true`, os campos `tempoServico` e `valor` nao devem ser obrigatorios.
- Quando informado, `tempoServico` deve estar entre `00:15` e `08:00`.
- Quando informado, `valor` deve ser maior que zero.

### US03 - Configurar regras operacionais do salao

Como administrador, quero configurar horarios e dias de funcionamento do salao, para que a agenda respeite a operacao real do negocio.

**Criterios de aceitacao**
- O sistema deve permitir configuracao de horario de funcionamento.
- O sistema deve considerar dias de funcionamento de terca a sabado.
- O sistema deve permitir configuracao de intervalo, como almoco.
- O sistema deve trabalhar com fuso horario consistente.
- As datas devem seguir o padrao ISO `YYYY-MM-DD`.

### US04 - Consultar horarios disponiveis

Como cliente, quero consultar os horarios disponiveis em uma data, para escolher um melhor horario para meu atendimento.

**Criterios de aceitacao**
- A data deve ser obrigatoria na consulta.
- A hora deve ser opcional.
- O sistema deve considerar horario de funcionamento, dias de funcionamento, intervalos e horarios ocupados.
- O sistema deve considerar a duracao do servico para determinar disponibilidade.
- O cliente deve visualizar apenas horarios disponiveis.
- O cliente nao deve visualizar dados de outros clientes.

### US05 - Visualizar agenda completa do dia

Como administrador, quero visualizar a agenda completa de uma data, para acompanhar todos os agendamentos do salao.

**Criterios de aceitacao**
- Apenas usuarios com perfil `ADMIN` podem visualizar a agenda completa.
- O filtro por data deve ser obrigatorio.
- O retorno deve listar nome do cliente, servico, horario e valor.
- Os agendamentos devem ser exibidos em ordem crescente de horario.
- A listagem deve mostrar apenas os agendamentos da data informada.
- O administrador pode visualizar todos os horarios, inclusive ocupados.

### US06 - Criar agendamento de servico comum

Como cliente, quero agendar um servico em um horario disponivel, para reservar meu atendimento no salao.

**Criterios de aceitacao**
- Apenas usuarios com perfil `CLIENT` podem criar seus proprios agendamentos.
- O sistema deve validar `clienteId`, `servicoId`, `data`, `hora` e `telefone`.
- O telefone deve possuir 11 digitos.
- O sistema nao deve permitir agendamentos em datas ou horarios passados.
- O sistema nao deve permitir agendamentos fora do expediente.
- O sistema nao deve permitir agendamentos em dias fora do funcionamento do salao.
- O sistema nao deve permitir mais de 2 agendamentos para o mesmo cliente no mesmo dia.
- O sistema nao deve permitir conflito no mesmo horario.
- O sistema nao deve permitir sobreposicao considerando o tempo do servico.
- Quando o servico nao exigir avaliacao, o sistema deve exibir tempo estimado e valor.

### US07 - Criar solicitacao para servico com avaliacao

Como cliente, quero solicitar um servico que exige avaliacao previa, para que o salao possa analisar meu caso antes da confirmacao.

**Criterios de aceitacao**
- Quando `necessitaAvaliacao = true`, o sistema nao deve reservar tempo automaticamente na agenda.
- O status inicial do agendamento deve ser `PENDENTE_AVALIACAO`.
- O sistema deve exibir a mensagem: "Este servico requer avaliacao. Entre em contato com o salao."

### US08 - Cancelar agendamento

Como cliente, quero cancelar meu agendamento com antecedencia, para liberar o horario quando eu nao puder comparecer.

**Criterios de aceitacao**
- O cliente pode cancelar apenas seus proprios agendamentos.
- O administrador pode cancelar qualquer agendamento.
- O cancelamento deve ser permitido apenas com no minimo 48 horas de antecedencia.
- Quando o prazo for menor que 48 horas, o sistema deve retornar a mensagem: "Cancelamento permitido apenas com 48 horas de antecedencia".

## Refinamento por fases

### MVP - Primeira entrega

- US01 - Autenticacao de usuarios
- US02 - Administrar servicos
- US03 - Configurar regras operacionais do salao
- US04 - Consultar horarios disponiveis
- US06 - Criar agendamento de servico comum
- US08 - Cancelar agendamento

### Pos-MVP - Evolucao recomendada

- US05 - Visualizar agenda completa do dia
- US07 - Criar solicitacao para servico com avaliacao

## Dependencias entre historias

- US01 e base para todas as historias que exigem autenticacao e controle por perfil.
- US02 deve existir antes de US04, US05, US06 e US07, pois os servicos fazem parte das consultas e agendamentos.
- US03 deve existir antes de US04, US05, US06, US07 e US08, pois horario de funcionamento, dias uteis e intervalos impactam a agenda.
- US04 depende de US02 e US03 para calcular disponibilidade.
- US05 depende de US01, US02 e US03 para exibir a agenda administrativa corretamente.
- US06 depende de US01, US02, US03 e US04.
- US07 depende de US01, US02 e US03.
- US08 depende de US01 e da existencia de agendamentos criados previamente.

## Quebra tecnica por user story

### US01 - Autenticacao de usuarios

- Implementar endpoint de login.
- Validar credenciais com email/usuario e senha.
- Retornar perfil do usuario autenticado.
- Proteger endpoints autenticados.
- Aplicar autorizacao por perfil.

### US02 - Administrar servicos

- Criar estrutura de entidade de servico.
- Validar nome obrigatorio e tamanho maximo.
- Validar duplicidade de nome.
- Validar regras de `necessitaAvaliacao`.
- Validar faixa de `tempoServico`.
- Validar `valor > 0`.
- Implementar cadastro, edicao e exclusao restritos a `ADMIN`.

### US03 - Configurar regras operacionais do salao

- Definir configuracao de horario de funcionamento.
- Definir configuracao de dias de atendimento.
- Definir configuracao de intervalos.
- Padronizar tratamento de data e fuso horario.
- Expor configuracoes para consulta e uso interno da agenda.

### US04 - Consultar horarios disponiveis

- Receber data obrigatoria e hora opcional.
- Buscar configuracoes operacionais do salao.
- Buscar servicos cadastrados e sua duracao.
- Buscar agendamentos existentes da data.
- Calcular indisponibilidade por conflito e sobreposicao.
- Retornar apenas horarios disponiveis para `CLIENT`.

### US05 - Visualizar agenda completa do dia

- Criar consulta administrativa por data.
- Buscar agendamentos do dia.
- Enriquecer resposta com cliente, servico, horario e valor.
- Ordenar por horario crescente.
- Restringir acesso ao perfil `ADMIN`.

### US06 - Criar agendamento de servico comum

- Validar campos obrigatorios.
- Validar telefone com 11 digitos.
- Validar data e horario futuros.
- Validar dia de funcionamento.
- Validar horario dentro do expediente.
- Validar limite de 2 agendamentos por cliente no dia.
- Validar conflito de horario e sobreposicao.
- Registrar agendamento confirmado.
- Retornar valor e tempo estimado do servico.

### US07 - Criar solicitacao para servico com avaliacao

- Identificar servicos com `necessitaAvaliacao = true`.
- Criar solicitacao sem bloquear horario automaticamente.
- Registrar status `PENDENTE_AVALIACAO`.
- Retornar mensagem orientando contato com o salao.

### US08 - Cancelar agendamento

- Validar permissao de cancelamento por perfil.
- Validar titularidade do agendamento para `CLIENT`.
- Calcular antecedencia minima de 48 horas.
- Impedir cancelamento fora da regra.
- Registrar cancelamento quando permitido.

## Cenários iniciais de teste

### US01 - Autenticacao de usuarios

- Login com credenciais validas para perfil `ADMIN`.
- Login com credenciais validas para perfil `CLIENT`.
- Tentativa de login com senha invalida.
- Tentativa de acesso a endpoint protegido sem autenticacao.
- Tentativa de acesso a funcionalidade administrativa com perfil `CLIENT`.

### US02 - Administrar servicos

- Cadastro de servico valido com `necessitaAvaliacao = false`.
- Cadastro de servico valido com `necessitaAvaliacao = true`.
- Tentativa de cadastro com nome vazio.
- Tentativa de cadastro com nome acima de 44 caracteres.
- Tentativa de cadastro com nome duplicado.
- Tentativa de cadastro sem `tempoServico` quando ele for obrigatorio.
- Tentativa de cadastro sem `valor` quando ele for obrigatorio.
- Tentativa de cadastro com `tempoServico` menor que `00:15`.
- Tentativa de cadastro com `tempoServico` maior que `08:00`.
- Tentativa de cadastro com `valor <= 0`.

### US03 - Configurar regras operacionais do salao

- Configuracao valida de horario de funcionamento.
- Configuracao valida de intervalo de almoco.
- Validacao de dias de funcionamento de terca a sabado.
- Persistencia e leitura correta do padrao de data ISO.
- Consistencia do fuso horario nas operacoes de agenda.

### US04 - Consultar horarios disponiveis

- Consulta de horarios disponiveis em dia util com agenda vazia.
- Consulta em dia fora do funcionamento.
- Consulta considerando intervalo de almoco.
- Consulta com horario ja ocupado.
- Consulta com bloqueio por sobreposicao de duracao do servico.
- Garantia de que cliente nao visualiza dados de outros clientes.

### US05 - Visualizar agenda completa do dia

- Consulta administrativa com data valida e retorno ordenado por horario.
- Consulta em data sem agendamentos.
- Tentativa de acesso por usuario `CLIENT`.

### US06 - Criar agendamento de servico comum

- Criacao de agendamento valido dentro do expediente.
- Tentativa de agendamento no passado.
- Tentativa de agendamento fora do expediente.
- Tentativa de agendamento em dia nao util.
- Tentativa de terceiro agendamento para o mesmo cliente no mesmo dia.
- Tentativa de agendamento no mesmo horario ja ocupado.
- Tentativa de agendamento com sobreposicao de horario.
- Tentativa de agendamento com telefone invalido.

### US07 - Criar solicitacao para servico com avaliacao

- Criacao de solicitacao para servico com avaliacao.
- Confirmacao de status inicial `PENDENTE_AVALIACAO`.
- Confirmacao de que o horario nao foi bloqueado automaticamente.
- Exibicao da mensagem orientativa ao cliente.

### US08 - Cancelar agendamento

- Cancelamento valido com mais de 48 horas de antecedencia.
- Tentativa de cancelamento com menos de 48 horas.
- Cancelamento de agendamento proprio por `CLIENT`.
- Tentativa de cancelar agendamento de outro cliente com perfil `CLIENT`.
- Cancelamento de qualquer agendamento com perfil `ADMIN`.

## Observacoes para implementacao

- O conflito de agenda deve considerar o horario inicial e a duracao do servico.
- Servicos com avaliacao devem seguir um fluxo diferente dos servicos comuns.
- O RBAC impacta diretamente autenticacao, consulta de agenda, criacao de servicos e cancelamentos.
- As regras acima sao boas candidatas para testes funcionais, testes de API e testes de regra de negocio.
