import Link from "next/link";
import { cardClass } from "@/components/classes";
import { RememberPass } from "@/components/remember-pass";
import { TicketCheckIn } from "@/components/ticket-check-in";
import type { TicketPass } from "@/lib/types";

export function TicketPassView({ pass }: { pass: TicketPass }) {
  const admitted = Boolean(pass.checkedInAt);

  return (
    <article className={`${cardClass} overflow-hidden`}>
      <RememberPass eventId={pass.event.id} code={pass.code} guestName={pass.guestName} />
      <div className="h-2" style={{ backgroundColor: pass.categoryColor }} />
      <div className="grid sm:grid-cols-[minmax(0,1fr)_10.5rem]">
        <div className="p-6 sm:p-8">
          <p className="text-[11px] font-medium tracking-[0.22em] text-muted uppercase">Ticket</p>
          <h1 className="mt-2 font-display text-4xl leading-tight text-ink">{pass.event.title}</h1>
          <p className="mt-3 text-muted">
            {pass.event.whenLabel}
            <span aria-hidden="true"> · </span>
            {pass.event.venue}
          </p>
          <p className="mt-8 font-display text-3xl text-ink">{pass.guestName}</p>
          <p className="mt-1 text-sm text-muted">{pass.guestEmail}</p>
          <p className="mt-4 inline-flex items-center gap-2 rounded-full border border-line px-3 py-1 text-sm">
            <span className="size-2.5 rounded-full" style={{ backgroundColor: pass.categoryColor }} />
            {pass.categoryName}
          </p>
          {admitted ? (
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <p className="admit-stamp">Admitted</p>
              <p className="text-sm text-muted">{pass.checkedInLabel}</p>
            </div>
          ) : (
            <>
              <p className="mt-8 text-sm text-muted">At the door, check in with this ticket.</p>
              <TicketCheckIn code={pass.code} />
            </>
          )}
          <p className="mt-8 text-sm">
            <Link href={`/events/${pass.event.id}`} className="text-muted underline hover:text-ink">
              Event page
            </Link>
          </p>
        </div>
        <aside className="flex flex-row items-center justify-between gap-4 border-t-2 border-dashed border-[#d9cdb8] bg-[#f6efe4] px-6 py-5 sm:flex-col sm:justify-center sm:border-t-0 sm:border-l-2">
          <p className="text-[10px] font-medium tracking-[0.22em] text-muted uppercase">Code</p>
          <p className="text-center font-mono text-xl tracking-[0.18em] text-ink">{pass.code}</p>
        </aside>
      </div>
    </article>
  );
}
