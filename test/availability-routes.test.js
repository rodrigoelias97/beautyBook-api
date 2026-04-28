import request from 'supertest';
import { expect } from 'chai';
import { app } from '../src/app.js';
import { getAuthHeader } from './helpers/auth-helper.js';
import { createAppointment } from './helpers/appointment-helper.js';
import { getNextNonWorkingDate, getNextWorkingDate } from './helpers/date-helper.js';

describe('Rotas de disponibilidade', () => {
  it('deve exigir os parametros obrigatorios da consulta', async () => {
    const authHeader = await getAuthHeader('client');

    const response = await request(app)
      .get('/api/availability')
      .set(authHeader);

    expect(response.status).to.equal(400);
    expect(response.body.code).to.equal('VALIDATION_ERROR');
  });

  it('deve validar o formato do horario informado', async () => {
    const authHeader = await getAuthHeader('client');

    const response = await request(app)
      .get('/api/availability')
      .query({
        date: getNextWorkingDate(7),
        serviceId: 'f9505c79-a5ba-4768-aa61-930d7d63ebf4',
        time: '25:99'
      })
      .set(authHeader);

    expect(response.status).to.equal(400);
    expect(response.body.code).to.equal('VALIDATION_ERROR');
  });

  it('deve informar erro quando o servico nao existir', async () => {
    const authHeader = await getAuthHeader('client');

    const response = await request(app)
      .get('/api/availability')
      .query({
        date: getNextWorkingDate(7),
        serviceId: 'servico-ausente'
      })
      .set(authHeader);

    expect(response.status).to.equal(404);
    expect(response.body.code).to.equal('RESOURCE_NOT_FOUND');
  });

  it('deve recusar consulta automatica para servico que exige avaliacao', async () => {
    const authHeader = await getAuthHeader('client');

    const response = await request(app)
      .get('/api/availability')
      .query({
        date: getNextWorkingDate(7),
        serviceId: '2594dc1d-e1e5-4569-ab4c-026872f3dd15'
      })
      .set(authHeader);

    expect(response.status).to.equal(400);
    expect(response.body.code).to.equal('SERVICE_REQUIRES_EVALUATION');
  });

  it('deve retornar lista vazia quando a data nao for um dia de funcionamento', async () => {
    const authHeader = await getAuthHeader('client');
    const date = getNextNonWorkingDate(1);

    const response = await request(app)
      .get('/api/availability')
      .query({
        date,
        serviceId: 'f9505c79-a5ba-4768-aa61-930d7d63ebf4'
      })
      .set(authHeader);

    expect(response.status).to.equal(200);
    expect(response.body).to.deep.equal({
      date,
      serviceId: 'f9505c79-a5ba-4768-aa61-930d7d63ebf4',
      availableSlots: []
    });
  });

  it('deve ocultar horarios que conflitam com agendamento existente', async () => {
    const authHeader = await getAuthHeader('client');
    const date = getNextWorkingDate(7);

    createAppointment({
      data: date,
      hora: '13:00'
    });

    const response = await request(app)
      .get('/api/availability')
      .query({
        date,
        serviceId: 'f9505c79-a5ba-4768-aa61-930d7d63ebf4'
      })
      .set(authHeader);

    expect(response.status).to.equal(200);
    expect(response.body.availableSlots.some((slot) => slot.startTime === '13:00')).to.equal(false);
    expect(response.body.availableSlots.some((slot) => slot.startTime === '14:00')).to.equal(true);
  });
});
