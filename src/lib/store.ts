import { createHash, randomBytes, randomUUID, timingSafeEqual } from "crypto";
import { mkdir, readFile, rename, writeFile } from "fs/promises";
import path from "path";
import { io } from "next/cache";
import { formatDay, formatMonth, formatWhen, isPast } from "@/lib/format";
import {
  StoreError,
  isCategoryColor,
  type CategoryColor,
  type CheckInResult,
  type EventRecord,
  type ManageTicket,
  type PublicCategory,
  type PublicEvent,
  type Ticket,
  type TicketCategory,
  type TicketPass,
} from "@/lib/types";

type StoreData = {
  events: EventRecord[];
  tickets: Ticket[];
};

const dataFile = path.join(process.cwd(), "data", "store.json");
const codeAlphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

let queue: Promise<unknown> = Promise.resolve();

function enqueue<T>(task: () => Promise<T>): Promise<T> {
  const run = queue.then(task, task);
  queue = run.then(
    () => undefined,
    () => undefined,
  );
  return run;
}

async function readStore(): Promise<StoreData> {
  try {
    const raw = await readFile(dataFile, "utf8");
    const parsed = JSON.parse(raw) as Partial<StoreData>;
    return {
      events: Array.isArray(parsed.events) ? parsed.events : [],
      tickets: Array.isArray(parsed.tickets) ? parsed.tickets : [],
    };
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return { events: [], tickets: [] };
    }
    throw error;
  }
}

async function writeStore(store: StoreData) {
  await mkdir(path.dirname(dataFile), { recursive: true });
  const temporary = `${dataFile}.${process.pid}.tmp`;
  await writeFile(temporary, JSON.stringify(store, null, 2));
  await rename(temporary, dataFile);
}

function hashKey(key: string) {
  return createHash("sha256").update(key).digest("hex");
}

function keysMatch(storedHash: string, providedKey: string) {
  const providedHash = hashKey(providedKey);
  const stored = Buffer.from(storedHash);
  const provided = Buffer.from(providedHash);
  if (stored.length === 0 || stored.length !== provided.length) return false;
  return timingSafeEqual(stored, provided);
}

function cleanText(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function requireText(value: string, label: string, max: number) {
  const cleaned = cleanText(value);
  if (!cleaned) throw new StoreError(`${label} is required.`);
  if (cleaned.length > max) {
    throw new StoreError(`${label} needs to be ${max} characters or fewer.`);
  }
  return cleaned;
}

function optionalText(value: string, label: string, max: number) {
  const cleaned = cleanText(value);
  if (cleaned.length > max) {
    throw new StoreError(`${label} needs to be ${max} characters or fewer.`);
  }
  return cleaned;
}

function parseCapacity(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (!/^\d+$/.test(trimmed)) {
    throw new StoreError("Capacity needs to be a whole number, or left blank for no cap.");
  }
  const capacity = Number(trimmed);
  if (capacity < 1 || capacity > 100000) {
    throw new StoreError("Capacity needs to be between 1 and 100000.");
  }
  return capacity;
}

function requireColor(value: string): CategoryColor {
  if (!isCategoryColor(value)) {
    throw new StoreError("Pick a label color from the set.");
  }
  return value;
}

function requireStartsAt(value: string) {
  const trimmed = value.trim();
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(trimmed) || Number.isNaN(new Date(trimmed).getTime())) {
    throw new StoreError("Choose a date and time for the event.");
  }
  return trimmed;
}

function requireEmail(value: string) {
  const email = value.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 200) {
    throw new StoreError("Enter a valid email address.");
  }
  return email;
}

export function normalizeCode(input: string) {
  const pasted = input.toUpperCase().match(/MRQ-[A-Z0-9]{3}-[A-Z0-9]{3}/);
  if (pasted) return pasted[0];

  const compact = input.toUpperCase().replace(/[^A-Z0-9]/g, "");
  const body = compact.startsWith("MRQ") ? compact.slice(3) : compact;
  if (body.length === 6) return `MRQ-${body.slice(0, 3)}-${body.slice(3)}`;
  return cleanText(input).toUpperCase();
}

