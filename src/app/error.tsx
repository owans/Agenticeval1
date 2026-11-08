"use client";

import { primaryButtonClass } from "@/components/classes";

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="max-w-lg">
      <p className="text-xs font-medium uppercase tracking-[0.18em] text-stamp">Error</p>
      <h1 className="mt-3 font-serif text-5xl tracking-tight">The list didn&apos;t load.</h1>
      <p className="mt-3 text-muted">Try again. If it keeps failing, the saved list may be unreadable.</p>
      <button type="button" className={`${primaryButtonClass} mt-6`} onClick={() => reset()}>
        Try again
      </button>
    </div>
  );
}
