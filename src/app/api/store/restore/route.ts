import { NextResponse } from "next/server";
import { z } from "zod";
import { buildDashboardState } from "@/lib/dashboard";
import { SPECIES_KEYS } from "@/lib/orto-types";
import { getStore, updateStore } from "@/lib/store";

const plantSchema = z.object({
  id: z.string().min(3).max(120),
  speciesKey: z.enum(SPECIES_KEYS),
  customName: z.string().trim().min(1).max(60),
  environment: z.enum(["casa", "balcone"]),
  quantity: z.coerce.number().int().min(1).max(24),
  potType: z.enum(["vaso", "terra", "acquacoltura"]),
  exposure: z.string().trim().max(60).optional(),
  notes: z.string().trim().max(240).optional(),
  heightCm: z.coerce.number().positive().max(999).optional(),
  spreadCm: z.coerce.number().positive().max(999).optional(),
  potDiameterCm: z.coerce.number().positive().max(999).optional(),
  lastMeasuredAt: z.string().min(10).optional(),
  addedAt: z.string().min(10),
});

const taskCompletionSchema = z.object({
  taskId: z.string().min(5),
  plantId: z.string().min(3),
  taskType: z.enum(["water", "fertilize", "change-water", "prune", "harvest"]),
  taskDate: z.string().min(10),
  completedBy: z.string().trim().min(1).max(40),
  completedAt: z.string().min(10),
});

const storeSchema = z.object({
  version: z.coerce.number().int().positive(),
  createdAt: z.string().min(10),
  updatedAt: z.string().min(10),
  plants: z.array(plantSchema).max(300),
  taskCompletions: z.record(z.string(), taskCompletionSchema),
});

const restoreSchema = z.object({
  state: storeSchema,
});

export async function POST(request: Request) {
  const payload = restoreSchema.parse(await request.json());
  const current = await getStore();

  if (!isTimestampNewer(payload.state.updatedAt, current.updatedAt)) {
    const dashboard = await buildDashboardState();
    return NextResponse.json(dashboard);
  }

  await updateStore(() => payload.state);

  const dashboard = await buildDashboardState();
  return NextResponse.json(dashboard);
}

function isTimestampNewer(left: string, right: string) {
  const leftTime = Date.parse(left);
  const rightTime = Date.parse(right);

  if (Number.isNaN(leftTime) || Number.isNaN(rightTime)) {
    return false;
  }

  return leftTime > rightTime;
}
