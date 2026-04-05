"use client";

import {
  useDeferredValue,
  useEffect,
  useState,
  useTransition,
} from "react";
import type { Dispatch, ReactNode, SetStateAction } from "react";
import {
  CheckCircle2,
  CloudSun,
  Droplets,
  Leaf,
  MapPin,
  Plus,
  Sprout,
  Trees,
} from "lucide-react";
import { PlantIllustration } from "@/components/plant-illustration";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { ENVIRONMENT_OPTIONS, POT_OPTIONS, SPECIES_OPTIONS } from "@/lib/plant-profiles";
import type { DashboardState, EnvironmentKey, SpeciesKey } from "@/lib/orto-types";
import { formatDate, formatDateTime } from "@/lib/utils";

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
};

const INITIAL_FORM: PlantFormState = {
  speciesKey: "custom",
  customName: "",
  environment: "casa",
  quantity: 1,
  potType: "vaso",
  exposure: "",
  notes: "",
};

export function DashboardShell({ initialState }: DashboardShellProps) {
  const [dashboard, setDashboard] = useState(initialState);
  const [activeTab, setActiveTab] = useState<"tutte" | EnvironmentKey>("tutte");
  const [activePerson, setActivePerson] = useState("Persona 1");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [form, setForm] = useState<PlantFormState>(INITIAL_FORM);
  const [notice, setNotice] = useState<string | null>(null);
  const [pendingTaskId, setPendingTaskId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const deferredTab = useDeferredValue(activeTab);

  useEffect(() => {
    const stored = window.localStorage.getItem("orto-active-person");

    if (stored) {
      setActivePerson(stored);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem("orto-active-person", activePerson);
  }, [activePerson]);

  const plants =
    deferredTab === "tutte"
      ? dashboard.plants
      : dashboard.plants.filter((plant) => plant.environment === deferredTab);

  const tasksByEnvironment = {
    balcone: dashboard.tasksToday.filter((task) => task.environment === "balcone").length,
    casa: dashboard.tasksToday.filter((task) => task.environment === "casa").length,
  };

  function handleToggleTask(taskId: string, plantId: string, taskType: string, done: boolean) {
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
              actor: activePerson,
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

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="relative isolate overflow-hidden">
        <div className="pointer-events-none absolute inset-0 orchard-mesh opacity-80" />
        <div className="pointer-events-none absolute left-[-12rem] top-[-12rem] size-[26rem] rounded-full bg-[radial-gradient(circle,_rgba(133,192,120,0.28)_0%,_rgba(133,192,120,0)_70%)] blur-3xl" />
        <div className="pointer-events-none absolute bottom-[-12rem] right-[-8rem] size-[28rem] rounded-full bg-[radial-gradient(circle,_rgba(206,228,182,0.42)_0%,_rgba(206,228,182,0)_70%)] blur-3xl" />

        <div className="mx-auto flex min-h-screen w-full max-w-[1480px] flex-col gap-6 px-4 py-4 sm:px-6 lg:px-8 lg:py-8">
          {renderHeader({
            dashboard,
            activePerson,
            setActivePerson,
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

          {renderPlantSections({
            dashboard,
            activeTab,
            setActiveTab,
            plants,
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
    </div>
  );
}

function renderHeader(_props: {
  dashboard: DashboardState;
  activePerson: string;
  setActivePerson: (value: string) => void;
  setIsDialogOpen: (value: boolean) => void;
  notice: string | null;
  tasksByEnvironment: { balcone: number; casa: number };
}) {
  const {
    dashboard,
    activePerson,
    setActivePerson,
    setIsDialogOpen,
    notice,
    tasksByEnvironment,
  } = _props;

  return (
    <header className="glass-panel flex flex-col gap-5 rounded-[2rem] px-5 py-5 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-4xl">
          <div className="flex flex-wrap items-center gap-3">
            <Badge variant="success">Milano live</Badge>
            <Badge variant="subtle">Dashboard quotidiana</Badge>
            <Badge variant={dashboard.storage.shared ? "default" : "warning"}>
              {dashboard.storage.label}
            </Badge>
          </div>

          <div className="mt-4 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-muted-foreground">oRTO</p>
              <h1 className="mt-2 max-w-3xl text-4xl font-semibold tracking-[-0.06em] sm:text-5xl">
                Casa e balcone nello stesso quadro operativo.
              </h1>
            </div>
          </div>

          <p className="mt-4 max-w-3xl text-sm leading-7 text-muted-foreground sm:text-base">
            {dashboard.weather.summary} Oggi il balcone riceve attenzione speciale
            sull&apos;acqua, mentre dentro casa la dashboard usa intervalli specie-specifici
            e tiene traccia di chi ha già fatto cosa.
          </p>
        </div>

        <div className="flex w-full max-w-[26rem] flex-col gap-4 rounded-[1.6rem] border border-border/70 bg-background/70 p-4">
          <div className="flex items-center gap-3">
            <Avatar className="size-11 border border-border/60">
              <AvatarFallback>{getInitials(activePerson)}</AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <Label htmlFor="active-person">Operatore attivo</Label>
              <Input
                id="active-person"
                value={activePerson}
                onChange={(event) => setActivePerson(event.target.value || "Persona 1")}
                placeholder="Es. Matteo"
                className="mt-2"
              />
            </div>
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
                {dashboard.stats.completedCount} già segnati come fatti
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
                {dashboard.stats.environments.casa} in casa, {dashboard.stats.environments.balcone} fuori
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

      {!dashboard.storage.shared ? (
        <div className="rounded-[1.35rem] border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-900">
          {dashboard.storage.note}
        </div>
      ) : null}

      {notice ? (
        <div className="rounded-[1.35rem] border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-900">
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
                  Priorità di oggi
                </span>
              </div>
              <CardTitle className="mt-2">Checklist condivisa</CardTitle>
              <CardDescription>
                Segna i task come fatti: il nome dell&apos;operatore resta visibile anche
                all&apos;altra persona.
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
                      className={`group flex cursor-pointer flex-col gap-3 rounded-[1.5rem] border px-4 py-4 transition ${
                        task.isDone
                          ? "border-primary/20 bg-primary/10"
                          : "border-border/70 bg-background/70 hover:border-primary/35 hover:bg-primary/5"
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
                          <div className="flex flex-col gap-2 lg:flex-row lg:items-start lg:justify-between">
                            <div className="min-w-0">
                              <div className="flex flex-wrap items-center gap-2">
                                <p
                                  className={`text-base font-semibold tracking-[-0.03em] ${
                                    task.isDone ? "text-foreground/60 line-through" : ""
                                  }`}
                                >
                                  {task.title}
                                </p>
                                <Badge
                                  variant={task.isDone ? "success" : priorityVariant(task.priority)}
                                >
                                  {task.isDone ? "Fatto" : priorityLabel(task.priority)}
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
                              <span className="font-medium">Suggerimento:</span> {task.recommendation}
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
                              <span>
                                fatto da {task.completedBy} il {formatDateTime(task.completedAt)}
                              </span>
                            ) : null}
                          </div>
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
  dashboard: DashboardState;
  activeTab: "tutte" | EnvironmentKey;
  setActiveTab: (value: "tutte" | EnvironmentKey) => void;
  plants: DashboardState["plants"];
}) {
  const { activeTab, setActiveTab, plants } = _props;

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
              Ogni scheda combina routine, segnali da controllare, ultima azione registrata e
              fonte online.
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
              {plants.map((plant) => (
                <Card key={plant.id} className="overflow-hidden rounded-[1.8rem] border-border/70">
                  <CardContent className="px-0 py-0">
                    <div className="relative overflow-hidden rounded-t-[1.8rem] bg-[linear-gradient(180deg,rgba(227,241,222,0.9),rgba(245,250,242,0.75))] px-5 pt-5">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <Badge variant="outline">{plant.environmentLabel}</Badge>
                            <Badge variant="subtle">{plant.quantity} unità</Badge>
                            {plant.potType === "acquacoltura" ? (
                              <Badge variant="warning">Acquacoltura</Badge>
                            ) : null}
                          </div>
                          <h3 className="mt-3 text-2xl font-semibold tracking-[-0.04em]">
                            {plant.displayName}
                          </h3>
                          <p className="mt-1 text-sm text-muted-foreground">
                            {plant.profile.scientificName}
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
                            <span className="font-medium text-foreground">Ultimo cambio acqua:</span>{" "}
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
                        {plant.notes ? (
                          <p>
                            <span className="font-medium text-foreground">Note:</span> {plant.notes}
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
                          {plant.profile.watchouts.join(" • ")}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
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
            Salva specie, ambiente e note essenziali: la dashboard la renderà subito persistente.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="species">Specie</Label>
            <Select
              value={form.speciesKey}
              onValueChange={(value) =>
                setForm((current) => ({
                  ...current,
                  speciesKey: value as SpeciesKey,
                  potType: value === "pothos-acqua" ? "acquacoltura" : current.potType,
                }))
              }
            >
              <SelectTrigger id="species">
                <SelectValue placeholder="Scegli una specie" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {SPECIES_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="name">Nome scheda</Label>
              <Input
                id="name"
                value={form.customName}
                onChange={(event) =>
                  setForm((current) => ({ ...current, customName: event.target.value }))
                }
                placeholder="Es. Ficus del salotto"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="quantity">Quantità</Label>
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

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
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
