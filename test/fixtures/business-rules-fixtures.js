export function buildBusinessRulesPayload(overrides = {}) {
  return {
    timezone: 'America/Sao_Paulo',
    openingTime: '09:00',
    closingTime: '18:00',
    workingDays: ['TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'],
    breaks: [
      {
        startTime: '12:00',
        endTime: '13:00'
      }
    ],
    ...overrides
  };
}
