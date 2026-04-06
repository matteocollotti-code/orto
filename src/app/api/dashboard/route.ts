import { NextResponse } from "next/server";
import { buildDashboardState } from "@/lib/dashboard";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  const dashboard = await buildDashboardState();

  return NextResponse.json(dashboard, {
    headers: {
      "Cache-Control": "no-store, max-age=0",
    },
  });
}
