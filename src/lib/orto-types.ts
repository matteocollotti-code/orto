export type EnvironmentKey = "casa" | "balcone";

export type PotType = "vaso" | "acquacoltura" | "terra";

export type TaskType =
  | "water"
  | "fertilize"
  | "change-water"
  | "prune"
  | "harvest";

export type TaskPriority = "urgent" | "medium" | "low";

export type SpeciesKey =
  | "basilico"
  | "limone"
  | "salvia"
  | "rosmarino"
  | "gelsomino"
  | "bulbi-fiori"
  | "fiori-seminati"
  | "pothos"
  | "caffe"
  | "monstera"
  | "avocado"
  | "pothos-acqua"
  | "custom";

export type Plant = {
  id: string;
  speciesKey: SpeciesKey;
  customName: string;
  environment: EnvironmentKey;
  quantity: number;
  potType: PotType;
  exposure?: string;
  notes?: string;
  heightCm?: number;
  spreadCm?: number;
  potDiameterCm?: number;
  lastMeasuredAt?: string;
  addedAt: string;
};

export type TaskCompletion = {
  taskId: string;
  plantId: string;
  taskType: TaskType;
  taskDate: string;
  completedBy: string;
  completedAt: string;
};

export type StoreState = {
  version: number;
  createdAt: string;
  updatedAt: string;
  plants: Plant[];
  taskCompletions: Record<string, TaskCompletion>;
};

export type WeatherDay = {
  date: string;
  tempMax: number;
  tempMin: number;
  precipitationSum: number;
  precipitationHours: number;
  evapotranspiration: number;
  windMax: number;
};

export type WeatherSnapshot = {
  city: string;
  today: WeatherDay;
  yesterday: WeatherDay;
  current: {
    timestamp: string;
    temperature: number;
    humidity: number;
    precipitation: number;
    windSpeed: number;
  };
  drynessScore: number;
  irrigationBias: "high" | "medium" | "low";
  summary: string;
  sourceUrl: string;
};

export type PlantSource = {
  label: string;
  url: string;
};

export type PlantTaskRule = {
  type: TaskType;
  intervalDays: number;
  label: string;
  description: string;
  priority: TaskPriority;
  months?: number[];
  weatherSensitive?: boolean;
  skipWhenRainMm?: number;
  dryWeatherReduction?: number;
  baseAmountMl?: [number, number];
  amountLabel?: string;
  dueOnFirstLoad?: boolean;
};

export type PlantProfile = {
  key: SpeciesKey;
  name: string;
  scientificName: string;
  environmentLabel: string;
  sunlight: string;
  watering: string;
  feeding: string;
  pruning: string;
  needs: string[];
  watchouts: string[];
  source: PlantSource;
  tasks: PlantTaskRule[];
  illustrationTone: {
    leaf: string;
    accent: string;
    pot: string;
    bloom?: string;
  };
};

export type DashboardTask = {
  id: string;
  plantId: string;
  plantName: string;
  environment: EnvironmentKey;
  type: TaskType;
  title: string;
  description: string;
  recommendation: string;
  reason: string;
  amount: string;
  priority: TaskPriority;
  dueDate: string;
  isDone: boolean;
  completedBy?: string;
  completedAt?: string;
};

export type DashboardPlant = Plant & {
  profile: PlantProfile;
  displayName: string;
  environmentLabel: string;
  lastWateredAt?: string;
  lastFedAt?: string;
  lastWaterChangedAt?: string;
};

export type DashboardState = {
  today: string;
  storage: {
    provider: "redis" | "local-file" | "ephemeral";
    durable: boolean;
    shared: boolean;
    recovery: "none" | "browser-backup";
  };
  storeSnapshot: StoreState;
  weather: WeatherSnapshot;
  plants: DashboardPlant[];
  tasksToday: DashboardTask[];
  upcomingTasks: DashboardTask[];
  stats: {
    plantCount: number;
    taskCount: number;
    completedCount: number;
    environments: Record<EnvironmentKey, number>;
  };
  assumptions: string[];
};
