import { DashboardShell } from "@/components/dashboard-shell";
import { buildDashboardState } from "@/lib/dashboard";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function Home() {
  const dashboard = await buildDashboardState();

  return <DashboardShell initialState={dashboard} />;
}
