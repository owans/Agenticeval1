import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CategoryManager } from "@/components/category-manager";
import { CopyPathButton } from "@/components/copy-path-button";
import { OwnerLock } from "@/components/owner-lock";
import { PageShell } from "@/components/page-shell";
import { PanelSkeleton } from "@/components/panel-skeleton";
import { RememberHosted } from "@/components/remember-hosted";
import { TicketRoster } from "@/components/ticket-roster";
import { secondaryButtonClass } from "@/components/classes";
import { getManageView, getPublicEvent } from "@/lib/store";

export default function ManagePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ key?: string | string[] }>;
}) {
  return (
    <PageShell>
      <Suspense fallback={<PanelSkeleton lines={8} />}>
        <ManageDoor params={params} searchParams={searchParams} />
      </Suspense>
    </PageShell>
  );
}

async function ManageDoor({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ key?: string | string[] }>;
}) {
  const { id } = await params;
  const query = await searchParams;
  const ownerKey = typeof query.key === "string" ? query.key : "";
  const event = await getPublicEvent(id);
  if (!event) notFound();

  if (!ownerKey) {
    return <OwnerLock eventId={id} title={event.title} />;
  }

  const view = await getManageView(id, ownerKey);
  if (view.kind === "missing") notFound();
  if (view.kind === "locked") {
    return <OwnerLock eventId={id} title={event.title} invalid />;
  }

  const categories = view.event.categories.map((category) => ({
    ...category,
    checkedIn: view.tickets.filter(
      (ticket) => ticket.categoryId === category.id && ticket.checkedInAt,
    ).length,
  }));

  const ownerPath = `/events/${event.id}/manage?key=${encodeURIComponent(ownerKey)}`;

  return (
    <div>
      <RememberHosted id={event.id} title={event.title} ownerKey={ownerKey} />
      <p className="text-[11px] font-medium tracking-[0.22em] text-muted uppercase">Door list</p>
      <h1 className="mt-2 font-display text-5xl tracking-tight text-ink">{event.title}</h1>
      <p className="mt-3 text-muted">
        {event.whenLabel}
        <span aria-hidden="true"> · </span>
        {event.venue}
      </p>
      <p className="mt-2 text-sm text-muted">
        {event.registeredCount} {event.registeredCount === 1 ? "ticket" : "tickets"} · {event.checkedInCount} checked in
      </p>
      <div className="mt-5 flex flex-wrap gap-2">
        <Link href={`/events/${event.id}`} className={secondaryButtonClass}>
          Guest page
        </Link>
        <CopyPathButton path={`/events/${event.id}`} label="Copy guest link" copiedLabel="Copied" />
        <CopyPathButton path={ownerPath} label="Copy owner link" copiedLabel="Copied" />
      </div>
      <p className="mt-4 max-w-xl text-sm text-muted">
        This owner link shows guest emails and can move tickets between labels. Keep it private.
      </p>
      <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(16rem,22rem)_minmax(0,1fr)]">
        <CategoryManager eventId={event.id} ownerKey={ownerKey} categories={categories} />
        <TicketRoster
          eventId={event.id}
          ownerKey={ownerKey}
          categories={view.event.categories}
          tickets={view.tickets}
        />
      </div>
    </div>
  );
}
