import { StatsProps } from "../types";

export function LanguagesSlide({ stats }: StatsProps) {
  const languages = stats.languages || [];

  return (
    <div className="text-center space-y-4">
      <h2 className="text-2xl font-bold">Most Used Languages in 2024</h2>
      <div className="space-y-3">
        {languages.slice(0, 5).map((lang) => (
          <div key={lang.name} className="space-y-1">
            <div className="flex justify-between text-sm">
              <span>{lang.name}</span>
              <span>{(lang.percentage || 0).toFixed(1)}%</span>
            </div>
            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-white rounded-full"
                style={{ width: `${lang.percentage || 0}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 