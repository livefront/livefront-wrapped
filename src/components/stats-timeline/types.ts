export interface Stats {
  totalCommits: number;
  totalComments: number;
  totalReviews: number;
  totalRepos: number;
  activeDays: number;
  contributionsByDay: {
    day: string;
    count: number;
  }[];
  contributionsByType: {
    type: string;
    count: number;
  }[];
  languages: {
    name: string;
    percentage: number;
  }[];
  repos: Array<{
    name: string;
    commits: number;
    stars: number;
    url: string;
    description: string | null;
    contributions: number;
  }>;
  user: {
    login: string;
    avatarUrl: string;
  };
}

export interface StatsProps {
  stats: Stats;
} 