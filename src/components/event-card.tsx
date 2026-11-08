import Link from "next/link";
import { seatsLabel } from "@/lib/format";
import type { PublicEvent } from "@/lib/types";

function ticketCount(count: number) {
  if (count === 0) return "No tickets yet";
  if (count === 1) return "1 ticket";
  return `${count} tickets`;
}

export function EventCard({ event }: { event: PublicEvent }) {
  return (
    <li>
      <Link
        href={`/events/${event.id}`}
        className="flex gap-4 rounded-[28px] border border-line bg-card p-4 shadow-[0_18px_50px_rgba(48,32,12,0.04)] transition hover:border-ink/30"
      >
        <div className="flex w-16 shrink-0 flex-col items-center justify-center rounded-2xl bg-paper py-3">
          <span className="text-[11px] tracking-[0.16em] text-muted uppercase">{event.monthLabel}</span>
          <span className="font-display text-3xl leading-none text-ink">{event.dayLabel}</span>
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="font-display text-2xl leading-tight text-ink">{event.title}</h2>
            {event.past ? (
              <span className="rounded-full border border-line px-2 py-0.5 text-[11px] tracking-wide text-muted uppercase">
                Passed
              </span>
            ) : null}
          </div>
          <p className="mt-1 text-sm text-muted">
            {event.whenLabel}
            <span aria-hidden="true"> · </span>
            {event.venue}
          </p>
          {event.description ? (
            <p className="mt-2 line-clamp-2 text-sm text-muted">{event.description}</p>
          ) : null}
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {event.categories.map((category) => (
              <span
                key={category.id}
                className="inline-flex items-center gap-1.5 rounded-full border border-line px-2.5 py-1 text-xs text-ink"
              >
                <span className="size-2 rounded-full" style={{ backgroundColor: category.color }} />
                {category.name}
                <span className="text-muted">{seatsLabel(category.capacity, category.taken)}</span>
              </span>
            ))}
          </div>
          <p className="mt-3 text-sm text-muted">
            {ticketCount(event.registeredCount)}
            {event.checkedInCount > 0 ? ` · ${event.checkedInCount} checked in` : ""}
          </p>
        </div>
      </Link>
    </li>
  );
}
