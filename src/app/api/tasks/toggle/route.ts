import { NextResponse } from "next/server";
import { z } from "zod";
import { buildDashboardState } from "@/lib/dashboard";
import { getRomeDate } from "@/lib/date-utils";
import { updateStore } from "@/lib/store";

const toggleTaskSchema = z.object({
  taskId: z.string().min(5),
  plantId: z.string().min(3),
  taskType: z.enum(["water", "fertilize", "change-water", "prune", "harvest"]),
  actor: z.string().trim().max(40).optional(),
  done: z.boolean(),
});

export async function POST(request: Request) {
  const payload = toggleTaskSchema.parse(await request.json());
  const completionDate = getRomeDate();

  await updateStore((state) => {
    if (payload.done) {
      state.taskCompletions[payload.taskId] = {
        taskId: payload.taskId,
        plantId: payload.plantId,
        taskType: payload.taskType,
        taskDate: completionDate,
        completedBy: payload.actor?.trim() || "Persona 1",
        completedAt: new Date().toISOString(),
      };
    } else {
      delete state.taskCompletions[payload.taskId];
    }

    return state;
  });

  const dashboard = await buildDashboardState();
  return NextResponse.json(dashboard);
}
