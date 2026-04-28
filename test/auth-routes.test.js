import request from 'supertest';
import { expect } from 'chai';
import { app } from '../src/app.js';
import { validAdminCredentials, validClientCredentials } from './fixtures/auth-fixtures.js';

describe('Rotas de autenticacao', () => {
  it('deve autenticar administrador usando username', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send(validAdminCredentials);

    expect(response.status).to.equal(200);
    expect(response.body).to.include({
      tokenType: 'Bearer',
      expiresIn: 3600
    });
    expect(response.body.accessToken).to.be.a('string').and.not.empty;
    expect(response.body.user.name).to.equal('Administrador BeautyBook');
  });

  it('deve autenticar cliente usando email', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        login: 'cliente@beautybook.com',
        password: validClientCredentials.password
      });

    expect(response.status).to.equal(200);
    expect(response.body).to.include({
      tokenType: 'Bearer',
      expiresIn: 3600
    });
    expect(response.body.accessToken).to.be.a('string').and.not.empty;
    expect(response.body.user.name).to.equal('Cliente Exemplo');
  });

  it('deve rejeitar login com credenciais invalidas', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        login: 'inexistente',
        password: 'senha-errada'
      });

    expect(response.status).to.equal(401);
    expect(response.body).to.deep.equal({
      code: 'UNAUTHORIZED',
      message: 'Login ou senha invalidos'
    });
  });
});
