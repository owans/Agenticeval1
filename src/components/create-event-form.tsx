"use client";

import { useActionState, useState } from "react";
import { errorClass, fieldClass, labelClass, primaryButtonClass, quietButtonClass } from "@/components/classes";
import { createEvent } from "@/lib/actions";
import { CATEGORY_COLORS } from "@/lib/types";

type Row = {
  key: string;
  name: string;
  description: string;
  capacity: string;
  color: string;
};

const initialRows: Row[] = [
  {
    key: "row-1",
    name: "General",
    description: "Open to everyone",
    capacity: "",
    color: CATEGORY_COLORS[0].value,
  },
];

export function CreateEventForm() {
  const [state, action, pending] = useActionState(createEvent, null);
  const [rows, setRows] = useState<Row[]>(initialRows);

  function updateRow(key: string, patch: Partial<Row>) {
    setRows((current) => current.map((row) => (row.key === key ? { ...row, ...patch } : row)));
  }

  return (
    <form action={action} className="mt-8 space-y-8">
      {state?.error ? (
        <p role="alert" className={errorClass}>
          {state.error}
        </p>
      ) : null}

      <div className="grid gap-5 sm:grid-cols-2">
        <label className={`sm:col-span-2 ${labelClass}`}>
          Event name
          <input
            name="title"
            required
            maxLength={120}
            placeholder="Listening party"
            className={fieldClass}
          />
        </label>
        <label className={labelClass}>
          Venue
          <input
            name="venue"
            required
            maxLength={160}
            placeholder="The Lantern, back room"
            autoComplete="off"
            className={fieldClass}
          />
        </label>
        <label className={labelClass}>
          Starts
          <input name="startsAt" type="datetime-local" required className={fieldClass} />
        </label>
        <label className={`sm:col-span-2 ${labelClass}`}>
          Note for guests
          <textarea
            name="description"
            maxLength={2000}
            rows={4}
            placeholder="What should people know before they take a ticket?"
            className={`${fieldClass} min-h-28`}
          />
        </label>
      </div>

      <fieldset className="space-y-4">
        <legend className="font-display text-2xl text-ink">Ticket labels</legend>
        <p className="text-sm text-muted">
          Guests pick one label when they register. You can move tickets between labels later.
        </p>

        {rows.map((row, index) => (
          <div key={row.key} className="rounded-3xl border border-line bg-card p-4 sm:p-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className={labelClass}>
                Label
                <input
                  name="categoryName"
                  required
                  maxLength={40}
                  value={row.name}
                  onChange={(event) => updateRow(row.key, { name: event.target.value })}
                  className={fieldClass}
                />
              </label>
              <label className={labelClass}>
                Cap
                <input
                  name="categoryCapacity"
                  inputMode="numeric"
                  placeholder="No limit"
                  value={row.capacity}
                  onChange={(event) => updateRow(row.key, { capacity: event.target.value })}
                  className={fieldClass}
                />
              </label>
              <label className={`sm:col-span-2 ${labelClass}`}>
                Note
                <input
                  name="categoryDescription"
                  maxLength={160}
                  value={row.description}
                  onChange={(event) => updateRow(row.key, { description: event.target.value })}
                  className={fieldClass}
                />
              </label>
            </div>
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap gap-2" role="group" aria-label={`Color for label ${index + 1}`}>
                {CATEGORY_COLORS.map((color) => (
                  <button
                    key={color.id}
                    type="button"
                    aria-label={color.label}
                    aria-pressed={row.color === color.value}
                    onClick={() => updateRow(row.key, { color: color.value })}
                    className={`size-7 cursor-pointer rounded-full border border-black/10 ${
                      row.color === color.value ? "ring-2 ring-ink ring-offset-2" : ""
                    }`}
                    style={{ backgroundColor: color.value }}
                  />
                ))}
              </div>
              {rows.length > 1 ? (
                <button
                  type="button"
                  className={quietButtonClass}
                  onClick={() => setRows((current) => current.filter((item) => item.key !== row.key))}
                >
                  Remove
                </button>
              ) : null}
            </div>
            <input type="hidden" name="categoryColor" value={row.color} />
          </div>
        ))}

        <button
          type="button"
          className={quietButtonClass}
          disabled={rows.length >= 8}
          onClick={() =>
            setRows((current) => [
              ...current,
              {
                key: crypto.randomUUID(),
                name: "",
                description: "",
                capacity: "",
                color: CATEGORY_COLORS[current.length % CATEGORY_COLORS.length].value,
              },
            ])
          }
        >
          Add a label
        </button>
      </fieldset>

      <button type="submit" className={primaryButtonClass} disabled={pending}>
        {pending ? "Listing…" : "List this event"}
      </button>
    </form>
  );
}
