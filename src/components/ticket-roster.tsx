"use client";

import { useActionState, useState, useTransition } from "react";
import { errorClass, fieldClass, secondaryButtonClass } from "@/components/classes";
import { checkInTicket, relabelTicket } from "@/lib/actions";
import { seatsLabel } from "@/lib/format";
import type { ManageTicket, PublicCategory } from "@/lib/types";

export function TicketRoster({
  eventId,
  ownerKey,
  categories,
  tickets,
}: {
  eventId: string;
  ownerKey: string;
  categories: PublicCategory[];
  tickets: ManageTicket[];
}) {
  return (
    <section>
      <h2 className="font-display text-3xl text-ink">Tickets</h2>
      <p className="mt-2 text-sm text-muted">
        Guests check themselves in from their ticket. You can also mark them in here, and move a
        ticket onto another label.
      </p>
      {tickets.length === 0 ? (
        <p className="mt-5 rounded-3xl border border-dashed border-line px-4 py-8 text-sm text-muted">
          No tickets yet. Share the guest link and people can register.
        </p>
      ) : (
        <ul className="mt-5 space-y-3">
          {tickets.map((ticket) => (
            <li key={ticket.id} className="rounded-3xl border border-line bg-card p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-medium text-ink">{ticket.guestName}</p>
                  <p className="text-sm text-muted">{ticket.guestEmail}</p>
                  <p className="mt-1 font-mono text-xs tracking-[0.16em] text-ink">{ticket.code}</p>
                </div>
                <p className={`text-sm ${ticket.checkedInAt ? "text-pine" : "text-muted"}`}>
                  {ticket.checkedInLabel ?? "Not checked in"}
                </p>
              </div>
              <div className="mt-4 flex flex-wrap items-end gap-3">
                <LabelSelect
                  key={`${ticket.id}:${ticket.categoryId}`}
                  eventId={eventId}
                  ownerKey={ownerKey}
                  ticket={ticket}
                  categories={categories}
                />
                {ticket.checkedInAt ? null : <RosterCheckIn code={ticket.code} />}
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function LabelSelect({
  eventId,
  ownerKey,
  ticket,
  categories,
}: {
  eventId: string;
  ownerKey: string;
  ticket: ManageTicket;
  categories: PublicCategory[];
}) {
  const [value, setValue] = useState(ticket.categoryId);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <label className="min-w-48 text-sm font-medium text-ink">
      Label
      <select
        value={value}
        disabled={pending}
        className={fieldClass}
        onChange={(event) => {
          const categoryId = event.target.value;
          setValue(categoryId);
          setError(null);
          startTransition(async () => {
            const result = await relabelTicket({
              eventId,
              ownerKey,
              ticketId: ticket.id,
              categoryId,
            });
            if (result?.error) {
              setValue(ticket.categoryId);
              setError(result.error);
            }
          });
        }}
      >
        {categories.map((category) => {
          const full = category.capacity !== null && category.taken >= category.capacity;
          return (
            <option
              key={category.id}
              value={category.id}
              disabled={full && category.id !== ticket.categoryId}
            >
              {category.name} · {seatsLabel(category.capacity, category.taken)}
            </option>
          );
        })}
      </select>
      {error ? (
        <span role="alert" className={`mt-1 block font-normal ${errorClass}`}>
          {error}
        </span>
      ) : null}
    </label>
  );
}

function RosterCheckIn({ code }: { code: string }) {
  const [state, action, pending] = useActionState(checkInTicket, null);

  return (
    <form action={action}>
      <input type="hidden" name="code" value={code} />
      {state?.error ? (
        <p role="alert" className={`mb-1 ${errorClass}`}>
          {state.error}
        </p>
      ) : null}
      <button type="submit" className={secondaryButtonClass} disabled={pending}>
        {pending ? "Checking in…" : "Check in"}
      </button>
    </form>
  );
}
