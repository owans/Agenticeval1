import type { Metadata } from "next";
import { Fraunces, Outfit } from "next/font/google";
import { SiteHeader } from "@/components/site-header";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
});

export const metadata: Metadata = {
  title: {
    default: "Marquee",
    template: "%s · Marquee",
  },
  description: "List an event, label tickets, and check guests in.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${outfit.variable} ${fraunces.variable} h-full antialiased`}>
      <body className="flex min-h-dvh flex-col bg-paper font-sans text-ink">
        <SiteHeader />
        {children}
        <footer className="mt-auto border-t border-line/80">
          <p className="mx-auto w-full max-w-5xl px-5 py-6 text-sm text-muted sm:px-8">
            Marquee keeps the list, the labels, and the door.
          </p>
        </footer>
      </body>
    </html>
  );
}
