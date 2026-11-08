export function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <main id="content" className="mx-auto w-full max-w-5xl flex-1 px-5 py-8 sm:px-8 sm:py-12">
      {children}
    </main>
  );
}
