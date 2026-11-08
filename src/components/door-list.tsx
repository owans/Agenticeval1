"use client";

import { useActionState, useState, useTransition } from "react";
import { ColorDots } from "@/components/color-swatches";
import { errorClass, fieldClass, labelClass } from "@/components/classes";
import { SubmitButton } from "@/components/submit-button";
import {
  addCategory,
  checkInTicket,
  deleteCategory,
  relabelTicket,
  updateCategory,
} from "@/lib/actions";
import { seatsLabel } from "@/lib/format";
import { CATEGORY_COLORS, type ManageTicket, type PublicCategory } from "@/lib/types";

function HiddenOwnerFields({
  eventId,
  ownerKey,
  categoryId,
}: {
  eventId: string;
  ownerKey: string;
  categoryId?: string;
}) {
  return (
    <>
      <input type="hidden" name="eventId" value={eventId} />
      <input type="hidden" name="ownerKey" value={ownerKey} />
      {categoryId ? <input type="hidden" name="categoryId" value={categoryId} /> : null}
    </>
  );
}

function CategoryEditor({
  eventId,
  ownerKey,
  category,
}: {
  eventId: string;
  ownerKey: string;
  category: PublicCategory;
}) {
  const [state, formAction] = useActionState(updateCategory, null);
  const [removeState, removeAction] = useActionState(deleteCategory, null);
  const takenLabel =
    category.taken === 1 ? "1 ticket" : `${category.taken} tickets`;

  return (
    <article className="rounded-2xl border border-line bg-card p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full" style={{ backgroundColor: category.color }} />
          <h3 className="font-medium">{category.name}</h3>
        </div>
        <p className="text-sm text-muted">
          {takenLabel} · {seatsLabel(category.capacity, category.taken)}
        </p>
      </div>
      {category.description ? (
        <p className="mt-2 text-sm text-muted">{category.description}</p>
      ) : null}

      <form action={formAction} className="mt-4 space-y-3">
        <HiddenOwnerFields eventId={eventId} ownerKey={ownerKey} categoryId={category.id} />
        <div className="grid gap-3 sm:grid-cols-2">
          <label className={labelClass}>
            Label
            <input
              className={fieldClass}
              name="name"
              defaultValue={category.name}
              required
              maxLength={40}
            />
          </label>
          <label className={labelClass}>
            Cap
            <input
              className={fieldClass}
              name="capacity"
              defaultValue={category.capacity ?? ""}
              inputMode="numeric"
              placeholder="No cap"
            />
          </label>
        </div>
        <label className={labelClass}>
          Note
          <input
            className={fieldClass}
            name="description"
            defaultValue={category.description}
            maxLength={160}
          />
        </label>
        <ColorDots name="color" defaultValue={category.color} />
        {state?.error ? (
          <p className={errorClass} role="alert">
            {state.error}
          </p>
        ) : null}
        <SubmitButton label="Save category" pendingLabel="Saving…" tone="secondary" />
      </form>

      <form action={removeAction} className="mt-3">
        <HiddenOwnerFields eventId={eventId} ownerKey={ownerKey} categoryId={category.id} />
        {removeState?.error ? (
          <p className={`${errorClass} mb-2`} role="alert">
            {removeState.error}
          </p>
        ) : null}
        <SubmitButton label="Remove category" pendingLabel="Removing…" tone="secondary" />
      </form>
    </article>
  );
}

function AddCategoryForm({ eventId, ownerKey }: { eventId: string; ownerKey: string }) {
  const [state, formAction] = useActionState(addCategory, null);

  return (
    <form action={formAction} className="rounded-2xl border border-dashed border-line bg-card p-4">
      <HiddenOwnerFields eventId={eventId} ownerKey={ownerKey} />
      <h3 className="font-medium">New category</h3>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <label className={labelClass}>
          Label
          <input className={fieldClass} name="name" required maxLength={40} placeholder="Press" />
        </label>
        <label className={labelClass}>
          Cap
          <input className={fieldClass} name="capacity" inputMode="numeric" placeholder="No cap" />
        </label>
      </div>
      <label className={`${labelClass} mt-3`}>
        Note
        <input className={fieldClass} name="description" maxLength={160} placeholder="Working press" />
      </label>
      <div className="mt-3">
        <ColorDots name="color" defaultValue={CATEGORY_COLORS[2].value} />
      </div>
      {state?.error ? (
        <p className={`${errorClass} mt-3`} role="alert">
          {state.error}
        </p>
      ) : null}
      <div className="mt-4">
        <SubmitButton label="Add category" pendingLabel="Adding…" tone="secondary" />
      </div>
    </form>
  );
}

