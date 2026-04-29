import { db, generateId } from '../../src/data/store.js';

export function createAppointment(overrides = {}) {
  const appointment = {
    id: generateId(),
    clienteId: '2469ec8e-a822-4f97-ac6c-6f53e61dbb4b',
    servicoId: 'f9505c79-a5ba-4768-aa61-930d7d63ebf4',
    status: 'CONFIRMED',
    data: overrides.data ?? '2099-05-06',
    hora: overrides.hora ?? '13:30',
    telefone: '11999999999',
    observacao: null,
    motivoCancelamento: null,
    createdAt: new Date().toISOString(),
    cancelledAt: null,
    ...overrides
  };

  db.appointments.push(appointment);
  return appointment;
}
