import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { PageShell } from "@/components/page-shell";
import { PanelSkeleton } from "@/components/panel-skeleton";
import { TicketPassView } from "@/components/ticket-pass";
import { getTicketPass } from "@/lib/store";

export default function TicketPage({ params }: { params: Promise<{ code: string }> }) {
  return (
    <PageShell>
      <Suspense fallback={<PanelSkeleton lines={6} />}>
        <Ticket params={params} />
      </Suspense>
    </PageShell>
  );
}

async function Ticket({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const pass = await getTicketPass(code);

  if (!pass) {
    return (
      <div className="max-w-lg">
        <h1 className="font-display text-4xl text-ink">This ticket isn&apos;t on the list.</h1>
        <p className="mt-3 text-muted">Check the code, or ask the host to look up your name.</p>
        <Link href="/" className="mt-6 inline-flex text-sm text-ink underline">
          All events
        </Link>
      </div>
    );
  }

  if (pass.code !== code) redirect(`/tickets/${pass.code}`);

  return (
    <div className="mx-auto max-w-3xl">
      <TicketPassView pass={pass} />
    </div>
  );
}