function TicketRow({
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
  const [categoryId, setCategoryId] = useState(ticket.categoryId);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [checkInState, checkInAction] = useActionState(checkInTicket, null);

  return (
    <li className="rounded-2xl border border-line bg-card p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-medium">{ticket.guestName}</p>
          <p className="text-sm text-muted">{ticket.guestEmail}</p>
          <p className="mt-1 font-mono text-xs tracking-wider text-muted">{ticket.code}</p>
        </div>
        {ticket.checkedInLabel ? (
          <span className="rounded-full bg-pine/10 px-2.5 py-1 text-xs font-medium text-pine">
            In
          </span>
        ) : (
          <span className="rounded-full bg-paper px-2.5 py-1 text-xs font-medium text-muted">
            Not in
          </span>
        )}
      </div>

      <label className={`${labelClass} mt-4`}>
        Category
        <select
          className={fieldClass}
          value={categoryId}
          disabled={pending}
          onChange={(event) => {
            const next = event.target.value;
            const previous = categoryId;
            setCategoryId(next);
            setError(null);
            startTransition(async () => {
              const result = await relabelTicket({
                eventId,
                ownerKey,
                ticketId: ticket.id,
                categoryId: next,
              });
              if (result?.error) {
                setCategoryId(previous);
                setError(result.error);
              }
            });
          }}
        >
          {categories.map((category) => {
            const full =
              category.capacity !== null &&
              category.taken >= category.capacity &&
              category.id !== ticket.categoryId;
            const count =
              category.capacity === null
                ? `${category.taken}`
                : `${category.taken}/${category.capacity}`;
            return (
              <option key={category.id} value={category.id} disabled={full}>
                {category.name} · {count}
              </option>
            );
          })}
        </select>
      </label>
      {error ? (
        <p className={`${errorClass} mt-2`} role="alert">
          {error}
        </p>
      ) : null}
      {pending ? <p className="mt-2 text-sm text-muted">Saving label…</p> : null}

      {ticket.checkedInLabel ? (
        <p className="mt-3 text-sm text-pine">{ticket.checkedInLabel}</p>
      ) : (
        <form action={checkInAction} className="mt-3">
          <input type="hidden" name="code" value={ticket.code} />
          {checkInState?.error ? (
            <p className={`${errorClass} mb-2`} role="alert">
              {checkInState.error}
            </p>
          ) : null}
          <SubmitButton label="Check in" pendingLabel="Checking in…" tone="secondary" />
        </form>
      )}
    </li>
  );
}

export function DoorList({
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
  const categoryKey = categories.map((category) => category.id).join(":");

  return (
    <div className="mt-8 grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
      <section>
        <h2 className="font-serif text-3xl tracking-tight">Categories</h2>
        <p className="mt-1 text-sm leading-relaxed text-muted">
          Labels sit on the ticket. Guests pick one when they register. Change the name, the cap,
          or the color here.
        </p>
        <div className="mt-4 space-y-3">
          {categories.map((category) => (
            <CategoryEditor
              key={`${category.id}:${category.name}:${category.color}:${category.capacity ?? ""}:${category.description}`}
              eventId={eventId}
              ownerKey={ownerKey}
              category={category}
            />
          ))}
          <AddCategoryForm key={categoryKey} eventId={eventId} ownerKey={ownerKey} />
        </div>
      </section>

      <section>
        <h2 className="font-serif text-3xl tracking-tight">Guests</h2>
        <p className="mt-1 text-sm leading-relaxed text-muted">
          Move a ticket into another category, or check the guest in from here.
        </p>
        {tickets.length === 0 ? (
          <p className="mt-4 rounded-2xl border border-dashed border-line bg-card px-4 py-8 text-sm text-muted">
            No guests yet. Share the public page when you want people to register.
          </p>
        ) : (
          <ul className="mt-4 space-y-3">
            {tickets.map((ticket) => (
              <TicketRow
                key={`${ticket.id}:${ticket.categoryId}:${ticket.checkedInAt ?? ""}`}
                eventId={eventId}
                ownerKey={ownerKey}
                ticket={ticket}
                categories={categories}
              />
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
