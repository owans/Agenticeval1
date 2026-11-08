"use client";

import { useActionState, useRef, useState } from "react";
import { ColorSwatches } from "@/components/color-swatches";
import { errorClass, fieldClass, labelClass } from "@/components/classes";
import { SubmitButton } from "@/components/submit-button";
import { createEvent } from "@/lib/actions";
import { CATEGORY_COLORS, type CategoryColor } from "@/lib/types";

type DraftCategory = {
  id: string;
  name: string;
  description: string;
  capacity: string;
  color: CategoryColor;
};

function draft(id: string, partial: Partial<DraftCategory> = {}): DraftCategory {
  return {
    name: "",
    description: "",
    capacity: "",
    color: CATEGORY_COLORS[0].value,
    ...partial,
    id,
  };
}

export function CreateEventForm() {
  const [state, formAction] = useActionState(createEvent, null);
  const nextId = useRef(2);
  const [categories, setCategories] = useState<DraftCategory[]>(() => [
    draft("category-0", {
      name: "General",
      description: "Open admission",
      color: CATEGORY_COLORS[0].value,
    }),
    draft("category-1", {
      name: "Guest",
      description: "Invited guests",
      color: CATEGORY_COLORS[1].value,
    }),
  ]);

  function update(id: string, patch: Partial<DraftCategory>) {
    setCategories((current) =>
      current.map((category) => (category.id === id ? { ...category, ...patch } : category)),
    );
  }

  return (
    <form action={formAction} className="space-y-10">
      <section className="space-y-4">
        <h2 className="font-serif text-2xl tracking-tight">The event</h2>
        <label className={labelClass}>
          Name
          <input
            className={fieldClass}
            name="title"
            required
            maxLength={120}
            placeholder="Autumn listening room"
          />
        </label>
        <label className={labelClass}>
          Venue
          <input
            className={fieldClass}
            name="venue"
            required
            maxLength={160}
            placeholder="The Hall, 14 Mercer Street"
          />
        </label>
        <label className={labelClass}>
          Starts
          <input className={fieldClass} name="startsAt" type="datetime-local" required />
        </label>
        <label className={labelClass}>
          Note
          <textarea
            className={`${fieldClass} min-h-28 resize-y`}
            name="description"
            maxLength={2000}
            placeholder="Doors at 7. Two sets, no late seating."
          />
        </label>
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="font-serif text-2xl tracking-tight">Ticket categories</h2>
          <p className="mt-1 text-sm leading-relaxed text-muted">
            These are the labels guests choose from. You can rename them, cap them, and move
            tickets between them after people register.
          </p>
        </div>

        <div className="space-y-3">
          {categories.map((category, index) => (
            <fieldset key={category.id} className="rounded-2xl border border-line bg-card p-4">
              <legend className="px-1 text-sm font-medium">Category {index + 1}</legend>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <label className={labelClass}>
                  Label
                  <input
                    className={fieldClass}
                    name="categoryName"
                    value={category.name}
                    required
                    maxLength={40}
                    onChange={(event) => update(category.id, { name: event.target.value })}
                  />
                </label>
                <label className={labelClass}>
                  Cap
                  <input
                    className={fieldClass}
                    name="categoryCapacity"
                    value={category.capacity}
                    inputMode="numeric"
                    placeholder="No cap"
                    onChange={(event) => update(category.id, { capacity: event.target.value })}
                  />
                </label>
              </div>
              <label className={`${labelClass} mt-3`}>
                Note
                <input
                  className={fieldClass}
                  name="categoryDescription"
                  value={category.description}
                  maxLength={160}
                  onChange={(event) => update(category.id, { description: event.target.value })}
                />
              </label>
              <div className="mt-3">
                <p className="text-sm font-medium">Color</p>
                <div className="mt-2">
                  <ColorSwatches
                    name={`draft-color-${category.id}`}
                    value={category.color}
                    onChange={(color) =>
                      update(category.id, {
                        color: CATEGORY_COLORS.find((item) => item.value === color)?.value ?? category.color,
                      })
                    }
                  />
                </div>
              </div>
              <input type="hidden" name="categoryColor" value={category.color} />
              {categories.length > 1 ? (
                <button
                  type="button"
                  className="mt-3 text-sm font-medium text-muted hover:text-ink"
                  onClick={() =>
                    setCategories((current) => current.filter((item) => item.id !== category.id))
                  }
                >
                  Remove
                </button>
              ) : null}
            </fieldset>
          ))}
        </div>

        {categories.length < 8 ? (
          <button
            type="button"
            className="text-sm font-medium text-stamp hover:underline"
            onClick={() => {
              const id = `category-${nextId.current}`;
              nextId.current += 1;
              setCategories((current) => [
                ...current,
                draft(id, { color: CATEGORY_COLORS[current.length % CATEGORY_COLORS.length].value }),
              ]);
            }}
          >
            Add a category
          </button>
        ) : null}
      </section>

      {state?.error ? (
        <p className={errorClass} role="alert">
          {state.error}
        </p>
      ) : null}

      <div className="flex flex-wrap items-center gap-4">
        <SubmitButton label="List this event" pendingLabel="Listing…" />
        <p className="max-w-sm text-sm text-muted">
          You&apos;ll get an owner key for the door list. Keep it. Anyone with the key can label
          tickets and see guests.
        </p>
      </div>
    </form>
  );
}
