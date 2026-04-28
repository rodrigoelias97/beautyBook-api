import request from 'supertest';
import { expect } from 'chai';
import { app } from '../src/app.js';
import { getAuthHeader } from './helpers/auth-helper.js';
import { createAppointment } from './helpers/appointment-helper.js';
import { buildAppointmentPayload } from './fixtures/appointment-fixtures.js';
import { getNextWorkingDate } from './helpers/date-helper.js';

describe('Rotas de agendamentos', () => {
  it('deve permitir que o cliente crie um agendamento confirmado', async () => {
    const authHeader = await getAuthHeader('client');
    const date = getNextWorkingDate(7);

    const response = await request(app)
      .post('/api/appointments')
      .set(authHeader)
      .send(buildAppointmentPayload({
        data: date
      }));

    expect(response.status).to.equal(201);
    expect(response.body).to.include({
      status: 'CONFIRMED',
      clienteId: '2469ec8e-a822-4f97-ac6c-6f53e61dbb4b',
      data: date,
      hora: '13:00',
      tempoEstimado: '01:00',
      valor: 80
    });
  });

  it('deve impedir que o cliente crie agendamento para outro cliente', async () => {
    const authHeader = await getAuthHeader('client');

    const response = await request(app)
      .post('/api/appointments')
      .set(authHeader)
      .send(buildAppointmentPayload({
        data: getNextWorkingDate(7),
        clienteId: '9b8ee0ab-863f-4b9a-8d9c-fcc2d2732e01'
      }));

    expect(response.status).to.equal(403);
    expect(response.body.code).to.equal('FORBIDDEN');
  });

  it('deve criar agendamento pendente quando o servico exigir avaliacao', async () => {
    const authHeader = await getAuthHeader('client');
    const date = getNextWorkingDate(7);

    const response = await request(app)
      .post('/api/appointments')
      .set(authHeader)
      .send(buildAppointmentPayload({
        data: date,
        servicoId: '2594dc1d-e1e5-4569-ab4c-026872f3dd15'
      }));

    expect(response.status).to.equal(201);
    expect(response.body.status).to.equal('PENDENTE_AVALIACAO');
    expect(response.body.mensagem).to.equal('Este servico requer avaliacao. Entre em contato com o salao.');
  });

  it('deve bloquear terceiro agendamento do mesmo cliente na mesma data', async () => {
    const authHeader = await getAuthHeader('client');
    const date = getNextWorkingDate(7);

    createAppointment({ data: date, hora: '13:00' });
    createAppointment({ data: date, hora: '14:15' });

    const response = await request(app)
      .post('/api/appointments')
      .set(authHeader)
      .send(buildAppointmentPayload({
        data: date,
        hora: '19:00'
      }));

    expect(response.status).to.equal(400);
    expect(response.body.code).to.equal('DAILY_APPOINTMENT_LIMIT_REACHED');
  });

  it('deve bloquear horario com conflito de outro agendamento confirmado', async () => {
    const authHeader = await getAuthHeader('client');
    const date = getNextWorkingDate(7);

    createAppointment({ data: date, hora: '13:00' });

    const response = await request(app)
      .post('/api/appointments')
      .set(authHeader)
      .send(buildAppointmentPayload({
        data: date,
        hora: '13:30'
      }));

    expect(response.status).to.equal(409);
    expect(response.body.code).to.equal('TIME_SLOT_OVERLAP');
  });

  it('deve exigir a data na listagem administrativa', async () => {
    const authHeader = await getAuthHeader('admin');

    const response = await request(app)
      .get('/api/appointments')
      .set(authHeader);

    expect(response.status).to.equal(400);
    expect(response.body.code).to.equal('VALIDATION_ERROR');
  });

  it('deve listar agendamentos do dia para administrador', async () => {
    const authHeader = await getAuthHeader('admin');
    const date = getNextWorkingDate(7);

    createAppointment({ data: date, hora: '14:00' });

    const response = await request(app)
      .get('/api/appointments')
      .query({ date })
      .set(authHeader);

    expect(response.status).to.equal(200);
    expect(response.body).to.have.lengthOf(1);
    expect(response.body[0]).to.include({
      clientName: 'Cliente Exemplo',
      serviceName: 'Corte feminino',
      date,
      time: '14:00'
    });
  });

  it('deve permitir que o proprio cliente consulte seu agendamento', async () => {
    const authHeader = await getAuthHeader('client');
    const date = getNextWorkingDate(7);
    const appointment = createAppointment({ data: date });

    const response = await request(app)
      .get(`/api/appointments/${appointment.id}`)
      .set(authHeader);

    expect(response.status).to.equal(200);
    expect(response.body.id).to.equal(appointment.id);
  });

  it('deve cancelar agendamento quando houver antecedencia minima de 48 horas', async () => {
    const authHeader = await getAuthHeader('client');
    const date = getNextWorkingDate(7);
    const appointment = createAppointment({ data: date, hora: '19:00' });

    const response = await request(app)
      .patch(`/api/appointments/${appointment.id}/cancel`)
      .set(authHeader)
      .send({
        reason: 'Compromisso pessoal'
      });

    expect(response.status).to.equal(200);
    expect(response.body.status).to.equal('CANCELLED');
    expect(response.body.motivoCancelamento).to.equal('Compromisso pessoal');
  });

  it('deve impedir cancelamento fora da janela minima de 48 horas', async () => {
    const authHeader = await getAuthHeader('client');
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const date = tomorrow.toISOString().slice(0, 10);
    const appointment = createAppointment({ data: date, hora: '21:00' });

    const response = await request(app)
      .patch(`/api/appointments/${appointment.id}/cancel`)
      .set(authHeader);

    expect(response.status).to.equal(400);
    expect(response.body.code).to.equal('CANCELLATION_WINDOW_EXPIRED');
  });
});
