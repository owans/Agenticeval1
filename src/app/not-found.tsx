import Link from "next/link";
import { primaryButtonClass } from "@/components/classes";

export default function NotFound() {
  return (
    <div className="max-w-lg">
      <p className="text-xs font-medium uppercase tracking-[0.18em] text-stamp">Missing</p>
      <h1 className="mt-3 font-serif text-5xl tracking-tight">Nothing on that page.</h1>
      <p className="mt-3 text-muted">The event or ticket may have been mistyped.</p>
      <Link href="/" className={`${primaryButtonClass} mt-6`}>
        Back to the board
      </Link>
    </div>
  );
}
