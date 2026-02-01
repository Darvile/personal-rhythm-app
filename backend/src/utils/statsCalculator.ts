export function getWeekBounds(date: Date = new Date()): { start: Date; end: Date } {
  const d = new Date(date);
  const day = d.getDay();
  const diffToMonday = day === 0 ? -6 : 1 - day;

  const start = new Date(d);
  start.setDate(d.getDate() + diffToMonday);
  start.setHours(0, 0, 0, 0);

  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  end.setHours(23, 59, 59, 999);

  return { start, end };
}

export function calculateSuccessRate(currentLogs: number, minWeeklyFreq: number): number {
  if (minWeeklyFreq <= 0) return 0;
  const rate = (currentLogs / minWeeklyFreq) * 100;
  return Math.min(Math.round(rate * 10) / 10, 100);
}
