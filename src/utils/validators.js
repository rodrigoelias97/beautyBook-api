import { createHttpError } from './http-error.js';
import { isValidDate, isValidTime, timeToMinutes } from './date-utils.js';

const INVALID_TIME_FORMAT_MESSAGE = 'Formato de hora invalido. Use HH:MM';

function addInvalidTimeFormatIfNeeded(details, field, value) {
  if (value !== undefined && value !== null && !isValidTime(value)) {
    details.push({ field, message: INVALID_TIME_FORMAT_MESSAGE });
    return true;
  }

  return false;
}

export function ensureRequiredFields(payload, fieldNames) {
  const details = [];

  for (const fieldName of fieldNames) {
    if (payload[fieldName] === undefined || payload[fieldName] === null || payload[fieldName] === '') {
      details.push({
        field: fieldName,
        message: 'Campo obrigatorio'
      });
    }
  }

  if (details.length > 0) {
    throw createHttpError(400, 'VALIDATION_ERROR', 'Existem campos obrigatorios nao preenchidos', details);
  }
}

export function validateServicePayload(payload, existingServices, currentServiceId = null) {
  ensureRequiredFields(payload, ['name', 'necessitaAvaliacao']);

  const details = [];

  if (typeof payload.name !== 'string' || payload.name.trim().length === 0) {
    details.push({ field: 'name', message: 'O nome do servico e obrigatorio' });
  }

  if (payload.name && payload.name.trim().length > 44) {
    details.push({ field: 'name', message: 'O nome do servico deve ter no maximo 44 caracteres' });
  }

  const duplicatedName = existingServices.find((service) => {
    return service.name.toLowerCase() === payload.name?.trim().toLowerCase() && service.id !== currentServiceId;
  });

  if (duplicatedName) {
    throw createHttpError(409, 'SERVICE_NAME_ALREADY_EXISTS', 'Ja existe um servico com este nome');
  }

  if (typeof payload.necessitaAvaliacao !== 'boolean') {
    details.push({ field: 'necessitaAvaliacao', message: 'necessitaAvaliacao deve ser true ou false' });
  }

  if (payload.necessitaAvaliacao === false) {
    if (!payload.tempoServico) {
      details.push({ field: 'tempoServico', message: 'tempoServico e obrigatorio quando necessitaAvaliacao for false' });
    }

    if (payload.valor === undefined || payload.valor === null) {
      details.push({ field: 'valor', message: 'valor e obrigatorio quando necessitaAvaliacao for false' });
    }
  }

  if (payload.tempoServico !== undefined && payload.tempoServico !== null) {
    const hasInvalidTimeFormat = addInvalidTimeFormatIfNeeded(details, 'tempoServico', payload.tempoServico);

    if (!hasInvalidTimeFormat) {
      const duration = timeToMinutes(payload.tempoServico);

      if (duration < 15 || duration > 480) {
        details.push({ field: 'tempoServico', message: 'tempoServico deve estar entre 00:15 e 08:00' });
      }
    }
  }

  if (payload.valor !== undefined && payload.valor !== null && payload.valor <= 0) {
    details.push({ field: 'valor', message: 'valor deve ser maior que zero' });
  }

  if (payload.valor !== undefined && payload.valor !== null && typeof payload.valor !== 'number') {
    details.push({ field: 'valor', message: 'valor deve ser numerico' });
  }

  if (details.length > 0) {
    throw createHttpError(400, 'VALIDATION_ERROR', 'Dados do servico invalidos', details);
  }
}

export function validateBusinessRulesPayload(payload) {
  ensureRequiredFields(payload, ['horaAbertura', 'horaFechamento', 'diasFuncionamento', 'intervalos']);

  const details = [];
  const allowedDays = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];

  addInvalidTimeFormatIfNeeded(details, 'horaAbertura', payload.horaAbertura);
  addInvalidTimeFormatIfNeeded(details, 'horaFechamento', payload.horaFechamento);

  if (isValidTime(payload.horaAbertura) && isValidTime(payload.horaFechamento)) {
    if (timeToMinutes(payload.horaAbertura) >= timeToMinutes(payload.horaFechamento)) {
      details.push({ field: 'horaFechamento', message: 'horaFechamento deve ser maior que horaAbertura' });
    }
  }

  if (!Array.isArray(payload.diasFuncionamento) || payload.diasFuncionamento.length === 0) {
    details.push({ field: 'diasFuncionamento', message: 'diasFuncionamento deve ser uma lista com pelo menos um dia' });
  } else {
    const hasInvalidDay = payload.diasFuncionamento.some((day) => !allowedDays.includes(day));
    if (hasInvalidDay) {
      details.push({ field: 'diasFuncionamento', message: 'diasFuncionamento aceita apenas dias validos entre SUNDAY e SATURDAY' });
    }
  }

  if (!Array.isArray(payload.intervalos)) {
    details.push({ field: 'intervalos', message: 'intervalos deve ser uma lista' });
  } else {
    payload.intervalos.forEach((item, index) => {
      const startField = `intervalos[${index}].horaInicio`;
      const endField = `intervalos[${index}].horaFim`;

      const startHasInvalidFormat = addInvalidTimeFormatIfNeeded(details, startField, item.horaInicio);
      const endHasInvalidFormat = addInvalidTimeFormatIfNeeded(details, endField, item.horaFim);

      if (startHasInvalidFormat || endHasInvalidFormat) {
        return;
      }

      if (timeToMinutes(item.horaInicio) >= timeToMinutes(item.horaFim)) {
        details.push({ field: `intervalos[${index}]`, message: 'horaFim deve ser maior que horaInicio' });
      }
    });
  }

  if (details.length > 0) {
    throw createHttpError(400, 'VALIDATION_ERROR', 'Configuracao operacional invalida', details);
  }
}

export function validateAppointmentPayload(payload) {
  ensureRequiredFields(payload, ['nomeCliente', 'nomeServico', 'data', 'hora', 'telefone']);

  const details = [];

  if (typeof payload.nomeCliente !== 'string' || payload.nomeCliente.trim().length === 0) {
    details.push({ field: 'nomeCliente', message: 'nomeCliente e obrigatorio' });
  }

  if (typeof payload.nomeServico !== 'string' || payload.nomeServico.trim().length === 0) {
    details.push({ field: 'nomeServico', message: 'nomeServico e obrigatorio' });
  }

  if (!isValidDate(payload.data)) {
    details.push({ field: 'data', message: 'A data deve estar no formato YYYY-MM-DD' });
  }

  addInvalidTimeFormatIfNeeded(details, 'hora', payload.hora);

  if (!/^\d{11}$/.test(payload.telefone || '')) {
    details.push({ field: 'telefone', message: 'O telefone deve possuir 11 digitos' });
  }

  if (details.length > 0) {
    throw createHttpError(400, 'VALIDATION_ERROR', 'Dados do agendamento invalidos', details);
  }
}
