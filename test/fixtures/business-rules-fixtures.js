export function buildBusinessRulesPayload(overrides = {}) {
  return {
    horaAbertura: '09:00',
    horaFechamento: '18:00',
    diasFuncionamento: ['TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'],
    intervalos: [
      {
        horaInicio: '12:00',
        horaFim: '13:00'
      }
    ],
    ...overrides
  };
}
