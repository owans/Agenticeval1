import type { Metadata } from "next";
import { Fraunces, Outfit } from "next/font/google";
import { SiteHeader } from "@/components/site-header";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Marquee",
    template: "%s · Marquee",
  },
  description: "List an event, register guests, label tickets, and check them in.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${outfit.variable} ${fraunces.variable} h-full antialiased`}>
      <body className="min-h-full bg-paper font-sans text-ink">
        <div className="mx-auto flex min-h-full w-full max-w-5xl flex-col px-5 py-6 sm:px-8">
          <SiteHeader />
          <div className="flex-1">{children}</div>
          <footer className="mt-16 border-t border-line pt-6 text-sm text-muted">
            Marquee keeps the list for the night: who is coming, which ticket they hold, and who
            is already in.
          </footer>
        </div>
      </body>
    </html>
  );
}