function makeCode(existing: Set<string>) {
  for (let attempt = 0; attempt < 8; attempt += 1) {
    const bytes = randomBytes(6);
    let body = "";
    for (const byte of bytes) {
      body += codeAlphabet[byte % codeAlphabet.length];
    }
    const code = `MRQ-${body.slice(0, 3)}-${body.slice(3)}`;
    if (!existing.has(code)) return code;
  }
  throw new StoreError("Could not issue a ticket code. Try again.");
}

function takenCount(tickets: Ticket[], categoryId: string) {
  return tickets.filter((ticket) => ticket.categoryId === categoryId).length;
}

function toPublic(event: EventRecord, tickets: Ticket[]): PublicEvent {
  const eventTickets = tickets.filter((ticket) => ticket.eventId === event.id);
  const categories: PublicCategory[] = event.categories.map((category) => ({
    ...category,
    taken: takenCount(eventTickets, category.id),
  }));

  return {
    id: event.id,
    title: event.title,
    description: event.description,
    venue: event.venue,
    startsAt: event.startsAt,
    whenLabel: formatWhen(event.startsAt),
    monthLabel: formatMonth(event.startsAt),
    dayLabel: formatDay(event.startsAt),
    past: isPast(event.startsAt),
    categories,
    registeredCount: eventTickets.length,
    checkedInCount: eventTickets.filter((ticket) => ticket.checkedInAt).length,
  };
}

function toManageTicket(ticket: Ticket): ManageTicket {
  return {
    id: ticket.id,
    guestName: ticket.guestName,
    guestEmail: ticket.guestEmail,
    code: ticket.code,
    categoryId: ticket.categoryId,
    checkedInAt: ticket.checkedInAt,
    checkedInLabel: ticket.checkedInAt ? `Checked in ${formatWhen(ticket.checkedInAt)}` : null,
  };
}

function findEvent(store: StoreData, eventId: string) {
  const event = store.events.find((item) => item.id === eventId);
  if (!event) throw new StoreError("That event is no longer listed.");
  return event;
}

function assertOwner(store: StoreData, eventId: string, ownerKey: string) {
  const event = findEvent(store, eventId);
  if (!ownerKey || !keysMatch(event.ownerKeyHash, ownerKey)) {
    throw new StoreError("That owner key does not open this door list.");
  }
  return event;
}

function assertCategoryName(event: EventRecord, name: string, ignoreId?: string) {
  const duplicate = event.categories.some(
    (category) =>
      category.id !== ignoreId && category.name.toLowerCase() === name.toLowerCase(),
  );
  if (duplicate) throw new StoreError(`There's already a label named ${name}.`);
}

function categoryById(event: EventRecord, categoryId: string) {
  const category = event.categories.find((item) => item.id === categoryId);
  if (!category) throw new StoreError("That label isn't on this event.");
  return category;
}

function assertRoom(store: StoreData, category: TicketCategory, extra = 1) {
  if (category.capacity === null) return;
  const taken = takenCount(store.tickets, category.id);
  if (taken + extra > category.capacity) {
    throw new StoreError(`${category.name} is full.`);
  }
}

async function withStore<T>(task: (store: StoreData) => Promise<T> | T) {
  return enqueue(async () => {
    const store = await readStore();
    const result = await task(store);
    return result;
  });
}

async function withWrite<T>(task: (store: StoreData) => Promise<T> | T) {
  return enqueue(async () => {
    const store = await readStore();
    const result = await task(store);
    await writeStore(store);
    return result;
  });
}

export async function listPublicEvents() {
  await io();
  const events = await withStore((store) =>
    store.events
      .map((event) => toPublic(event, store.tickets))
      .sort((a, b) => a.startsAt.localeCompare(b.startsAt)),
  );
  return events;
}

export async function getPublicEvent(eventId: string) {
  await io();
  return withStore((store) => {
    const event = store.events.find((item) => item.id === eventId);
    return event ? toPublic(event, store.tickets) : null;
  });
}

