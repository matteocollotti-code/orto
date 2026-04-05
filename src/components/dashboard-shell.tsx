"use client";

import {
  useDeferredValue,
  useEffect,
  useRef,
  useState,
  useTransition,
} from "react";
import type { Dispatch, ReactNode, SetStateAction } from "react";
import {
  CalendarDays,
  CheckCircle2,
  CloudSun,
  Droplets,
  Leaf,
  MapPin,
  MoonStar,
  Plus,
  Ruler,
  Sprout,
  Trees,
} from "lucide-react";
import { PlantIllustration } from "@/components/plant-illustration";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  ENVIRONMENT_OPTIONS,
  POT_OPTIONS,
  SPECIES_GROUPS,
  getSpeciesLabel,
} from "@/lib/plant-profiles";
import type {
  DashboardPlant,
  DashboardState,
  EnvironmentKey,
  PlantingCalendarEntry,
  SpeciesKey,
  StoreState,
} from "@/lib/orto-types";
import { formatDate, formatDateTime } from "@/lib/utils";

const BROWSER_BACKUP_KEY = "orto-store-backup";

type DashboardShellProps = {
  initialState: DashboardState;
};

type PlantFormState = {
  speciesKey: SpeciesKey;
  customName: string;
  environment: EnvironmentKey;
  quantity: number;
  potType: "vaso" | "terra" | "acquacoltura";
  exposure: string;
  notes: string;
  heightCm: string;
  spreadCm: string;
  potDiameterCm: string;
};

type PlantMeasurementsState = {
  plantId: string;
  plantName: string;
  customName: string;
  exposure: string;
  notes: string;
  heightCm: string;
  spreadCm: string;
  potDiameterCm: string;
};

const INITIAL_FORM: PlantFormState = {
  speciesKey: "custom",
  customName: "",
  environment: "casa",
  quantity: 1,
  potType: "vaso",
  exposure: "",
  notes: "",
  heightCm: "",
  spreadCm: "",
  potDiameterCm: "",
};

export function DashboardShell({ initialState }: DashboardShellProps) {
  const [dashboard, setDashboard] = useState(initialState);
  const [activeTab, setActiveTab] = useState<"tutte" | EnvironmentKey>("tutte");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isMeasurementsDialogOpen, setIsMeasurementsDialogOpen] = useState(false);
  const [form, setForm] = useState<PlantFormState>(INITIAL_FORM);
  const [measurementsForm, setMeasurementsForm] =
    useState<PlantMeasurementsState | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [pendingTaskId, setPendingTaskId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const deferredTab = useDeferredValue(activeTab);
  const attemptedRestoreRef = useRef<string | null>(null);

  useEffect(() => {
    try {
      window.localStorage.setItem(
        BROWSER_BACKUP_KEY,
        JSON.stringify(dashboard.storeSnapshot),
      );
    } catch {}
  }, [dashboard.storeSnapshot]);

  useEffect(() => {
    if (dashboard.storage.recovery !== "browser-backup") {
      return;
    }

    if (attemptedRestoreRef.current === dashboard.storeSnapshot.updatedAt) {
      return;
    }

    attemptedRestoreRef.current = dashboard.storeSnapshot.updatedAt;

    let backup: StoreState | null = null;

    try {
      const rawBackup = window.localStorage.getItem(BROWSER_BACKUP_KEY);
      backup = rawBackup ? (JSON.parse(rawBackup) as StoreState) : null;
    } catch {
      window.localStorage.removeItem(BROWSER_BACKUP_KEY);
      return;
    }

    if (!backup || !isBackupNewer(backup.updatedAt, dashboard.storeSnapshot.updatedAt)) {
      return;
    }

    startTransition(() => {
      void (async () => {
        try {
          const response = await fetch("/api/store/restore", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ state: backup }),
          });

          if (!response.ok) {
            throw new Error("Non sono riuscito a ripristinare i dati salvati.");
          }

          const nextState = (await response.json()) as DashboardState;
          setDashboard(nextState);
        } catch {
          // If restore fails we keep the current dashboard and try again on a future refresh.
        }
      })();
    });
  }, [dashboard.storage.recovery, dashboard.storeSnapshot.updatedAt, startTransition]);

  const plants =
    deferredTab === "tutte"
      ? dashboard.plants
      : dashboard.plants.filter((plant) => plant.environment === deferredTab);

  const tasksByEnvironment = {
    balcone: dashboard.tasksToday.filter((task) => task.environment === "balcone").length,
    casa: dashboard.tasksToday.filter((task) => task.environment === "casa").length,
  };

  function handleToggleTask(
    taskId: string,
    plantId: string,
    taskType: string,
    done: boolean,
  ) {
    setPendingTaskId(taskId);
    setNotice(null);

    startTransition(() => {
      void (async () => {
        try {
          const response = await fetch("/api/tasks/toggle", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              taskId,
              plantId,
              taskType,
              done,
            }),
          });

          if (!response.ok) {
            throw new Error("Non sono riuscito a salvare il task.");
          }

          const nextState = (await response.json()) as DashboardState;
          setDashboard(nextState);
        } catch (error) {
          setNotice(
            error instanceof Error ? error.message : "Errore durante il salvataggio del task.",
          );
        } finally {
          setPendingTaskId(null);
        }
      })();
    });
  }

  function handleAddPlant() {
    setNotice(null);

    startTransition(() => {
      void (async () => {
        try {
          const response = await fetch("/api/plants", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(form),
          });

          if (!response.ok) {
            throw new Error("Non sono riuscito ad aggiungere la pianta.");
          }

          const nextState = (await response.json()) as DashboardState;
          setDashboard(nextState);
          setForm(INITIAL_FORM);
          setIsDialogOpen(false);
        } catch (error) {
          setNotice(
            error instanceof Error ? error.message : "Errore durante il salvataggio della pianta.",
          );
        }
      })();
    });
  }

  function openMeasurementsDialog(plant: DashboardPlant) {
    setMeasurementsForm({
      plantId: plant.id,
      plantName: plant.displayName,
      customName: plant.customName,
      exposure: plant.exposure ?? "",
      notes: plant.notes ?? "",
      heightCm: plant.heightCm ? String(plant.heightCm) : "",
      spreadCm: plant.spreadCm ? String(plant.spreadCm) : "",
      potDiameterCm: plant.potDiameterCm ? String(plant.potDiameterCm) : "",
    });
    setIsMeasurementsDialogOpen(true);
  }

  function closeMeasurementsDialog(open: boolean) {
    setIsMeasurementsDialogOpen(open);

    if (!open) {
      setMeasurementsForm(null);
    }
  }

  function handleSaveMeasurements() {
    if (!measurementsForm) {
      return;
    }

    setNotice(null);

    startTransition(() => {
      void (async () => {
        try {
          const response = await fetch("/api/plants/update", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(measurementsForm),
          });

          if (!response.ok) {
            throw new Error("Non sono riuscito a salvare misure e dettagli.");
          }

          const nextState = (await response.json()) as DashboardState;
          setDashboard(nextState);
          setMeasurementsForm(null);
          setIsMeasurementsDialogOpen(false);
        } catch (error) {
          setNotice(
            error instanceof Error
              ? error.message
              : "Errore durante il salvataggio delle misure.",
          );
        }
      })();
    });
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="relative isolate overflow-hidden">
        <div className="pointer-events-none absolute inset-0 orchard-mesh opacity-80" />
        <div className="pointer-events-none absolute left-[-12rem] top-[-12rem] size-[26rem] rounded-full bg-[radial-gradient(circle,_rgba(74,132,89,0.34)_0%,_rgba(74,132,89,0)_70%)] blur-3xl" />
        <div className="pointer-events-none absolute bottom-[-12rem] right-[-8rem] size-[28rem] rounded-full bg-[radial-gradient(circle,_rgba(44,92,58,0.42)_0%,_rgba(44,92,58,0)_70%)] blur-3xl" />

        <div className="mx-auto flex min-h-screen w-full max-w-[1480px] flex-col gap-6 px-4 py-4 sm:px-6 lg:px-8 lg:py-8">
          {renderHeader({
            dashboard,
            setIsDialogOpen,
            notice,
            tasksByEnvironment,
          })}

          {renderTaskAndWeather({
            dashboard,
            isPending,
            pendingTaskId,
            handleToggleTask,
          })}

          {renderPlantingGuide(dashboard)}

          {renderPlantSections({
            activeTab,
            setActiveTab,
            plants,
            openMeasurementsDialog,
          })}

          {renderAssumptions(dashboard)}
        </div>
      </div>

      {renderPlantDialog({
        isDialogOpen,
        setIsDialogOpen,
        form,
        setForm,
        handleAddPlant,
        isPending,
      })}

      {renderMeasurementsDialog({
        isOpen: isMeasurementsDialogOpen,
        onOpenChange: closeMeasurementsDialog,
        measurementsForm,
        setMeasurementsForm,
        handleSaveMeasurements,
        isPending,
      })}
    </div>
  );
}

