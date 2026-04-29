import { db } from '../../src/data/store.js';

const initialState = structuredClone({
  users: db.users,
  services: db.services,
  businessRules: db.businessRules,
  appointments: db.appointments,
  sessions: db.sessions
});

export function resetDatabase() {
  db.users.splice(0, db.users.length, ...structuredClone(initialState.users));
  db.services.splice(0, db.services.length, ...structuredClone(initialState.services));
  db.appointments.splice(0, db.appointments.length, ...structuredClone(initialState.appointments));
  db.sessions.splice(0, db.sessions.length, ...structuredClone(initialState.sessions));

  db.businessRules.horaAbertura = initialState.businessRules.horaAbertura;
  db.businessRules.horaFechamento = initialState.businessRules.horaFechamento;
  db.businessRules.diasFuncionamento.splice(
    0,
    db.businessRules.diasFuncionamento.length,
    ...structuredClone(initialState.businessRules.diasFuncionamento)
  );
  db.businessRules.intervalos.splice(0, db.businessRules.intervalos.length, ...structuredClone(initialState.businessRules.intervalos));
}
