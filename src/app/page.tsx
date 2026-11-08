import { Suspense } from "react";
import Link from "next/link";
import { EventCard } from "@/components/event-card";
import { HostedEvents } from "@/components/hosted-events";
import { PageShell } from "@/components/page-shell";
import { PanelSkeleton } from "@/components/panel-skeleton";
import { primaryButtonClass } from "@/components/classes";
import { listPublicEvents } from "@/lib/store";
import type { PublicEvent } from "@/lib/types";

export default function HomePage() {
  return (
    <PageShell>
      <p className="text-[11px] font-medium tracking-[0.22em] text-muted uppercase">Tonight&apos;s board</p>
      <h1 className="mt-3 max-w-xl font-display text-5xl leading-none tracking-tight text-ink sm:text-6xl">
        The night, listed.
      </h1>
      <p className="mt-4 max-w-xl text-lg leading-relaxed text-muted">
        Put an event on the board, hand guests a ticket, check them in, and sort the list into
        labels like general, VIP, or press.
      </p>
      <div className="mt-6">
        <Link href="/events/new" className={primaryButtonClass}>
          List an event
        </Link>
      </div>
      <HostedEvents />
      <Suspense
        fallback={
          <div className="mt-12">
            <PanelSkeleton lines={5} />
          </div>
        }
      >
        <EventBoard />
      </Suspense>
    </PageShell>
  );
}

async function EventBoard() {
  const events = await listPublicEvents();
  const upcoming = events.filter((event) => !event.past);
  const past = events.filter((event) => event.past).reverse();

  if (events.length === 0) {
    return (
      <section className="mt-12 rounded-[28px] border border-dashed border-line px-6 py-12">
        <h2 className="font-display text-3xl text-ink">Nothing listed yet.</h2>
        <p className="mt-2 max-w-md text-muted">
          When you list an event, it shows up here for guests to take a ticket.
        </p>
      </section>
    );
  }

  return (
    <div className="mt-12 space-y-12">
      <EventSection title="On the board" events={upcoming} empty="Nothing coming up." />
      {past.length > 0 ? <EventSection title="Earlier" events={past} /> : null}
    </div>
  );
}

function EventSection({
  title,
  events,
  empty,
}: {
  title: string;
  events: PublicEvent[];
  empty?: string;
}) {
  return (
    <section>
      <h2 className="text-[11px] font-medium tracking-[0.22em] text-muted uppercase">{title}</h2>
      {events.length === 0 && empty ? (
        <p className="mt-3 text-muted">{empty}</p>
      ) : (
        <ul className="mt-4 space-y-3">
          {events.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </ul>
      )}
    </section>
  );
}
