import request from 'supertest';
import { expect } from 'chai';
import { app } from '../src/app.js';
import { getAuthHeader } from './helpers/auth-helper.js';
import { buildBusinessRulesPayload } from './fixtures/business-rules-fixtures.js';

describe('Rotas de regras de negocio', () => {
  it('deve retornar as regras atuais para usuario administrador autenticado', async () => {
    const authHeader = await getAuthHeader('admin');

    const response = await request(app)
      .get('/api/business-rules')
      .set(authHeader);

    expect(response.status).to.equal(200);
    expect(response.body).to.include({
      horaAbertura: '13:30',
      horaFechamento: '22:00'
    });
    expect(response.body.diasFuncionamento).to.deep.equal([
      'TUESDAY',
      'WEDNESDAY',
      'THURSDAY',
      'FRIDAY',
      'SATURDAY'
    ]);
  });

  it('deve retornar as regras atuais para usuario cliente autenticado', async () => {
    const authHeader = await getAuthHeader('client');

    const response = await request(app)
      .get('/api/business-rules')
      .set(authHeader);

    expect(response.status).to.equal(200);
    expect(response.body).to.include({
      horaAbertura: '13:30',
      horaFechamento: '22:00'
    });
    expect(response.body.diasFuncionamento).to.deep.equal([
      'TUESDAY',
      'WEDNESDAY',
      'THURSDAY',
      'FRIDAY',
      'SATURDAY'
    ]);
  });

  it('deve permitir atualizacao das regras quando o usuario for administrador', async () => {
    const authHeader = await getAuthHeader('admin');

    const response = await request(app)
      .put('/api/business-rules')
      .set(authHeader)
      .send(buildBusinessRulesPayload());

    expect(response.status).to.equal(200);
    expect(response.body).to.include({
      horaAbertura: '09:00',
      horaFechamento: '18:00'
    });
    expect(response.body.intervalos).to.deep.equal([
      {
        horaInicio: '12:00',
        horaFim: '13:00'
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
        horaAbertura: '18:00',
        horaFechamento: '09:00'
      }));

    expect(response.status).to.equal(400);
    expect(response.body.code).to.equal('VALIDATION_ERROR');
    expect(response.body.details).to.deep.include({
      field: 'horaFechamento',
      message: 'horaFechamento deve ser maior que horaAbertura'
    });
  });

  it('deve validar horario final de break menor que o inicial', async () => {
    const authHeader = await getAuthHeader('admin');

    const response = await request(app)
      .put('/api/business-rules')
      .set(authHeader)
      .send(buildBusinessRulesPayload({
        intervalos: [
          {
            horaInicio: '15:00',
            horaFim: '14:00'
          }
        ]
      }));

    expect(response.status).to.equal(400);
    expect(response.body.code).to.equal('VALIDATION_ERROR');
    expect(response.body.details).to.deep.include({
      field: 'intervalos[0]',
      message: 'horaFim deve ser maior que horaInicio'
    });
  });

  it('deve permitir atualizacao com qualquer dia da semana', async () => {
    const authHeader = await getAuthHeader('admin');

    const response = await request(app)
      .put('/api/business-rules')
      .set(authHeader)
      .send(buildBusinessRulesPayload({
        diasFuncionamento: ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY']
      }));

    expect(response.status).to.equal(200);
    expect(response.body.diasFuncionamento).to.deep.equal([
      'SUNDAY',
      'MONDAY',
      'TUESDAY',
      'WEDNESDAY',
      'THURSDAY',
      'FRIDAY',
      'SATURDAY'
    ]);
  });

  it('deve validar dia da semana invalido', async () => {
    const authHeader = await getAuthHeader('admin');

    const response = await request(app)
      .put('/api/business-rules')
      .set(authHeader)
      .send(buildBusinessRulesPayload({
        diasFuncionamento: ['TUESDAY', 'teste']
      }));

    expect(response.status).to.equal(400);
    expect(response.body.code).to.equal('VALIDATION_ERROR');
    expect(response.body.details).to.deep.include({
      field: 'diasFuncionamento',
      message: 'diasFuncionamento aceita apenas dias validos entre SUNDAY e SATURDAY'
    });
  });

  it('deve validar horarios no formato incorreto', async () => {
    const authHeader = await getAuthHeader('admin');

    const response = await request(app)
      .put('/api/business-rules')
      .set(authHeader)
      .send(buildBusinessRulesPayload({
        horaAbertura: '9h',
        horaFechamento: '18h',
        intervalos: [
          {
            horaInicio: '12h',
            horaFim: '13h'
          }
        ]
      }));

    expect(response.status).to.equal(400);
    expect(response.body.code).to.equal('VALIDATION_ERROR');
    expect(response.body.details).to.deep.include({
      field: 'horaAbertura',
      message: 'Formato de hora invalido. Use HH:MM'
    });
    expect(response.body.details).to.deep.include({
      field: 'horaFechamento',
      message: 'Formato de hora invalido. Use HH:MM'
    });
    expect(response.body.details).to.deep.include({
      field: 'intervalos[0].horaInicio',
      message: 'Formato de hora invalido. Use HH:MM'
    });
    expect(response.body.details).to.deep.include({
      field: 'intervalos[0].horaFim',
      message: 'Formato de hora invalido. Use HH:MM'
    });
  });
});
