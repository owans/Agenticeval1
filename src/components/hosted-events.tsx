"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import {
  parseHostedSnapshot,
  readHostedSnapshot,
  subscribeHosted,
} from "@/lib/hosted";

export function HostedEvents() {
  const raw = useSyncExternalStore(subscribeHosted, readHostedSnapshot, () => "");
  const events = parseHostedSnapshot(raw);
  if (events.length === 0) return null;

  return (
    <section className="mt-14">
      <h2 className="font-serif text-2xl tracking-tight">On this browser</h2>
      <p className="mt-1 text-sm text-muted">Door lists you opened here.</p>
      <ul className="mt-4 divide-y divide-line rounded-2xl border border-line bg-card">
        {events.map((event) => (
          <li key={event.id} className="flex items-center justify-between gap-3 px-4 py-3">
            <span className="truncate font-medium">{event.title}</span>
            <Link
              href={`/events/${event.id}/manage?key=${encodeURIComponent(event.key)}`}
              className="shrink-0 text-sm font-medium text-stamp hover:underline"
            >
              Door list
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
