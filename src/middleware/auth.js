import { db, findSessionByToken } from '../data/store.js';
import { createHttpError } from '../utils/http-error.js';

export function authenticate(req, res, next) {
  const authorization = req.headers.authorization;

  if (!authorization || !authorization.startsWith('Bearer ')) {
    return next(createHttpError(401, 'UNAUTHORIZED', 'Autenticacao obrigatoria'));
  }

  const token = authorization.replace('Bearer ', '').trim();
  const session = findSessionByToken(token);

  if (!session) {
    return next(createHttpError(401, 'UNAUTHORIZED', 'Token invalido ou expirado'));
  }

  const user = db.users.find((item) => item.id === session.userId);

  if (!user) {
    return next(createHttpError(401, 'UNAUTHORIZED', 'Usuario da sessao nao encontrado'));
  }

  req.user = user;
  next();
}

export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return next(createHttpError(401, 'UNAUTHORIZED', 'Autenticacao obrigatoria'));
    }

    if (!roles.includes(req.user.role)) {
      return next(createHttpError(403, 'FORBIDDEN', 'Voce nao possui permissao para acessar este recurso'));
    }

    next();
  };
}
