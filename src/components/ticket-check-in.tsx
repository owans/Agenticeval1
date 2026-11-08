"use client";

import { useActionState } from "react";
import { errorClass } from "@/components/classes";
import { SubmitButton } from "@/components/submit-button";
import { checkInTicket } from "@/lib/actions";

export function TicketCheckIn({
  code,
  checkedInLabel,
}: {
  code: string;
  checkedInLabel: string | null;
}) {
  const [state, formAction] = useActionState(checkInTicket, null);

  if (checkedInLabel) {
    return (
      <div className="rounded-xl border border-pine/30 bg-pine/5 px-4 py-4">
        <p className="text-xs font-medium uppercase tracking-[0.16em] text-pine">In</p>
        <p className="mt-1 font-medium">{checkedInLabel}</p>
      </div>
    );
  }

  return (
    <form action={formAction}>
      <input type="hidden" name="code" value={code} />
      {state?.error ? (
        <p className={`${errorClass} mb-3`} role="alert">
          {state.error}
        </p>
      ) : null}
      <SubmitButton label="Check in" pendingLabel="Checking in…" />
    </form>
  );
}
