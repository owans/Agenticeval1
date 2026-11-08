"use client";

import { useEffect, useState } from "react";
import { rememberHosted } from "@/lib/hosted";
import { secondaryButtonClass } from "@/components/classes";

export function OwnerKeyBanner({
  eventId,
  title,
  ownerKey,
}: {
  eventId: string;
  title: string;
  ownerKey: string;
}) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    rememberHosted({ id: eventId, title, key: ownerKey });
  }, [eventId, title, ownerKey]);

  return (
    <div className="mt-6 rounded-2xl border border-line bg-card px-4 py-4 sm:px-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted">Owner key</p>
          <p className="mt-1 font-mono text-sm tracking-wide break-all">{ownerKey}</p>
        </div>
        <button
          type="button"
          className={secondaryButtonClass}
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(ownerKey);
              setCopied(true);
            } catch {
              setCopied(false);
            }
          }}
        >
          {copied ? "Copied" : "Copy key"}
        </button>
      </div>
      <p className="mt-3 text-sm text-muted">
        This key opens the door list. It is saved in this browser so you can come back from the
        home page.
      </p>
    </div>
  );
}
