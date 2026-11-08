export function formatWhen(value: string, now = new Date()) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  const options: Intl.DateTimeFormatOptions = {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  };

  if (date.getFullYear() !== now.getFullYear()) {
    options.year = "numeric";
  }

  return new Intl.DateTimeFormat("en-US", options).format(date);
}

export function formatMonth(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("en-US", { month: "short" }).format(date);
}

export function formatDay(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("en-US", { day: "numeric" }).format(date);
}

export function isPast(value: string, now = Date.now()) {
  const time = new Date(value).getTime();
  return !Number.isNaN(time) && time < now;
}

export function seatsLabel(capacity: number | null, taken: number) {
  if (capacity === null) return "Open";
  const left = capacity - taken;
  if (left <= 0) return "Full";
  if (left === 1) return "1 left";
  return `${left} left`;
}
