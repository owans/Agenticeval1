import Link from "next/link";
import { PageShell } from "@/components/page-shell";

export default function NotFound() {
  return (
    <PageShell>
      <h1 className="font-display text-4xl text-ink">That page isn&apos;t on the board.</h1>
      <Link href="/" className="mt-6 inline-flex text-sm text-ink underline">
        All events
      </Link>
    </PageShell>
  );
}
