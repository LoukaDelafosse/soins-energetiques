"use client";

interface DayStat {
  label: string;
  count: number;
  revenue: number;
}

export default function StatsChart({ data }: { data: DayStat[] }) {
  const maxCount = Math.max(...data.map((d) => d.count), 1);
  // Show last 14 days for readability
  const displayData = data.slice(-14);

  return (
    <div className="space-y-4">
      {/* Bar chart */}
      <div className="flex items-end gap-1 h-32">
        {displayData.map((day, i) => {
          const height = day.count === 0 ? 4 : (day.count / maxCount) * 100;
          return (
            <div key={i} className="flex-1 flex flex-col items-center gap-1 group relative">
              {/* Tooltip */}
              <div className="absolute bottom-full mb-2 hidden group-hover:block bg-mauve-900 text-white text-xs rounded-lg px-2 py-1 whitespace-nowrap z-10">
                {day.count} séance{day.count > 1 ? "s" : ""} · {day.revenue}€
              </div>
              <div
                className={`w-full rounded-t-lg transition-all duration-500 ${
                  day.count > 0
                    ? "bg-gradient-to-t from-mauve-500 to-gold-400"
                    : "bg-mauve-100"
                }`}
                style={{ height: `${height}%` }}
              />
            </div>
          );
        })}
      </div>
      {/* Labels */}
      <div className="flex gap-1">
        {displayData.map((day, i) => (
          <div key={i} className="flex-1 text-center text-xs text-mauve-400 truncate">
            {day.label}
          </div>
        ))}
      </div>
    </div>
  );
}
