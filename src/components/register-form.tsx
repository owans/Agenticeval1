"use client";

import { useActionState, useState } from "react";
import { errorClass, fieldClass, labelClass } from "@/components/classes";
import { SubmitButton } from "@/components/submit-button";
import { seatsLabel } from "@/lib/format";
import { registerGuest } from "@/lib/actions";
import type { PublicCategory } from "@/lib/types";

export function RegisterForm({
  eventId,
  categories,
}: {
  eventId: string;
  categories: PublicCategory[];
}) {
  const [state, formAction] = useActionState(registerGuest, null);
  const openCategories = categories.filter(
    (category) => category.capacity === null || category.taken < category.capacity,
  );
  const [categoryId, setCategoryId] = useState(openCategories[0]?.id ?? "");

  if (categories.length === 0 || openCategories.length === 0) {
    return (
      <div className="rounded-2xl border border-line bg-card p-5">
        <h2 className="font-serif text-2xl tracking-tight">Registration is closed</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          Every ticket category is full. The door list can still check in people who already have
          a ticket.
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} className="rounded-2xl border border-line bg-card p-5">
      <input type="hidden" name="eventId" value={eventId} />
      <h2 className="font-serif text-2xl tracking-tight">Register</h2>
      <p className="mt-1 text-sm text-muted">Pick a category. You&apos;ll get a ticket to check in with.</p>

      <fieldset className="mt-4 space-y-2">
        <legend className="text-sm font-medium">Category</legend>
        {categories.map((category) => {
          const full = category.capacity !== null && category.taken >= category.capacity;
          const selected = categoryId === category.id;
          return (
            <label
              key={category.id}
              className={`block rounded-xl border px-3 py-3 ${
                full ? "cursor-not-allowed opacity-50" : "cursor-pointer"
              } ${selected && !full ? "border-ink bg-paper" : "border-line"}`}
            >
              <input
                className="sr-only"
                type="radio"
                name="categoryId"
                value={category.id}
                checked={selected}
                disabled={full}
                onChange={() => setCategoryId(category.id)}
                required
              />
              <span className="flex items-start justify-between gap-3">
                <span>
                  <span className="flex items-center gap-2 font-medium">
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: category.color }}
                    />
                    {category.name}
                  </span>
                  {category.description ? (
                    <span className="mt-1 block text-sm text-muted">{category.description}</span>
                  ) : null}
                </span>
                <span className="shrink-0 text-sm text-muted">
                  {seatsLabel(category.capacity, category.taken)}
                </span>
              </span>
            </label>
          );
        })}
      </fieldset>

      <div className="mt-4 space-y-3">
        <label className={labelClass}>
          Name
          <input className={fieldClass} name="guestName" required maxLength={80} autoComplete="name" />
        </label>
        <label className={labelClass}>
          Email
          <input
            className={fieldClass}
            name="guestEmail"
            type="email"
            required
            maxLength={200}
            autoComplete="email"
          />
        </label>
      </div>

      {state?.error ? (
        <p className={`${errorClass} mt-4`} role="alert">
          {state.error}
        </p>
      ) : null}

      <div className="mt-5">
        <SubmitButton label="Get a ticket" pendingLabel="Saving…" />
      </div>
    </form>
  );
}
