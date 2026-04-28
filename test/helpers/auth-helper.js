import request from 'supertest';
import { app } from '../../src/app.js';

export async function loginAs(credentials) {
  const response = await request(app)
    .post('/api/auth/login')
    .send(credentials);

  return response.body.accessToken;
}

export async function getAuthHeader(profile = 'client') {
  const credentialsByProfile = {
    admin: {
      login: 'admin',
      password: 'admin123'
    },
    client: {
      login: 'cliente',
      password: 'cliente123'
    }
  };

  const accessToken = await loginAs(credentialsByProfile[profile]);
  return { Authorization: `Bearer ${accessToken}` };
}
