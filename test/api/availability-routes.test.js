import request from 'supertest';
import { expect } from 'chai';
import { app } from '../../src/app.js';
import { getAuthHeader } from '../helpers/auth-helper.js';
import { createAppointment } from '../helpers/appointment-helper.js';
import { getNextNonWorkingDate, getNextWorkingDate } from '../helpers/date-helper.js';

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
        data: getNextWorkingDate(7),
        nomeServico: 'Corte feminino',
        hora: '25:99'
      })
      .set(authHeader);

    expect(response.status).to.equal(400);
    expect(response.body.code).to.equal('VALIDATION_ERROR');
    expect(response.body.details).to.deep.include({
      field: 'hora',
      message: 'Formato de hora invalido. Use HH:MM'
    });
  });

  it('deve informar erro quando o servico nao existir', async () => {
    const authHeader = await getAuthHeader('client');

    const response = await request(app)
      .get('/api/availability')
      .query({
        data: getNextWorkingDate(7),
        nomeServico: 'Servico ausente'
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
        data: getNextWorkingDate(7),
        nomeServico: 'Coloracao personalizada'
      })
      .set(authHeader);

    expect(response.status).to.equal(400);
    expect(response.body.code).to.equal('SERVICE_REQUIRES_EVALUATION');
  });

  it('deve retornar lista vazia quando a data nao for um dia de funcionamento', async () => {
    const authHeader = await getAuthHeader('client');
    const data = getNextNonWorkingDate(1);

    const response = await request(app)
      .get('/api/availability')
      .query({
        data,
        nomeServico: 'Corte feminino'
      })
      .set(authHeader);

    expect(response.status).to.equal(200);
    expect(response.body).to.deep.equal({
      data,
      nomeServico: 'Corte feminino',
      horariosDisponiveis: []
    });
  });

  it('deve ocultar horarios que conflitam com agendamento existente', async () => {
    const authHeader = await getAuthHeader('client');
    const data = getNextWorkingDate(7);

    createAppointment({
      data,
      hora: '13:30'
    });

    const response = await request(app)
      .get('/api/availability')
      .query({
        data,
        nomeServico: 'Corte feminino'
      })
      .set(authHeader);

    expect(response.status).to.equal(200);
    expect(response.body.horariosDisponiveis.some((slot) => slot.horaInicio === '13:30')).to.equal(false);
    expect(response.body.horariosDisponiveis.some((slot) => slot.horaInicio === '14:30')).to.equal(true);
    expect(response.body.horariosDisponiveis.some((slot) => slot.horaInicio === '14:45')).to.equal(false);
  });

  it('deve retornar horarios disponiveis apenas de meia em meia hora', async () => {
    const authHeader = await getAuthHeader('client');
    const data = getNextWorkingDate(7);

    const response = await request(app)
      .get('/api/availability')
      .query({
        data,
        nomeServico: 'Corte feminino'
      })
      .set(authHeader);

    expect(response.status).to.equal(200);
    expect(response.body.horariosDisponiveis.length).to.be.greaterThan(0);

    response.body.horariosDisponiveis.forEach((slot) => {
      expect(['00', '30']).to.include(slot.horaInicio.slice(3, 5));
    });
  });
});
