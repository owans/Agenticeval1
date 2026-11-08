import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageSkeleton } from "@/components/page-skeleton";
import { TicketCheckIn } from "@/components/ticket-check-in";
import { secondaryButtonClass } from "@/components/classes";
import { getTicketPass } from "@/lib/store";

export default function TicketPage({ params }: { params: Promise<{ code: string }> }) {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <TicketView params={params} />
    </Suspense>
  );
}

async function TicketView({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const pass = await getTicketPass(code);
  if (!pass) notFound();

  return (
    <article className="mx-auto max-w-xl">
      <div className="overflow-hidden rounded-2xl border border-line bg-card">
        <div className="h-2" style={{ backgroundColor: pass.categoryColor }} />
        <div className="px-6 py-6 sm:px-8">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted">Marquee</p>
          <h1 className="mt-3 font-serif text-4xl tracking-tight">{pass.event.title}</h1>
          <p className="mt-2 text-muted">{pass.event.venue}</p>
          <p className="text-muted">{pass.event.whenLabel}</p>
        </div>
        <div className="border-t border-dashed border-line px-6 py-6 sm:px-8">
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted">Guest</p>
          <p className="mt-1 font-serif text-3xl tracking-tight">{pass.guestName}</p>
          <p className="mt-1 text-sm text-muted">{pass.guestEmail}</p>
          <p className="mt-4 inline-flex items-center gap-2 rounded-full border border-line px-3 py-1 text-sm">
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: pass.categoryColor }}
            />
            {pass.categoryName}
          </p>
          <p className="mt-6 font-mono text-3xl tracking-[0.18em]">{pass.code}</p>
          <div className="mt-6">
            <TicketCheckIn code={pass.code} checkedInLabel={pass.checkedInLabel} />
          </div>
        </div>
      </div>
      <div className="mt-5 flex flex-wrap gap-3">
        <Link href={`/events/${pass.event.id}`} className={secondaryButtonClass}>
          Event page
        </Link>
        <Link href={`/events/${pass.event.id}/check-in`} className={secondaryButtonClass}>
          Check-in desk
        </Link>
      </div>
    </article>
  );
}
