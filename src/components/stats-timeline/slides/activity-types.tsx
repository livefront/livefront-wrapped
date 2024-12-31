import { StatsProps } from "../types";

export function ActivityTypesSlide({ stats }: StatsProps) {
  const types = stats.contributionsByType || [];
  const totalContributions = types.reduce((sum, type) => sum + (type.count || 0), 0) || 1;

  return (
    <div className="text-center space-y-4">
      <h2 className="text-2xl font-bold">2024 Contribution Types</h2>
      <div className="space-y-3">
        {types.map((type) => (
          <div key={type.type} className="space-y-1">
            <div className="flex justify-between text-sm">
              <span>{type.type}</span>
              <span>{type.count || 0}</span>
            </div>
            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-white rounded-full"
                style={{
                  width: `${((type.count || 0) / totalContributions) * 100}%`
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 