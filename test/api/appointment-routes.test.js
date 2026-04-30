import request from 'supertest';
import { expect } from 'chai';
import { app } from '../../src/app.js';
import { getAuthHeader } from '../helpers/auth-helper.js';
import { createAppointment } from '../helpers/appointment-helper.js';
import { buildAppointmentPayload } from '../fixtures/appointment-fixtures.js';
import { getNextWorkingDate } from '../helpers/date-helper.js';

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
      nomeCliente: 'Cliente Exemplo',
      nomeServico: 'Corte feminino',
      data: date,
      hora: '13:30',
      tempoEstimado: '01:00',
      valor: 120
    });
  });

  it('deve impedir que o cliente crie agendamento para outro cliente', async () => {
    const authHeader = await getAuthHeader('client');

    const response = await request(app)
      .post('/api/appointments')
      .set(authHeader)
      .send(buildAppointmentPayload({
        data: getNextWorkingDate(7),
        nomeCliente: 'Administrador BeautyBook'
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
        nomeServico: 'Coloracao personalizada'
      }));

    expect(response.status).to.equal(201);
    expect(response.body.status).to.equal('PENDENTE_AVALIACAO');
    expect(response.body.mensagem).to.equal('Este servico requer avaliacao. Entre em contato com o salao.');
  });

  it('deve permitir que o administrador crie agendamento confirmado para um cliente', async () => {
    const authHeader = await getAuthHeader('admin');
    const date = getNextWorkingDate(7);

    const response = await request(app)
      .post('/api/appointments')
      .set(authHeader)
      .send(buildAppointmentPayload({
        data: date,
        hora: '15:00'
      }));

    expect(response.status).to.equal(201);
    expect(response.body).to.include({
      status: 'CONFIRMED',
      nomeCliente: 'Cliente Exemplo',
      nomeServico: 'Corte feminino',
      data: date,
      hora: '15:00'
    });
  });

  it('deve permitir que o administrador crie solicitacao pendente para servico com avaliacao', async () => {
    const authHeader = await getAuthHeader('admin');
    const date = getNextWorkingDate(7);

    const response = await request(app)
      .post('/api/appointments')
      .set(authHeader)
      .send(buildAppointmentPayload({
        data: date,
        nomeServico: 'Coloracao personalizada'
      }));

    expect(response.status).to.equal(201);
    expect(response.body).to.include({
      status: 'PENDENTE_AVALIACAO',
      nomeCliente: 'Cliente Exemplo',
      nomeServico: 'Coloracao personalizada',
      data: date,
      hora: '13:30'
    });
    expect(response.body.mensagem).to.equal('Este servico requer avaliacao. Entre em contato com o salao.');
  });

  it('deve bloquear terceiro agendamento do mesmo cliente na mesma data', async () => {
    const authHeader = await getAuthHeader('client');
    const date = getNextWorkingDate(7);

    createAppointment({ data: date, hora: '13:30' });
    createAppointment({ data: date, hora: '14:45' });

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

    createAppointment({ data: date, hora: '13:30' });

    const response = await request(app)
      .post('/api/appointments')
      .set(authHeader)
      .send(buildAppointmentPayload({
        data: date,
        hora: '14:00'
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
    const data = getNextWorkingDate(7);

    createAppointment({ data, hora: '14:00' });

    const response = await request(app)
      .get('/api/appointments')
      .query({ data })
      .set(authHeader);

    expect(response.status).to.equal(200);
    expect(response.body).to.have.lengthOf(1);
    expect(response.body[0]).to.include({
      nomeCliente: 'Cliente Exemplo',
      nomeServico: 'Corte feminino',
      data,
      hora: '14:00'
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

  it('deve permitir que o administrador exclua um agendamento', async () => {
    const authHeader = await getAuthHeader('admin');
    const date = getNextWorkingDate(7);
    const appointment = createAppointment({ data: date, hora: '16:00' });

    const response = await request(app)
      .delete(`/api/appointments/${appointment.id}`)
      .set(authHeader);

    expect(response.status).to.equal(204);
    expect(response.text).to.equal('');
  });

  it('deve impedir que o cliente exclua um agendamento', async () => {
    const authHeader = await getAuthHeader('client');
    const date = getNextWorkingDate(7);
    const appointment = createAppointment({ data: date, hora: '16:00' });

    const response = await request(app)
      .delete(`/api/appointments/${appointment.id}`)
      .set(authHeader);

    expect(response.status).to.equal(403);
    expect(response.body.code).to.equal('FORBIDDEN');
  });

  it('deve impedir campo de data fora do formato', async () => {
    const authHeader = await getAuthHeader('client');

    const response = await request(app)
      .post('/api/appointments')
      .set(authHeader)
      .send(buildAppointmentPayload({
        data: '06/05/2099'
      }));

    expect(response.status).to.equal(400);
    expect(response.body.code).to.equal('VALIDATION_ERROR');
    expect(response.body.details).to.deep.include({
      field: 'data',
      message: 'A data deve estar no formato YYYY-MM-DD'
    });
  });

  it('deve impedir campo hora fora do formato', async () => {
    const authHeader = await getAuthHeader('client');

    const response = await request(app)
      .post('/api/appointments')
      .set(authHeader)
      .send(buildAppointmentPayload({
        data: getNextWorkingDate(7),
        hora: '13h30'
      }));

    expect(response.status).to.equal(400);
    expect(response.body.code).to.equal('VALIDATION_ERROR');
    expect(response.body.details).to.deep.include({
      field: 'hora',
      message: 'Formato de hora invalido. Use HH:MM'
    });
  });

  it('deve impedir telefone fora do formato', async () => {
    const authHeader = await getAuthHeader('client');

    const response = await request(app)
      .post('/api/appointments')
      .set(authHeader)
      .send(buildAppointmentPayload({
        data: getNextWorkingDate(7),
        telefone: '(11)99999-9999'
      }));

    expect(response.status).to.equal(400);
    expect(response.body.code).to.equal('VALIDATION_ERROR');
    expect(response.body.details).to.deep.include({
      field: 'telefone',
      message: 'O telefone deve possuir 11 digitos'
    });
  });

  it('deve impedir telefone com texto', async () => {
    const authHeader = await getAuthHeader('client');

    const response = await request(app)
      .post('/api/appointments')
      .set(authHeader)
      .send(buildAppointmentPayload({
        data: getNextWorkingDate(7),
        telefone: 'telefoneabc'
      }));

    expect(response.status).to.equal(400);
    expect(response.body.code).to.equal('VALIDATION_ERROR');
    expect(response.body.details).to.deep.include({
      field: 'telefone',
      message: 'O telefone deve possuir 11 digitos'
    });
  });

  it('deve impedir cliente inexistente', async () => {
    const authHeader = await getAuthHeader('admin');

    const response = await request(app)
      .post('/api/appointments')
      .set(authHeader)
      .send(buildAppointmentPayload({
        data: getNextWorkingDate(7),
        nomeCliente: 'Cliente Inexistente'
      }));

    expect(response.status).to.equal(404);
    expect(response.body).to.deep.equal({
      code: 'RESOURCE_NOT_FOUND',
      message: 'Cliente nao encontrado'
    });
  });

  it('deve impedir servico inexistente', async () => {
    const authHeader = await getAuthHeader('client');

    const response = await request(app)
      .post('/api/appointments')
      .set(authHeader)
      .send(buildAppointmentPayload({
        data: getNextWorkingDate(7),
        nomeServico: 'Servico Inexistente'
      }));

    expect(response.status).to.equal(404);
    expect(response.body).to.deep.equal({
      code: 'RESOURCE_NOT_FOUND',
      message: 'Servico nao encontrado'
    });
  });

  it('deve impedir telefone fora do padrao', async () => {
    const authHeader = await getAuthHeader('client');

    const response = await request(app)
      .post('/api/appointments')
      .set(authHeader)
      .send(buildAppointmentPayload({
        data: getNextWorkingDate(7),
        telefone: '1199999999'
      }));

    expect(response.status).to.equal(400);
    expect(response.body.code).to.equal('VALIDATION_ERROR');
    expect(response.body.details).to.deep.include({
      field: 'telefone',
      message: 'O telefone deve possuir 11 digitos'
    });
  });
});
