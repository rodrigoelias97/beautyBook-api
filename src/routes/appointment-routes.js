import express from 'express';
import { db, generateId } from '../data/store.js';
import { authenticate, requireRole } from '../middleware/auth.js';
import { createHttpError } from '../utils/http-error.js';
import {
  differenceInHours,
  getWorkingDay,
  isPastDateTime,
  isValidDate,
  parseDateTime,
  timeToMinutes
} from '../utils/date-utils.js';
import { validateAppointmentPayload } from '../utils/validators.js';

const appointmentRoutes = express.Router();

appointmentRoutes.use(authenticate);

appointmentRoutes.post('/', requireRole('CLIENT'), (req, res, next) => {
  try {
    validateAppointmentPayload(req.body);

    if (req.user.id !== req.body.clienteId) {
      throw createHttpError(403, 'FORBIDDEN', 'O cliente pode criar apenas seus proprios agendamentos');
    }

    const service = db.services.find((item) => item.id === req.body.servicoId);

    if (!service) {
      throw createHttpError(404, 'RESOURCE_NOT_FOUND', 'Servico nao encontrado');
    }

    if (isPastDateTime(req.body.data, req.body.hora)) {
      throw createHttpError(400, 'APPOINTMENT_IN_PAST', 'Nao e permitido criar agendamentos em datas ou horarios passados');
    }

    const workingDay = getWorkingDay(req.body.data);

    if (!db.businessRules.workingDays.includes(workingDay)) {
      throw createHttpError(400, 'NON_WORKING_DAY', 'Nao e permitido agendar em dias fora do funcionamento do salao');
    }

    const openingMinutes = timeToMinutes(db.businessRules.openingTime);
    const closingMinutes = timeToMinutes(db.businessRules.closingTime);
    const requestedMinutes = timeToMinutes(req.body.hora);

    if (requestedMinutes < openingMinutes || requestedMinutes >= closingMinutes) {
      throw createHttpError(400, 'OUTSIDE_BUSINESS_HOURS', 'O horario informado esta fora do expediente');
    }

    const conflictsWithBreak = db.businessRules.breaks.some((item) => {
      return requestedMinutes >= timeToMinutes(item.startTime) && requestedMinutes < timeToMinutes(item.endTime);
    });

    if (conflictsWithBreak) {
      throw createHttpError(400, 'BREAK_TIME', 'O horario informado esta dentro de um intervalo indisponivel');
    }

    const sameDayAppointments = db.appointments.filter((item) => {
      return item.clienteId === req.body.clienteId && item.data === req.body.data && item.status !== 'CANCELLED';
    });

    if (sameDayAppointments.length >= 2) {
      throw createHttpError(400, 'DAILY_APPOINTMENT_LIMIT_REACHED', 'O cliente ja possui 2 agendamentos nesta data');
    }

    if (service.necessitaAvaliacao) {
      const pendingAppointment = {
        id: generateId(),
        clienteId: req.body.clienteId,
        servicoId: req.body.servicoId,
        status: 'PENDENTE_AVALIACAO',
        data: req.body.data,
        hora: req.body.hora,
        telefone: req.body.telefone,
        observacao: req.body.observacao ?? null,
        motivoCancelamento: null,
        createdAt: new Date().toISOString(),
        cancelledAt: null
      };

      db.appointments.push(pendingAppointment);

      return res.status(201).json({
        id: pendingAppointment.id,
        status: pendingAppointment.status,
        clienteId: pendingAppointment.clienteId,
        servico: service,
        data: pendingAppointment.data,
        hora: pendingAppointment.hora,
        telefone: pendingAppointment.telefone,
        mensagem: 'Este servico requer avaliacao. Entre em contato com o salao.',
        tempoEstimado: null,
        valor: null,
        createdAt: pendingAppointment.createdAt
      });
    }

    const durationInMinutes = timeToMinutes(service.tempoServico);
    const requestedEnd = requestedMinutes + durationInMinutes;

    if (requestedEnd > closingMinutes) {
      throw createHttpError(400, 'OUTSIDE_BUSINESS_HOURS', 'O horario informado ultrapassa o expediente do salao');
    }

    const overlapsBreak = db.businessRules.breaks.some((item) => {
      return requestedMinutes < timeToMinutes(item.endTime) && requestedEnd > timeToMinutes(item.startTime);
    });

    if (overlapsBreak) {
      throw createHttpError(400, 'BREAK_TIME', 'O horario informado conflita com um intervalo indisponivel');
    }

    const dayAppointments = db.appointments.filter((item) => item.data === req.body.data && item.status === 'CONFIRMED');
    const conflict = dayAppointments.find((appointment) => {
      const appointmentService = db.services.find((serviceItem) => serviceItem.id === appointment.servicoId);

      if (!appointmentService?.tempoServico) {
        return false;
      }

      const appointmentStart = timeToMinutes(appointment.hora);
      const appointmentEnd = appointmentStart + timeToMinutes(appointmentService.tempoServico);

      return requestedMinutes < appointmentEnd && requestedEnd > appointmentStart;
    });

    if (conflict) {
      throw createHttpError(409, 'TIME_SLOT_OVERLAP', 'O horario solicitado conflita com outro agendamento existente');
    }

    const appointment = {
      id: generateId(),
      clienteId: req.body.clienteId,
      servicoId: req.body.servicoId,
      status: 'CONFIRMED',
      data: req.body.data,
      hora: req.body.hora,
      telefone: req.body.telefone,
      observacao: req.body.observacao ?? null,
      motivoCancelamento: null,
      createdAt: new Date().toISOString(),
      cancelledAt: null
    };

    db.appointments.push(appointment);

    res.status(201).json({
      id: appointment.id,
      status: appointment.status,
      clienteId: appointment.clienteId,
      servico: service,
      data: appointment.data,
      hora: appointment.hora,
      telefone: appointment.telefone,
      mensagem: null,
      tempoEstimado: service.tempoServico,
      valor: service.valor,
      createdAt: appointment.createdAt
    });
  } catch (error) {
    next(error);
  }
});

