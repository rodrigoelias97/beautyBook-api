import express from 'express';
import { db } from '../data/store.js';
import { authenticate } from '../middleware/auth.js';
import { createHttpError } from '../utils/http-error.js';
import {
  addMinutes,
  getWorkingDay,
  isValidDate,
  isValidTime,
  timeToMinutes
} from '../utils/date-utils.js';

const availabilityRoutes = express.Router();

availabilityRoutes.use(authenticate);

availabilityRoutes.get('/', (req, res, next) => {
  try {
    const { data, hora, nomeServico } = req.query;

    if (!data || !nomeServico) {
      throw createHttpError(400, 'VALIDATION_ERROR', 'data e nomeServico sao obrigatorios', [
        { field: 'data', message: !data ? 'Campo obrigatorio' : undefined },
        { field: 'nomeServico', message: !nomeServico ? 'Campo obrigatorio' : undefined }
      ].filter((item) => item.message));
    }

    if (!isValidDate(data)) {
      throw createHttpError(400, 'VALIDATION_ERROR', 'A data deve estar no formato YYYY-MM-DD', [
        { field: 'data', message: 'A data deve estar no formato YYYY-MM-DD' }
      ]);
    }

    if (hora && !isValidTime(hora)) {
      throw createHttpError(400, 'VALIDATION_ERROR', 'Formato de hora invalido. Use HH:MM', [
        { field: 'hora', message: 'Formato de hora invalido. Use HH:MM' }
      ]);
    }

    const service = db.services.find((item) => item.name.toLowerCase() === String(nomeServico).trim().toLowerCase());

    if (!service) {
      throw createHttpError(404, 'RESOURCE_NOT_FOUND', 'Servico nao encontrado');
    }

    if (service.necessitaAvaliacao || !service.tempoServico) {
      throw createHttpError(400, 'SERVICE_REQUIRES_EVALUATION', 'Este servico requer avaliacao e nao possui agenda automatica');
    }

    const workingDay = getWorkingDay(data);

    if (!db.businessRules.diasFuncionamento.includes(workingDay)) {
      return res.json({
        data,
        nomeServico: service.name,
        horariosDisponiveis: []
      });
    }

    const durationInMinutes = timeToMinutes(service.tempoServico);
    const openingMinutes = timeToMinutes(db.businessRules.horaAbertura);
    const closingMinutes = timeToMinutes(db.businessRules.horaFechamento);
    const busyAppointments = db.appointments.filter((item) => {
      return item.data === data && item.status === 'CONFIRMED';
    });

    const horariosDisponiveis = [];

    for (let startMinutes = openingMinutes; startMinutes + durationInMinutes <= closingMinutes; startMinutes += 30) {
      const slotStart = addMinutes('00:00', startMinutes);
      const slotEnd = addMinutes(slotStart, durationInMinutes);

      if (hora && slotStart < hora) {
        continue;
      }

      const isDuringBreak = db.businessRules.intervalos.some((item) => {
        return startMinutes < timeToMinutes(item.horaFim) && timeToMinutes(slotEnd) > timeToMinutes(item.horaInicio);
      });

      if (isDuringBreak) {
        continue;
      }

      const conflictsWithAppointment = busyAppointments.some((appointment) => {
        const appointmentService = db.services.find((serviceItem) => serviceItem.id === appointment.servicoId);

        if (!appointmentService?.tempoServico) {
          return false;
        }

        const appointmentStart = timeToMinutes(appointment.hora);
        const appointmentEnd = appointmentStart + timeToMinutes(appointmentService.tempoServico);

        return startMinutes < appointmentEnd && startMinutes + durationInMinutes > appointmentStart;
      });

      if (conflictsWithAppointment) {
        continue;
      }

      horariosDisponiveis.push({
        horaInicio: slotStart,
        horaFim: slotEnd
      });
    }

    res.json({
      data,
      nomeServico: service.name,
      horariosDisponiveis
    });
  } catch (error) {
    next(error);
  }
});

export { availabilityRoutes };
