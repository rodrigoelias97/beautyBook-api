export function errorHandler(error, req, res, next) {
  const status = error.status || 500;

  const payload = {
    code: error.code || 'INTERNAL_SERVER_ERROR',
    message: error.message || 'Ocorreu um erro interno no servidor'
  };

  if (error.details) {
    payload.details = error.details;
  }

  res.status(status).json(payload);
}
