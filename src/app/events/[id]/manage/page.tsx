import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { fieldClass, labelClass, primaryButtonClass, secondaryButtonClass } from "@/components/classes";
import { DoorList } from "@/components/door-list";
import { OwnerKeyBanner } from "@/components/owner-key-banner";
import { PageSkeleton } from "@/components/page-skeleton";
import { getManageView } from "@/lib/store";

export default function ManagePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ key?: string | string[] }>;
}) {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <ManageView params={params} searchParams={searchParams} />
    </Suspense>
  );
}

function first(value: string | string[] | undefined) {
  if (Array.isArray(value)) return value[0] ?? "";
  return value ?? "";
}

async function ManageView({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ key?: string | string[] }>;
}) {
  const { id } = await params;
  const key = first((await searchParams).key);
  const view = await getManageView(id, key);

  if (view.kind === "missing") notFound();
  if (view.kind === "locked") return <OwnerKeyGate eventId={id} hasKey={key.length > 0} />;

  const { event, tickets } = view;

  return (
    <article>
      <p className="text-xs font-medium uppercase tracking-[0.18em] text-stamp">Door list</p>
      <h1 className="mt-3 font-serif text-5xl tracking-tight">{event.title}</h1>
      <p className="mt-3 text-muted">
        {event.whenLabel} · {event.venue}
      </p>
      <p className="mt-2 text-sm text-muted">
        {event.registeredCount} registered · {event.checkedInCount} checked in
      </p>
      <div className="mt-5 flex flex-wrap gap-3">
        <Link href={`/events/${event.id}`} className={secondaryButtonClass}>
          Public page
        </Link>
        <Link href={`/events/${event.id}/check-in`} className={secondaryButtonClass}>
          Guest check-in
        </Link>
      </div>
      <OwnerKeyBanner eventId={event.id} title={event.title} ownerKey={key} />
      <DoorList
        eventId={event.id}
        ownerKey={key}
        categories={event.categories}
        tickets={tickets}
      />
    </article>
  );
}

function OwnerKeyGate({ eventId, hasKey }: { eventId: string; hasKey: boolean }) {
  return (
    <form method="get" action={`/events/${eventId}/manage`} className="max-w-md">
      <p className="text-xs font-medium uppercase tracking-[0.18em] text-stamp">Door list</p>
      <h1 className="mt-3 font-serif text-5xl tracking-tight">Open the door list.</h1>
      <p className="mt-3 text-muted">
        {hasKey
          ? "That key does not open this door list."
          : "Enter the owner key from when you listed this event."}
      </p>
      <label className={`${labelClass} mt-6`}>
        Owner key
        <input
          className={fieldClass}
          name="key"
          required
          autoComplete="off"
          spellCheck={false}
        />
      </label>
      <button type="submit" className={`${primaryButtonClass} mt-5`}>
        Open door list
      </button>
    </form>
  );
}