export async function getManageView(eventId: string, ownerKey: string) {
  await io();
  return withStore((store) => {
    const event = store.events.find((item) => item.id === eventId);
    if (!event) return { kind: "missing" } as const;
    if (!ownerKey || !keysMatch(event.ownerKeyHash, ownerKey)) {
      return { kind: "locked" } as const;
    }

    const tickets = store.tickets
      .filter((ticket) => ticket.eventId === event.id)
      .map(toManageTicket)
      .sort((a, b) => {
        if (Boolean(a.checkedInAt) !== Boolean(b.checkedInAt)) {
          return a.checkedInAt ? 1 : -1;
        }
        return a.guestName.localeCompare(b.guestName);
      });

    return {
      kind: "ready" as const,
      event: toPublic(event, store.tickets),
      tickets,
    };
  });
}

export async function getTicketPass(code: string) {
  await io();
  const normalized = normalizeCode(code);
  return withStore((store) => {
    const ticket = store.tickets.find((item) => item.code === normalized);
    if (!ticket) return null;
    const event = store.events.find((item) => item.id === ticket.eventId);
    if (!event) return null;
    const category = event.categories.find((item) => item.id === ticket.categoryId);

    const pass: TicketPass = {
      code: ticket.code,
      guestName: ticket.guestName,
      guestEmail: ticket.guestEmail,
      categoryName: category?.name ?? "Unlabeled",
      categoryColor: category?.color ?? "#234e3e",
      checkedInAt: ticket.checkedInAt,
      checkedInLabel: ticket.checkedInAt ? `Checked in ${formatWhen(ticket.checkedInAt)}` : null,
      event: {
        id: event.id,
        title: event.title,
        venue: event.venue,
        whenLabel: formatWhen(event.startsAt),
        monthLabel: formatMonth(event.startsAt),
        dayLabel: formatDay(event.startsAt),
      },
    };

    return pass;
  });
}

type CategoryInput = {
  name: string;
  description: string;
  capacity: string;
  color: string;
};

function buildCategory(event: EventRecord, input: CategoryInput, ignoreId?: string) {
  const name = requireText(input.name, "Label name", 40);
  assertCategoryName(event, name, ignoreId);
  return {
    name,
    description: optionalText(input.description, "Label note", 160),
    capacity: parseCapacity(input.capacity),
    color: requireColor(input.color),
  };
}

export async function createEventRecord(input: {
  title: string;
  description: string;
  venue: string;
  startsAt: string;
  categories: CategoryInput[];
}) {
  const title = requireText(input.title, "Event name", 120);
  const description = optionalText(input.description, "Description", 2000);
  const venue = requireText(input.venue, "Venue", 160);
  const startsAt = requireStartsAt(input.startsAt);

  if (input.categories.length < 1) {
    throw new StoreError("Add at least one ticket label.");
  }
  if (input.categories.length > 8) {
    throw new StoreError("An event can have up to 8 ticket labels.");
  }

  const ownerKey = randomBytes(18).toString("base64url");
  const event: EventRecord = {
    id: randomUUID(),
    ownerKeyHash: hashKey(ownerKey),
    title,
    description,
    venue,
    startsAt,
    createdAt: new Date().toISOString(),
    categories: [],
  };

  for (const category of input.categories) {
    event.categories.push({
      id: randomUUID(),
      ...buildCategory(event, category),
    });
  }

  await withWrite((store) => {
    store.events.push(event);
  });

  return { id: event.id, ownerKey };
}

export async function addCategoryRecord(
  eventId: string,
  ownerKey: string,
  input: CategoryInput,
) {
  await withWrite((store) => {
    const event = assertOwner(store, eventId, ownerKey);
    if (event.categories.length >= 8) {
      throw new StoreError("An event can have up to 8 ticket labels.");
    }
    event.categories.push({
      id: randomUUID(),
      ...buildCategory(event, input),
    });
  });
}

