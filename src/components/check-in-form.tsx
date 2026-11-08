"use client";

import { useActionState, useEffect, useRef } from "react";
import { errorClass, fieldClass, labelClass } from "@/components/classes";
import { SubmitButton } from "@/components/submit-button";
import { checkInAtEvent } from "@/lib/actions";

export function CheckInForm({ eventId }: { eventId: string }) {
  const [state, formAction] = useActionState(checkInAtEvent, null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.guestName) formRef.current?.reset();
  }, [state]);

  return (
    <div className="space-y-4">
      {state?.guestName ? (
        <div className="rounded-2xl border border-pine/30 bg-pine/5 px-5 py-5" role="status">
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-pine">
            {state.already ? "Already checked in" : "Checked in"}
          </p>
          <p className="mt-2 font-serif text-4xl tracking-tight">{state.guestName}</p>
          <p className="mt-2 text-sm text-muted">
            {state.categoryName}
            {state.whenLabel ? ` · ${state.whenLabel}` : ""}
          </p>
        </div>
      ) : null}

      <form ref={formRef} action={formAction} className="rounded-2xl border border-line bg-card p-5">
        <input type="hidden" name="eventId" value={eventId} />
        <label className={labelClass} htmlFor="ticket-code">
          Ticket code
        </label>
        <input
          id="ticket-code"
          className={`${fieldClass} font-mono text-2xl uppercase tracking-[0.18em]`}
          name="code"
          required
          autoCapitalize="characters"
          autoCorrect="off"
          spellCheck={false}
          placeholder="MRQ-000-000"
        />
        {state?.error ? (
          <p className={`${errorClass} mt-3`} role="alert">
            {state.error}
          </p>
        ) : null}
        <div className="mt-5">
          <SubmitButton label="Check in" pendingLabel="Checking in…" />
        </div>
      </form>
    </div>
  );
}
