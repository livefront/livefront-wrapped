import { Octokit } from "@octokit/rest";

export interface RepoStats {
  name: string;
  commits: number;
  stars: number;
  url: string;
  description: string | null;
  language: string | null;
  contributions: number;
}

export async function getGitHubStats(accessToken: string | undefined | null) {
  if (!accessToken) {
    throw new Error("No access token provided");
  }

  const octokit = new Octokit({
    auth: accessToken,
  });
  
  try {
    // Get user's repositories
    const { data: repos } = await octokit.repos.listForAuthenticatedUser({
      sort: "pushed",
      per_page: 100,
      type: "owner",
    });

    const repoStats: RepoStats[] = [];
    let totalComments = 0;
    let totalReviews = 0;
    const activeDaysSet = new Set<string>();
    const dailyContributions: Record<string, number> = {};

    // Get commit counts and other stats for each repository
    for (const repo of repos) {
      // Skip forked repositories
      if (repo.fork) {
        continue;
      }

      try {
        // Get commit activity stats
        const { data: commitActivity } = await octokit.repos.getCommitActivityStats({
          owner: repo.owner.login,
          repo: repo.name,
        });

        let totalCommits = 0;
        
        // If we have commit activity data, sum it up
        if (Array.isArray(commitActivity)) {
          totalCommits = commitActivity.reduce((sum, week) => sum + (week.total || 0), 0);
          // Record daily commits for the current year
          commitActivity.forEach(week => {
            const weekStart = new Date(week.week * 1000);
            if (weekStart.getFullYear() === new Date().getFullYear()) {
              week.days.forEach((count, dayIndex) => {
                if (count > 0) {
                  const date = new Date(week.week * 1000);
                  date.setDate(date.getDate() + dayIndex);
                  const dayKey = date.toLocaleDateString('en-US', { weekday: 'long' });
                  activeDaysSet.add(date.toISOString());
                  dailyContributions[dayKey] = (dailyContributions[dayKey] || 0) + count;
                }
              });
            }
          });
        }

        // Get comments for this repo
        const { data: comments } = await octokit.issues.listCommentsForRepo({
          owner: repo.owner.login,
          repo: repo.name,
          since: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(), // Last year
          per_page: 100,
        });
        totalComments += comments.length;

        // Record comment dates for active days
        comments.forEach(comment => {
          if (comment.created_at) {
            const date = new Date(comment.created_at);
            if (date.getFullYear() === new Date().getFullYear()) {
              const dayKey = date.toLocaleDateString('en-US', { weekday: 'long' });
              activeDaysSet.add(date.toISOString());
              dailyContributions[dayKey] = (dailyContributions[dayKey] || 0) + 1;
            }
          }
        });

        // Get PR reviews for this repo
        const { data: pullRequests } = await octokit.pulls.list({
          owner: repo.owner.login,
          repo: repo.name,
          state: "all",
          per_page: 100,
        });

        // For each PR, get its reviews
        for (const pr of pullRequests) {
          const { data: reviews } = await octokit.pulls.listReviews({
            owner: repo.owner.login,
            repo: repo.name,
            pull_number: pr.number,
            per_page: 100,
          });
          totalReviews += reviews.length;

          // Record review dates for active days
          reviews.forEach(review => {
            if (review.submitted_at) {
              const date = new Date(review.submitted_at);
              if (date.getFullYear() === new Date().getFullYear()) {
                const dayKey = date.toLocaleDateString('en-US', { weekday: 'long' });
                activeDaysSet.add(date.toISOString());
                dailyContributions[dayKey] = (dailyContributions[dayKey] || 0) + 1;
              }
            }
          });
        }

        repoStats.push({
          name: repo.name,
          commits: totalCommits,
          stars: repo.stargazers_count,
          url: repo.html_url,
          description: repo.description,
          language: repo.language,
          contributions: totalCommits + comments.length + totalReviews,
        });
      } catch (error) {
        console.error(`Error fetching stats for ${repo.name}:`, error);
        // Still add the repo with 0 counts
        repoStats.push({
          name: repo.name,
          commits: 0,
          stars: repo.stargazers_count,
          url: repo.html_url,
          description: repo.description,
          language: repo.language,
          contributions: 0,
        });
      }
    }

    // Aggregate languages
    const languageStats: Record<string, number> = {};
    repoStats.forEach(repo => {
      if (repo.language) {
        languageStats[repo.language] = (languageStats[repo.language] || 0) + repo.commits;
      }
    });

    const totalLanguageCommits = Object.values(languageStats).reduce((sum, count) => sum + count, 0);
    const languages = Object.entries(languageStats)
      .map(([name, count]) => ({
        name,
        percentage: (count / totalLanguageCommits) * 100
      }))
      .sort((a, b) => b.percentage - a.percentage);

    // Convert daily contributions to sorted array
    const daysOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const contributionsByDay = daysOrder.map(day => ({
      day,
      count: dailyContributions[day] || 0
    }));

    return {
      repos: repoStats.sort((a, b) => b.commits - a.commits),
      totalCommits: repoStats.reduce((sum, repo) => sum + repo.commits, 0),
      totalComments,
      totalReviews,
      totalRepos: repoStats.length,
      activeDays: activeDaysSet.size,
      contributionsByDay,
      contributionsByType: [
        { type: "Commits", count: repoStats.reduce((sum, repo) => sum + repo.commits, 0) },
        { type: "Comments", count: totalComments },
        { type: "Reviews", count: totalReviews },
      ],
      languages,
      user: {
        login: (await octokit.users.getAuthenticated()).data.login,
        avatarUrl: (await octokit.users.getAuthenticated()).data.avatar_url,
      },
    };
  } catch (error) {
    console.error("Error fetching GitHub stats:", error);
    throw error;
  }
} 