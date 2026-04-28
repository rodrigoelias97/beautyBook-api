import request from 'supertest';
import { expect } from 'chai';
import { app } from '../src/app.js';
import { getAuthHeader } from './helpers/auth-helper.js';
import { buildServicePayload } from './fixtures/service-fixtures.js';

describe('Rotas de servicos', () => {
  it('deve bloquear listagem quando o usuario nao estiver autenticado', async () => {
    const response = await request(app).get('/api/services');

    expect(response.status).to.equal(401);
    expect(response.body.code).to.equal('UNAUTHORIZED');
  });

  it('deve listar servicos para usuario autenticado', async () => {
    const authHeader = await getAuthHeader('client');

    const response = await request(app)
      .get('/api/services')
      .set(authHeader);

    expect(response.status).to.equal(200);
    expect(response.body).to.be.an('array').with.lengthOf(2);
  });

  it('deve permitir que administrador cadastre um novo servico', async () => {
    const authHeader = await getAuthHeader('admin');

    const response = await request(app)
      .post('/api/services')
      .set(authHeader)
      .send(buildServicePayload());

    expect(response.status).to.equal(201);
    expect(response.body).to.include({
      name: 'Hidratacao premium',
      necessitaAvaliacao: false,
      tempoServico: '01:30',
      valor: 150
    });
  });

  it('deve impedir que cliente cadastre servico', async () => {
    const authHeader = await getAuthHeader('client');

    const response = await request(app)
      .post('/api/services')
      .set(authHeader)
      .send(buildServicePayload());

    expect(response.status).to.equal(403);
    expect(response.body.code).to.equal('FORBIDDEN');
  });

  it('deve rejeitar cadastro de servico com nome duplicado', async () => {
    const authHeader = await getAuthHeader('admin');

    const response = await request(app)
      .post('/api/services')
      .set(authHeader)
      .send(buildServicePayload({ name: 'Corte feminino' }));

    expect(response.status).to.equal(409);
    expect(response.body).to.deep.equal({
      code: 'SERVICE_NAME_ALREADY_EXISTS',
      message: 'Ja existe um servico com este nome'
    });
  });

  it('deve retornar erro ao buscar servico inexistente', async () => {
    const authHeader = await getAuthHeader('client');

    const response = await request(app)
      .get('/api/services/servico-inexistente')
      .set(authHeader);

    expect(response.status).to.equal(404);
    expect(response.body.code).to.equal('RESOURCE_NOT_FOUND');
  });

  it('deve permitir que administrador atualize um servico existente', async () => {
    const authHeader = await getAuthHeader('admin');

    const response = await request(app)
      .put('/api/services/f9505c79-a5ba-4768-aa61-930d7d63ebf4')
      .set(authHeader)
      .send(buildServicePayload({
        name: 'Corte feminino atualizado',
        valor: 95
      }));

    expect(response.status).to.equal(200);
    expect(response.body.name).to.equal('Corte feminino atualizado');
    expect(response.body.valor).to.equal(95);
  });

  it('deve permitir que administrador exclua um servico existente', async () => {
    const authHeader = await getAuthHeader('admin');

    const response = await request(app)
      .delete('/api/services/f9505c79-a5ba-4768-aa61-930d7d63ebf4')
      .set(authHeader);

    expect(response.status).to.equal(204);
    expect(response.text).to.equal('');
  });
});
