export function startOfDay(d = new Date()) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

export function endOfDay(d = new Date()) {
  const x = new Date(d);
  x.setHours(23, 59, 59, 999);
  return x;
}

export function startOfWeek(d = new Date()) {
  const x = new Date(d);
  const day = x.getDay();
  const diff = day === 0 ? 6 : day - 1;
  x.setDate(x.getDate() - diff);
  x.setHours(0, 0, 0, 0);
  return x;
}

export function endOfWeek(d = new Date()) {
  const s = startOfWeek(d);
  const x = new Date(s);
  x.setDate(x.getDate() + 6);
  x.setHours(23, 59, 59, 999);
  return x;
}

export function startOfMonth(d = new Date()) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

export function endOfMonth(d = new Date()) {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999);
}

export function startOfYear(d = new Date()) {
  return new Date(d.getFullYear(), 0, 1);
}

export function endOfYear(d = new Date()) {
  return new Date(d.getFullYear(), 11, 31, 23, 59, 59, 999);
}

export type FinancePeriod = "today" | "week" | "month" | "year";

export function getPeriodRange(period: FinancePeriod, ref = new Date()) {
  switch (period) {
    case "today":
      return { start: startOfDay(ref), end: endOfDay(ref) };
    case "week":
      return { start: startOfWeek(ref), end: endOfWeek(ref) };
    case "month":
      return { start: startOfMonth(ref), end: endOfMonth(ref) };
    case "year":
      return { start: startOfYear(ref), end: endOfYear(ref) };
  }
}

export function formatEuro(centimes: number) {
  return `${(centimes / 100).toFixed(centimes % 100 === 0 ? 0 : 2).replace(".", ",")} €`;
}

export function formatEuroSigned(centimes: number) {
  const sign = centimes >= 0 ? "+" : "";
  return `${sign}${formatEuro(Math.abs(centimes))}`;
}