function renderHeader(_props: {
  dashboard: DashboardState;
  setIsDialogOpen: (value: boolean) => void;
  notice: string | null;
  tasksByEnvironment: { balcone: number; casa: number };
}) {
  const { dashboard, setIsDialogOpen, notice, tasksByEnvironment } = _props;

  return (
    <header className="glass-panel flex flex-col gap-5 rounded-[2rem] px-5 py-5 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-4xl">
          <div className="flex flex-wrap items-center gap-3">
            <Badge variant="success">Milano live</Badge>
            <Badge variant="subtle">Dashboard quotidiana</Badge>
            {dashboard.storage.shared ? <Badge variant="default">Condivisa</Badge> : null}
          </div>

          <div className="mt-4 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-muted-foreground">
                oRTO
              </p>
              <h1 className="mt-2 max-w-3xl text-4xl font-semibold tracking-[-0.06em] sm:text-5xl">
                Casa e balcone nello stesso quadro operativo.
              </h1>
            </div>
          </div>

          <p className="mt-4 max-w-3xl text-sm leading-7 text-muted-foreground sm:text-base">
            {dashboard.weather.summary} Oggi il balcone riceve attenzione speciale
            sull&apos;acqua, mentre dentro casa la dashboard usa intervalli
            specie-specifici. Quando una task viene segnata, la checklist aggiornata
            resta la stessa per chi visita il sito.
          </p>
        </div>

        <div className="flex w-full max-w-[26rem] flex-col gap-4 rounded-[1.6rem] border border-border/70 bg-background/70 p-4">
          <div className="rounded-[1.35rem] border border-border/70 bg-primary/8 px-4 py-4 text-sm leading-6 text-muted-foreground">
            La checklist e condivisa: se una task viene segnata come fatta, il suo
            stato aggiornato e quello che vedono tutti gli utenti del sito.
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-[1.35rem] border border-border/70 bg-secondary/40 p-3">
              <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
                Task oggi
              </p>
              <p className="mt-1 text-3xl font-semibold tracking-[-0.05em]">
                {dashboard.stats.taskCount}
              </p>
              <p className="text-sm text-muted-foreground">
                {dashboard.stats.completedCount} gia segnati come fatti
              </p>
            </div>
            <div className="rounded-[1.35rem] border border-border/70 bg-secondary/40 p-3">
              <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
                Piante totali
              </p>
              <p className="mt-1 text-3xl font-semibold tracking-[-0.05em]">
                {dashboard.stats.plantCount}
              </p>
              <p className="text-sm text-muted-foreground">
                {dashboard.stats.environments.casa} in casa,{" "}
                {dashboard.stats.environments.balcone} fuori
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button onClick={() => setIsDialogOpen(true)} className="flex-1">
              <Plus data-icon="inline-start" />
              Aggiungi pianta
            </Button>
            <div className="flex flex-1 items-center gap-2 rounded-full border border-border/70 px-4 py-2 text-sm text-muted-foreground">
              <MapPin className="size-4 text-primary" />
              {dashboard.weather.city}
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Badge variant="outline">Balcone {tasksByEnvironment.balcone}</Badge>
        <Badge variant="outline">Casa {tasksByEnvironment.casa}</Badge>
      </div>
      {notice ? (
        <div className="rounded-[1.35rem] border border-red-400/25 bg-red-500/12 px-4 py-3 text-sm text-red-100">
          {notice}
        </div>
      ) : null}
    </header>
  );
}

