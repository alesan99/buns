export type Dow = 0 | 1 | 2 | 3 | 4 | 5 | 6;

const DOW_SHORT = ["Su", "M", "T", "W", "Th", "F", "Sa"] as const;
const DOW_LONG = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const;
const MONTH_LONG = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
] as const;

function pad(n: number): string {
  return n < 10 ? `0${n}` : String(n);
}

export function toIso(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function fromIso(iso: string): Date {
  return new Date(`${iso}T00:00:00`);
}

export function todayIso(): string {
  return toIso(new Date());
}

export function addDaysIso(iso: string, days: number): string {
  const d = fromIso(iso);
  d.setDate(d.getDate() + days);
  return toIso(d);
}

export function dowShort(dow: Dow): string {
  return DOW_SHORT[dow];
}

export function dowOf(iso: string): Dow {
  return fromIso(iso).getDay() as Dow;
}

export function dayLongLabel(iso: string): string {
  const d = fromIso(iso);
  return `${DOW_LONG[d.getDay()]} · ${MONTH_LONG[d.getMonth()]} ${d.getDate()}`;
}

export function dayOfMonth(iso: string): number {
  return Number(iso.slice(8, 10));
}

export function monthLabel(year: number, month0: number): string {
  return `${MONTH_LONG[month0]} ${year}`;
}

/** Format "HH:mm" 24h → "2:00 PM". */
export function fmtTime12(hhmm: string | undefined): string | null {
  if (!hhmm) return null;
  const [hStr, mStr] = hhmm.split(":");
  const h = Number(hStr);
  const m = Number(mStr);
  if (Number.isNaN(h) || Number.isNaN(m)) return null;
  const suffix = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${pad(m)} ${suffix}`;
}

export function isOverdue(todo: {
  completed: boolean;
  dueDate: string;
  dueTime?: string;
}): boolean {
  if (todo.completed) return false;
  const now = new Date();
  const dueAt = new Date(`${todo.dueDate}T${todo.dueTime ?? "23:59"}:00`);
  return dueAt.getTime() < now.getTime();
}

export function shortDateLabel(iso: string): string {
  const d = fromIso(iso);
  return d.toLocaleString("en-US", { month: "short", day: "numeric" });
}

export type WeekRow = string[]; // 7 ISO strings, Su-Sa

/** Build a month grid: arrays of 7 ISO dates (Su-Sa) covering the visible month.
 *  Days outside the target month are still ISO strings (from prev/next month). */
export function monthGrid(year: number, month0: number): WeekRow[] {
  const first = new Date(year, month0, 1);
  const startOffset = first.getDay(); // 0 = Sun
  const gridStart = new Date(year, month0, 1 - startOffset);
  const rows: WeekRow[] = [];
  const cursor = new Date(gridStart);
  for (let r = 0; r < 6; r++) {
    const week: string[] = [];
    for (let c = 0; c < 7; c++) {
      week.push(toIso(cursor));
      cursor.setDate(cursor.getDate() + 1);
    }
    rows.push(week);
    // Stop early if next row would be entirely in the next month.
    const next = new Date(cursor);
    if (next.getMonth() !== month0 && r >= 4) break;
  }
  return rows;
}
