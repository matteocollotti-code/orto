import { addDays, buildTaskId, diffInDays, getRomeDate } from "@/lib/date-utils";
import {
  getDisplayPlantName,
  getEnvironmentLabel,
  getPlantProfile,
} from "@/lib/plant-profiles";
import { getStorageMeta, getStore } from "@/lib/store";
import { getWeatherSnapshot } from "@/lib/weather";
import type {
  DashboardPlant,
  DashboardState,
  DashboardTask,
  Plant,
  PlantTaskRule,
  StoreState,
  TaskCompletion,
  TaskPriority,
  TaskType,
  WeatherSnapshot,
} from "@/lib/orto-types";

const UPCOMING_WINDOW_DAYS = 6;

export async function buildDashboardState(): Promise<DashboardState> {
  const [store, weather] = await Promise.all([getStore(), getWeatherSnapshot()]);
  const today = getRomeDate();
  const storage = getStorageMeta();
  const plants = mapPlants(store);
  const tasks = buildTasks(store, weather, today);
  const tasksToday = tasks
    .filter((task) => diffInDays(task.dueDate, today) >= 0)
    .sort(sortTasks);
  const upcomingTasks = tasks
    .filter((task) => diffInDays(today, task.dueDate) > 0)
    .sort(sortTasks)
    .slice(0, 12);

  return {
    today,
    storage,
    weather,
    plants,
    tasksToday,
    upcomingTasks,
    stats: {
      plantCount: plants.reduce((total, plant) => total + plant.quantity, 0),
      taskCount: tasksToday.length,
      completedCount: tasksToday.filter((task) => task.isDone).length,
      environments: {
        casa: plants
          .filter((plant) => plant.environment === "casa")
          .reduce((total, plant) => total + plant.quantity, 0),
        balcone: plants
          .filter((plant) => plant.environment === "balcone")
          .reduce((total, plant) => total + plant.quantity, 0),
      },
    },
    assumptions: [
      "Gli ultimi interventi iniziali sono stati precompilati in modo prudenziale per evitare una dashboard vuota al primo avvio.",
      "Le dosi d'acqua sono indicative per vasi domestici; regolale in base a diametro vaso, drenaggio e stato reale del terriccio.",
      "Per i pothos in acquacoltura il cambio acqua settimanale è una regola operativa della dashboard, adattata all'uso domestico.",
    ],
  };
}

function mapPlants(store: StoreState): DashboardPlant[] {
  return store.plants
    .map((plant) => {
      const profile = getPlantProfile(plant.speciesKey);

      return {
        ...plant,
        profile,
        displayName: getDisplayPlantName(plant),
        environmentLabel: getEnvironmentLabel(plant.environment),
        lastWateredAt: findLatestCompletion(store, plant.id, "water")?.taskDate,
        lastFedAt: findLatestCompletion(store, plant.id, "fertilize")?.taskDate,
        lastWaterChangedAt: findLatestCompletion(store, plant.id, "change-water")
          ?.taskDate,
      };
    })
    .sort((left, right) => left.environment.localeCompare(right.environment));
}

function buildTasks(
  store: StoreState,
  weather: WeatherSnapshot,
  today: string,
): DashboardTask[] {
  const tasks: DashboardTask[] = [];

  for (const plant of store.plants) {
    const profile = getPlantProfile(plant.speciesKey);

    for (const rule of profile.tasks) {
      const dueDate = getDueDate(store, plant, rule, today, weather);
      const distance = diffInDays(today, dueDate);

      if (distance > UPCOMING_WINDOW_DAYS) {
        continue;
      }

      const taskId = buildTaskId(dueDate, plant.id, rule.type);
      const completion = store.taskCompletions[taskId];
      const priority = getPriority(rule.priority, diffInDays(dueDate, today));

      tasks.push({
        id: taskId,
        plantId: plant.id,
        plantName: getDisplayPlantName(plant),
        environment: plant.environment,
        type: rule.type,
        title: `${rule.label} ${plant.customName.toLowerCase()}`,
        description: rule.description,
        recommendation: buildRecommendation(plant, rule, weather),
        reason: buildReason(plant, rule, weather, today),
        amount: buildAmount(plant, rule, weather),
        priority,
        dueDate,
        isDone: Boolean(completion),
        completedBy: completion?.completedBy,
        completedAt: completion?.completedAt,
      });
    }
  }

  return tasks;
}

function getDueDate(
  store: StoreState,
  plant: Plant,
  rule: PlantTaskRule,
  today: string,
  weather: WeatherSnapshot,
) {
  if (rule.months && !rule.months.includes(new Date(`${today}T12:00:00Z`).getUTCMonth() + 1)) {
    return addDays(today, UPCOMING_WINDOW_DAYS + 2);
  }

  const latest = findLatestCompletion(store, plant.id, rule.type);
  const effectiveInterval = getEffectiveInterval(plant, rule, weather);

  if (!latest) {
    return rule.dueOnFirstLoad ? today : addDays(today, effectiveInterval);
  }

  const candidate = addDays(latest.taskDate, effectiveInterval);

  if (rule.weatherSensitive && plant.environment === "balcone") {
    const combinedRain =
      weather.today.precipitationSum + weather.yesterday.precipitationSum;

    if (combinedRain >= (rule.skipWhenRainMm ?? 7) && diffInDays(candidate, today) >= 0) {
      return addDays(today, 1);
    }
  }

  return candidate;
}

