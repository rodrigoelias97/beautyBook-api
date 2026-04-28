import request from 'supertest';
import { expect } from 'chai';
import { app } from '../src/app.js';
import { getAuthHeader } from './helpers/auth-helper.js';
import { buildBusinessRulesPayload } from './fixtures/business-rules-fixtures.js';

describe('Rotas de regras de negocio', () => {
  it('deve retornar as regras atuais para usuario autenticado', async () => {
    const authHeader = await getAuthHeader('client');

    const response = await request(app)
      .get('/api/business-rules')
      .set(authHeader);

    expect(response.status).to.equal(200);
    expect(response.body).to.include({
      timezone: 'America/Sao_Paulo',
      openingTime: '13:00',
      closingTime: '22:00'
    });
  });

  it('deve permitir atualizacao das regras quando o usuario for administrador', async () => {
    const authHeader = await getAuthHeader('admin');

    const response = await request(app)
      .put('/api/business-rules')
      .set(authHeader)
      .send(buildBusinessRulesPayload());

    expect(response.status).to.equal(200);
    expect(response.body).to.include({
      openingTime: '09:00',
      closingTime: '18:00'
    });
    expect(response.body.breaks).to.deep.equal([
      {
        startTime: '12:00',
        endTime: '13:00'
      }
    ]);
  });

  it('deve impedir atualizacao quando o usuario nao for administrador', async () => {
    const authHeader = await getAuthHeader('client');

    const response = await request(app)
      .put('/api/business-rules')
      .set(authHeader)
      .send(buildBusinessRulesPayload());

    expect(response.status).to.equal(403);
    expect(response.body.code).to.equal('FORBIDDEN');
  });

  it('deve validar horario de fechamento maior que abertura', async () => {
    const authHeader = await getAuthHeader('admin');

    const response = await request(app)
      .put('/api/business-rules')
      .set(authHeader)
      .send(buildBusinessRulesPayload({
        openingTime: '18:00',
        closingTime: '09:00'
      }));

    expect(response.status).to.equal(400);
    expect(response.body.code).to.equal('VALIDATION_ERROR');
    expect(response.body.details).to.deep.include({
      field: 'closingTime',
      message: 'closingTime deve ser maior que openingTime'
    });
  });
});
