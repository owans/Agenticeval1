import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckInForm } from "@/components/check-in-form";
import { PageShell } from "@/components/page-shell";
import { PanelSkeleton } from "@/components/panel-skeleton";
import { getPublicEvent } from "@/lib/store";

export default function CheckInPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <PageShell>
      <Suspense fallback={<PanelSkeleton lines={5} />}>
        <CheckInDesk params={params} />
      </Suspense>
    </PageShell>
  );
}

async function CheckInDesk({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const event = await getPublicEvent(id);
  if (!event) notFound();

  return (
    <div className="max-w-xl">
      <Link href={`/events/${event.id}`} className="text-sm text-muted underline hover:text-ink">
        {event.title}
      </Link>
      <h1 className="mt-4 font-display text-5xl tracking-tight text-ink">Check in</h1>
      <p className="mt-3 text-muted">
        Enter the code on your ticket for {event.title}. {event.whenLabel} at {event.venue}.
      </p>
      <CheckInForm eventId={event.id} />
    </div>
  );
}
