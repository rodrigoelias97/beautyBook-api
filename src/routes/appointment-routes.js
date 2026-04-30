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

function serializeAppointment(appointment) {
  const cliente = db.users.find((user) => user.id === appointment.clienteId);
  const servico = db.services.find((serviceItem) => serviceItem.id === appointment.servicoId);

  return {
    id: appointment.id,
    nomeCliente: cliente?.name ?? 'Cliente nao encontrado',
    nomeServico: servico?.name ?? 'Servico nao encontrado',
    status: appointment.status,
    data: appointment.data,
    hora: appointment.hora,
    telefone: appointment.telefone,
    observacao: appointment.observacao,
    motivoCancelamento: appointment.motivoCancelamento,
    mensagem: appointment.status === 'PENDENTE_AVALIACAO'
      ? 'Este servico requer avaliacao. Entre em contato com o salao.'
      : null,
    tempoEstimado: servico?.tempoServico ?? null,
    valor: servico?.valor ?? null,
    createdAt: appointment.createdAt,
    cancelledAt: appointment.cancelledAt
  };
}

appointmentRoutes.post('/', requireRole('CLIENT', 'ADMIN'), (req, res, next) => {
  try {
    validateAppointmentPayload(req.body);

    const cliente = db.users.find((item) => item.name.toLowerCase() === req.body.nomeCliente.trim().toLowerCase());

    if (!cliente) {
      throw createHttpError(404, 'RESOURCE_NOT_FOUND', 'Cliente nao encontrado');
    }

    if (req.user.role === 'CLIENT' && req.user.id !== cliente.id) {
      throw createHttpError(403, 'FORBIDDEN', 'O cliente pode criar apenas seus proprios agendamentos');
    }

    const servico = db.services.find((item) => item.name.toLowerCase() === req.body.nomeServico.trim().toLowerCase());

    if (!servico) {
      throw createHttpError(404, 'RESOURCE_NOT_FOUND', 'Servico nao encontrado');
    }

    if (isPastDateTime(req.body.data, req.body.hora)) {
      throw createHttpError(400, 'APPOINTMENT_IN_PAST', 'Nao e permitido criar agendamentos em datas ou horarios passados');
    }

    const workingDay = getWorkingDay(req.body.data);

    if (!db.businessRules.diasFuncionamento.includes(workingDay)) {
      throw createHttpError(400, 'NON_WORKING_DAY', 'Nao e permitido agendar em dias fora do funcionamento do salao');
    }

    const openingMinutes = timeToMinutes(db.businessRules.horaAbertura);
    const closingMinutes = timeToMinutes(db.businessRules.horaFechamento);
    const requestedMinutes = timeToMinutes(req.body.hora);

    if (requestedMinutes < openingMinutes || requestedMinutes >= closingMinutes) {
      throw createHttpError(400, 'OUTSIDE_BUSINESS_HOURS', 'O horario informado esta fora do expediente');
    }

    const conflictsWithBreak = db.businessRules.intervalos.some((item) => {
      return requestedMinutes >= timeToMinutes(item.horaInicio) && requestedMinutes < timeToMinutes(item.horaFim);
    });

    if (conflictsWithBreak) {
      throw createHttpError(400, 'BREAK_TIME', 'O horario informado esta dentro de um intervalo indisponivel');
    }

    const sameDayAppointments = db.appointments.filter((item) => {
      return item.clienteId === cliente.id && item.data === req.body.data && item.status !== 'CANCELLED';
    });

    if (sameDayAppointments.length >= 2) {
      throw createHttpError(400, 'DAILY_APPOINTMENT_LIMIT_REACHED', 'O cliente ja possui 2 agendamentos nesta data');
    }

    if (servico.necessitaAvaliacao) {
      const pendingAppointment = {
        id: generateId(),
        clienteId: cliente.id,
        servicoId: servico.id,
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

      return res.status(201).json(serializeAppointment(pendingAppointment));
    }

    const durationInMinutes = timeToMinutes(servico.tempoServico);
    const requestedEnd = requestedMinutes + durationInMinutes;

    if (requestedEnd > closingMinutes) {
      throw createHttpError(400, 'OUTSIDE_BUSINESS_HOURS', 'O horario informado ultrapassa o expediente do salao');
    }

    const overlapsBreak = db.businessRules.intervalos.some((item) => {
      return requestedMinutes < timeToMinutes(item.horaFim) && requestedEnd > timeToMinutes(item.horaInicio);
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
      clienteId: cliente.id,
      servicoId: servico.id,
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

    res.status(201).json(serializeAppointment(appointment));
  } catch (error) {
    next(error);
  }
});

appointmentRoutes.get('/', requireRole('ADMIN'), (req, res, next) => {
  try {
    const { data } = req.query;

    if (!data) {
      throw createHttpError(400, 'VALIDATION_ERROR', 'A data e obrigatoria', [
        { field: 'data', message: 'Campo obrigatorio' }
      ]);
    }

    if (!isValidDate(data)) {
      throw createHttpError(400, 'VALIDATION_ERROR', 'A data deve estar no formato YYYY-MM-DD', [
        { field: 'data', message: 'A data deve estar no formato YYYY-MM-DD' }
      ]);
    }

    const result = db.appointments
      .filter((item) => item.data === data)
      .sort((first, second) => first.hora.localeCompare(second.hora))
      .map((appointment) => {
        const cliente = db.users.find((user) => user.id === appointment.clienteId);
        const servico = db.services.find((serviceItem) => serviceItem.id === appointment.servicoId);

        return {
          id: appointment.id,
          nomeCliente: cliente?.name ?? 'Cliente nao encontrado',
          nomeServico: servico?.name ?? 'Servico nao encontrado',
          status: appointment.status,
          data: appointment.data,
          hora: appointment.hora,
          valor: servico?.valor ?? null
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

    res.json(serializeAppointment(appointment));
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

    res.json(serializeAppointment(appointment));
  } catch (error) {
    next(error);
  }
});

appointmentRoutes.delete('/:appointmentId', requireRole('ADMIN'), (req, res, next) => {
  try {
    const appointmentIndex = db.appointments.findIndex((item) => item.id === req.params.appointmentId);

    if (appointmentIndex === -1) {
      throw createHttpError(404, 'RESOURCE_NOT_FOUND', 'Agendamento nao encontrado');
    }

    db.appointments.splice(appointmentIndex, 1);

    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

export { appointmentRoutes };
