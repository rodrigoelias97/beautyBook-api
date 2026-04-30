import http from 'k6/http';

const postLogin = JSON.parse(open('../fixtures/post-login.json'));

import { pegarBaseURL } from '../utils/variaveis.js';

export function obterToken() {
  const url = `${pegarBaseURL()}/api/auth/login`;
  const payload = JSON.stringify(postLogin);

  const params = {
    headers: {
      'Content-Type': 'application/json'
    },
    tags: { endpoint: 'auth-login' }
  };

  const response = http.post(url, payload, params);

  return response.json('accessToken');
}