function renderTaskAndWeather(_props: {
  dashboard: DashboardState;
  isPending: boolean;
  pendingTaskId: string | null;
  handleToggleTask: (taskId: string, plantId: string, taskType: string, done: boolean) => void;
}) {
  const { dashboard, isPending, pendingTaskId, handleToggleTask } = _props;

  return (
    <section className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_22rem]">
      <Card className="rounded-[2rem]">
        <CardHeader className="gap-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="flex items-center gap-2 text-primary">
                <CheckCircle2 className="size-5" />
                <span className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
                  Priorita di oggi
                </span>
              </div>
              <CardTitle className="mt-2">Checklist condivisa</CardTitle>
              <CardDescription>
                Segna i task come fatti: la checklist aggiornata e la stessa per tutti
                gli utenti che aprono il sito.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {dashboard.tasksToday.length ? (
            <ScrollArea className="h-[30rem] pr-4">
              <div className="flex flex-col gap-3">
                {dashboard.tasksToday.map((task) => {
                  const isBusy = pendingTaskId === task.id && isPending;

                  return (
                    <label
                      key={task.id}
                      className={`group flex cursor-pointer flex-col rounded-[1.5rem] border px-4 transition ${
                        task.isDone
                          ? "border-primary/20 bg-primary/10 py-3"
                          : "gap-3 border-border/70 bg-background/70 py-4 hover:border-primary/35 hover:bg-primary/5"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <Checkbox
                          checked={task.isDone}
                          disabled={isBusy}
                          onCheckedChange={(checked) =>
                            handleToggleTask(
                              task.id,
                              task.plantId,
                              task.type,
                              Boolean(checked),
                            )
                          }
                          className="mt-1"
                        />

                        <div className="min-w-0 flex-1">
                          {task.isDone ? (
                            <p className="text-base font-semibold tracking-[-0.03em] text-foreground/60 line-through">
                              {task.title}
                            </p>
                          ) : (
                            <>
                              <div className="flex flex-col gap-2 lg:flex-row lg:items-start lg:justify-between">
                                <div className="min-w-0">
                                  <div className="flex flex-wrap items-center gap-2">
                                    <p className="text-base font-semibold tracking-[-0.03em]">
                                      {task.title}
                                    </p>
                                    <Badge variant={priorityVariant(task.priority)}>
                                      {priorityLabel(task.priority)}
                                    </Badge>
                                    <Badge variant="subtle">
                                      {task.environment === "balcone" ? "Balcone" : "Casa"}
                                    </Badge>
                                  </div>
                                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                                    {task.description}
                                  </p>
                                </div>

                                <div className="rounded-full border border-border/70 bg-secondary/50 px-3 py-1.5 text-xs font-medium text-foreground">
                                  {task.amount}
                                </div>
                              </div>

                              <div className="mt-3 grid gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(12rem,0.6fr)]">
                                <div className="rounded-[1.15rem] bg-secondary/40 px-3 py-3 text-sm leading-6 text-foreground/90">
                                  <span className="font-medium">Suggerimento:</span>{" "}
                                  {task.recommendation}
                                </div>
                                <div className="rounded-[1.15rem] bg-secondary/40 px-3 py-3 text-sm leading-6 text-muted-foreground">
                                  {task.reason}
                                </div>
                              </div>

                              <div className="mt-3 flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.18em] text-muted-foreground">
                                <span>{task.plantName}</span>
                                <span>
                                  {task.dueDate === dashboard.today
                                    ? "Oggi"
                                    : `Da ${formatDate(task.dueDate)}`}
                                </span>
                                {task.completedAt ? (
                                  <span>completato il {formatDateTime(task.completedAt)}</span>
                                ) : null}
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </label>
                  );
                })}
              </div>
            </ScrollArea>
          ) : (
            <div className="rounded-[1.6rem] border border-dashed border-border/70 bg-secondary/35 px-5 py-8 text-sm text-muted-foreground">
              Nessun task urgente oggi. La dashboard sta comunque seguendo i prossimi
              promemoria.
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex flex-col gap-6">
        <Card className="rounded-[2rem]">
          <CardHeader>
            <div className="flex items-center gap-2 text-primary">
              <CloudSun className="size-5" />
              <span className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
                Meteo e irrigazione
              </span>
            </div>
            <CardTitle className="mt-2">Milano, oggi e ieri</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4 pt-0">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-[1.3rem] border border-border/70 bg-secondary/40 p-4">
                <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
                  Oggi
                </p>
                <p className="mt-1 text-3xl font-semibold tracking-[-0.05em]">
                  {dashboard.weather.today.tempMax.toFixed(1)} °C
                </p>
                <p className="text-sm text-muted-foreground">
                  min {dashboard.weather.today.tempMin.toFixed(1)} °C
                </p>
              </div>
              <div className="rounded-[1.3rem] border border-border/70 bg-secondary/40 p-4">
                <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
                  Pioggia 48h
                </p>
                <p className="mt-1 text-3xl font-semibold tracking-[-0.05em]">
                  {(
                    dashboard.weather.today.precipitationSum +
                    dashboard.weather.yesterday.precipitationSum
                  ).toFixed(1)}{" "}
                  mm
                </p>
                <p className="text-sm text-muted-foreground">
                  bias acqua {irrigationLabel(dashboard.weather.irrigationBias)}
                </p>
              </div>
            </div>

            <div className="rounded-[1.35rem] border border-border/70 bg-primary/10 px-4 py-4 text-sm leading-6 text-foreground/90">
              {dashboard.weather.summary}
            </div>

            <div className="grid gap-3">
              <div className="flex items-center justify-between rounded-[1.25rem] bg-secondary/40 px-4 py-3 text-sm">
                <span className="text-muted-foreground">Evapotraspirazione oggi</span>
                <span className="font-medium">
                  {dashboard.weather.today.evapotranspiration.toFixed(2)} mm
                </span>
              </div>
              <div className="flex items-center justify-between rounded-[1.25rem] bg-secondary/40 px-4 py-3 text-sm">
                <span className="text-muted-foreground">Vento massimo oggi</span>
                <span className="font-medium">
                  {dashboard.weather.today.windMax.toFixed(1)} km/h
                </span>
              </div>
              <div className="flex items-center justify-between rounded-[1.25rem] bg-secondary/40 px-4 py-3 text-sm">
                <span className="text-muted-foreground">Minima prossima notte</span>
                <span className="font-medium">
                  {dashboard.weather.tomorrow.tempMin.toFixed(1)} C
                </span>
              </div>
              <a
                href={dashboard.weather.sourceUrl}
                target="_blank"
                rel="noreferrer"
                className="text-sm text-primary underline-offset-4 transition hover:underline"
              >
                Fonte meteo Open-Meteo
              </a>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-[2rem]">
          <CardHeader>
            <div className="flex items-center gap-2 text-primary">
              <Sprout className="size-5" />
              <span className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
                In arrivo
              </span>
            </div>
            <CardTitle className="mt-2">Prossimi promemoria</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex flex-col gap-3">
              {dashboard.upcomingTasks.slice(0, 6).map((task) => (
                <div
                  key={task.id}
                  className="rounded-[1.3rem] border border-border/70 bg-secondary/35 px-4 py-3"
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-medium">{task.title}</p>
                    <Badge variant="subtle">{formatDate(task.dueDate)}</Badge>
                  </div>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">
                    {task.amount}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}

function renderPlantSections(_props: {
  activeTab: "tutte" | EnvironmentKey;
  setActiveTab: (value: "tutte" | EnvironmentKey) => void;
  plants: DashboardState["plants"];
  openMeasurementsDialog: (plant: DashboardPlant) => void;
}) {
  const { activeTab, setActiveTab, plants, openMeasurementsDialog } = _props;

  return (
    <Card className="rounded-[2rem]">
      <CardHeader className="gap-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="flex items-center gap-2 text-primary">
              <Trees className="size-5" />
              <span className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
                Schede piante
              </span>
            </div>
            <CardTitle className="mt-2">Casa e balcone, con scheda informativa</CardTitle>
            <CardDescription>
              Ogni scheda combina routine, segnali da controllare, ultima azione
              registrata e misure utili per affinare l&apos;acqua.
            </CardDescription>
          </div>
          <div className="rounded-full border border-border/70 bg-secondary/40 px-4 py-2 text-sm text-muted-foreground">
            Esposizione balcone: sud-est
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <Tabs
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as "tutte" | EnvironmentKey)}
        >
          <TabsList>
            <TabsTrigger value="tutte">Tutte</TabsTrigger>
            <TabsTrigger value="casa">Casa</TabsTrigger>
            <TabsTrigger value="balcone">Balcone</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-5">
            <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
              {plants.map((plant) => {
                const hasMeasurements = hasMeasurementsSaved(plant);

                return (
                  <Card
                    key={plant.id}
                    className="overflow-hidden rounded-[1.8rem] border-border/70"
                  >
                    <CardContent className="px-0 py-0">
                      <div className="relative overflow-hidden rounded-t-[1.8rem] bg-[linear-gradient(180deg,rgba(32,56,42,0.92),rgba(18,31,24,0.88))] px-5 pt-5">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <Badge variant="outline">{plant.environmentLabel}</Badge>
                              <Badge variant="subtle">{plant.quantity} unita</Badge>
                              {plant.potType === "acquacoltura" ? (
                                <Badge variant="warning">Acquacoltura</Badge>
                              ) : null}
                              <Badge variant={hasMeasurements ? "success" : "warning"}>
                                {hasMeasurements ? "Misure salvate" : "Misure mancanti"}
                              </Badge>
                            </div>
                            <h3 className="mt-3 text-2xl font-semibold tracking-[-0.04em]">
                              {plant.displayName}
                            </h3>
                            <p className="mt-1 text-sm text-muted-foreground">
                              {usesCustomPlantName(plant)
                                ? `${plant.profile.name} · ${plant.profile.scientificName}`
                                : plant.profile.scientificName}
                            </p>
                          </div>
                        </div>

                        <PlantIllustration
                          speciesKey={plant.speciesKey}
                          tone={plant.profile.illustrationTone}
                          className="mx-auto mt-2 max-w-[15rem]"
                        />
                      </div>

                      <div className="flex flex-col gap-4 px-5 py-5">
                        <div className="grid gap-3 text-sm leading-6 text-muted-foreground">
                          <InfoLine
                            label="Luce"
                            value={plant.profile.sunlight}
                            icon={<Leaf className="size-4 text-primary" />}
                          />
                          <InfoLine
                            label="Acqua"
                            value={plant.profile.watering}
                            icon={<Droplets className="size-4 text-primary" />}
                          />
                          <InfoLine
                            label="Nutrimento"
                            value={plant.profile.feeding}
                            icon={<Sprout className="size-4 text-primary" />}
                          />
                        </div>

                        <Separator />

                        <div className="flex flex-wrap gap-2">
                          {plant.profile.needs.map((item) => (
                            <Badge key={`${plant.id}-${item}`} variant="subtle">
                              {item}
                            </Badge>
                          ))}
                        </div>

                        {plant.nightShelterAdvice ? (
                          <div className="rounded-[1.3rem] border border-border/70 bg-secondary/20 px-4 py-4">
                            <div className="flex items-start gap-3">
                              <div className="mt-1 rounded-full bg-primary/10 p-2 text-primary">
                                <MoonStar className="size-4" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="flex flex-wrap items-center gap-2">
                                  <p className="text-sm font-medium text-foreground">
                                    Notte sul balcone
                                  </p>
                                  <Badge variant={nightShelterVariant(plant.nightShelterAdvice.status)}>
                                    {plant.nightShelterAdvice.label}
                                  </Badge>
                                </div>
                                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                                  {plant.nightShelterAdvice.detail}
                                </p>
                              </div>
                            </div>
                          </div>
                        ) : null}

                        <div className="rounded-[1.3rem] border border-border/70 bg-secondary/20 px-4 py-4">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <div className="flex items-center gap-2 text-primary">
                                <Ruler className="size-4" />
                                <p className="text-sm font-medium text-foreground">
                                  Scheda e calibrazione acqua
                                </p>
                              </div>
                              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                                {hasMeasurements
                                  ? "Qui puoi rinominare la pianta e aggiornare misure, esposizione e note per mantenere la scheda precisa."
                                  : "Completa nome, misure, esposizione e note per rendere piu affidabili le quantita di acqua."}
                              </p>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openMeasurementsDialog(plant)}
                            >
                              Modifica scheda
                            </Button>
                          </div>

                          <div className="mt-4 grid gap-2 rounded-[1.15rem] bg-background/70 px-3 py-3 text-sm text-muted-foreground sm:grid-cols-3">
                            <MeasurementLine
                              label="Altezza"
                              value={formatMeasurement(plant.heightCm)}
                            />
                            <MeasurementLine
                              label="Larghezza"
                              value={formatMeasurement(plant.spreadCm)}
                            />
                            <MeasurementLine
                              label="Diametro vaso"
                              value={formatMeasurement(plant.potDiameterCm)}
                            />
                          </div>

                          {plant.lastMeasuredAt ? (
                            <p className="mt-3 text-xs uppercase tracking-[0.18em] text-muted-foreground">
                              Ultimo aggiornamento misure {formatDate(plant.lastMeasuredAt)}
                            </p>
                          ) : null}
                        </div>

                        <div className="grid gap-2 rounded-[1.3rem] bg-secondary/35 px-4 py-4 text-sm">
                          <p>
                            <span className="font-medium text-foreground">Ultima acqua:</span>{" "}
                            {plant.lastWateredAt ? formatDate(plant.lastWateredAt) : "nessun dato"}
                          </p>
                          <p>
                            <span className="font-medium text-foreground">Ultimo concime:</span>{" "}
                            {plant.lastFedAt ? formatDate(plant.lastFedAt) : "nessun dato"}
                          </p>
                          {plant.potType === "acquacoltura" ? (
                            <p>
                              <span className="font-medium text-foreground">
                                Ultimo cambio acqua:
                              </span>{" "}
                              {plant.lastWaterChangedAt
                                ? formatDate(plant.lastWaterChangedAt)
                                : "nessun dato"}
                            </p>
                          ) : null}
                          {plant.exposure ? (
                            <p>
                              <span className="font-medium text-foreground">Esposizione:</span>{" "}
                              {plant.exposure}
                            </p>
                          ) : null}
                          {plant.nightShelterAdvice ? (
                            <p>
                              <span className="font-medium text-foreground">
                                Rientro notturno:
                              </span>{" "}
                              {plant.nightShelterAdvice.label.toLowerCase()}
                            </p>
                          ) : null}
                          {plant.notes ? (
                            <p>
                              <span className="font-medium text-foreground">Note:</span>{" "}
                              {plant.notes}
                            </p>
                          ) : null}
                        </div>

                        <div className="flex flex-wrap gap-3 text-sm">
                          <a
                            href={plant.profile.source.url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-primary underline-offset-4 transition hover:underline"
                          >
                            Fonte: {plant.profile.source.label}
                          </a>
                          <span className="text-muted-foreground">
                            {plant.profile.watchouts.join(", ")}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

function renderPlantingGuide(dashboard: DashboardState) {
  const { plantingGuide } = dashboard;

  return (
    <Card className="rounded-[2rem]">
      <CardHeader className="gap-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="flex items-center gap-2 text-primary">
              <CalendarDays className="size-5" />
              <span className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
                Semine e trapianti
              </span>
            </div>
            <CardTitle className="mt-2">
              Cosa mettere a dimora durante l&apos;anno
            </CardTitle>
            <CardDescription>
              Planner stagionale per {plantingGuide.location}, pensato per balcone,
              cassette e orto domestico in vaso.
            </CardDescription>
          </div>
          <div className="rounded-full border border-border/70 bg-secondary/40 px-4 py-2 text-sm text-muted-foreground">
            {plantingGuide.scope}
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_22rem]">
          <div className="rounded-[1.7rem] border border-border/70 bg-[linear-gradient(135deg,rgba(32,58,44,0.92),rgba(17,30,23,0.88))] px-5 py-5">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="success">{plantingGuide.currentPeriodLabel}</Badge>
              <Badge variant="outline">{plantingGuide.current.monthLabel}</Badge>
            </div>

            <h3 className="mt-4 text-2xl font-semibold tracking-[-0.04em]">
              {plantingGuide.currentHeadline}
            </h3>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-muted-foreground sm:text-base">
              {plantingGuide.current.summary}
            </p>

            <div className="mt-5 grid gap-4 lg:grid-cols-2">
              <PlantingColumn
                title="Semi consigliati adesso"
                items={plantingGuide.current.seeds}
                accent="from-primary/12 to-primary/4"
              />
              <PlantingColumn
                title="Piantine da mettere a dimora"
                items={plantingGuide.current.seedlings}
                accent="from-secondary/70 to-secondary/40"
              />
            </div>

            <div className="mt-5 rounded-[1.25rem] border border-border/70 bg-background/70 px-4 py-4 text-sm leading-6 text-muted-foreground">
              <span className="font-medium text-foreground">Nota pratica:</span>{" "}
              {plantingGuide.weatherNote}
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <div className="rounded-[1.6rem] border border-border/70 bg-secondary/30 px-4 py-4">
              <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
                Prossimo passaggio
              </p>
              <h3 className="mt-2 text-xl font-semibold tracking-[-0.04em]">
                {plantingGuide.next.monthLabel}
              </h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {plantingGuide.next.summary}
              </p>
              <div className="mt-4 flex flex-col gap-3 text-sm">
                <div>
                  <p className="font-medium text-foreground">Semi</p>
                  <p className="mt-1 text-muted-foreground">
                    {plantingGuide.next.seeds.slice(0, 2).join(", ")}.
                  </p>
                </div>
                <div>
                  <p className="font-medium text-foreground">Piantine</p>
                  <p className="mt-1 text-muted-foreground">
                    {plantingGuide.next.seedlings.slice(0, 2).join(", ")}.
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-[1.6rem] border border-border/70 bg-background/70 px-4 py-4">
              <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
                Fonti guida
              </p>
              <div className="mt-3 flex flex-col gap-2 text-sm">
                {plantingGuide.sources.map((source) => (
                  <a
                    key={source.url}
                    href={source.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-primary underline-offset-4 transition hover:underline"
                  >
                    {source.label}
                  </a>
                ))}
              </div>
              <p className="mt-4 text-sm leading-6 text-muted-foreground">
                Finestre stagionali adattate a Milano e alla coltivazione in vaso,
                inferite dalle finestre di semina e trapianto delle fonti usate.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
          {plantingGuide.calendar.map((entry) => {
            const isCurrent = entry.month === plantingGuide.current.month;

            return (
              <div
                key={entry.month}
                className={`rounded-[1.5rem] border px-4 py-4 ${
                  isCurrent
                    ? "border-primary/35 bg-primary/8"
                    : "border-border/70 bg-secondary/20"
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="text-lg font-semibold tracking-[-0.03em]">
                    {entry.monthLabel}
                  </p>
                  {isCurrent ? <Badge variant="success">Adesso</Badge> : null}
                </div>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {entry.summary}
                </p>

                <div className="mt-4 grid gap-3">
                  <MiniPlantingBlock
                    label="Semi"
                    items={entry.seeds}
                  />
                  <MiniPlantingBlock
                    label="Piantine"
                    items={entry.seedlings}
                  />
                </div>

                <p className="mt-4 text-sm leading-6 text-muted-foreground">
                  {entry.caution}
                </p>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

function renderAssumptions(_dashboard: DashboardState) {
  return (
    <Card className="rounded-[2rem]">
      <CardHeader>
        <CardTitle>Assunzioni iniziali</CardTitle>
        <CardDescription>
          Le puoi usare come checklist di calibrazione dopo i primi giorni di utilizzo.
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="grid gap-3 lg:grid-cols-3">
          {_dashboard.assumptions.map((assumption) => (
            <div
              key={assumption}
              className="rounded-[1.35rem] border border-border/70 bg-secondary/35 px-4 py-4 text-sm leading-6 text-muted-foreground"
            >
              {assumption}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function renderPlantDialog(_props: {
  isDialogOpen: boolean;
  setIsDialogOpen: (value: boolean) => void;
  form: PlantFormState;
  setForm: Dispatch<SetStateAction<PlantFormState>>;
  handleAddPlant: () => void;
  isPending: boolean;
}) {
  const { isDialogOpen, setIsDialogOpen, form, setForm, handleAddPlant, isPending } = _props;

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Aggiungi una nuova pianta</DialogTitle>
          <DialogDescription>
            Scegli una specie dal catalogo, dai un nome alla pianta e salva ambiente
            e misure utili: la dashboard le terra in memoria e usera questi dati anche
            per affinare le dosi d&apos;acqua.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="species">Specie</Label>
            <Select
              value={form.speciesKey}
              onValueChange={(value) =>
                setForm((current) => ({
                  ...getNextPlantFormStateForSpecies(current, value as SpeciesKey),
                }))
              }
            >
              <SelectTrigger id="species">
                <SelectValue placeholder="Scegli una specie" />
              </SelectTrigger>
              <SelectContent className="max-h-[26rem]">
                {SPECIES_GROUPS.map((group) => (
                  <SelectGroup key={group.label}>
                    <SelectLabel>{group.label}</SelectLabel>
                    {group.options.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="name">Nome pianta o scheda</Label>
              <Input
                id="name"
                value={form.customName}
                onChange={(event) =>
                  setForm((current) => ({ ...current, customName: event.target.value }))
                }
                placeholder={getPlantNamePlaceholder(form.speciesKey)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="quantity">Quantita</Label>
              <Input
                id="quantity"
                type="number"
                min={1}
                max={24}
                value={form.quantity}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    quantity: Number(event.target.value) || 1,
                  }))
                }
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="environment">Ambiente</Label>
              <Select
                value={form.environment}
                onValueChange={(value) =>
                  setForm((current) => ({ ...current, environment: value as EnvironmentKey }))
                }
              >
                <SelectTrigger id="environment">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {ENVIRONMENT_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="pot-type">Tipo di gestione</Label>
              <Select
                value={form.potType}
                onValueChange={(value) =>
                  setForm((current) => ({
                    ...current,
                    potType: value as PlantFormState["potType"],
                  }))
                }
              >
                <SelectTrigger id="pot-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {POT_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="exposure">Esposizione o punto luce</Label>
            <Input
              id="exposure"
              value={form.exposure}
              onChange={(event) =>
                setForm((current) => ({ ...current, exposure: event.target.value }))
              }
              placeholder="Es. sud-est, finestra luminosa, mezz'ombra"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="grid gap-2">
              <Label htmlFor="height">Altezza (cm)</Label>
              <Input
                id="height"
                type="number"
                min={1}
                max={999}
                value={form.heightCm}
                onChange={(event) =>
                  setForm((current) => ({ ...current, heightCm: event.target.value }))
                }
                placeholder="Es. 35"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="spread">Larghezza (cm)</Label>
              <Input
                id="spread"
                type="number"
                min={1}
                max={999}
                value={form.spreadCm}
                onChange={(event) =>
                  setForm((current) => ({ ...current, spreadCm: event.target.value }))
                }
                placeholder="Es. 28"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="pot-diameter">Diametro vaso (cm)</Label>
              <Input
                id="pot-diameter"
                type="number"
                min={1}
                max={999}
                value={form.potDiameterCm}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    potDiameterCm: event.target.value,
                  }))
                }
                placeholder="Es. 18"
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="notes">Note utili</Label>
            <Textarea
              id="notes"
              value={form.notes}
              onChange={(event) =>
                setForm((current) => ({ ...current, notes: event.target.value }))
              }
              placeholder="Vaso grande, terreno drenante, ultime osservazioni..."
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
            Annulla
          </Button>
          <Button onClick={handleAddPlant} disabled={isPending}>
            <Plus data-icon="inline-start" />
            Salva pianta
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function renderMeasurementsDialog(_props: {
  isOpen: boolean;
  onOpenChange: (value: boolean) => void;
  measurementsForm: PlantMeasurementsState | null;
  setMeasurementsForm: Dispatch<SetStateAction<PlantMeasurementsState | null>>;
  handleSaveMeasurements: () => void;
  isPending: boolean;
}) {
  const {
    isOpen,
    onOpenChange,
    measurementsForm,
    setMeasurementsForm,
    handleSaveMeasurements,
    isPending,
  } = _props;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Modifica scheda pianta</DialogTitle>
          <DialogDescription>
            Qui puoi rinominare la pianta, aggiornare le misure e salvare note che
            restano in memoria per tutti gli utenti del sito.
          </DialogDescription>
        </DialogHeader>

        {measurementsForm ? (
          <div className="grid gap-4">
            <div className="rounded-[1.2rem] border border-border/70 bg-secondary/35 px-4 py-3 text-sm text-muted-foreground">
              Scheda:{" "}
              <span className="font-medium text-foreground">
                {measurementsForm.plantName}
              </span>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="edit-name">Nome scheda</Label>
                <Input
                  id="edit-name"
                  value={measurementsForm.customName}
                  onChange={(event) =>
                    setMeasurementsForm((current) =>
                      current ? { ...current, customName: event.target.value } : current,
                    )
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-exposure">Esposizione</Label>
                <Input
                  id="edit-exposure"
                  value={measurementsForm.exposure}
                  onChange={(event) =>
                    setMeasurementsForm((current) =>
                      current ? { ...current, exposure: event.target.value } : current,
                    )
                  }
                  placeholder="Es. sud-est, finestra luminosa"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="grid gap-2">
                <Label htmlFor="edit-height">Altezza (cm)</Label>
                <Input
                  id="edit-height"
                  type="number"
                  min={1}
                  max={999}
                  value={measurementsForm.heightCm}
                  onChange={(event) =>
                    setMeasurementsForm((current) =>
                      current ? { ...current, heightCm: event.target.value } : current,
                    )
                  }
                  placeholder="Es. 35"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-spread">Larghezza (cm)</Label>
                <Input
                  id="edit-spread"
                  type="number"
                  min={1}
                  max={999}
                  value={measurementsForm.spreadCm}
                  onChange={(event) =>
                    setMeasurementsForm((current) =>
                      current ? { ...current, spreadCm: event.target.value } : current,
                    )
                  }
                  placeholder="Es. 28"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-pot-diameter">Diametro vaso (cm)</Label>
                <Input
                  id="edit-pot-diameter"
                  type="number"
                  min={1}
                  max={999}
                  value={measurementsForm.potDiameterCm}
                  onChange={(event) =>
                    setMeasurementsForm((current) =>
                      current
                        ? { ...current, potDiameterCm: event.target.value }
                        : current,
                    )
                  }
                  placeholder="Es. 18"
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="edit-notes">Note</Label>
              <Textarea
                id="edit-notes"
                value={measurementsForm.notes}
                onChange={(event) =>
                  setMeasurementsForm((current) =>
                    current ? { ...current, notes: event.target.value } : current,
                  )
                }
                placeholder="Osservazioni utili per irrigazione, crescita o posizione"
              />
            </div>
          </div>
        ) : null}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Chiudi
          </Button>
          <Button
            onClick={handleSaveMeasurements}
            disabled={isPending || !measurementsForm}
          >
            Salva dettagli
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function InfoLine({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: ReactNode;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-1 rounded-full bg-primary/10 p-2 text-primary">{icon}</div>
      <div>
        <p className="text-sm font-medium text-foreground">{label}</p>
        <p>{value}</p>
      </div>
    </div>
  );
}

function nightShelterVariant(status: "bring-inside" | "watch" | "outside-ok") {
  if (status === "bring-inside") {
    return "warning" as const;
  }

  if (status === "watch") {
    return "default" as const;
  }

  return "success" as const;
}

function MeasurementLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1rem] bg-secondary/30 px-3 py-2">
      <p className="text-xs uppercase tracking-[0.18em]">{label}</p>
      <p className="mt-1 font-medium text-foreground">{value}</p>
    </div>
  );
}

function PlantingColumn({
  title,
  items,
  accent,
}: {
  title: string;
  items: string[];
  accent: string;
}) {
  return (
    <div
      className={`rounded-[1.3rem] border border-border/70 bg-gradient-to-br ${accent} px-4 py-4`}
    >
      <p className="text-sm font-medium text-foreground">{title}</p>
      <div className="mt-3 flex flex-col gap-2">
        {items.map((item) => (
          <div
            key={`${title}-${item}`}
            className="rounded-[1rem] bg-background/80 px-3 py-2 text-sm leading-6 text-muted-foreground"
          >
            {item}
          </div>
        ))}
      </div>
    </div>
  );
}

function MiniPlantingBlock({
  label,
  items,
}: {
  label: string;
  items: PlantingCalendarEntry["seeds"];
}) {
  return (
    <div className="rounded-[1rem] bg-background/75 px-3 py-3">
      <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </p>
      <div className="mt-2 flex flex-wrap gap-2">
        {items.map((item) => (
          <Badge key={`${label}-${item}`} variant="subtle">
            {item}
          </Badge>
        ))}
      </div>
    </div>
  );
}

function hasMeasurementsSaved(plant: DashboardPlant) {
  return Boolean(plant.heightCm || plant.spreadCm || plant.potDiameterCm);
}

function usesCustomPlantName(plant: DashboardPlant) {
  return normalizePlantName(plant.customName) !== normalizePlantName(plant.profile.name);
}

function normalizePlantName(value: string) {
  return value.trim().toLowerCase();
}

function getNextPlantFormStateForSpecies(
  current: PlantFormState,
  speciesKey: SpeciesKey,
): PlantFormState {
  const currentDefaultName = getSpeciesLabel(current.speciesKey);
  const nextDefaultName = getSpeciesLabel(speciesKey);
  const shouldReplaceName =
    !current.customName.trim() || current.customName.trim() === currentDefaultName;

  return {
    ...current,
    speciesKey,
    customName: shouldReplaceName ? nextDefaultName : current.customName,
    potType: speciesKey === "pothos-acqua" ? "acquacoltura" : current.potType,
  };
}

function getPlantNamePlaceholder(speciesKey: SpeciesKey) {
  const defaultName = getSpeciesLabel(speciesKey);
  return `Es. ${defaultName} del soggiorno`;
}

function formatMeasurement(value?: number) {
  return value ? `${value} cm` : "da inserire";
}

function priorityVariant(priority: "urgent" | "medium" | "low") {
  if (priority === "urgent") {
    return "warning" as const;
  }

  if (priority === "medium") {
    return "default" as const;
  }

  return "subtle" as const;
}

function priorityLabel(priority: "urgent" | "medium" | "low") {
  if (priority === "urgent") {
    return "Urgente";
  }

  if (priority === "medium") {
    return "Oggi";
  }

  return "Promemoria";
}

function irrigationLabel(bias: "high" | "medium" | "low") {
  if (bias === "high") {
    return "alto";
  }

  if (bias === "medium") {
    return "medio";
  }

  return "basso";
}

function isBackupNewer(backupUpdatedAt?: string, currentUpdatedAt?: string) {
  if (!backupUpdatedAt || !currentUpdatedAt) {
    return false;
  }

  const backupTime = Date.parse(backupUpdatedAt);
  const currentTime = Date.parse(currentUpdatedAt);

  if (Number.isNaN(backupTime) || Number.isNaN(currentTime)) {
    return false;
  }

  return backupTime > currentTime;
}
