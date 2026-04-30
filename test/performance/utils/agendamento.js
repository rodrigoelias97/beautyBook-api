import exec from 'k6/execution';

const postAppointment = JSON.parse(open('../fixtures/post-appointment.json'));

const appointmentCombos = [
  { nomeCliente: 'Cliente Exemplo', hora: '13:30' },
  { nomeCliente: 'Cliente Exemplo', hora: '18:00' },
  { nomeCliente: 'Cliente Teste', hora: '14:30' },
  { nomeCliente: 'Cliente Teste', hora: '19:00' }
];
const workingWeekdays = [2, 3, 4, 5, 6];
const runSeed = Math.floor(Date.now() / 1000) % 20000;

function formatDate(date) {
  return date.toISOString().slice(0, 10);
}

function getFutureWorkingDate(offset, minimumDaysAhead = 365) {
  const candidate = new Date();
  candidate.setDate(candidate.getDate() + minimumDaysAhead);

  while (!workingWeekdays.includes(candidate.getDay())) {
    candidate.setDate(candidate.getDate() + 1);
  }

  let remainingWorkingDays = offset;

  while (remainingWorkingDays > 0) {
    candidate.setDate(candidate.getDate() + 1);

    if (workingWeekdays.includes(candidate.getDay())) {
      remainingWorkingDays -= 1;
    }
  }

  return formatDate(candidate);
}

export function montarPayloadAgendamento() {
  const sequence = (exec.vu.iterationInScenario * 1000) + exec.vu.idInTest;
  const appointmentMatrixSize = appointmentCombos.length;
  const dayOffset = runSeed + Math.floor(sequence / appointmentMatrixSize);
  const combo = appointmentCombos[sequence % appointmentMatrixSize];

  return {
    ...postAppointment,
    data: getFutureWorkingDate(dayOffset),
    hora: combo.hora,
    nomeCliente: combo.nomeCliente,
    observacao: `Carga k6 iteracao ${sequence + 1}`
  };
}
