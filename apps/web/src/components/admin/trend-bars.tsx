export function TrendBars({
  title,
  points,
  formatValue,
}: {
  title: string;
  points: { date: string; value: number }[];
  formatValue?: (value: number) => string;
}) {
  const max = Math.max(1, ...points.map((p) => p.value));
  const fmt = formatValue ?? ((v: number) => String(v));

  return (
    <div className="panel p-5">
      <p className="text-sm font-semibold">{title}</p>
      <div className="mt-4 flex h-32 items-end gap-0.5">
        {points.slice(-30).map((point) => (
          <div key={point.date} className="group flex flex-1 flex-col items-center justify-end">
            <div
              className="w-full rounded-t bg-clay/80 transition group-hover:bg-clay"
              style={{ height: `${Math.max(4, (point.value / max) * 100)}%` }}
              title={`${point.date}: ${fmt(point.value)}`}
            />
          </div>
        ))}
      </div>
      <div className="mt-2 flex justify-between text-[10px] text-muted">
        <span>{points[0]?.date.slice(5)}</span>
        <span>{points[points.length - 1]?.date.slice(5)}</span>
      </div>
    </div>
  );
}
