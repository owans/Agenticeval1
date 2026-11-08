export function PageSkeleton() {
  return (
    <div className="animate-pulse space-y-4" aria-hidden="true">
      <div className="h-4 w-24 rounded-full bg-line" />
      <div className="h-12 w-2/3 rounded-xl bg-line" />
      <div className="h-28 rounded-2xl bg-line/80" />
      <div className="h-40 rounded-2xl bg-line/70" />
    </div>
  );
}
