import type { Stats } from "../types";

export function DailyActivitySlide({ stats }: { stats: Stats }) {
  const maxCount = Math.max(...stats.contributionsByDay.map(d => d.count));
  const mostActiveDay = stats.contributionsByDay.reduce((a, b) => a.count > b.count ? a : b);

  return (
    <div className="w-full space-y-4">
      <div className="text-center">
        <h2 className="text-2xl font-bold">Your Activity Pattern</h2>
        <p className="text-white/80 text-sm">
          You're most active on <span className="font-bold text-white">{mostActiveDay.day}s</span>!
        </p>
      </div>

      <div className="space-y-2">
        {stats.contributionsByDay.map((day) => (
          <div key={day.day} className="flex items-center gap-4">
            <div className="w-32 text-right text-sm text-white/80">{day.day}</div>
            <div className="flex-1 h-2 bg-black/25 rounded-full overflow-hidden">
              <div
                className="h-full bg-white rounded-full transition-all duration-500"
                style={{
                  width: `${(day.count / maxCount) * 100}%`,
                }}
              />
            </div>
            <div className="w-16 text-sm font-mono text-white/80">{day.count}</div>
          </div>
        ))}
      </div>

      <div className="text-center text-xs text-white/60">
        Based on your commits, comments, and reviews in 2024
      </div>
    </div>
  )
} 