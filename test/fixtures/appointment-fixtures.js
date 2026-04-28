export function buildAppointmentPayload(overrides = {}) {
  return {
    clienteId: '2469ec8e-a822-4f97-ac6c-6f53e61dbb4b',
    servicoId: 'f9505c79-a5ba-4768-aa61-930d7d63ebf4',
    data: '2099-05-06',
    hora: '13:00',
    telefone: '11999999999',
    observacao: 'Cliente prefere atendimento rapido',
    ...overrides
  };
}
