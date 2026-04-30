import http from 'k6/http';
import { sleep, check } from 'k6';
import { obterToken } from '../helpers/autenticacao.js';
import { montarPayloadAgendamento } from '../utils/agendamento.js';
import { criarOpcoes } from '../utils/opcoes.js';
import { pegarBaseURL } from '../utils/variaveis.js';

export const options = criarOpcoes({
  stages: [
    { duration: '30s', target: 20 },
    { duration: '1m', target: 40 },
    { duration: '1m', target: 60 },
    { duration: '30s', target: 0 }
  ],
  thresholds: {
    http_req_failed: ['rate<0.05'],
    http_req_duration: ['p(95)<1500']
  }
});

export default function () {
  const baseUrl = pegarBaseURL();
  const token = obterToken();
  const appointmentPayload = montarPayloadAgendamento();

  const healthResponse = http.get(`${baseUrl}/health`, {
    tags: { endpoint: 'health' }
  });

  check(healthResponse, {
    'health retorna 200': (response) => response.status === 200
  });

  const serviceResponse = http.get(`${baseUrl}/api/services`, {
    headers: {
      Authorization: `Bearer ${token}`
    },
    tags: { endpoint: 'services-list' }
  });

  check(serviceResponse, {
    'servicos retorna 200': (response) => response.status === 200
  });

  const availabilityResponse = http.get(
    `${baseUrl}/api/availability?data=${appointmentPayload.data}&nomeServico=${encodeURIComponent(appointmentPayload.nomeServico)}&hora=${appointmentPayload.hora}`,
    {
      headers: {
        Authorization: `Bearer ${token}`
      },
      tags: { endpoint: 'availability-list' }
    }
  );

  check(availabilityResponse, {
    'availability retorna 200': (response) => response.status === 200
  });

  const appointmentResponse = http.post(
    `${baseUrl}/api/appointments`,
    JSON.stringify(appointmentPayload),
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      tags: { endpoint: 'appointments-create' }
    }
  );

  check(appointmentResponse, {
    'appointment retorna 201': (response) => response.status === 201
  });

  sleep(1);
}
