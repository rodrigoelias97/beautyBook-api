import crypto from 'node:crypto';

const now = new Date().toISOString();

const users = [
  {
    id: '9b8ee0ab-863f-4b9a-8d9c-fcc2d2732e01',
    name: 'Administrador BeautyBook',
    username: 'admin',
    email: 'admin@beautybook.com',
    password: 'admin123',
    role: 'ADMIN'
  },
  {
    id: '2469ec8e-a822-4f97-ac6c-6f53e61dbb4b',
    name: 'Cliente Exemplo',
    username: 'cliente',
    email: 'cliente@beautybook.com',
    password: 'cliente123',
    role: 'CLIENT'
  }
];

const services = [
  {
    id: 'f9505c79-a5ba-4768-aa61-930d7d63ebf4',
    name: 'Corte feminino',
    description: 'Corte com finalizacao simples',
    necessitaAvaliacao: false,
    tempoServico: '01:00',
    valor: 80,
    createdAt: now,
    updatedAt: now
  },
  {
    id: '2594dc1d-e1e5-4569-ab4c-026872f3dd15',
    name: 'Coloracao personalizada',
    description: 'Servico sujeito a avaliacao previa',
    necessitaAvaliacao: true,
    tempoServico: null,
    valor: null,
    createdAt: now,
    updatedAt: now
  }
];

const businessRules = {
  horaAbertura: '13:30',
  horaFechamento: '22:00',
  diasFuncionamento: ['TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'],
  intervalos: [
    {
      horaInicio: '17:00',
      horaFim: '18:00'
    }
  ]
};

const appointments = [];
const sessions = [];

function createSession(user) {
  const token = crypto.randomUUID();

  const session = {
    token,
    userId: user.id,
    createdAt: new Date().toISOString()
  };

  sessions.push(session);

  return token;
}

function findSessionByToken(token) {
  return sessions.find((session) => session.token === token);
}

function generateId() {
  return crypto.randomUUID();
}

export const db = {
  users,
  services,
  businessRules,
  appointments,
  sessions
};

export { createSession, findSessionByToken, generateId };
