import Link from "next/link";
import type { PublicEvent } from "@/lib/types";

export function EventCard({ event }: { event: PublicEvent }) {
  const guestLabel =
    event.registeredCount === 0
      ? "No guests yet"
      : `${event.registeredCount} registered · ${event.checkedInCount} in`;

  return (
    <Link
      href={`/events/${event.id}`}
      className="group flex gap-4 rounded-2xl border border-line bg-card p-4 transition hover:border-ink/25"
    >
      <div className="flex w-16 shrink-0 flex-col items-center justify-center rounded-xl bg-paper py-3">
        <span className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted">
          {event.monthLabel}
        </span>
        <span className="font-serif text-3xl leading-none">{event.dayLabel}</span>
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <h2 className="font-serif text-2xl tracking-tight group-hover:underline">
            {event.title}
          </h2>
          {event.past ? (
            <span className="shrink-0 rounded-full bg-paper px-2.5 py-1 text-xs font-medium text-muted">
              Past
            </span>
          ) : null}
        </div>
        <p className="mt-1 text-sm text-muted">
          {event.venue} · {event.whenLabel}
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {event.categories.map((category) => (
            <span
              key={category.id}
              className="inline-flex items-center gap-1.5 rounded-full border border-line px-2.5 py-1 text-xs"
            >
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: category.color }}
              />
              {category.name}
            </span>
          ))}
        </div>
        <p className="mt-3 text-sm text-muted">{guestLabel}</p>
      </div>
    </Link>
  );
}
