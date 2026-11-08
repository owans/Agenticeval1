export function PanelSkeleton({ lines = 4 }: { lines?: number }) {
  return (
    <div className="animate-pulse rounded-[28px] border border-line bg-card p-6" aria-hidden="true">
      <div className="space-y-3">
        {Array.from({ length: lines }, (_, index) => (
          <div
            key={index}
            className="h-4 rounded-full bg-line"
            style={{ width: `${88 - index * 12}%` }}
          />
        ))}
      </div>
    </div>
  );
}
