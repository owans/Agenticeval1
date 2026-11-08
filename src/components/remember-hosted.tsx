"use client";

import { useEffect } from "react";
import { rememberHosted } from "@/lib/hosted";

export function RememberHosted({
  id,
  title,
  ownerKey,
}: {
  id: string;
  title: string;
  ownerKey: string;
}) {
  useEffect(() => {
    rememberHosted({ id, title, key: ownerKey });
  }, [id, title, ownerKey]);

  return null;
}