export async function updateCategoryRecord(
  eventId: string,
  ownerKey: string,
  categoryId: string,
  input: CategoryInput,
) {
  await withWrite((store) => {
    const event = assertOwner(store, eventId, ownerKey);
    const category = categoryById(event, categoryId);
    const next = buildCategory(event, input, category.id);
    const taken = takenCount(store.tickets, category.id);
    if (next.capacity !== null && next.capacity < taken) {
      throw new StoreError(
        taken === 1
          ? "1 guest already has this label, so the cap can't go below that."
          : `${taken} guests already have this label, so the cap can't go below that.`,
      );
    }
    category.name = next.name;
    category.description = next.description;
    category.capacity = next.capacity;
    category.color = next.color;
  });
}

export async function deleteCategoryRecord(
  eventId: string,
  ownerKey: string,
  categoryId: string,
) {
  await withWrite((store) => {
    const event = assertOwner(store, eventId, ownerKey);
    if (event.categories.length <= 1) {
      throw new StoreError("Keep at least one label on the event.");
    }
    if (takenCount(store.tickets, categoryId) > 0) {
      throw new StoreError("Move guests off this label before removing it.");
    }
    event.categories = event.categories.filter((category) => category.id !== categoryId);
  });
}

export async function registerGuestRecord(input: {
  eventId: string;
  categoryId: string;
  guestName: string;
  guestEmail: string;
}) {
  const guestName = requireText(input.guestName, "Name", 80);
  const guestEmail = requireEmail(input.guestEmail);

  return withWrite((store) => {
    const event = findEvent(store, input.eventId);
    const category = categoryById(event, input.categoryId);
    const duplicate = store.tickets.some(
      (ticket) => ticket.eventId === event.id && ticket.guestEmail === guestEmail,
    );
    if (duplicate) {
      throw new StoreError(
        "That email already has a ticket for this event. Check in with the ticket code.",
      );
    }
    assertRoom(store, category);

    const code = makeCode(new Set(store.tickets.map((ticket) => ticket.code)));
    const ticket: Ticket = {
      id: randomUUID(),
      eventId: event.id,
      categoryId: category.id,
      guestName,
      guestEmail,
      code,
      createdAt: new Date().toISOString(),
      checkedInAt: null,
    };
    store.tickets.push(ticket);
    return { code, eventId: event.id };
  });
}

export async function relabelTicketRecord(input: {
  eventId: string;
  ownerKey: string;
  ticketId: string;
  categoryId: string;
}) {
  return withWrite((store) => {
    const event = assertOwner(store, input.eventId, input.ownerKey);
    const ticket = store.tickets.find(
      (item) => item.id === input.ticketId && item.eventId === event.id,
    );
    if (!ticket) throw new StoreError("That ticket is not on this door list.");
    const category = categoryById(event, input.categoryId);
    if (ticket.categoryId === category.id) return ticket.code;
    assertRoom(store, category);
    ticket.categoryId = category.id;
    return ticket.code;
  });
}

export async function checkInByCode(rawCode: string, expectedEventId?: string) {
  const code = normalizeCode(rawCode);

  return withWrite((store) => {
    const ticket = store.tickets.find((item) => item.code === code);
    if (!ticket) throw new StoreError("No ticket matches that code.");
    if (expectedEventId && ticket.eventId !== expectedEventId) {
      throw new StoreError("That ticket is for a different event.");
    }

    const event = findEvent(store, ticket.eventId);
    const category = event.categories.find((item) => item.id === ticket.categoryId);
    const already = Boolean(ticket.checkedInAt);
    if (!ticket.checkedInAt) {
      ticket.checkedInAt = new Date().toISOString();
    }

    const result: CheckInResult = {
      eventId: event.id,
      code: ticket.code,
      guestName: ticket.guestName,
      categoryName: category?.name ?? "Unlabeled",
      checkedInLabel: `Checked in ${formatWhen(ticket.checkedInAt ?? new Date().toISOString())}`,
      already,
    };
    return result;
  });
}
