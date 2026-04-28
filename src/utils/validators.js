import { createHttpError } from './http-error.js';
import { isValidDate, isValidTime, timeToMinutes } from './date-utils.js';

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
    if (!isValidTime(payload.tempoServico)) {
      details.push({ field: 'tempoServico', message: 'tempoServico deve estar no formato HH:mm' });
    } else {
      const duration = timeToMinutes(payload.tempoServico);

      if (duration < 15 || duration > 480) {
        details.push({ field: 'tempoServico', message: 'tempoServico deve estar entre 00:15 e 08:00' });
      }
    }
  }

  if (payload.valor !== undefined && payload.valor !== null && payload.valor <= 0) {
    details.push({ field: 'valor', message: 'valor deve ser maior que zero' });
  }

  if (details.length > 0) {
    throw createHttpError(400, 'VALIDATION_ERROR', 'Dados do servico invalidos', details);
  }
}

export function validateBusinessRulesPayload(payload) {
  ensureRequiredFields(payload, ['timezone', 'openingTime', 'closingTime', 'workingDays', 'breaks']);

  const details = [];
  const allowedDays = ['TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];

  if (!isValidTime(payload.openingTime)) {
    details.push({ field: 'openingTime', message: 'openingTime deve estar no formato HH:mm' });
  }

  if (!isValidTime(payload.closingTime)) {
    details.push({ field: 'closingTime', message: 'closingTime deve estar no formato HH:mm' });
  }

  if (isValidTime(payload.openingTime) && isValidTime(payload.closingTime)) {
    if (timeToMinutes(payload.openingTime) >= timeToMinutes(payload.closingTime)) {
      details.push({ field: 'closingTime', message: 'closingTime deve ser maior que openingTime' });
    }
  }

  if (!Array.isArray(payload.workingDays) || payload.workingDays.length === 0) {
    details.push({ field: 'workingDays', message: 'workingDays deve ser uma lista com pelo menos um dia' });
  } else {
    const hasInvalidDay = payload.workingDays.some((day) => !allowedDays.includes(day));
    if (hasInvalidDay) {
      details.push({ field: 'workingDays', message: 'Apenas dias de terca a sabado sao permitidos' });
    }
  }

  if (!Array.isArray(payload.breaks)) {
    details.push({ field: 'breaks', message: 'breaks deve ser uma lista' });
  } else {
    payload.breaks.forEach((item, index) => {
      if (!isValidTime(item.startTime) || !isValidTime(item.endTime)) {
        details.push({ field: `breaks[${index}]`, message: 'Os intervalos devem usar o formato HH:mm' });
        return;
      }

      if (timeToMinutes(item.startTime) >= timeToMinutes(item.endTime)) {
        details.push({ field: `breaks[${index}]`, message: 'endTime deve ser maior que startTime' });
      }
    });
  }

  if (details.length > 0) {
    throw createHttpError(400, 'VALIDATION_ERROR', 'Configuracao operacional invalida', details);
  }
}

export function validateAppointmentPayload(payload) {
  ensureRequiredFields(payload, ['clienteId', 'servicoId', 'data', 'hora', 'telefone']);

  const details = [];

  if (!isValidDate(payload.data)) {
    details.push({ field: 'data', message: 'A data deve estar no formato YYYY-MM-DD' });
  }

  if (!isValidTime(payload.hora)) {
    details.push({ field: 'hora', message: 'A hora deve estar no formato HH:mm' });
  }

  if (!/^\d{11}$/.test(payload.telefone || '')) {
    details.push({ field: 'telefone', message: 'O telefone deve possuir 11 digitos' });
  }

  if (details.length > 0) {
    throw createHttpError(400, 'VALIDATION_ERROR', 'Dados do agendamento invalidos', details);
  }
}