appointmentRoutes.get('/', requireRole('ADMIN'), (req, res, next) => {
  try {
    const { date } = req.query;

    if (!date) {
      throw createHttpError(400, 'VALIDATION_ERROR', 'A data e obrigatoria', [
        { field: 'date', message: 'Campo obrigatorio' }
      ]);
    }

    if (!isValidDate(date)) {
      throw createHttpError(400, 'VALIDATION_ERROR', 'A data deve estar no formato YYYY-MM-DD', [
        { field: 'date', message: 'A data deve estar no formato YYYY-MM-DD' }
      ]);
    }

    const result = db.appointments
      .filter((item) => item.data === date)
      .sort((first, second) => first.hora.localeCompare(second.hora))
      .map((appointment) => {
        const client = db.users.find((user) => user.id === appointment.clienteId);
        const service = db.services.find((serviceItem) => serviceItem.id === appointment.servicoId);

        return {
          id: appointment.id,
          clientName: client?.name ?? 'Cliente nao encontrado',
          serviceName: service?.name ?? 'Servico nao encontrado',
          status: appointment.status,
          date: appointment.data,
          time: appointment.hora,
          valor: service?.valor ?? null
        };
      });

    res.json(result);
  } catch (error) {
    next(error);
  }
});

appointmentRoutes.get('/:appointmentId', (req, res, next) => {
  try {
    const appointment = db.appointments.find((item) => item.id === req.params.appointmentId);

    if (!appointment) {
      throw createHttpError(404, 'RESOURCE_NOT_FOUND', 'Agendamento nao encontrado');
    }

    const canAccess = req.user.role === 'ADMIN' || appointment.clienteId === req.user.id;

    if (!canAccess) {
      throw createHttpError(403, 'FORBIDDEN', 'Voce nao pode visualizar o agendamento de outro cliente');
    }

    res.json(appointment);
  } catch (error) {
    next(error);
  }
});

appointmentRoutes.patch('/:appointmentId/cancel', (req, res, next) => {
  try {
    const appointment = db.appointments.find((item) => item.id === req.params.appointmentId);

    if (!appointment) {
      throw createHttpError(404, 'RESOURCE_NOT_FOUND', 'Agendamento nao encontrado');
    }

    const canCancel = req.user.role === 'ADMIN' || appointment.clienteId === req.user.id;

    if (!canCancel) {
      throw createHttpError(403, 'FORBIDDEN', 'Voce nao pode cancelar o agendamento de outro cliente');
    }

    if (appointment.status === 'CANCELLED') {
      throw createHttpError(400, 'APPOINTMENT_ALREADY_CANCELLED', 'Este agendamento ja foi cancelado');
    }

    const appointmentDateTime = parseDateTime(appointment.data, appointment.hora);
    const hoursUntilAppointment = differenceInHours(appointmentDateTime);

    if (hoursUntilAppointment < 48) {
      throw createHttpError(400, 'CANCELLATION_WINDOW_EXPIRED', 'Cancelamento permitido apenas com 48 horas de antecedencia');
    }

    appointment.status = 'CANCELLED';
    appointment.motivoCancelamento = req.body?.reason ?? null;
    appointment.cancelledAt = new Date().toISOString();

    res.json(appointment);
  } catch (error) {
    next(error);
  }
});

export { appointmentRoutes };
