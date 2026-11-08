import type { Metadata } from "next";
import { CreateEventForm } from "@/components/create-event-form";
import { PageShell } from "@/components/page-shell";

export const metadata: Metadata = {
  title: "List an event",
};

export default function NewEventPage() {
  return (
    <PageShell>
      <p className="text-[11px] font-medium tracking-[0.22em] text-muted uppercase">New listing</p>
      <h1 className="mt-3 font-display text-5xl tracking-tight text-ink">List an event</h1>
      <p className="mt-3 max-w-xl text-muted">
        You&apos;ll get a private owner link for labels, the guest list, and the door.
      </p>
      <CreateEventForm />
    </PageShell>
  );
}
