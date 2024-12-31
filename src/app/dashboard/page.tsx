import { redirect } from "next/navigation";
import { getGitHubStats } from "@/lib/github";
import { auth } from "@/auth";
import { StatsTimeline } from "@/components/stats-timeline/index";

export default async function DashboardPage() {
  const session = await auth();

  if (!session) {
    redirect("/");
  }

  // Get the token from the session
  const token = session.accessToken;
  if (!token) {
    console.error("No access token found in session");
    redirect("/");
  }

  const stats = await getGitHubStats(token);

  return (
    <main className="dashboard-page min-h-screen py-10">
      <div className="dashboard-page__container container mx-auto">
        <StatsTimeline stats={stats} />
      </div>
    </main>
  );
} 