import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { z } from "zod";
import { buildDashboardState } from "@/lib/dashboard";
import { getSpeciesLabel } from "@/lib/plant-profiles";
import { SPECIES_KEYS } from "@/lib/orto-types";
import { updateStore } from "@/lib/store";

const optionalMeasureSchema = z.preprocess(
  (value) => (value === "" || value === null || value === undefined ? undefined : value),
  z.coerce.number().positive().max(999).optional(),
);

const createPlantSchema = z.object({
  speciesKey: z.enum(SPECIES_KEYS),
  customName: z.string().trim().max(60).optional(),
  environment: z.enum(["casa", "balcone"]),
  quantity: z.coerce.number().int().min(1).max(24),
  potType: z.enum(["vaso", "terra", "acquacoltura"]),
  exposure: z.string().trim().max(60).optional(),
  notes: z.string().trim().max(240).optional(),
  heightCm: optionalMeasureSchema,
  spreadCm: optionalMeasureSchema,
  potDiameterCm: optionalMeasureSchema,
});

export async function POST(request: Request) {
  const payload = createPlantSchema.parse(await request.json());
  const fallbackName = getSpeciesLabel(payload.speciesKey);

  await updateStore((state) => {
    const customName = payload.customName?.trim() || fallbackName;
    const baseId = slugify(`${payload.environment}-${customName}`);
    const hasConflict = state.plants.some((plant) => plant.id === baseId);
    const hasMeasurements = Boolean(
      payload.heightCm || payload.spreadCm || payload.potDiameterCm,
    );

    state.plants.push({
      id: hasConflict ? `${baseId}-${randomUUID().slice(0, 6)}` : baseId,
      speciesKey: payload.speciesKey,
      customName,
      environment: payload.environment,
      quantity: payload.quantity,
      potType: payload.potType,
      exposure: payload.exposure?.trim() || undefined,
      notes: payload.notes?.trim() || undefined,
      heightCm: payload.heightCm,
      spreadCm: payload.spreadCm,
      potDiameterCm: payload.potDiameterCm,
      lastMeasuredAt: hasMeasurements ? new Date().toISOString() : undefined,
      addedAt: new Date().toISOString(),
    });

    return state;
  });

  const dashboard = await buildDashboardState();
  return NextResponse.json(dashboard);
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
