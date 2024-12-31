import type { StatsTimelineProps } from "../../stats-timeline";

export function ActiveDaysSlide({ stats }: StatsTimelineProps) {
  const today = new Date();
  const startOfYear = new Date(today.getFullYear(), 0, 1);
  const daysIntoYear = Math.floor(
    (today.getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24)
  ) + 1;
  
  return (
    <div className="text-center space-y-4">
      <h2 className="text-2xl font-bold">Days Active in 2024</h2>
      <p className="text-6xl font-bold">{stats.activeDays || 0}</p>
      <p className="text-xl text-muted-foreground">
        That&apos;s {Math.round(((stats.activeDays || 0) / daysIntoYear) * 100)}% of the year so far! 📅
      </p>
    </div>
  );
} 