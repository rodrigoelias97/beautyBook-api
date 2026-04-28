function formatDate(date) {
  return date.toISOString().slice(0, 10);
}

function addDays(baseDate, daysToAdd) {
  const result = new Date(baseDate);
  result.setDate(result.getDate() + daysToAdd);
  return result;
}

export function getNextDateByWeekday(targetWeekday, startAt = new Date(), minimumDaysAhead = 1) {
  const firstCandidate = addDays(startAt, minimumDaysAhead);
  const result = new Date(firstCandidate);

  while (result.getDay() !== targetWeekday) {
    result.setDate(result.getDate() + 1);
  }

  return formatDate(result);
}

export function getNextWorkingDate(minimumDaysAhead = 1) {
  return getNextDateByWeekday(2, new Date(), minimumDaysAhead);
}

export function getNextNonWorkingDate(minimumDaysAhead = 1) {
  return getNextDateByWeekday(0, new Date(), minimumDaysAhead);
}

export function getPastDate(daysBehind = 1) {
  return formatDate(addDays(new Date(), -Math.abs(daysBehind)));
}
