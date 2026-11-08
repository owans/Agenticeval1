import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckInForm } from "@/components/check-in-form";
import { PageSkeleton } from "@/components/page-skeleton";
import { getPublicEvent } from "@/lib/store";

export default function CheckInPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <CheckInView params={params} />
    </Suspense>
  );
}

async function CheckInView({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const event = await getPublicEvent(id);
  if (!event) notFound();

  return (
    <div className="mx-auto max-w-xl">
      <p className="text-xs font-medium uppercase tracking-[0.18em] text-stamp">Check in</p>
      <h1 className="mt-3 font-serif text-5xl tracking-tight">{event.title}</h1>
      <p className="mt-3 text-muted">
        {event.venue} · {event.whenLabel}
      </p>
      <p className="mt-4 text-sm leading-relaxed text-muted">
        Enter the code from your ticket. You can also open the ticket page and check in from
        there.
      </p>
      <div className="mt-6">
        <CheckInForm eventId={event.id} />
      </div>
      <Link href={`/events/${event.id}`} className="mt-6 inline-block text-sm font-medium text-muted hover:text-ink">
        Back to the event
      </Link>
    </div>
  );
}
