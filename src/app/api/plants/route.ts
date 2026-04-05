import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { z } from "zod";
import { buildDashboardState } from "@/lib/dashboard";
import { SPECIES_OPTIONS } from "@/lib/plant-profiles";
import { updateStore } from "@/lib/store";

const createPlantSchema = z.object({
  speciesKey: z.enum([
    "basilico",
    "limone",
    "salvia",
    "rosmarino",
    "gelsomino",
    "pothos",
    "caffe",
    "monstera",
    "avocado",
    "pothos-acqua",
    "custom",
  ]),
  customName: z.string().trim().max(60).optional(),
  environment: z.enum(["casa", "balcone"]),
  quantity: z.coerce.number().int().min(1).max(24),
  potType: z.enum(["vaso", "terra", "acquacoltura"]),
  exposure: z.string().trim().max(60).optional(),
  notes: z.string().trim().max(240).optional(),
});

export async function POST(request: Request) {
  const payload = createPlantSchema.parse(await request.json());
  const fallbackName =
    SPECIES_OPTIONS.find((option) => option.value === payload.speciesKey)?.label ??
    "Nuova pianta";

  await updateStore((state) => {
    const customName = payload.customName?.trim() || fallbackName;
    const baseId = slugify(`${payload.environment}-${customName}`);
    const hasConflict = state.plants.some((plant) => plant.id === baseId);

    state.plants.push({
      id: hasConflict ? `${baseId}-${randomUUID().slice(0, 6)}` : baseId,
      speciesKey: payload.speciesKey,
      customName,
      environment: payload.environment,
      quantity: payload.quantity,
      potType: payload.potType,
      exposure: payload.exposure?.trim() || undefined,
      notes: payload.notes?.trim() || undefined,
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
