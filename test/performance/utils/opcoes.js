export function criarOpcoes(overrides = {}) {
  return {
    thresholds: {
      http_req_failed: ['rate<0.01'],
      http_req_duration: ['p(95)<800']
    },
    ...overrides
  };
}
