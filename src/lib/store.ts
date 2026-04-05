import { promises as fs } from "node:fs";
import path from "node:path";
import { Redis } from "@upstash/redis";
import { createSeedState } from "@/lib/plant-profiles";
import type { StoreState } from "@/lib/orto-types";

const STORE_KEY = "orto-dashboard-state:v1";

let redisClient: Redis | null | undefined;

function getRedisClient() {
  if (redisClient !== undefined) {
    return redisClient;
  }

  const url =
    process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL ?? "";
  const token =
    process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN ?? "";

  redisClient = url && token ? new Redis({ url, token }) : null;
  return redisClient;
}

function getFileTarget() {
  if (process.env.VERCEL) {
    return {
      provider: "ephemeral" as const,
      shared: false,
      label: "Fallback temporaneo",
      note: "Su Vercel senza Redis la memoria resta solo temporanea. Per una sync reale tra due persone aggiungi Upstash Redis.",
      filePath: path.join("/tmp", "orto-store.json"),
    };
  }

  return {
    provider: "local-file" as const,
    shared: true,
    label: "File locale",
    note: "In sviluppo i dati vengono salvati in un file locale del progetto.",
    filePath: path.join(/* turbopackIgnore: true */ process.cwd(), ".data", "orto-store.json"),
  };
}

export function getStorageMeta() {
  if (getRedisClient()) {
    return {
      provider: "redis" as const,
      shared: true,
      label: "Redis condiviso",
      note: "Stato condiviso persistente, adatto a due persone e deploy Vercel.",
    };
  }

  const target = getFileTarget();

  return {
    provider: target.provider,
    shared: target.shared,
    label: target.label,
    note: target.note,
  };
}

export async function getStore() {
  const state = await readStore();
  return normalizeStore(state);
}

export async function updateStore(
  mutator: (state: StoreState) => StoreState | Promise<StoreState>,
) {
  const current = await getStore();
  const draft = structuredClone(current);
  const next = await mutator(draft);
  const normalized = normalizeStore({
    ...next,
    updatedAt: new Date().toISOString(),
  });

  await writeStore(normalized);
  return normalized;
}

async function readStore(): Promise<StoreState> {
  const redis = getRedisClient();

  if (redis) {
    const stored = await redis.get<StoreState>(STORE_KEY);

    if (stored) {
      return stored;
    }

    const seeded = createSeedState();
    await redis.set(STORE_KEY, seeded);
    return seeded;
  }

  const target = getFileTarget();

  try {
    const raw = await fs.readFile(target.filePath, "utf8");
    return JSON.parse(raw) as StoreState;
  } catch {
    const seeded = createSeedState();
    await writeFileState(target.filePath, seeded);
    return seeded;
  }
}

async function writeStore(state: StoreState) {
  const redis = getRedisClient();

  if (redis) {
    await redis.set(STORE_KEY, state);
    return;
  }

  const target = getFileTarget();
  await writeFileState(target.filePath, state);
}

async function writeFileState(filePath: string, state: StoreState) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, JSON.stringify(state, null, 2), "utf8");
}

function normalizeStore(state: StoreState): StoreState {
  return {
    version: 1,
    createdAt: state.createdAt,
    updatedAt: state.updatedAt,
    plants: state.plants ?? [],
    taskCompletions: state.taskCompletions ?? {},
  };
}
