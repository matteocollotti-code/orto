const ROME_TIME_ZONE = "Europe/Rome";

export function getRomeDate(date = new Date()) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: ROME_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

export function toRomeDateTime(date = new Date()) {
  const parts = new Intl.DateTimeFormat("sv-SE", {
    timeZone: ROME_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(date);

  return parts.replace(" ", "T");
}

export function addDays(dateIso: string, days: number) {
  const base = new Date(`${dateIso}T12:00:00Z`);
  base.setUTCDate(base.getUTCDate() + days);
  return base.toISOString().slice(0, 10);
}

export function diffInDays(fromDateIso: string, toDateIso: string) {
  const from = new Date(`${fromDateIso}T12:00:00Z`).getTime();
  const to = new Date(`${toDateIso}T12:00:00Z`).getTime();
  return Math.floor((to - from) / 86_400_000);
}

export function monthOf(dateIso: string) {
  return new Date(`${dateIso}T12:00:00Z`).getUTCMonth() + 1;
}

export function formatShortDate(dateIso: string) {
  return new Intl.DateTimeFormat("it-IT", {
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
    timeZone: ROME_TIME_ZONE,
  }).format(new Date(`${dateIso}T12:00:00Z`));
}

export function toCompletionTimestamp(dateIso: string) {
  return `${dateIso}T08:00:00.000Z`;
}

export function buildTaskId(dateIso: string, plantId: string, taskType: string) {
  return `${dateIso}:${plantId}:${taskType}`;
}
