export function normalizeUtcDateTime(value: string): string {
  return value.endsWith("Z") ? value : `${value}Z`;
}

export function formatDateTime(value?: string | null): string {
  if (!value) return "N/A";
  const date = new Date(normalizeUtcDateTime(value));
  if (Number.isNaN(date.getTime())) return "N/A";
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(date);
}

export function formatDate(value?: string | null): string {
  if (!value) return "N/A";
  const date = new Date(value.length <= 10 ? `${value}T00:00:00` : normalizeUtcDateTime(value));
  if (Number.isNaN(date.getTime())) return "N/A";
  return new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(date);
}

export function relativeDay(value: string): "today" | "missed" | "upcoming" {
  const appointment = new Date(normalizeUtcDateTime(value));
  const now = new Date();
  const startToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const endToday = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  if (appointment >= startToday && appointment < endToday) return "today";
  if (appointment < startToday) return "missed";
  return "upcoming";
}

export function ageFromDob(value?: string | null): string {
  if (!value) return "N/A";
  const dob = new Date(`${value}T00:00:00`);
  if (Number.isNaN(dob.getTime())) return "N/A";
  const now = new Date();
  let age = now.getFullYear() - dob.getFullYear();
  const beforeBirthday =
    now.getMonth() < dob.getMonth() || (now.getMonth() === dob.getMonth() && now.getDate() < dob.getDate());
  if (beforeBirthday) age -= 1;
  return String(age);
}

export function toUtcIso(date: string, time: string): string {
  return new Date(`${date}T${time}:00`).toISOString();
}
