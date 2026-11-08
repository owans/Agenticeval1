import Link from "next/link";
import { primaryButtonClass } from "@/components/classes";

export function SiteHeader() {
  return (
    <header className="border-b border-line/80">
      <a
        href="#content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-10 focus:rounded-full focus:bg-ink focus:px-4 focus:py-2 focus:text-paper"
      >
        Skip to content
      </a>
      <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-4 px-5 py-4 sm:px-8">
        <Link href="/" className="group">
          <span className="block text-[10px] font-medium tracking-[0.22em] text-muted uppercase">
            Box office
          </span>
          <span className="font-display text-[1.7rem] leading-none text-ink">Marquee</span>
        </Link>
        <Link href="/events/new" className={primaryButtonClass}>
          List an event
        </Link>
      </div>
    </header>
  );
}
