import { StatsProps } from "../types";

export function TopReposSlide({ stats }: StatsProps) {
  const repos = stats.repos || [];

  return (
    <div className="text-center space-y-4">
      <h2 className="text-2xl font-bold">Most Active Repositories of 2024</h2>
      <div className="space-y-4">
        {repos.slice(0, 3).map((repo) => (
          <div key={repo.name} className="space-y-1">
            <p className="text-xl font-bold">{repo.name}</p>
            <p className="text-sm text-muted-foreground">
              {repo.contributions || 0} contributions
            </p>
          </div>
        ))}
      </div>
    </div>
  );
} 