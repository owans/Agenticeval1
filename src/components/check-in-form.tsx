"use client";

import { useActionState } from "react";
import Link from "next/link";
import { errorClass, fieldClass, labelClass, primaryButtonClass } from "@/components/classes";
import { checkInAtEvent } from "@/lib/actions";

export function CheckInForm({ eventId }: { eventId: string }) {
  const [state, action, pending] = useActionState(checkInAtEvent, null);

  return (
    <form action={action} className="mt-6 max-w-md space-y-4">
      <input type="hidden" name="eventId" value={eventId} />
      <label className={labelClass}>
        Ticket code
        <input
          name="code"
          required
          autoComplete="off"
          spellCheck={false}
          placeholder="MRQ-ABC-DEF"
          className={`${fieldClass} font-mono tracking-[0.14em] uppercase`}
        />
      </label>
      {state?.error ? (
        <p role="alert" className={errorClass}>
          {state.error}
        </p>
      ) : null}
      {state?.guestName ? (
        <p role="status" className="rounded-2xl border border-line bg-card px-4 py-3 text-sm">
          {state.guestName} {state.already ? "was already checked in" : "is checked in"}
          {state.categoryName ? ` · ${state.categoryName}` : ""}. {state.whenLabel}
          {state.code ? (
            <>
              {" "}
              <Link href={`/tickets/${state.code}`} className="font-medium underline">
                Open the ticket
              </Link>
            </>
          ) : null}
        </p>
      ) : null}
      <button type="submit" className={primaryButtonClass} disabled={pending}>
        {pending ? "Checking in…" : "Check in"}
      </button>
    </form>
  );
}
