"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import { parsePassesSnapshot, readPassesSnapshot, subscribePasses } from "@/lib/passes";

export function YourPass({ eventId }: { eventId: string }) {
  const raw = useSyncExternalStore(subscribePasses, readPassesSnapshot, () => "");
  const pass = parsePassesSnapshot(raw).find((item) => item.eventId === eventId);

  if (!pass) return null;

  return (
    <aside className="mt-6 rounded-2xl border border-line bg-card px-4 py-3 text-sm">
      <p className="text-muted">Ticket saved in this browser for {pass.guestName}.</p>
      <Link href={`/tickets/${pass.code}`} className="mt-1 inline-flex font-medium text-ink underline">
        Open {pass.code}
      </Link>
    </aside>
  );
}
