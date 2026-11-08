import { Suspense } from "react";
import Link from "next/link";
import { EventCard } from "@/components/event-card";
import { HostedEvents } from "@/components/hosted-events";
import { PageSkeleton } from "@/components/page-skeleton";
import { primaryButtonClass } from "@/components/classes";
import { listPublicEvents } from "@/lib/store";

export default function HomePage() {
  return (
    <div>
      <section className="max-w-2xl">
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-stamp">Door list</p>
        <h1 className="mt-3 font-serif text-5xl leading-[1.05] tracking-tight sm:text-6xl">
          The night, written down.
        </h1>
        <p className="mt-4 max-w-xl text-lg leading-relaxed text-muted">
          List the event, give each guest a ticket, and check them in when they arrive. Split the
          room into categories and move people between them.
        </p>
      </section>

      <Suspense fallback={<div className="mt-12"><PageSkeleton /></div>}>
        <EventBoard />
      </Suspense>
      <HostedEvents />
    </div>
  );
}

async function EventBoard() {
  const events = await listPublicEvents();

  if (events.length === 0) {
    return (
      <div className="mt-12 rounded-2xl border border-dashed border-line bg-card px-6 py-12 text-center">
        <p className="font-serif text-3xl tracking-tight">No events on the board yet.</p>
        <p className="mx-auto mt-2 max-w-md text-muted">
          List the first one. Guests can register, and you can label their tickets from the door
          list.
        </p>
        <Link href="/events/new" className={`${primaryButtonClass} mt-6`}>
          List an event
        </Link>
      </div>
    );
  }

  return (
    <div className="mt-12 space-y-3">
      <h2 className="sr-only">Events</h2>
      {events.map((event) => (
        <EventCard key={event.id} event={event} />
      ))}
    </div>
  );
}
