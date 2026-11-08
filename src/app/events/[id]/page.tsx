import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageShell } from "@/components/page-shell";
import { PanelSkeleton } from "@/components/panel-skeleton";
import { RegisterForm } from "@/components/register-form";
import { YourPass } from "@/components/your-pass";
import { getPublicEvent } from "@/lib/store";

export default function EventPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <PageShell>
      <Suspense fallback={<PanelSkeleton lines={8} />}>
        <EventDetails params={params} />
      </Suspense>
    </PageShell>
  );
}

async function EventDetails({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const event = await getPublicEvent(id);
  if (!event) notFound();

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(20rem,26rem)]">
      <div>
        <Link href="/" className="text-sm text-muted underline hover:text-ink">
          All events
        </Link>
        <p className="mt-6 text-[11px] font-medium tracking-[0.22em] text-muted uppercase">
          {event.monthLabel} {event.dayLabel}
        </p>
        <h1 className="mt-2 font-display text-5xl leading-tight tracking-tight text-ink">
          {event.title}
        </h1>
        <p className="mt-3 text-lg text-muted">
          {event.whenLabel}
          <span aria-hidden="true"> · </span>
          {event.venue}
        </p>
        {event.description ? (
          <p className="mt-6 max-w-xl whitespace-pre-wrap leading-relaxed text-ink">{event.description}</p>
        ) : null}
        <p className="mt-6 text-sm text-muted">
          {event.registeredCount} registered
          <span aria-hidden="true"> · </span>
          {event.checkedInCount} checked in
        </p>
        <YourPass eventId={event.id} />
        <p className="mt-6 text-sm">
          <Link href={`/events/${event.id}/check-in`} className="text-ink underline">
            Already have a ticket? Check in
          </Link>
        </p>
      </div>
      <RegisterForm eventId={event.id} categories={event.categories} />
    </div>
  );
}
