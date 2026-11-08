import type { Metadata } from "next";
import { CreateEventForm } from "@/components/create-event-form";

export const metadata: Metadata = {
  title: "List an event",
};

export default function NewEventPage() {
  return (
    <div className="max-w-2xl">
      <p className="text-xs font-medium uppercase tracking-[0.18em] text-stamp">New event</p>
      <h1 className="mt-3 font-serif text-5xl tracking-tight">List an event.</h1>
      <p className="mt-3 max-w-xl text-muted">
        Put the night on the board. Categories are the labels on a ticket: general, guest, crew,
        press. Guests pick one when they register.
      </p>
      <div className="mt-8">
        <CreateEventForm />
      </div>
    </div>
  );
}
