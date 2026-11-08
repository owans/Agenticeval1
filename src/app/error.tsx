"use client";

import { PageShell } from "@/components/page-shell";
import { primaryButtonClass } from "@/components/classes";

export default function AppError({ reset }: { error: Error; reset: () => void }) {
  return (
    <PageShell>
      <h1 className="font-display text-4xl text-ink">The board hit a snag.</h1>
      <p className="mt-3 text-muted">Try that again.</p>
      <button type="button" className={`mt-6 ${primaryButtonClass}`} onClick={() => reset()}>
        Try again
      </button>
    </PageShell>
  );
}
