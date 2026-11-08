import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageSkeleton } from "@/components/page-skeleton";
import { RegisterForm } from "@/components/register-form";
import { secondaryButtonClass } from "@/components/classes";
import { getPublicEvent } from "@/lib/store";

export default function EventPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <EventDetail params={params} />
    </Suspense>
  );
}

async function EventDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const event = await getPublicEvent(id);
  if (!event) notFound();

  return (
    <article>
      <p className="text-xs font-medium uppercase tracking-[0.18em] text-stamp">
        {event.past ? "Past event" : event.whenLabel}
      </p>
      <h1 className="mt-3 max-w-3xl font-serif text-5xl leading-[1.05] tracking-tight">
        {event.title}
      </h1>
      <p className="mt-3 text-lg text-muted">
        {event.venue}
        {event.past ? ` · ${event.whenLabel}` : ""}
      </p>
      {event.description ? (
        <p className="mt-6 max-w-2xl whitespace-pre-wrap leading-relaxed">{event.description}</p>
      ) : null}
      <p className="mt-6 text-sm text-muted">
        {event.registeredCount} registered · {event.checkedInCount} checked in
      </p>

      <div className="mt-8 grid items-start gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <aside className="rounded-2xl border border-line bg-card p-5">
          <h2 className="font-serif text-2xl tracking-tight">Already have a ticket?</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            Check in with the code on your ticket. The category printed there is the label the
            host assigned.
          </p>
          <Link href={`/events/${event.id}/check-in`} className={`${secondaryButtonClass} mt-5`}>
            Check in
          </Link>
        </aside>
        <RegisterForm eventId={event.id} categories={event.categories} />
      </div>
    </article>
  );
}
