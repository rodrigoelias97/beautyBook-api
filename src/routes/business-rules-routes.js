import express from 'express';
import { db } from '../data/store.js';
import { authenticate, requireRole } from '../middleware/auth.js';
import { validateBusinessRulesPayload } from '../utils/validators.js';

const businessRulesRoutes = express.Router();

businessRulesRoutes.use(authenticate);

businessRulesRoutes.get('/', (req, res) => {
  res.json(db.businessRules);
});

businessRulesRoutes.put('/', requireRole('ADMIN'), (req, res, next) => {
  try {
    validateBusinessRulesPayload(req.body);

    db.businessRules.horaAbertura = req.body.horaAbertura;
    db.businessRules.horaFechamento = req.body.horaFechamento;
    db.businessRules.diasFuncionamento = req.body.diasFuncionamento;
    db.businessRules.intervalos = req.body.intervalos;

    res.json(db.businessRules);
  } catch (error) {
    next(error);
  }
});

export { businessRulesRoutes };
