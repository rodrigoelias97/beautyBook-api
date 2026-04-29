# Regra de Negócio - BeautyBook

## 1. Usuários e Autenticação

### Tipos de usuário
- Administrador
- Cliente

### Regras
- O login deve validar:
  - email/usuário + senha
- O sistema deve retornar o perfil (role) do usuário:
  - ADMIN
  - CLIENT
- Apenas usuários autenticados podem acessar a API
- O sistema deve utilizar controle de acesso baseado em perfil (RBAC)

### Restrições
- Apenas ADMIN pode:
  - cadastrar/editar/excluir serviços
  - visualizar agenda completa do dia
- CLIENT pode:
  - criar e cancelar seus próprios agendamentos
  - consultar horários disponíveis

---

## 2. Cadastro de Serviços

### Campos obrigatórios
- nome (string, até 44 caracteres)
- tempoServico (HH:mm)
- valor (decimal)
- necessitaAvaliacao (boolean)

### Regras
- Nome:
  - obrigatório
  - máximo de 44 caracteres
- necessitaAvaliacao = true:
  - tempoServico NÃO é obrigatório
  - valor NÃO é obrigatório
- necessitaAvaliacao = false:
  - tempoServico é obrigatório
  - valor é obrigatório
- Não permitir nomes duplicados

### Regras adicionais
- tempo mínimo: 00:15
- tempo máximo: 08:00
- valor > 0

---

## 3. Agendamento

### Campos
- nomeCliente
- nomeServico
- data
- hora
- telefone (11 dígitos: DDD + número)

### Regras principais
- Validar:
  - disponibilidade de horário
  - horário dentro do expediente (ex: 13:00 às 22:00)
  - dia de trabalho (terça à sábado)
- Não permitir:
  - agendamentos no passado
  - conflito de horário
  - mais de 2 agendamentos por cliente no dia

### Regra de conflito
- Um horário está indisponível se:
  - já existe outro agendamento no mesmo horário OU
  - há sobreposição considerando o tempo do serviço

**Exemplo:**
- Serviço A: 1h
- Agendado às 10:00
- Bloqueia: 10:00 até 11:00

### necessitaAvaliacao
- Se true:
  - NÃO reservar tempo automaticamente
  - status: PENDENTE_AVALIACAO
  - mensagem:
    > "Este serviço requer avaliação. Entre em contato com o salão."
- Se false:
  - exibir tempo estimado e valor

---

## 4. Consulta de Horários Disponíveis

### Entrada
- Data (obrigatório)
- Hora (opcional)

### Regras
- Considerar:
  - horário de funcionamento
  - horários ocupados
  - duração dos serviços

### Diferença por perfil

**CLIENTE**
- Retorna apenas horários disponíveis
- NÃO mostra dados de outros clientes

**ADMIN**
- Pode visualizar:
  - todos os horários
  - cliente + serviço + valor

---

## 5. Cancelamento de Agendamento

### Regra principal
- Cancelamento permitido apenas com 48 horas de antecedência

### Validação
- Se menor que 48h:
  - erro:
    > "Cancelamento permitido apenas com 48 horas de antecedência"

### Permissões
- CLIENT: apenas seus agendamentos
- ADMIN: qualquer agendamento

---

## 6. Listagem de Agendamentos (ADMIN)

### Filtro
- por data (obrigatório)

### Retorno
- nome do cliente
- serviço
- horário
- valor

### Regras
- Ordenar por horário crescente
- Mostrar apenas agendamentos do dia

---

## 7. Regras Gerais do Sistema

- Horário de funcionamento configurável (ex: 13:00 às 22:00)
- Dias de funcionamento: terça a sábado
- Permitir intervalo/almoço
- Fuso horário consistente
- Datas no padrão ISO (YYYY-MM-DD)