function getEffectiveInterval(
  plant: Plant,
  rule: PlantTaskRule,
  weather: WeatherSnapshot,
) {
  let interval = rule.intervalDays;

  if (!rule.weatherSensitive || plant.environment !== "balcone") {
    return interval;
  }

  if (weather.irrigationBias === "high") {
    interval = Math.max(1, interval - (rule.dryWeatherReduction ?? 1));
  } else if (weather.irrigationBias === "low") {
    interval += 1;
  }

  return interval;
}

function buildRecommendation(
  plant: Plant,
  rule: PlantTaskRule,
  weather: WeatherSnapshot,
) {
  if (rule.type === "water" && plant.environment === "balcone") {
    return weather.irrigationBias === "high"
      ? "Oggi mantieni il vaso più reattivo del solito: controlla subito il substrato e irriga nella fascia fresca."
      : "Controlla il terriccio e irriga solo quanto basta a riportarlo umido, senza saturarlo.";
  }

  if (rule.type === "change-water") {
    return "Sciacqua il contenitore, controlla le radici e rimetti acqua pulita a temperatura ambiente.";
  }

  if (rule.type === "fertilize") {
    return "Usa una dose leggera, preferibilmente su substrato già leggermente umido.";
  }

  if (rule.type === "harvest") {
    return "Raccogli dalle cime per favorire nuova vegetazione e ritardare la fioritura.";
  }

  return plant.environment === "casa"
    ? "Procedi solo se il substrato conferma il bisogno reale della pianta."
    : "Meglio intervenire al mattino o nel tardo pomeriggio, evitando le ore più calde.";
}

function buildReason(
  plant: Plant,
  rule: PlantTaskRule,
  weather: WeatherSnapshot,
  today: string,
) {
  const exposure = plant.exposure ? ` Esposizione ${plant.exposure.toLowerCase()}.` : "";

  if (rule.type === "water" && plant.environment === "balcone") {
    return `${weather.summary}${exposure}`;
  }

  if (rule.type === "water") {
    return `Promemoria basato sull'intervallo della specie e sull'ultimo intervento registrato prima del ${today}.`;
  }

  if (rule.type === "change-water") {
    return "La coltura in acqua tende a perdere qualità se il contenitore resta fermo per troppi giorni.";
  }

  return "Promemoria periodico derivato dal profilo della specie e dalla stagione attuale.";
}

function buildAmount(plant: Plant, rule: PlantTaskRule, weather: WeatherSnapshot) {
  if (rule.amountLabel) {
    return rule.amountLabel;
  }

  if (!rule.baseAmountMl) {
    return rule.type === "fertilize"
      ? "Dose leggera secondo etichetta."
      : "Controllo manuale del fabbisogno.";
  }

  let [min, max] = rule.baseAmountMl;

  if (rule.weatherSensitive && plant.environment === "balcone") {
    if (weather.irrigationBias === "high") {
      min = Math.round(min * 1.15);
      max = Math.round(max * 1.15);
    } else if (weather.irrigationBias === "low") {
      min = Math.round(min * 0.85);
      max = Math.round(max * 0.85);
    }
  }

  if (plant.quantity > 1) {
    const totalMin = min * plant.quantity;
    const totalMax = max * plant.quantity;

    return `${min}-${max} ml per unità (${formatLiters(totalMin)}-${formatLiters(totalMax)} totali).`;
  }

  return `${min}-${max} ml circa.`;
}

function findLatestCompletion(
  store: StoreState,
  plantId: string,
  taskType: TaskType,
) {
  return Object.values(store.taskCompletions)
    .filter((completion) => completion.plantId === plantId && completion.taskType === taskType)
    .sort(compareCompletions)
    .at(-1);
}

function compareCompletions(left: TaskCompletion, right: TaskCompletion) {
  return left.taskDate.localeCompare(right.taskDate);
}

function getPriority(priority: TaskPriority, overdueDays: number): TaskPriority {
  if (overdueDays >= 2) {
    return "urgent";
  }

  if (overdueDays === 1 && priority !== "low") {
    return "urgent";
  }

  return priority;
}

function sortTasks(left: DashboardTask, right: DashboardTask) {
  const priorityWeight = { urgent: 0, medium: 1, low: 2 };

  return (
    priorityWeight[left.priority] - priorityWeight[right.priority] ||
    left.environment.localeCompare(right.environment) ||
    left.plantName.localeCompare(right.plantName)
  );
}

function formatLiters(value: number) {
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)} L`;
  }

  return `${value} ml`;
}
