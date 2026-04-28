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

  db.businessRules.timezone = initialState.businessRules.timezone;
  db.businessRules.openingTime = initialState.businessRules.openingTime;
  db.businessRules.closingTime = initialState.businessRules.closingTime;
  db.businessRules.workingDays.splice(
    0,
    db.businessRules.workingDays.length,
    ...structuredClone(initialState.businessRules.workingDays)
  );
  db.businessRules.breaks.splice(0, db.businessRules.breaks.length, ...structuredClone(initialState.businessRules.breaks));
}
