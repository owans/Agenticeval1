"use client";

import { useActionState, useState } from "react";
import { cardClass, errorClass, fieldClass, labelClass, primaryButtonClass } from "@/components/classes";
import { registerGuest } from "@/lib/actions";
import { seatsLabel } from "@/lib/format";
import type { PublicCategory } from "@/lib/types";

function isOpen(category: PublicCategory) {
  return category.capacity === null || category.taken < category.capacity;
}

export function RegisterForm({
  eventId,
  categories,
}: {
  eventId: string;
  categories: PublicCategory[];
}) {
  const [state, action, pending] = useActionState(registerGuest, null);
  const firstOpen = categories.find(isOpen);
  const [selected, setSelected] = useState(firstOpen?.id ?? "");
  const openCategories = categories.filter(isOpen);
  const selectedIsOpen = openCategories.some((category) => category.id === selected);
  const activeId = selectedIsOpen ? selected : (firstOpen?.id ?? "");

  return (
    <form action={action} className={`${cardClass} p-5 sm:p-6`}>
      <h2 className="font-display text-3xl text-ink">Take a ticket</h2>
      <input type="hidden" name="eventId" value={eventId} />

      {state?.error ? (
        <p role="alert" className={`mt-4 ${errorClass}`}>
          {state.error}
        </p>
      ) : null}

      {openCategories.length === 0 ? (
        <p className="mt-4 text-sm text-muted">Every label is full.</p>
      ) : (
        <>
          <fieldset className="mt-5">
            <legend className={labelClass}>Ticket label</legend>
            <div className="mt-3 grid gap-3">
              {categories.map((category) => {
                const open = isOpen(category);
                const active = activeId === category.id;
                return (
                  <label
                    key={category.id}
                    className={`block rounded-2xl border px-4 py-3 ${
                      open ? "cursor-pointer" : "cursor-not-allowed opacity-60"
                    } ${active && open ? "border-ink bg-paper" : "border-line"}`}
                  >
                    <input
                      type="radio"
                      name="categoryId"
                      value={category.id}
                      className="sr-only"
                      checked={active}
                      required
                      disabled={!open}
                      onChange={() => setSelected(category.id)}
                    />
                    <span className="flex items-start justify-between gap-3">
                      <span>
                        <span className="flex items-center gap-2 font-medium">
                          <span
                            className="size-2.5 rounded-full"
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
            </div>
          </fieldset>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <label className={labelClass}>
              Name
              <input
                name="guestName"
                required
                maxLength={80}
                autoComplete="name"
                placeholder="Avery Cole"
                className={fieldClass}
              />
            </label>
            <label className={labelClass}>
              Email
              <input
                name="guestEmail"
                type="email"
                required
                maxLength={200}
                autoComplete="email"
                placeholder="avery@example.com"
                className={fieldClass}
              />
            </label>
          </div>

          <button type="submit" className={`mt-5 ${primaryButtonClass}`} disabled={pending}>
            {pending ? "Saving your ticket…" : "Get a ticket"}
          </button>
        </>
      )}
    </form>
  );
}
