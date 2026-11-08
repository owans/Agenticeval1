"use client";

import { useActionState } from "react";
import {
  errorClass,
  fieldClass,
  labelClass,
  primaryButtonClass,
  quietButtonClass,
  secondaryButtonClass,
} from "@/components/classes";
import { addCategory, deleteCategory, updateCategory } from "@/lib/actions";
import { seatsLabel } from "@/lib/format";
import { CATEGORY_COLORS, type PublicCategory } from "@/lib/types";

type ManagedCategory = PublicCategory & { checkedIn: number };

export function CategoryManager({
  eventId,
  ownerKey,
  categories,
}: {
  eventId: string;
  ownerKey: string;
  categories: ManagedCategory[];
}) {
  return (
    <section>
      <h2 className="font-display text-3xl text-ink">Labels</h2>
      <p className="mt-2 text-sm text-muted">
        Guests choose one of these when they register. Move a ticket from the door list when its
        label should change.
      </p>
      <div className="mt-5 space-y-4">
        {categories.map((category) => (
          <EditCategoryForm
            key={`${category.id}:${category.name}:${category.description}:${category.capacity ?? ""}:${category.color}`}
            eventId={eventId}
            ownerKey={ownerKey}
            category={category}
            canDelete={categories.length > 1 && category.taken === 0}
            deleteHint={
              categories.length <= 1
                ? "An event keeps at least one label."
                : category.taken > 0
                  ? "Move guests off this label before removing it."
                  : null
            }
          />
        ))}
        <AddCategoryForm
          key={categories.map((category) => category.id).join("-")}
          eventId={eventId}
          ownerKey={ownerKey}
          defaultColor={CATEGORY_COLORS[categories.length % CATEGORY_COLORS.length].value}
          disabled={categories.length >= 8}
        />
      </div>
    </section>
  );
}

function EditCategoryForm({
  eventId,
  ownerKey,
  category,
  canDelete,
  deleteHint,
}: {
  eventId: string;
  ownerKey: string;
  category: ManagedCategory;
  canDelete: boolean;
  deleteHint: string | null;
}) {
  const [state, action, pending] = useActionState(updateCategory, null);

  return (
    <div className="rounded-3xl border border-line bg-card p-4">
      <p className="mb-3 text-sm text-muted">
        {category.taken} {category.taken === 1 ? "guest" : "guests"} · {category.checkedIn} checked
        in · {seatsLabel(category.capacity, category.taken)}
      </p>
      <form action={action} className="space-y-3">
        <input type="hidden" name="eventId" value={eventId} />
        <input type="hidden" name="ownerKey" value={ownerKey} />
        <input type="hidden" name="categoryId" value={category.id} />
        <label className={labelClass}>
          Label
          <input
            name="name"
            required
            maxLength={40}
            defaultValue={category.name}
            className={fieldClass}
          />
        </label>
        <label className={labelClass}>
          Note
          <input
            name="description"
            maxLength={160}
            defaultValue={category.description}
            className={fieldClass}
          />
        </label>
        <label className={labelClass}>
          Cap
          <input
            name="capacity"
            inputMode="numeric"
            placeholder="No limit"
            defaultValue={category.capacity ?? ""}
            className={fieldClass}
          />
        </label>
        <ColorChoices selected={category.color} />
        {state?.error ? (
          <p role="alert" className={errorClass}>
            {state.error}
          </p>
        ) : null}
        <button type="submit" className={secondaryButtonClass} disabled={pending}>
          {pending ? "Saving…" : "Save label"}
        </button>
      </form>
      <div className="mt-3">
        {canDelete ? (
          <DeleteCategoryForm eventId={eventId} ownerKey={ownerKey} categoryId={category.id} />
        ) : deleteHint ? (
          <p className="text-sm text-muted">{deleteHint}</p>
        ) : null}
      </div>
    </div>
  );
}

function DeleteCategoryForm({
  eventId,
  ownerKey,
  categoryId,
}: {
  eventId: string;
  ownerKey: string;
  categoryId: string;
}) {
  const [state, action, pending] = useActionState(deleteCategory, null);

  return (
    <form action={action}>
      <input type="hidden" name="eventId" value={eventId} />
      <input type="hidden" name="ownerKey" value={ownerKey} />
      <input type="hidden" name="categoryId" value={categoryId} />
      {state?.error ? (
        <p role="alert" className={`mb-2 ${errorClass}`}>
          {state.error}
        </p>
      ) : null}
      <button type="submit" className={quietButtonClass} disabled={pending}>
        {pending ? "Removing…" : "Remove label"}
      </button>
    </form>
  );
}

function AddCategoryForm({
  eventId,
  ownerKey,
  defaultColor,
  disabled,
}: {
  eventId: string;
  ownerKey: string;
  defaultColor: string;
  disabled: boolean;
}) {
  const [state, action, pending] = useActionState(addCategory, null);

  if (disabled) {
    return <p className="text-sm text-muted">This event already has 8 labels.</p>;
  }

  return (
    <form action={action} className="space-y-3 rounded-3xl border border-dashed border-line p-4">
      <h3 className="font-medium text-ink">New label</h3>
      <input type="hidden" name="eventId" value={eventId} />
      <input type="hidden" name="ownerKey" value={ownerKey} />
      <label className={labelClass}>
        Label
        <input name="name" required maxLength={40} placeholder="VIP" className={fieldClass} />
      </label>
      <label className={labelClass}>
        Note
        <input name="description" maxLength={160} className={fieldClass} />
      </label>
      <label className={labelClass}>
        Cap
        <input name="capacity" inputMode="numeric" placeholder="No limit" className={fieldClass} />
      </label>
      <ColorChoices selected={defaultColor} />
      {state?.error ? (
        <p role="alert" className={errorClass}>
          {state.error}
        </p>
      ) : null}
      <button type="submit" className={primaryButtonClass} disabled={pending}>
        {pending ? "Adding…" : "Add label"}
      </button>
    </form>
  );
}

function ColorChoices({ selected }: { selected: string }) {
  return (
    <fieldset>
      <legend className={labelClass}>Color</legend>
      <div className="mt-2 flex flex-wrap gap-2">
        {CATEGORY_COLORS.map((color) => (
          <label key={color.id} className="cursor-pointer">
            <input
              type="radio"
              name="color"
              value={color.value}
              defaultChecked={color.value === selected}
              className="peer sr-only"
              required
            />
            <span className="sr-only">{color.label}</span>
            <span
              className="block size-7 rounded-full border border-black/10 peer-checked:ring-2 peer-checked:ring-ink peer-checked:ring-offset-2"
              style={{ backgroundColor: color.value }}
            />
          </label>
        ))}
      </div>
    </fieldset>
  );
}
