import { DashboardShell } from "@/components/dashboard-shell";
import { buildDashboardState } from "@/lib/dashboard";

export default async function Home() {
  const dashboard = await buildDashboardState();

  return <DashboardShell initialState={dashboard} />;
}
