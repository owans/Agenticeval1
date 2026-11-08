"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import { parseHostedSnapshot, readHostedSnapshot, subscribeHosted } from "@/lib/hosted";

export function HostedEvents() {
  const raw = useSyncExternalStore(subscribeHosted, readHostedSnapshot, () => "");
  const events = parseHostedSnapshot(raw);

  if (events.length === 0) return null;

  return (
    <section className="mt-10">
      <h2 className="text-[11px] font-medium tracking-[0.22em] text-muted uppercase">
        Door lists on this browser
      </h2>
      <ul className="mt-3 flex flex-wrap gap-2">
        {events.map((event) => (
          <li key={event.id}>
            <Link
              href={`/events/${event.id}/manage?key=${encodeURIComponent(event.key)}`}
              className="inline-flex rounded-full border border-line bg-card px-4 py-2 text-sm text-ink transition hover:border-ink/30"
            >
              {event.title}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
