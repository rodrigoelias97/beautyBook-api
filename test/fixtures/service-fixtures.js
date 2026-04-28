export function buildServicePayload(overrides = {}) {
  return {
    name: 'Hidratacao premium',
    description: 'Tratamento capilar hidratante',
    necessitaAvaliacao: false,
    tempoServico: '01:30',
    valor: 150,
    ...overrides
  };
}
