"use client";

import { useRouter } from "next/navigation";
import { useSyncExternalStore } from "react";
import Link from "next/link";
import { errorClass, fieldClass, labelClass, primaryButtonClass } from "@/components/classes";
import { parseHostedSnapshot, readHostedSnapshot, subscribeHosted } from "@/lib/hosted";

export function OwnerLock({
  eventId,
  title,
  invalid = false,
}: {
  eventId: string;
  title: string;
  invalid?: boolean;
}) {
  const router = useRouter();
  const raw = useSyncExternalStore(subscribeHosted, readHostedSnapshot, () => "");
  const saved = parseHostedSnapshot(raw).find((item) => item.id === eventId);

  return (
    <div className="max-w-lg">
      <p className="text-[11px] font-medium tracking-[0.22em] text-muted uppercase">Door list</p>
      <h1 className="mt-2 font-display text-4xl text-ink">{title}</h1>
      <p className="mt-3 text-muted">
        The owner key opens guest emails, ticket labels, and check-in status.
      </p>

      {saved ? (
        <Link
          href={`/events/${eventId}/manage?key=${encodeURIComponent(saved.key)}`}
          className={`mt-6 ${primaryButtonClass}`}
        >
          Use the key saved in this browser
        </Link>
      ) : null}

      <form
        className="mt-6 space-y-4"
        onSubmit={(event) => {
          event.preventDefault();
          const key = String(new FormData(event.currentTarget).get("ownerKey") ?? "").trim();
          if (!key) return;
          router.push(`/events/${eventId}/manage?key=${encodeURIComponent(key)}`);
        }}
      >
        <label className={labelClass}>
          Owner key
          <input
            name="ownerKey"
            required
            autoComplete="off"
            spellCheck={false}
            className={fieldClass}
          />
        </label>
        {invalid ? (
          <p role="alert" className={errorClass}>
            That owner key does not open this door list.
          </p>
        ) : null}
        <button type="submit" className={primaryButtonClass}>
          Open the door list
        </button>
      </form>
    </div>
  );
}
