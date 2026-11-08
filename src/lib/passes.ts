export type SavedPass = {
  eventId: string;
  code: string;
  guestName: string;
};

const STORAGE_KEY = "marquee.passes";
const CHANGE_EVENT = "marquee-passes";

function parsePasses(raw: string): SavedPass[] {
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];

    return parsed.flatMap((item) => {
      if (!item || typeof item !== "object") return [];
      const record = item as Partial<SavedPass>;
      if (!record.eventId || !record.code || !record.guestName) return [];
      return [
        {
          eventId: record.eventId,
          code: record.code,
          guestName: record.guestName,
        },
      ];
    });
  } catch {
    return [];
  }
}

export function readPassesSnapshot() {
  if (typeof window === "undefined") return "";
  return window.localStorage.getItem(STORAGE_KEY) ?? "";
}

export function parsePassesSnapshot(raw: string) {
  return parsePasses(raw);
}

export function subscribePasses(callback: () => void) {
  window.addEventListener(CHANGE_EVENT, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(CHANGE_EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}

export function rememberPass(entry: SavedPass) {
  const next = [
    entry,
    ...parsePasses(window.localStorage.getItem(STORAGE_KEY) ?? "").filter(
      (item) => item.eventId !== entry.eventId,
    ),
  ].slice(0, 12);

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  window.dispatchEvent(new Event(CHANGE_EVENT));
}
