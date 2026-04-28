const dayMap = {
  0: 'SUNDAY',
  1: 'MONDAY',
  2: 'TUESDAY',
  3: 'WEDNESDAY',
  4: 'THURSDAY',
  5: 'FRIDAY',
  6: 'SATURDAY'
};

export function isValidDate(value) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

export function isValidTime(value) {
  return /^([01]\d|2[0-3]):[0-5]\d$/.test(value);
}

export function timeToMinutes(time) {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

export function minutesToTime(minutes) {
  const safeMinutes = Math.max(0, minutes);
  const hours = Math.floor(safeMinutes / 60)
    .toString()
    .padStart(2, '0');
  const rest = (safeMinutes % 60).toString().padStart(2, '0');
  return `${hours}:${rest}`;
}

export function parseDateTime(date, time) {
  return new Date(`${date}T${time}:00`);
}

export function getWorkingDay(date) {
  return dayMap[new Date(`${date}T12:00:00`).getDay()];
}

export function isPastDateTime(date, time) {
  return parseDateTime(date, time).getTime() < Date.now();
}

export function addMinutes(time, durationInMinutes) {
  return minutesToTime(timeToMinutes(time) + durationInMinutes);
}

export function differenceInHours(futureDate, baseDate = new Date()) {
  const diffInMilliseconds = futureDate.getTime() - baseDate.getTime();
  return diffInMilliseconds / (1000 * 60 * 60);
}
