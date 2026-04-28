import express from 'express';
import { db, createSession } from '../data/store.js';
import { createHttpError } from '../utils/http-error.js';

const authRoutes = express.Router();

authRoutes.post('/login', (req, res, next) => {
  try {
    const { login, password } = req.body;

    const user = db.users.find((item) => {
      return (item.email === login || item.username === login) && item.password === password;
    });

    if (!user) {
      throw createHttpError(401, 'UNAUTHORIZED', 'Login ou senha invalidos');
    }

    const accessToken = createSession(user);

    res.json({
      accessToken,
      tokenType: 'Bearer',
      expiresIn: 3600,
      user: {
        id: user.id,
        name: user.name,
        role: user.role
      }
    });
  } catch (error) {
    next(error);
  }
});

export { authRoutes };
