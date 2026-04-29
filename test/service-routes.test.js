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

  it('deve listar servicos para usuario administrador autenticado', async () => {
    const authHeader = await getAuthHeader('admin');

    const response = await request(app)
      .get('/api/services')
      .set(authHeader);

    expect(response.status).to.equal(200);
    expect(response.body).to.be.an('array').with.lengthOf(2);
  });

  it('deve listar servicos para usuario cliente autenticado', async () => {
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

  it('deve permitir cadastro de servico com necessitaAvaliacao true sem valor e tempoServico', async () => {
    const authHeader = await getAuthHeader('admin');

    const response = await request(app)
      .post('/api/services')
      .set(authHeader)
      .send(buildServicePayload({
        name: 'Coloracao tecnica',
        necessitaAvaliacao: true,
        tempoServico: undefined,
        valor: undefined
      }));

    expect(response.status).to.equal(201);
    expect(response.body).to.include({
      name: 'Coloracao tecnica',
      necessitaAvaliacao: true,
      tempoServico: null,
      valor: null
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

  it('deve bloquear cadastro de servico sem nome', async () => {
    const authHeader = await getAuthHeader('admin');

    const response = await request(app)
      .post('/api/services')
      .set(authHeader)
      .send(buildServicePayload({
        name: ''
      }));

    expect(response.status).to.equal(400);
    expect(response.body.code).to.equal('VALIDATION_ERROR');
    expect(response.body.details).to.deep.include({
      field: 'name',
      message: 'Campo obrigatorio'
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
      .put('/api/services/Corte%20feminino')
      .set(authHeader)
      .send(buildServicePayload({
        name: 'Corte feminino atualizado',
        valor: 95
      }));

    expect(response.status).to.equal(200);
    expect(response.body.name).to.equal('Corte feminino atualizado');
    expect(response.body.valor).to.equal(95);
  });

  it('deve permitir atualizacao de servico com necessitaAvaliacao true removendo valor e tempoServico', async () => {
    const authHeader = await getAuthHeader('admin');

    const response = await request(app)
      .put('/api/services/Corte%20feminino')
      .set(authHeader)
      .send(buildServicePayload({
        name: 'Corte mediante avaliacao',
        necessitaAvaliacao: true,
        tempoServico: undefined,
        valor: undefined
      }));

    expect(response.status).to.equal(200);
    expect(response.body).to.include({
      name: 'Corte mediante avaliacao',
      necessitaAvaliacao: true,
      tempoServico: null,
      valor: null
    });
  });

  it('deve bloquear atualizacao com nome duplicado', async () => {
    const authHeader = await getAuthHeader('admin');

    const response = await request(app)
      .put('/api/services/Corte%20feminino')
      .set(authHeader)
      .send(buildServicePayload({
        name: 'Coloracao personalizada',
        valor: 95
      }));

    expect(response.status).to.equal(409);
    expect(response.body).to.deep.equal({
      code: 'SERVICE_NAME_ALREADY_EXISTS',
      message: 'Ja existe um servico com este nome'
    });
  });

  it('deve bloquear que o cliente atualize um servico existente', async () => {
    const authHeader = await getAuthHeader('client');

    const response = await request(app)
      .put('/api/services/Corte%20feminino')
      .set(authHeader)
      .send(buildServicePayload({
        name: 'Corte feminino atualizado pelo cliente',
        valor: 95
      }));

    expect(response.status).to.equal(403);
    expect(response.body.code).to.equal('FORBIDDEN');
  });

  it('deve permitir que administrador exclua um servico existente', async () => {
    const authHeader = await getAuthHeader('admin');

    const response = await request(app)
      .delete('/api/services/Corte%20feminino')
      .set(authHeader);

    expect(response.status).to.equal(204);
    expect(response.text).to.equal('');
  });

  it('deve bloquear que o cliente exclua um servico existente', async () => {
    const authHeader = await getAuthHeader('client');

    const response = await request(app)
      .delete('/api/services/Corte%20feminino')
      .set(authHeader);

    expect(response.status).to.equal(403);
    expect(response.body.code).to.equal('FORBIDDEN');
  });

  it('deve bloquear nome de servico com mais de 44 caracteres', async () => {
    const authHeader = await getAuthHeader('admin');

    const response = await request(app)
      .post('/api/services')
      .set(authHeader)
      .send(buildServicePayload({
        name: 'Servico extremamente grande para exceder quarenta e quatro'
      }));

    expect(response.status).to.equal(400);
    expect(response.body.code).to.equal('VALIDATION_ERROR');
    expect(response.body.details).to.deep.include({
      field: 'name',
      message: 'O nome do servico deve ter no maximo 44 caracteres'
    });
  });

  it('deve bloquear cadastro de servico com necessitaAvaliacao false e sem valor e tempoServico', async () => {
    const authHeader = await getAuthHeader('admin');

    const response = await request(app)
      .post('/api/services')
      .set(authHeader)
      .send(buildServicePayload({
        tempoServico: undefined,
        valor: undefined
      }));

    expect(response.status).to.equal(400);
    expect(response.body.code).to.equal('VALIDATION_ERROR');
    expect(response.body.details).to.deep.include({
      field: 'tempoServico',
      message: 'tempoServico e obrigatorio quando necessitaAvaliacao for false'
    });
    expect(response.body.details).to.deep.include({
      field: 'valor',
      message: 'valor e obrigatorio quando necessitaAvaliacao for false'
    });
  });

  it('deve bloquear valor negativo', async () => {
    const authHeader = await getAuthHeader('admin');

    const response = await request(app)
      .post('/api/services')
      .set(authHeader)
      .send(buildServicePayload({
        valor: -10
      }));

    expect(response.status).to.equal(400);
    expect(response.body.code).to.equal('VALIDATION_ERROR');
    expect(response.body.details).to.deep.include({
      field: 'valor',
      message: 'valor deve ser maior que zero'
    });
  });

  it('deve bloquear valor igual a zero', async () => {
    const authHeader = await getAuthHeader('admin');

    const response = await request(app)
      .post('/api/services')
      .set(authHeader)
      .send(buildServicePayload({
        valor: 0
      }));

    expect(response.status).to.equal(400);
    expect(response.body.code).to.equal('VALIDATION_ERROR');
    expect(response.body.details).to.deep.include({
      field: 'valor',
      message: 'valor deve ser maior que zero'
    });
  });

  it('deve bloquear valor em string', async () => {
    const authHeader = await getAuthHeader('admin');

    const response = await request(app)
      .post('/api/services')
      .set(authHeader)
      .send(buildServicePayload({
        valor: '150'
      }));

    expect(response.status).to.equal(400);
    expect(response.body.code).to.equal('VALIDATION_ERROR');
    expect(response.body.details).to.deep.include({
      field: 'valor',
      message: 'valor deve ser numerico'
    });
  });

  it('deve bloquear tempoServico menor que 00:15', async () => {
    const authHeader = await getAuthHeader('admin');

    const response = await request(app)
      .post('/api/services')
      .set(authHeader)
      .send(buildServicePayload({
        tempoServico: '00:10'
      }));

    expect(response.status).to.equal(400);
    expect(response.body.code).to.equal('VALIDATION_ERROR');
    expect(response.body.details).to.deep.include({
      field: 'tempoServico',
      message: 'tempoServico deve estar entre 00:15 e 08:00'
    });
  });

  it('deve permitir tempoServico no limite minimo 00:15', async () => {
    const authHeader = await getAuthHeader('admin');

    const response = await request(app)
      .post('/api/services')
      .set(authHeader)
      .send(buildServicePayload({
        name: 'Escova rapida',
        tempoServico: '00:15',
        valor: 50
      }));

    expect(response.status).to.equal(201);
    expect(response.body).to.include({
      name: 'Escova rapida',
      tempoServico: '00:15',
      valor: 50
    });
  });

  it('deve permitir tempoServico no limite maximo 08:00', async () => {
    const authHeader = await getAuthHeader('admin');

    const response = await request(app)
      .post('/api/services')
      .set(authHeader)
      .send(buildServicePayload({
        name: 'Dia da noiva completo',
        tempoServico: '08:00',
        valor: 900
      }));

    expect(response.status).to.equal(201);
    expect(response.body).to.include({
      name: 'Dia da noiva completo',
      tempoServico: '08:00',
      valor: 900
    });
  });

  it('deve bloquear tempoServico maior que 08:00', async () => {
    const authHeader = await getAuthHeader('admin');

    const response = await request(app)
      .post('/api/services')
      .set(authHeader)
      .send(buildServicePayload({
        tempoServico: '08:15'
      }));

    expect(response.status).to.equal(400);
    expect(response.body.code).to.equal('VALIDATION_ERROR');
    expect(response.body.details).to.deep.include({
      field: 'tempoServico',
      message: 'tempoServico deve estar entre 00:15 e 08:00'
    });
  });

  it('deve bloquear hora fora do formato', async () => {
    const authHeader = await getAuthHeader('admin');

    const response = await request(app)
      .post('/api/services')
      .set(authHeader)
      .send(buildServicePayload({
        tempoServico: '1h30'
      }));

    expect(response.status).to.equal(400);
    expect(response.body.code).to.equal('VALIDATION_ERROR');
    expect(response.body.details).to.deep.include({
      field: 'tempoServico',
      message: 'Formato de hora invalido. Use HH:MM'
    });
  });
});
