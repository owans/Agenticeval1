import {
  addCategoryRecord,
  checkInByCode,
  createEventRecord,
  getManageView,
  getPublicEvent,
  getTicketPass,
  registerGuestRecord,
  relabelTicketRecord,
} from "../src/lib/store";

function assert(condition: unknown, message: string) {
  if (!condition) throw new Error(message);
}

const created = await createEventRecord({
  title: "Verification night",
  description: "A door-list check.",
  venue: "Side room",
  startsAt: "2026-12-01T19:30",
  categories: [
    { name: "General", description: "Open", capacity: "", color: "#234e3e" },
    { name: "VIP", description: "Front table", capacity: "1", color: "#8a5a12" },
  ],
});

const duplicate = await createEventRecord({
  title: "Duplicate labels",
  description: "",
  venue: "Hall",
  startsAt: "2026-12-02T19:30",
  categories: [
    { name: "VIP", description: "", capacity: "", color: "#8a5a12" },
    { name: "vip", description: "", capacity: "", color: "#7a3148" },
  ],
}).then(
  () => "allowed",
  (error: Error) => error.message,
);
assert(duplicate.includes("already a label"), `duplicate labels: ${duplicate}`);

const guest = await registerGuestRecord({
  eventId: created.id,
  categoryId: (await getPublicEvent(created.id))!.categories.find((item) => item.name === "VIP")!
    .id,
  guestName: "Avery Cole",
  guestEmail: "avery@example.com",
});

const full = await registerGuestRecord({
  eventId: created.id,
  categoryId: (await getPublicEvent(created.id))!.categories.find((item) => item.name === "VIP")!
    .id,
  guestName: "Blair Kim",
  guestEmail: "blair@example.com",
}).then(
  () => "allowed",
  (error: Error) => error.message,
);
assert(full === "VIP is full.", `capacity: ${full}`);

const generalId = (await getPublicEvent(created.id))!.categories.find(
  (item) => item.name === "General",
)!.id;
const second = await registerGuestRecord({
  eventId: created.id,
  categoryId: generalId,
  guestName: "Blair Kim",
  guestEmail: "blair@example.com",
});

const checked = await checkInByCode(guest.code, created.id);
assert(checked.guestName === "Avery Cole" && checked.already === false, "first check-in");
const again = await checkInByCode(guest.code.toLowerCase(), created.id);
assert(again.already === true, "second check-in should be idempotent");

const wrongEvent = await checkInByCode(second.code, created.id === "nope" ? created.id : "wrong").then(
  () => "allowed",
  (error: Error) => error.message,
);
assert(wrongEvent.includes("different event"), `wrong event: ${wrongEvent}`);

await addCategoryRecord(created.id, created.ownerKey, {
  name: "Press",
  description: "Notebooks",
  capacity: "2",
  color: "#2c4c7c",
});

const managed = await getManageView(created.id, created.ownerKey);
assert(managed.kind === "ready", "owner can open the door list");
if (managed.kind !== "ready") throw new Error("unreachable");
const press = managed.event.categories.find((item) => item.name === "Press");
const blair = managed.tickets.find((item) => item.guestName === "Blair Kim");
assert(press && blair, "press label and blair ticket exist");
await relabelTicketRecord({
  eventId: created.id,
  ownerKey: created.ownerKey,
  ticketId: blair!.id,
  categoryId: press!.id,
});

const locked = await getManageView(created.id, "not-the-key");
assert(locked.kind === "locked", "bad owner key stays locked");

const pass = await getTicketPass(second.code);
assert(pass?.categoryName === "Press" && pass.guestName === "Blair Kim", "ticket label moved");

const avery = await getTicketPass(`mrq-${guest.code.slice(4)}`);
assert(avery?.checkedInAt, "normalized code finds the checked-in ticket");

console.log(
  JSON.stringify({
    eventId: created.id,
    ownerKey: created.ownerKey,
    avery: guest.code,
    blair: second.code,
  }),
);
