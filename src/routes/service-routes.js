import express from 'express';
import { db, generateId } from '../data/store.js';
import { authenticate, requireRole } from '../middleware/auth.js';
import { createHttpError } from '../utils/http-error.js';
import { validateServicePayload } from '../utils/validators.js';

const serviceRoutes = express.Router();

serviceRoutes.use(authenticate);

serviceRoutes.get('/', (req, res) => {
  res.json(db.services);
});

serviceRoutes.get('/:serviceId', (req, res, next) => {
  try {
    const service = db.services.find((item) => item.id === req.params.serviceId);

    if (!service) {
      throw createHttpError(404, 'RESOURCE_NOT_FOUND', 'Servico nao encontrado');
    }

    res.json(service);
  } catch (error) {
    next(error);
  }
});

serviceRoutes.post('/', requireRole('ADMIN'), (req, res, next) => {
  try {
    validateServicePayload(req.body, db.services);

    const service = {
      id: generateId(),
      name: req.body.name.trim(),
      description: req.body.description ?? null,
      necessitaAvaliacao: req.body.necessitaAvaliacao,
      tempoServico: req.body.necessitaAvaliacao ? null : req.body.tempoServico,
      valor: req.body.necessitaAvaliacao ? null : req.body.valor,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    db.services.push(service);
    res.status(201).json(service);
  } catch (error) {
    next(error);
  }
});

serviceRoutes.put('/:serviceId', requireRole('ADMIN'), (req, res, next) => {
  try {
    const service = db.services.find((item) => item.id === req.params.serviceId);

    if (!service) {
      throw createHttpError(404, 'RESOURCE_NOT_FOUND', 'Servico nao encontrado');
    }

    validateServicePayload(req.body, db.services, service.id);

    service.name = req.body.name.trim();
    service.description = req.body.description ?? null;
    service.necessitaAvaliacao = req.body.necessitaAvaliacao;
    service.tempoServico = req.body.necessitaAvaliacao ? null : req.body.tempoServico;
    service.valor = req.body.necessitaAvaliacao ? null : req.body.valor;
    service.updatedAt = new Date().toISOString();

    res.json(service);
  } catch (error) {
    next(error);
  }
});

serviceRoutes.delete('/:serviceId', requireRole('ADMIN'), (req, res, next) => {
  try {
    const index = db.services.findIndex((item) => item.id === req.params.serviceId);

    if (index === -1) {
      throw createHttpError(404, 'RESOURCE_NOT_FOUND', 'Servico nao encontrado');
    }

    db.services.splice(index, 1);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

export { serviceRoutes };
