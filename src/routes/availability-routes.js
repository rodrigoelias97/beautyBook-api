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
    const { date, time, serviceId } = req.query;

    if (!date || !serviceId) {
      throw createHttpError(400, 'VALIDATION_ERROR', 'date e serviceId sao obrigatorios', [
        { field: 'date', message: !date ? 'Campo obrigatorio' : undefined },
        { field: 'serviceId', message: !serviceId ? 'Campo obrigatorio' : undefined }
      ].filter((item) => item.message))
    }

    if (!isValidDate(date)) {
      throw createHttpError(400, 'VALIDATION_ERROR', 'A data deve estar no formato YYYY-MM-DD', [
        { field: 'date', message: 'A data deve estar no formato YYYY-MM-DD' }
      ]);
    }

    if (time && !isValidTime(time)) {
      throw createHttpError(400, 'VALIDATION_ERROR', 'A hora deve estar no formato HH:mm', [
        { field: 'time', message: 'A hora deve estar no formato HH:mm' }
      ]);
    }

    const service = db.services.find((item) => item.id === serviceId);

    if (!service) {
      throw createHttpError(404, 'RESOURCE_NOT_FOUND', 'Servico nao encontrado');
    }

    if (service.necessitaAvaliacao || !service.tempoServico) {
      throw createHttpError(400, 'SERVICE_REQUIRES_EVALUATION', 'Este servico requer avaliacao e nao possui agenda automatica');
    }

    const workingDay = getWorkingDay(date);

    if (!db.businessRules.workingDays.includes(workingDay)) {
      return res.json({
        date,
        serviceId,
        availableSlots: []
      });
    }

    const durationInMinutes = timeToMinutes(service.tempoServico);
    const openingMinutes = timeToMinutes(db.businessRules.openingTime);
    const closingMinutes = timeToMinutes(db.businessRules.closingTime);
    const busyAppointments = db.appointments.filter((item) => {
      return item.data === date && item.status === 'CONFIRMED';
    });

    const availableSlots = [];

    for (let startMinutes = openingMinutes; startMinutes + durationInMinutes <= closingMinutes; startMinutes += 15) {
      const slotStart = addMinutes('00:00', startMinutes);
      const slotEnd = addMinutes(slotStart, durationInMinutes);

      if (time && slotStart < time) {
        continue;
      }

      const isDuringBreak = db.businessRules.breaks.some((item) => {
        return startMinutes < timeToMinutes(item.endTime) && timeToMinutes(slotEnd) > timeToMinutes(item.startTime);
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

      availableSlots.push({
        startTime: slotStart,
        endTime: slotEnd
      });
    }

    res.json({
      date,
      serviceId,
      availableSlots
    });
  } catch (error) {
    next(error);
  }
});

export { availabilityRoutes };
