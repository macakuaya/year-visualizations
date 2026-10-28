/** @typedef {{ date: Date, level: number, games: number }} DayActivity */

const LEVELS = 5;

/** Seeded-ish noise so patterns look plausible, not pure random. */
function hashDay(year, month, day) {
  let h = year * 371 + month * 31 + day;
  h = (h ^ (h >>> 13)) * 1274126177;
  return (h ^ (h >>> 16)) >>> 0;
}

/**
 * @param {number} year
 * @returns {DayActivity[]}
 */
export function buildYearData(year) {
  const days = [];
  const start = new Date(year, 0, 1);
  const end = new Date(year, 11, 31);
  const cursor = new Date(start);

  // Slow-moving "form" creates multi-week hot streaks and dry spells
  let form = (hashDay(year, 0, 0) % 100) / 100;

  while (cursor <= end) {
    const m = cursor.getMonth();
    const d = cursor.getDate();
    const dow = cursor.getDay();
    const h = hashDay(year, m, d);
    const noise = (h % 1000) / 1000;

    // Drift, with occasional regime shifts
    form += (noise - 0.5) * 0.12;
    if (noise > 0.985) form += 0.35; // burst starts
    if (noise < 0.015) form -= 0.35; // dry spell starts
    form = Math.min(1, Math.max(0, form));

    let base = form * (0.1 + ((h % 100) / 100) * 0.9);
    if (dow === 0 || dow === 6) base *= 1.3;
    if (m === 11 && d > 20) base *= 1.25;
    if (m === 0 && d < 8) base *= 0.5;

    let games = Math.floor(base * 26);
    if (noise > 0.97) games += 8; // occasional spike day

    let level = 0;
    if (games > 0) level = 1;
    if (games >= 4) level = 2;
    if (games >= 10) level = 3;
    if (games >= 18) level = 4;

    days.push({
      date: new Date(cursor),
      level,
      games,
    });
    cursor.setDate(cursor.getDate() + 1);
  }
  return days;
}

export function isLeapYear(year) {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

export function daysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

/** Monday = 0 … Sunday = 6 */
export function mondayIndex(date) {
  return (date.getDay() + 6) % 7;
}

export function formatDayLabel(date) {
  return date.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

export { LEVELS };
