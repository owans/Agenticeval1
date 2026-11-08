import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="mb-10 flex items-center justify-between gap-4">
      <Link href="/" className="flex items-center gap-2.5">
        <span className="grid h-8 w-8 place-items-center rounded-sm bg-stamp text-[11px] font-semibold tracking-[0.14em] text-paper">
          M
        </span>
        <span className="font-serif text-xl tracking-tight">Marquee</span>
      </Link>
      <Link href="/events/new" className="rounded-full bg-ink px-4 py-2 text-sm font-medium text-paper transition hover:bg-ink/85">
        List an event
      </Link>
    </header>
  );
}
