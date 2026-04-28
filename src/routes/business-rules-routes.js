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

    db.businessRules.timezone = req.body.timezone;
    db.businessRules.openingTime = req.body.openingTime;
    db.businessRules.closingTime = req.body.closingTime;
    db.businessRules.workingDays = req.body.workingDays;
    db.businessRules.breaks = req.body.breaks;

    res.json(db.businessRules);
  } catch (error) {
    next(error);
  }
});

export { businessRulesRoutes };
