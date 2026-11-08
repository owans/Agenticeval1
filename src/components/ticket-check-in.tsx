"use client";

import { useActionState } from "react";
import { errorClass, primaryButtonClass } from "@/components/classes";
import { checkInTicket } from "@/lib/actions";

export function TicketCheckIn({ code }: { code: string }) {
  const [state, action, pending] = useActionState(checkInTicket, null);

  return (
    <form action={action} className="mt-6">
      <input type="hidden" name="code" value={code} />
      {state?.error ? (
        <p role="alert" className={`mb-3 ${errorClass}`}>
          {state.error}
        </p>
      ) : null}
      <button type="submit" className={primaryButtonClass} disabled={pending}>
        {pending ? "Checking in…" : "Check in"}
      </button>
    </form>
  );
}
