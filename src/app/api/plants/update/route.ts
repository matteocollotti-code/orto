import { NextResponse } from "next/server";
import { z } from "zod";
import { buildDashboardState } from "@/lib/dashboard";
import { updateStore } from "@/lib/store";

const editableMeasureSchema = z.preprocess(
  (value) => (value === "" || value === undefined ? null : value),
  z.union([z.coerce.number().positive().max(999), z.null()]),
);

const updatePlantSchema = z.object({
  plantId: z.string().min(3),
  customName: z.string().trim().max(60).optional(),
  exposure: z.string().trim().max(60).optional(),
  notes: z.string().trim().max(240).optional(),
  heightCm: editableMeasureSchema.optional(),
  spreadCm: editableMeasureSchema.optional(),
  potDiameterCm: editableMeasureSchema.optional(),
});

export async function POST(request: Request) {
  const payload = updatePlantSchema.parse(await request.json());

  await updateStore((state) => {
    const plant = state.plants.find((entry) => entry.id === payload.plantId);

    if (!plant) {
      throw new Error("Plant not found");
    }

    if (payload.customName !== undefined) {
      plant.customName = payload.customName.trim() || plant.customName;
    }

    if (payload.exposure !== undefined) {
      plant.exposure = payload.exposure.trim() || undefined;
    }

    if (payload.notes !== undefined) {
      plant.notes = payload.notes.trim() || undefined;
    }

    let touchedMeasurements = false;

    if (payload.heightCm !== undefined) {
      plant.heightCm = payload.heightCm ?? undefined;
      touchedMeasurements = true;
    }

    if (payload.spreadCm !== undefined) {
      plant.spreadCm = payload.spreadCm ?? undefined;
      touchedMeasurements = true;
    }

    if (payload.potDiameterCm !== undefined) {
      plant.potDiameterCm = payload.potDiameterCm ?? undefined;
      touchedMeasurements = true;
    }

    if (touchedMeasurements) {
      plant.lastMeasuredAt = new Date().toISOString();
    }

    return state;
  });

  const dashboard = await buildDashboardState();
  return NextResponse.json(dashboard);
}
