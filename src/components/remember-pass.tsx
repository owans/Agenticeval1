"use client";

import { useEffect } from "react";
import { rememberPass } from "@/lib/passes";

export function RememberPass({
  eventId,
  code,
  guestName,
}: {
  eventId: string;
  code: string;
  guestName: string;
}) {
  useEffect(() => {
    rememberPass({ eventId, code, guestName });
  }, [eventId, code, guestName]);

  return null;
}
