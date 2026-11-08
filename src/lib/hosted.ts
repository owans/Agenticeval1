export type HostedEvent = {
  id: string;
  title: string;
  key: string;
};

const STORAGE_KEY = "marquee.hosted";
const CHANGE_EVENT = "marquee-hosted";

function parseHosted(raw: string): HostedEvent[] {
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];

    return parsed.flatMap((item) => {
      if (!item || typeof item !== "object") return [];
      const record = item as Partial<HostedEvent>;
      if (!record.id || !record.title || !record.key) return [];
      return [{ id: record.id, title: record.title, key: record.key }];
    });
  } catch {
    return [];
  }
}

export function readHostedSnapshot() {
  if (typeof window === "undefined") return "";
  return window.localStorage.getItem(STORAGE_KEY) ?? "";
}

export function parseHostedSnapshot(raw: string) {
  return parseHosted(raw);
}

export function subscribeHosted(callback: () => void) {
  window.addEventListener(CHANGE_EVENT, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(CHANGE_EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}

export function rememberHosted(entry: HostedEvent) {
  const next = [
    entry,
    ...parseHosted(window.localStorage.getItem(STORAGE_KEY) ?? "").filter(
      (item) => item.id !== entry.id,
    ),
  ].slice(0, 12);

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  window.dispatchEvent(new Event(CHANGE_EVENT));
}
