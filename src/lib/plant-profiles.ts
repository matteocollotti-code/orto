import { addDays, buildTaskId, getRomeDate, toCompletionTimestamp } from "@/lib/date-utils";
import type {
  Plant,
  PlantProfile,
  PlantTaskRule,
  SpeciesKey,
  StoreState,
  TaskCompletion,
  TaskPriority,
} from "@/lib/orto-types";

type SpeciesOption = {
  value: SpeciesKey;
  label: string;
};

type SpeciesGroup = {
  label: string;
  options: SpeciesOption[];
};

type ScheduledTaskDefinition = {
  intervalDays: number;
  label?: string;
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

type ProfileDefinition = Omit<PlantProfile, "source" | "tasks"> & {
  source: PlantProfile["source"];
  water: ScheduledTaskDefinition;
  fertilize?: ScheduledTaskDefinition;
  prune?: ScheduledTaskDefinition;
  harvest?: ScheduledTaskDefinition;
  extraTasks?: PlantTaskRule[];
};

const GROWING_MONTHS = [3, 4, 5, 6, 7, 8, 9];
const BALCONY_MONTHS = [3, 4, 5, 6, 7, 8, 9, 10];
const FLOWER_MONTHS = [3, 4, 5, 6];
const BULB_MONTHS = [3, 4, 5, 9, 10];

export const SPECIES_GROUPS: SpeciesGroup[] = [
  {
    label: "Balcone: aromatiche",
    options: [
      { value: "basilico", label: "Basilico" },
      { value: "salvia", label: "Salvia" },
      { value: "rosmarino", label: "Rosmarino" },
      { value: "lavanda", label: "Lavanda" },
      { value: "menta", label: "Menta" },
      { value: "timo", label: "Timo" },
      { value: "origano", label: "Origano" },
      { value: "prezzemolo", label: "Prezzemolo" },
      { value: "erba-cipollina", label: "Erba cipollina" },
    ],
  },
  {
    label: "Balcone: orto e fiori",
    options: [
      { value: "pomodoro", label: "Pomodoro" },
      { value: "peperoncino", label: "Peperoncino" },
      { value: "fragola", label: "Fragola" },
      { value: "limone", label: "Limone" },
      { value: "gelsomino", label: "Gelsomino" },
      { value: "geranio", label: "Geranio" },
      { value: "bulbi-fiori", label: "Bulbi da fiore" },
      { value: "fiori-seminati", label: "Fiori seminati" },
    ],
  },
  {
    label: "Casa: tropicali e fogliame",
    options: [
      { value: "pothos", label: "Pothos" },
      { value: "pothos-acqua", label: "Pothos in acquacoltura" },
      { value: "monstera", label: "Monstera" },
      { value: "filodendro", label: "Filodendro" },
      { value: "spatifillo", label: "Spatifillo" },
      { value: "aglaonema", label: "Aglaonema" },
      { value: "calathea-orbifolia", label: "Calathea orbifolia" },
      { value: "anthurium", label: "Anthurium" },
      { value: "pilea", label: "Pilea" },
      { value: "hoya", label: "Hoya" },
      { value: "peperomia", label: "Peperomia" },
      { value: "falangio", label: "Falangio" },
      { value: "dracena", label: "Dracena" },
      { value: "ficus-elastica", label: "Ficus elastica" },
      { value: "ficus-lyrata", label: "Ficus lyrata" },
      { value: "caffe", label: "Caffe" },
      { value: "avocado", label: "Avocado" },
    ],
  },
  {
    label: "Casa: resistenti e succulente",
    options: [
      { value: "sansevieria", label: "Sansevieria" },
      { value: "zamioculcas", label: "Zamioculcas" },
      { value: "aloe-vera", label: "Aloe vera" },
      { value: "crassula", label: "Crassula" },
      { value: "tradescantia", label: "Tradescantia" },
    ],
  },
  {
    label: "Generiche",
    options: [{ value: "custom", label: "Pianta personalizzata" }],
  },
];

export const SPECIES_OPTIONS = SPECIES_GROUPS.flatMap((group) => group.options);

export const ENVIRONMENT_OPTIONS = [
  { value: "casa", label: "Casa" },
  { value: "balcone", label: "Balcone" },
] as const;

export const POT_OPTIONS = [
  { value: "vaso", label: "Vaso" },
  { value: "terra", label: "Terra" },
  { value: "acquacoltura", label: "Acquacoltura" },
] as const;

const PLANT_PROFILES = {
  basilico: createProfile({
    key: "basilico",
    name: "Basilico",
    scientificName: "Ocimum basilicum",
    environmentLabel: "Balcone",
    sunlight: "Luce piena e posizione calda, soleggiata e riparata.",
    watering:
      "Terriccio leggermente umido e controlli frequenti in vaso, soprattutto con giornate asciutte.",
    feeding:
      "Fertilizzante liquido leggero ogni 2-3 settimane in fase di crescita e raccolta intensa.",
    pruning:
      "Pizzica spesso le punte per ritardare la fioritura e mantenere la pianta compatta.",
    needs: ["calore", "sole", "raccolta regolare", "vaso drenante"],
    watchouts: ["soffre il freddo", "in vaso si asciuga in fretta", "teme ristagni"],
    source: {
      label: "RHS Basil Guide",
      url: "https://www.rhs.org.uk/herbs/basil/grow-your-own",
    },
    water: {
      intervalDays: 1,
      description: "Mantieni il terriccio appena umido, senza ristagni.",
      priority: "urgent",
      weatherSensitive: true,
      dryWeatherReduction: 0,
      baseAmountMl: [150, 220],
      dueOnFirstLoad: true,
    },
    fertilize: {
      intervalDays: 21,
      description: "Un concime leggero aiuta nuova crescita e raccolti continui.",
      priority: "low",
      months: BALCONY_MONTHS,
    },
    harvest: {
      intervalDays: 7,
      label: "Pizzica le cime",
      description: "Raccogli le punte apicali per mantenere il basilico folto.",
      priority: "medium",
      months: BALCONY_MONTHS,
    },
    illustrationTone: { leaf: "#4e9c58", accent: "#8ed09b", pot: "#ead7bf" },
  }),
  salvia: createProfile({
    key: "salvia",
    name: "Salvia",
    scientificName: "Salvia officinalis",
    environmentLabel: "Balcone",
    sunlight: "Pieno sole, posizione riparata e suolo molto drenante.",
    watering:
      "Piu asciutta che umida: annaffia solo quando il substrato si e asciugato bene in superficie.",
    feeding: "Concime leggero e non troppo frequente in primavera-estate.",
    pruning:
      "Raccogli le foglie giovani e spunta dopo la fioritura per mantenerla compatta.",
    needs: ["sole", "drenaggio", "aria", "potature leggere"],
    watchouts: ["ristagni", "ombra prolungata", "substrato pesante"],
    source: {
      label: "RHS Sage Guide",
      url: "https://www.rhs.org.uk/herbs/sage/grow-your-own",
    },
    water: {
      intervalDays: 5,
      description: "Bagna solo se il vaso e asciutto in alto; la salvia tollera un po di siccita.",
      priority: "medium",
      weatherSensitive: true,
      dryWeatherReduction: 1,
      baseAmountMl: [250, 350],
      dueOnFirstLoad: true,
    },
    prune: {
      intervalDays: 50,
      label: "Spunta",
      description: "Una piccola spuntatura mantiene la salvia piu fitta.",
      priority: "low",
      months: [4, 5, 6, 9],
    },
    illustrationTone: { leaf: "#7c9177", accent: "#b6c0a2", pot: "#d9cfbf" },
  }),
  rosmarino: createProfile({
    key: "rosmarino",
    name: "Rosmarino",
    scientificName: "Salvia rosmarinus",
    environmentLabel: "Balcone",
    sunlight: "Molto sole e terriccio libero da ristagni.",
    watering:
      "Pianta mediterranea: in vaso si controlla nei periodi caldi, ma va lasciata respirare tra un'annaffiatura e l'altra.",
    feeding: "Poco concime, solo se la crescita rallenta nel periodo vegetativo.",
    pruning: "Taglio annuale leggero dopo la fioritura per mantenerlo compatto.",
    needs: ["sole", "substrato drenante", "potature leggere"],
    watchouts: ["radici bagnate a lungo", "sottovaso pieno", "ombra fitta"],
    source: {
      label: "RHS Rosemary Guide",
      url: "https://www.rhs.org.uk/herbs/rosemary/grow-your-own",
    },
    water: {
      intervalDays: 6,
      description: "Bagna soltanto se il vaso e ben asciutto in superficie.",
      priority: "medium",
      weatherSensitive: true,
      dryWeatherReduction: 1,
      baseAmountMl: [220, 320],
      dueOnFirstLoad: true,
    },
    prune: {
      intervalDays: 60,
      label: "Spunta",
      description: "Un taglio leggero dopo la fioritura lo mantiene ordinato.",
      priority: "low",
      months: [4, 5, 6, 9],
    },
    illustrationTone: { leaf: "#4d7d6d", accent: "#93b6a8", pot: "#ddd6c6" },
  }),
  lavanda: createProfile({
    key: "lavanda",
    name: "Lavanda",
    scientificName: "Lavandula angustifolia",
    environmentLabel: "Balcone",
    sunlight: "Pieno sole, aria e terriccio molto drenante.",
    watering:
      "Preferisce irrigazioni distanziate: bagna solo quando il vaso si e asciugato bene.",
    feeding: "Concime leggero in primavera, senza esagerare con l'azoto.",
    pruning:
      "Spunta regolarmente i fiori finiti e fai potature leggere per mantenere la cupola compatta.",
    needs: ["sole", "drenaggio", "aria", "substrato leggero"],
    watchouts: ["ristagni", "ombra umida", "potature drastiche sul legno vecchio"],
    source: {
      label: "RHS Lavender Guide",
      url: "https://www.rhs.org.uk/plants/lavender",
    },
    water: {
      intervalDays: 6,
      description: "Irriga con moderazione e lascia asciugare bene il terriccio tra un intervento e l'altro.",
      priority: "medium",
      weatherSensitive: true,
      dryWeatherReduction: 1,
      baseAmountMl: [240, 320],
      dueOnFirstLoad: true,
    },
    fertilize: {
      intervalDays: 45,
      description: "Una dose molto leggera basta per sostenere il cespo senza renderlo molle.",
      priority: "low",
      months: [3, 4, 5],
    },
    prune: {
      intervalDays: 45,
      label: "Pulisci e spunta",
      description: "Togli gli steli sfioriti e mantieni la pianta ariosa.",
      priority: "medium",
      months: [5, 6, 7, 8, 9],
    },
    illustrationTone: {
      leaf: "#6f8d74",
      accent: "#b9a2db",
      pot: "#ded4c7",
      bloom: "#dbc6f1",
    },
  }),
  menta: createProfile({
    key: "menta",
    name: "Menta",
    scientificName: "Mentha",
    environmentLabel: "Balcone",
    sunlight: "Mezz'ombra luminosa o sole del mattino, con substrato fresco.",
    watering:
      "La menta gradisce umidita piu costante rispetto alle aromatiche mediterranee, soprattutto in vaso.",
    feeding: "Concime leggero ma regolare nei mesi di crescita piu intensa.",
    pruning: "Raccogli e spunta spesso per mantenerla piena e ritardare la fioritura.",
    needs: ["vaso fresco", "controlli frequenti", "raccolta regolare"],
    watchouts: ["vaso troppo secco", "sole forte tutto il giorno", "crescita invadente"],
    source: {
      label: "RHS Mint Guide",
      url: "https://www.rhs.org.uk/herbs/mint/grow-your-own",
    },
    water: {
      intervalDays: 2,
      description: "Mantieni il terriccio appena umido e controlla spesso nei giorni secchi.",
      priority: "urgent",
      weatherSensitive: true,
      dryWeatherReduction: 1,
      baseAmountMl: [220, 320],
      dueOnFirstLoad: true,
    },
    fertilize: {
      intervalDays: 21,
      description: "Una dose moderata sostiene ricaccio e foglie tenere.",
      priority: "low",
      months: BALCONY_MONTHS,
    },
    harvest: {
      intervalDays: 10,
      label: "Raccogli",
      description: "Taglia le cime per stimolare nuovi getti laterali.",
      priority: "medium",
      months: BALCONY_MONTHS,
    },
    illustrationTone: { leaf: "#4a945c", accent: "#a7deb6", pot: "#e7d8c5" },
  }),
  timo: createProfile({
    key: "timo",
    name: "Timo",
    scientificName: "Thymus vulgaris",
    environmentLabel: "Balcone",
    sunlight: "Pieno sole e terriccio molto drenante.",
    watering:
      "Pianta sobria: bagna poco ma con regolarita nei periodi piu asciutti, sempre dopo un controllo del vaso.",
    feeding: "Concime leggero una o due volte nella stagione di crescita, se serve.",
    pruning: "Spunta dopo la fioritura e raccogli spesso i rametti teneri.",
    needs: ["sole", "drenaggio", "vaso arioso"],
    watchouts: ["ristagni", "ombra umida", "legno vecchio molto fitto"],
    source: {
      label: "RHS Thyme Guide",
      url: "https://www.rhs.org.uk/herbs/thyme/grow-your-own",
    },
    water: {
      intervalDays: 7,
      description: "Irriga con moderazione quando la superficie del substrato e asciutta.",
      priority: "medium",
      weatherSensitive: true,
      dryWeatherReduction: 1,
      baseAmountMl: [180, 260],
      dueOnFirstLoad: true,
    },
    harvest: {
      intervalDays: 14,
      label: "Raccogli",
      description: "Taglia i rametti giovani per mantenerlo fitto e produttivo.",
      priority: "low",
      months: BALCONY_MONTHS,
    },
    illustrationTone: { leaf: "#6b8e62", accent: "#b8d0aa", pot: "#e3d7c7" },
  }),
  origano: createProfile({
    key: "origano",
    name: "Origano",
    scientificName: "Origanum vulgare",
    environmentLabel: "Balcone",
    sunlight: "Molto sole e vaso drenante.",
    watering:
      "Si gestisce come una mediterranea leggera: acqua solo dopo che il terriccio si e alleggerito.",
    feeding: "Concime leggero in stagione, senza forzare troppo la vegetazione.",
    pruning: "Spunta e raccogli le cime per mantenere il cespo giovane.",
    needs: ["sole", "drenaggio", "raccolta regolare"],
    watchouts: ["eccesso d'acqua", "ombra lunga", "vaso sempre bagnato"],
    source: {
      label: "RHS Oregano Guide",
      url: "https://www.rhs.org.uk/herbs/oregano/grow-your-own",
    },
    water: {
      intervalDays: 5,
      description: "Bagna con moderazione e lascia respirare il vaso tra un giro e l'altro.",
      priority: "medium",
      weatherSensitive: true,
      dryWeatherReduction: 1,
      baseAmountMl: [200, 280],
      dueOnFirstLoad: true,
    },
    harvest: {
      intervalDays: 12,
      label: "Raccogli",
      description: "Recidi i getti piu teneri per favorire nuova vegetazione profumata.",
      priority: "low",
      months: BALCONY_MONTHS,
    },
    illustrationTone: { leaf: "#6d9c63", accent: "#c2d9a3", pot: "#e0d5c8" },
  }),
  prezzemolo: createProfile({
    key: "prezzemolo",
    name: "Prezzemolo",
    scientificName: "Petroselinum crispum",
    environmentLabel: "Balcone",
    sunlight: "Molta luce o sole del mattino, meglio con vaso mai completamente secco.",
    watering:
      "Il substrato va tenuto fresco e leggermente umido, soprattutto in contenitori piccoli.",
    feeding: "Concime leggero a intervalli regolari nei mesi di raccolta continua.",
    pruning: "Raccogli i gambi esterni e lascia il cuore centrale libero di ricacciare.",
    needs: ["luce abbondante", "umidita regolare", "raccolta esterna"],
    watchouts: ["vaso che asciuga del tutto", "caldo eccessivo senza acqua", "ristagni"],
    source: {
      label: "RHS Parsley Guide",
      url: "https://www.rhs.org.uk/herbs/parsley/grow-your-own",
    },
    water: {
      intervalDays: 2,
      description: "Controlla spesso e bagna con regolarita per evitare blocchi di crescita.",
      priority: "urgent",
      weatherSensitive: true,
      dryWeatherReduction: 1,
      baseAmountMl: [180, 260],
      dueOnFirstLoad: true,
    },
    fertilize: {
      intervalDays: 21,
      description: "Piccole dosi mantengono foglie tenere e ricaccio costante.",
      priority: "low",
      months: BALCONY_MONTHS,
    },
    harvest: {
      intervalDays: 10,
      label: "Raccogli",
      description: "Taglia i gambi esterni, non solo le foglie, per aiutare nuova crescita.",
      priority: "medium",
      months: BALCONY_MONTHS,
    },
    illustrationTone: { leaf: "#5ea15d", accent: "#abd68f", pot: "#e7dccb" },
  }),
  "erba-cipollina": createProfile({
    key: "erba-cipollina",
    name: "Erba cipollina",
    scientificName: "Allium schoenoprasum",
    environmentLabel: "Balcone",
    sunlight: "Sole o mezz'ombra luminosa, con buona aria intorno al cespo.",
    watering:
      "Terriccio fresco ma non zuppo, con controlli regolari nel pieno della stagione.",
    feeding: "Concime leggero in primavera-estate per sostenere nuovi getti.",
    pruning: "Taglia regolarmente le foglie piu esterne per stimolare il ricaccio.",
    needs: ["luce", "substrato fresco", "tagli regolari"],
    watchouts: ["vaso sempre fradicio", "bulbi compressi", "foglie vecchie non pulite"],
    source: {
      label: "RHS Chives Guide",
      url: "https://www.rhs.org.uk/herbs/chives/grow-your-own",
    },
    water: {
      intervalDays: 3,
      description: "Mantieni il vaso fresco, senza arrivare a saturazione continua.",
      priority: "medium",
      weatherSensitive: true,
      dryWeatherReduction: 1,
      baseAmountMl: [160, 220],
      dueOnFirstLoad: true,
    },
    fertilize: {
      intervalDays: 30,
      description: "Una dose leggera favorisce nuovi steli sottili e saporiti.",
      priority: "low",
      months: BALCONY_MONTHS,
    },
    harvest: {
      intervalDays: 14,
      label: "Taglia le foglie",
      description: "Recidi a pochi centimetri dal colletto per stimolare nuovo ricaccio.",
      priority: "medium",
      months: BALCONY_MONTHS,
    },
    illustrationTone: { leaf: "#75a75b", accent: "#c9d7a2", pot: "#e1d4c6" },
  }),
  pomodoro: createProfile({
    key: "pomodoro",
    name: "Pomodoro",
    scientificName: "Solanum lycopersicum",
    environmentLabel: "Balcone",
    sunlight: "Pieno sole, vaso capiente e supporto stabile.",
    watering:
      "Il pomodoro in vaso richiede acqua regolare e profonda, con grande attenzione alle giornate calde e ventose.",
    feeding:
      "Serve nutrimento costante in stagione produttiva, preferibilmente specifico per ortaggi da frutto.",
    pruning:
      "Controlla tutoraggio e pulizia dei germogli in base alla varieta, evitando interventi troppo aggressivi se e cespuglioso.",
    needs: ["sole pieno", "vaso capiente", "tutore", "acqua costante"],
    watchouts: ["collassi idrici", "foglie bagnate la sera", "ristagni lunghi"],
    source: {
      label: "RHS Tomato Guide",
      url: "https://www.rhs.org.uk/vegetables/tomatoes/grow-your-own",
    },
    water: {
      intervalDays: 1,
      description: "Controlla il vaso ogni giorno: se il terriccio si alleggerisce, irriga in profondita.",
      priority: "urgent",
      weatherSensitive: true,
      dryWeatherReduction: 0,
      baseAmountMl: [550, 850],
      dueOnFirstLoad: true,
    },
    fertilize: {
      intervalDays: 10,
      description: "Una routine frequente sostiene allegagione e sviluppo dei frutti.",
      priority: "medium",
      months: [4, 5, 6, 7, 8, 9],
    },
    prune: {
      intervalDays: 7,
      label: "Controlla tutoraggio",
      description: "Lega i fusti e rimuovi solo i getti superflui se la varieta lo richiede.",
      priority: "medium",
      months: [5, 6, 7, 8, 9],
    },
    illustrationTone: {
      leaf: "#4f8b50",
      accent: "#e25d4f",
      pot: "#deceb8",
      bloom: "#f7dd85",
    },
  }),
  peperoncino: createProfile({
    key: "peperoncino",
    name: "Peperoncino",
    scientificName: "Capsicum annuum",
    environmentLabel: "Balcone",
    sunlight: "Sole pieno, molto caldo e vaso ben drenante.",
    watering:
      "In piena produzione richiede irrigazioni regolari, ma non ama avere radici costantemente fradice.",
    feeding: "Concime per ortaggi da fiore e frutto a piccole dosi ma con continuita.",
    pruning:
      "Pulisci foglie rovinate e controlla l'equilibrio della chioma se carica di frutti.",
    needs: ["sole", "calore", "vaso drenante", "nutrimento costante"],
    watchouts: ["freddo", "sbalzi idrici", "ristagni"],
    source: {
      label: "RHS Chilli Pepper Guide",
      url: "https://www.rhs.org.uk/vegetables/chilli-pepper/grow-your-own",
    },
    water: {
      intervalDays: 2,
      description: "Mantieni il substrato leggermente umido senza lasciare il vaso in acqua.",
      priority: "urgent",
      weatherSensitive: true,
      dryWeatherReduction: 1,
      baseAmountMl: [320, 520],
      dueOnFirstLoad: true,
    },
    fertilize: {
      intervalDays: 14,
      description: "Una nutrizione regolare sostiene fioritura e maturazione dei frutti.",
      priority: "medium",
      months: [4, 5, 6, 7, 8, 9],
    },
    illustrationTone: {
      leaf: "#4f8c4d",
      accent: "#d94b41",
      pot: "#e0d2c2",
      bloom: "#fff4df",
    },
  }),
  fragola: createProfile({
    key: "fragola",
    name: "Fragola",
    scientificName: "Fragaria x ananassa",
    environmentLabel: "Balcone",
    sunlight: "Molto sole e vaso che dreni bene.",
    watering:
      "Le fragole in contenitore hanno bisogno di acqua regolare, soprattutto durante fioritura e sviluppo frutti.",
    feeding: "Concime per piante da frutto a dosi leggere durante la stagione produttiva.",
    pruning: "Rimuovi foglie secche, stoloni in eccesso e frutti rovinati.",
    needs: ["sole", "substrato fresco", "aria", "frutti puliti"],
    watchouts: ["substrato che secca del tutto", "frutti appoggiati sul bagnato", "ristagni"],
    source: {
      label: "RHS Strawberry Guide",
      url: "https://www.rhs.org.uk/fruit/strawberries/grow-your-own",
    },
    water: {
      intervalDays: 2,
      description: "Irriga con costanza e cerca di non far collassare il vaso tra un turno e l'altro.",
      priority: "medium",
      weatherSensitive: true,
      dryWeatherReduction: 1,
      baseAmountMl: [220, 360],
      dueOnFirstLoad: true,
    },
    fertilize: {
      intervalDays: 21,
      description: "Un apporto regolare sostiene nuovi fiori e frutti piu uniformi.",
      priority: "low",
      months: [3, 4, 5, 6, 7, 8],
    },
    harvest: {
      intervalDays: 4,
      label: "Controlla raccolta",
      description: "Raccogli i frutti maturi per evitare marciumi e alleggerire la pianta.",
      priority: "medium",
      months: [4, 5, 6, 7, 8],
    },
    illustrationTone: {
      leaf: "#4d8c4a",
      accent: "#db4a56",
      pot: "#dfd4c3",
      bloom: "#fff6ef",
    },
  }),
  limone: createProfile({
    key: "limone",
    name: "Limone",
    scientificName: "Citrus x limon",
    environmentLabel: "Balcone",
    sunlight: "Sole pieno e posizione riparata; meglio all'aperto nella bella stagione.",
    watering:
      "In estate va controllato spesso: terriccio appena umido, mai fradicio, con drenaggio ottimo.",
    feeding: "Concime specifico per agrumi dalla primavera all'inizio dell'autunno.",
    pruning: "Potature leggere di contenimento e rimozione dei rami secchi.",
    needs: ["sole", "drenaggio", "umidita moderata", "nutrimento regolare"],
    watchouts: ["radici sensibili ai ristagni", "aria secca indoor", "freddo intenso"],
    source: {
      label: "RHS Citrus Guide",
      url: "https://www.rhs.org.uk/fruit/citrus/grow-your-own",
    },
    water: {
      intervalDays: 3,
      description: "Con temperature in aumento il limone richiede irrigazioni piu frequenti.",
      priority: "urgent",
      weatherSensitive: true,
      dryWeatherReduction: 1,
      baseAmountMl: [700, 1000],
      dueOnFirstLoad: true,
    },
    fertilize: {
      intervalDays: 21,
      description: "Usa un fertilizzante per agrumi durante la crescita attiva.",
      priority: "medium",
      months: [3, 4, 5, 6, 7, 8, 9, 10],
    },
    prune: {
      intervalDays: 60,
      label: "Pota leggermente",
      description: "Togli secco e rami disordinati per mantenere forma e aria.",
      priority: "low",
      months: [3, 4, 9],
    },
    illustrationTone: {
      leaf: "#397a43",
      accent: "#f0d348",
      pot: "#d7d2bb",
      bloom: "#fff7d6",
    },
  }),
  gelsomino: createProfile({
    key: "gelsomino",
    name: "Gelsomino",
    scientificName: "Jasminum officinale",
    environmentLabel: "Balcone",
    sunlight: "Sole o mezz'ombra luminosa, in posizione calda e ariosa.",
    watering:
      "Gradisce umidita moderata e regolare, senza lasciare il vaso zuppo troppo a lungo.",
    feeding: "Concime in primavera e in estate per sostenere foglie e fiori.",
    pruning: "Pota e guida i getti dopo la fioritura per contenere la crescita.",
    needs: ["supporto", "sole o mezz'ombra", "umidita costante", "spazio per allargarsi"],
    watchouts: ["secchezza prolungata", "crescita disordinata", "poca luce"],
    source: {
      label: "Clemson Jasmine Fact Sheet",
      url: "https://hgic.clemson.edu/factsheet/jasmine/",
    },
    water: {
      intervalDays: 2,
      description: "Con giornate asciutte e miti tende ad avere sete piu spesso.",
      priority: "urgent",
      weatherSensitive: true,
      dryWeatherReduction: 1,
      baseAmountMl: [450, 650],
      dueOnFirstLoad: true,
    },
    fertilize: {
      intervalDays: 21,
      description: "Supporta la fase vegetativa e la futura fioritura.",
      priority: "medium",
      months: BALCONY_MONTHS,
    },
    illustrationTone: {
      leaf: "#5d8c46",
      accent: "#ffffff",
      pot: "#dbd1c1",
      bloom: "#fffdf7",
    },
  }),
  geranio: createProfile({
    key: "geranio",
    name: "Geranio",
    scientificName: "Pelargonium x hybridum",
    environmentLabel: "Balcone",
    sunlight: "Molto sole, aria e vaso ben drenante.",
    watering:
      "In vaso ama irrigazioni regolari ma sempre con terriccio che possa respirare tra un turno e l'altro.",
    feeding: "Concime per piante fiorite ogni 2-3 settimane in stagione.",
    pruning: "Elimina foglie e corolle sfiorite per prolungare la fioritura.",
    needs: ["sole", "drenaggio", "fiori puliti", "aria"],
    watchouts: ["ristagni", "foglie molto bagnate la sera", "ombreggiamento eccessivo"],
    source: {
      label: "NC State Geranium",
      url: "https://plants.ces.ncsu.edu/plants/pelargonium-x-hybridum/",
    },
    water: {
      intervalDays: 3,
      description: "Bagna bene e poi lascia alleggerire il vaso prima del turno successivo.",
      priority: "medium",
      weatherSensitive: true,
      dryWeatherReduction: 1,
      baseAmountMl: [260, 360],
      dueOnFirstLoad: true,
    },
    fertilize: {
      intervalDays: 18,
      description: "Una piccola routine regolare aiuta a tenere molti boccioli attivi.",
      priority: "medium",
      months: BALCONY_MONTHS,
    },
    prune: {
      intervalDays: 10,
      label: "Togli i fiori sfioriti",
      description: "Pulisci le infiorescenze finite per alleggerire la pianta e favorire nuovi fiori.",
      priority: "medium",
      months: [4, 5, 6, 7, 8, 9, 10],
    },
    illustrationTone: {
      leaf: "#4d8e57",
      accent: "#ee6f85",
      pot: "#e3d3c3",
      bloom: "#ffd8e0",
    },
  }),
  "bulbi-fiori": createProfile({
    key: "bulbi-fiori",
    name: "Bulbi da fiore",
    scientificName: "Bulbous flowering plants",
    environmentLabel: "Balcone",
    sunlight:
      "Molti bulbi da fiore gradiscono luce abbondante o sole leggero, con substrato drenante e vaso non fradicio.",
    watering:
      "Durante la crescita attiva il terriccio va tenuto appena umido; dopo la fioritura spesso si riduce gradualmente l'acqua.",
    feeding: "Un concime leggero in fase vegetativa puo aiutare fioritura e ricarica del bulbo.",
    pruning:
      "Rimuovi i fiori sfioriti, ma lascia il fogliame finche non ingiallisce per permettere al bulbo di ricaricarsi.",
    needs: ["drenaggio", "luce", "acqua moderata", "gestione stagionale"],
    watchouts: ["ristagni", "vaso sempre bagnato", "tagliare il fogliame troppo presto"],
    source: {
      label: "RHS Bulbs",
      url: "https://www.rhs.org.uk/plants/types/bulbs",
    },
    water: {
      intervalDays: 3,
      description: "Mantieni il substrato appena umido finche i bulbi sono in crescita attiva.",
      priority: "medium",
      weatherSensitive: true,
      dryWeatherReduction: 1,
      baseAmountMl: [220, 320],
      dueOnFirstLoad: true,
    },
    fertilize: {
      intervalDays: 30,
      description: "Un apporto leggero in stagione puo sostenere fiori e riserva del bulbo.",
      priority: "low",
      months: BULB_MONTHS,
    },
    prune: {
      intervalDays: 14,
      label: "Pulisci i fiori sfioriti",
      description:
        "Togli le corolle finite ma lascia il fogliame verde finche non si esaurisce da solo.",
      priority: "medium",
      months: FLOWER_MONTHS,
    },
    illustrationTone: {
      leaf: "#5f9a54",
      accent: "#f1c86c",
      pot: "#e3d6c7",
      bloom: "#fff2d8",
    },
  }),
  "fiori-seminati": createProfile({
    key: "fiori-seminati",
    name: "Fiori seminati",
    scientificName: "Flower seedlings",
    environmentLabel: "Balcone",
    sunlight:
      "Le piantine da seme hanno bisogno di molta luce e buona aria, ma all'inizio conviene evitare stress eccessivi.",
    watering:
      "Il terriccio va mantenuto uniformemente umido, con annaffiature leggere e piu frequenti rispetto a piante adulte.",
    feeding:
      "Quando le piantine si sono stabilizzate, puoi usare un concime leggero e diluito.",
    pruning:
      "Controlla se serve diradare o spuntare leggermente le cime quando la crescita si infittisce.",
    needs: ["umidita costante", "luce", "delicatezza", "osservazione frequente"],
    watchouts: ["substrato che secca troppo", "eccesso d'acqua", "piantine troppo fitte"],
    source: {
      label: "RHS Annuals and Biennials",
      url: "https://www.rhs.org.uk/plants/types/annuals-biennials",
    },
    water: {
      intervalDays: 2,
      description: "Le semine in vaso richiedono controlli ravvicinati per evitare asciugature complete.",
      priority: "urgent",
      weatherSensitive: true,
      dryWeatherReduction: 1,
      baseAmountMl: [180, 260],
      dueOnFirstLoad: true,
    },
    fertilize: {
      intervalDays: 21,
      label: "Concima leggermente",
      description:
        "Procedi solo quando le piantine hanno preso forza e non sono piu in fase appena emersa.",
      priority: "low",
      months: BALCONY_MONTHS,
    },
    prune: {
      intervalDays: 10,
      label: "Controlla se diradare",
      description:
        "Se le piantine sono molto fitte, valuta diradamento o piccola cimatura in base alla specie.",
      priority: "medium",
      months: FLOWER_MONTHS,
    },
    illustrationTone: {
      leaf: "#72a85e",
      accent: "#f4a7b9",
      pot: "#e5d8cb",
      bloom: "#ffe3eb",
    },
  }),
  pothos: createProfile({
    key: "pothos",
    name: "Pothos",
    scientificName: "Epipremnum aureum",
    environmentLabel: "Casa",
    sunlight: "Luce brillante indiretta; tollera anche meno luce, ma cresce piu lentamente.",
    watering:
      "Lascia asciugare il terriccio tra un'annaffiatura e l'altra, poi bagna con moderazione.",
    feeding: "Concime leggero circa a mesi alterni, evitando l'inverno pieno.",
    pruning: "Puoi cimarlo per infoltirlo e contenere i tralci.",
    needs: ["luce indiretta", "umidita media", "terriccio drenante"],
    watchouts: ["eccesso d'acqua", "sottovaso pieno", "sole diretto forte"],
    source: {
      label: "NC State Pothos",
      url: "https://plants.ces.ncsu.edu/plants/epipremnum-aureum/",
    },
    water: {
      intervalDays: 8,
      description: "Aspetta che il terriccio asciughi prima di bagnare di nuovo.",
      priority: "medium",
      baseAmountMl: [180, 250],
      dueOnFirstLoad: true,
    },
    fertilize: {
      intervalDays: 60,
      description: "Un apporto leggero sostiene la crescita delle foglie.",
      priority: "low",
      months: GROWING_MONTHS,
    },
    illustrationTone: { leaf: "#6ba75f", accent: "#cde58b", pot: "#e7d8c5" },
  }),
  "pothos-acqua": createProfile({
    key: "pothos-acqua",
    name: "Pothos in acqua",
    scientificName: "Epipremnum aureum",
    environmentLabel: "Casa",
    sunlight: "Luce indiretta brillante, lontano dal sole forte diretto.",
    watering:
      "In coltura in acqua serve acqua pulita, con rabbocchi frequenti e cambio completo periodico.",
    feeding:
      "Concimazione molto leggera e meno frequente; meglio dosi minime per colture in acqua.",
    pruning: "Cimatura leggera per tenere i tralci equilibrati.",
    needs: ["acqua pulita", "luce indiretta", "contenitore pulito"],
    watchouts: ["acqua stagnante da molti giorni", "alghe", "radici scure o molli"],
    source: {
      label: "NC State Pothos",
      url: "https://plants.ces.ncsu.edu/plants/epipremnum-aureum/",
    },
    water: {
      intervalDays: 3,
      label: "Rabbocca l'acqua",
      description: "Aggiungi acqua se il livello e sceso sotto le radici principali.",
      priority: "medium",
      amountLabel: "Aggiungi acqua fino a coprire bene le radici.",
      dueOnFirstLoad: true,
    },
    extraTasks: [
      {
        type: "change-water",
        intervalDays: 7,
        label: "Cambia l'acqua",
        description: "Sostituisci tutta l'acqua e risciacqua il contenitore.",
        priority: "urgent",
        amountLabel: "Svuota, sciacqua il vaso e riempi con acqua pulita.",
        dueOnFirstLoad: true,
      },
    ],
    illustrationTone: { leaf: "#5eab62", accent: "#d5efac", pot: "#c6eef3" },
  }),
  monstera: createProfile({
    key: "monstera",
    name: "Monstera",
    scientificName: "Monstera deliciosa",
    environmentLabel: "Casa",
    sunlight: "Luce media o brillante ma indiretta, con umidita buona.",
    watering:
      "Bagna a fondo, poi lascia asciugare circa il primo quarto-terzo del substrato.",
    feeding: "Concime mensile nella stagione di crescita.",
    pruning: "Pulisci le foglie e pota o rinvasa in primavera se serve.",
    needs: ["luce indiretta", "supporto", "umidita", "substrato ricco ma drenante"],
    watchouts: ["sole diretto forte", "terriccio sempre zuppo", "aria molto secca"],
    source: {
      label: "NC State Monstera",
      url: "https://plants.ces.ncsu.edu/plants/monstera-deliciosa/",
    },
    water: {
      intervalDays: 7,
      description: "Bagna bene e lascia poi respirare il vaso.",
      priority: "medium",
      baseAmountMl: [280, 380],
      dueOnFirstLoad: true,
    },
    fertilize: {
      intervalDays: 30,
      description: "Una concimazione regolare sostiene foglie grandi e sane.",
      priority: "medium",
      months: GROWING_MONTHS,
    },
    illustrationTone: { leaf: "#2f7a50", accent: "#8fcf9d", pot: "#e0d3c2" },
  }),
  filodendro: createProfile({
    key: "filodendro",
    name: "Filodendro",
    scientificName: "Philodendron hederaceum",
    environmentLabel: "Casa",
    sunlight: "Luce brillante indiretta o luce media costante.",
    watering:
      "Bagna quando i primi centimetri di terriccio sono asciutti, evitando ristagni nel sottovaso.",
    feeding: "Concime leggero ogni 4-6 settimane nella stagione attiva.",
    pruning: "Cima i tralci per infoltire la pianta e controllare la lunghezza.",
    needs: ["luce indiretta", "terriccio drenante", "umidita media"],
    watchouts: ["acqua eccessiva", "sole diretto", "freddo"],
    source: {
      label: "NC State Philodendron",
      url: "https://plants.ces.ncsu.edu/plants/philodendron-hederaceum/",
    },
    water: {
      intervalDays: 7,
      description: "Controlla il substrato e irriga solo quando si e alleggerito nella parte alta.",
      priority: "medium",
      baseAmountMl: [200, 290],
      dueOnFirstLoad: true,
    },
    fertilize: {
      intervalDays: 45,
      description: "Una dose regolare ma leggera sostiene foglie nuove e internodi equilibrati.",
      priority: "low",
      months: GROWING_MONTHS,
    },
    illustrationTone: { leaf: "#4b8b5a", accent: "#add48e", pot: "#e3d5c6" },
  }),
  spatifillo: createProfile({
    key: "spatifillo",
    name: "Spatifillo",
    scientificName: "Spathiphyllum wallisii",
    environmentLabel: "Casa",
    sunlight: "Luce indiretta media o brillante, senza sole forte diretto.",
    watering:
      "Gradisce un terriccio uniformemente fresco; non ama lunghi periodi di asciutto completo.",
    feeding: "Concime leggero una volta al mese nella stagione di crescita.",
    pruning: "Elimina foglie o spate sfiorite alla base per mantenere la pianta pulita.",
    needs: ["umidita", "luce filtrata", "substrato fresco"],
    watchouts: ["foglie afflosciate per sete", "ristagni continui", "aria troppo secca"],
    source: {
      label: "NC State Spathiphyllum",
      url: "https://plants.ces.ncsu.edu/plants/spathiphyllum/",
    },
    water: {
      intervalDays: 5,
      description: "Non aspettare che il vaso asciughi del tutto: controlla prima che le foglie cedano.",
      priority: "urgent",
      baseAmountMl: [220, 320],
      dueOnFirstLoad: true,
    },
    fertilize: {
      intervalDays: 35,
      description: "Piccole dosi aiutano foglie lucide e nuova fioritura.",
      priority: "low",
      months: GROWING_MONTHS,
    },
    illustrationTone: {
      leaf: "#3e8a57",
      accent: "#fbfbf0",
      pot: "#ddd1c5",
      bloom: "#fffdfa",
    },
  }),
  aglaonema: createProfile({
    key: "aglaonema",
    name: "Aglaonema",
    scientificName: "Aglaonema commutatum",
    environmentLabel: "Casa",
    sunlight: "Luce media o brillante indiretta, anche in stanze non troppo esposte.",
    watering:
      "Lascia asciugare leggermente il terriccio in superficie prima di bagnare di nuovo.",
    feeding: "Concime leggero ogni 5-6 settimane durante la crescita attiva.",
    pruning: "Rimuovi foglie vecchie o danneggiate e ruota il vaso per una crescita piu uniforme.",
    needs: ["luce indiretta", "temperature stabili", "acqua moderata"],
    watchouts: ["freddo", "ristagni", "sole forte sulle foglie variegate"],
    source: {
      label: "NC State Aglaonema",
      url: "https://plants.ces.ncsu.edu/plants/aglaonema/common-name/philippine-evergreen/",
    },
    water: {
      intervalDays: 8,
      description: "Procedi solo dopo aver verificato che la parte alta del substrato sia asciutta.",
      priority: "medium",
      baseAmountMl: [180, 260],
      dueOnFirstLoad: true,
    },
    fertilize: {
      intervalDays: 45,
      description: "Una routine leggera sostiene nuove foglie senza forzare troppo la pianta.",
      priority: "low",
      months: GROWING_MONTHS,
    },
    illustrationTone: { leaf: "#5f8f5c", accent: "#d4e4c3", pot: "#ddd3c7" },
  }),
  "calathea-orbifolia": createProfile({
    key: "calathea-orbifolia",
    name: "Calathea orbifolia",
    scientificName: "Goeppertia orbifolia",
    environmentLabel: "Casa",
    sunlight: "Luce indiretta diffusa e ambiente con buona umidita.",
    watering:
      "Preferisce un substrato costantemente appena umido, senza ristagni e senza acqua molto calcarea.",
    feeding: "Concime molto leggero nei mesi di crescita, senza eccessi.",
    pruning: "Pulisci le foglie secche alla base e controlla spesso l'umidita ambientale.",
    needs: ["umidita alta", "luce filtrata", "acqua regolare"],
    watchouts: ["aria secca", "acqua dura", "sole diretto"],
    source: {
      label: "NC State Calathea",
      url: "https://plants.ces.ncsu.edu/plants/goeppertia-orbifolia/",
    },
    water: {
      intervalDays: 4,
      description: "Non far asciugare del tutto il vaso: controlla spesso soprattutto con riscaldamento acceso.",
      priority: "urgent",
      baseAmountMl: [180, 280],
      dueOnFirstLoad: true,
    },
    fertilize: {
      intervalDays: 45,
      description: "Una dose molto leggera basta per sostenere il fogliame.",
      priority: "low",
      months: GROWING_MONTHS,
    },
    illustrationTone: { leaf: "#6e966d", accent: "#c8d6be", pot: "#ddd1c5" },
  }),
  anthurium: createProfile({
    key: "anthurium",
    name: "Anthurium",
    scientificName: "Anthurium andraeanum",
    environmentLabel: "Casa",
    sunlight: "Luce intensa ma filtrata; no sole duro diretto.",
    watering:
      "Terriccio leggermente umido con drenaggio eccellente, lasciando asciugare solo un poco tra i turni.",
    feeding: "Concime regolare ma leggero in stagione, utile anche per sostenere la fioritura.",
    pruning: "Rimuovi foglie e spate sfiorite alla base per mantenere la pianta ordinata.",
    needs: ["luce filtrata", "umidita", "substrato arioso"],
    watchouts: ["ristagni", "aria secca", "sole diretto sulle spate"],
    source: {
      label: "NC State Anthurium",
      url: "https://plants.ces.ncsu.edu/plants/anthurium-andraeanum/",
    },
    water: {
      intervalDays: 5,
      description: "Mantieni il substrato appena umido, senza arrivare a terriccio zuppo.",
      priority: "medium",
      baseAmountMl: [180, 260],
      dueOnFirstLoad: true,
    },
    fertilize: {
      intervalDays: 30,
      description: "Un apporto leggero e regolare aiuta a mantenere nuove spate attive.",
      priority: "medium",
      months: GROWING_MONTHS,
    },
    illustrationTone: {
      leaf: "#488454",
      accent: "#da5d57",
      pot: "#e0d3c6",
      bloom: "#ffe4e1",
    },
  }),
  pilea: createProfile({
    key: "pilea",
    name: "Pilea",
    scientificName: "Pilea peperomioides",
    environmentLabel: "Casa",
    sunlight: "Luce brillante indiretta, con vaso ruotato spesso per mantenerla simmetrica.",
    watering:
      "Annaffia quando i primi centimetri del terriccio sono asciutti; teme i ristagni piu della leggera sete.",
    feeding: "Concime leggero ogni 4-6 settimane durante la crescita.",
    pruning: "Pulisci foglie basse e controlla eventuali polloni da separare o lasciare crescere.",
    needs: ["luce brillante", "rotazione del vaso", "drenaggio"],
    watchouts: ["ristagni", "poca luce", "vasi troppo profondi"],
    source: {
      label: "NC State Pilea",
      url: "https://plants.ces.ncsu.edu/plants/pilea-peperomioides/",
    },
    water: {
      intervalDays: 6,
      description: "Controlla il vaso e bagna solo quando la parte alta e asciutta al tatto.",
      priority: "medium",
      baseAmountMl: [160, 240],
      dueOnFirstLoad: true,
    },
    fertilize: {
      intervalDays: 45,
      description: "Una piccola dose periodica aiuta a mantenere crescita equilibrata e foglie tonde.",
      priority: "low",
      months: GROWING_MONTHS,
    },
    illustrationTone: { leaf: "#5c9557", accent: "#abd27b", pot: "#ddd2c4" },
  }),
  hoya: createProfile({
    key: "hoya",
    name: "Hoya",
    scientificName: "Hoya carnosa",
    environmentLabel: "Casa",
    sunlight: "Luce brillante indiretta, anche molto luminosa se filtrata.",
    watering:
      "Lascia asciugare bene una parte del substrato prima di irrigare; le foglie carnose aiutano a tollerare piccole attese.",
    feeding: "Concime leggero nelle stagioni di crescita e formazione dei nuovi tralci.",
    pruning:
      "Non recidere i piccoli peduncoli floreali: e meglio limitarsi a foglie o tralci secchi.",
    needs: ["luce abbondante", "vaso non eccessivo", "drenaggio"],
    watchouts: ["troppa acqua", "poca luce", "spostamenti continui in fioritura"],
    source: {
      label: "NC State Hoya",
      url: "https://plants.ces.ncsu.edu/plants/hoya-carnosa/",
    },
    water: {
      intervalDays: 10,
      description: "Aspetta che il vaso asciughi bene prima di tornare ad irrigare.",
      priority: "medium",
      baseAmountMl: [140, 220],
      dueOnFirstLoad: true,
    },
    fertilize: {
      intervalDays: 45,
      description: "Piccole dosi aiutano la pianta a mantenere foglie e futuri fiori.",
      priority: "low",
      months: GROWING_MONTHS,
    },
    illustrationTone: {
      leaf: "#4f8b53",
      accent: "#f0d6cf",
      pot: "#ddd4c7",
      bloom: "#fff2ef",
    },
  }),
  peperomia: createProfile({
    key: "peperomia",
    name: "Peperomia",
    scientificName: "Peperomia obtusifolia",
    environmentLabel: "Casa",
    sunlight: "Luce indiretta brillante o media, senza sole forte diretto.",
    watering:
      "Le foglie carnose la rendono prudente con l'acqua: meglio aspettare un leggero asciugamento del vaso.",
    feeding: "Concime leggero a bassa frequenza in primavera-estate.",
    pruning: "Taglia solo i getti troppo lunghi o le foglie rovinate.",
    needs: ["drenaggio", "luce indiretta", "poca acqua ma regolare"],
    watchouts: ["ristagni", "vaso freddo e bagnato", "sole forte"],
    source: {
      label: "NC State Peperomia",
      url: "https://plants.ces.ncsu.edu/plants/peperomia-obtusifolia/common-name/baby-rubberplant/",
    },
    water: {
      intervalDays: 10,
      description: "Aspetta che il vaso asciughi un po in superficie prima di annaffiare.",
      priority: "medium",
      baseAmountMl: [130, 190],
      dueOnFirstLoad: true,
    },
    fertilize: {
      intervalDays: 50,
      description: "Una dose lieve e rara e piu che sufficiente per questa specie.",
      priority: "low",
      months: GROWING_MONTHS,
    },
    illustrationTone: { leaf: "#67945d", accent: "#c7d99b", pot: "#dfd4c7" },
  }),
  falangio: createProfile({
    key: "falangio",
    name: "Falangio",
    scientificName: "Chlorophytum comosum",
    environmentLabel: "Casa",
    sunlight: "Luce brillante indiretta o mezz'ombra chiara.",
    watering:
      "Gradisce irrigazioni regolari ma senza eccessi; puo tollerare qualche lieve ritardo tra un turno e l'altro.",
    feeding: "Concime leggero ogni 4-6 settimane in crescita attiva.",
    pruning: "Elimina punte secche e steli esauriti, mantenendo la rosetta pulita.",
    needs: ["luce indiretta", "vaso drenante", "aria"],
    watchouts: ["ristagni", "acqua molto calcarea", "sole duro"],
    source: {
      label: "NC State Chlorophytum",
      url: "https://plants.ces.ncsu.edu/plants/chlorophytum-comosum/common-name/ribbon-plant/",
    },
    water: {
      intervalDays: 6,
      description: "Bagna quando il terriccio inizia ad asciugare, senza aspettare troppo oltre.",
      priority: "medium",
      baseAmountMl: [170, 250],
      dueOnFirstLoad: true,
    },
    fertilize: {
      intervalDays: 45,
      description: "Una nutrizione leggera sostiene nuovi getti e piantine sospese.",
      priority: "low",
      months: GROWING_MONTHS,
    },
    illustrationTone: { leaf: "#6ba15f", accent: "#d7e3a8", pot: "#dfd3c4" },
  }),
  dracena: createProfile({
    key: "dracena",
    name: "Dracena",
    scientificName: "Dracaena fragrans",
    environmentLabel: "Casa",
    sunlight: "Luce media o brillante indiretta; tollera bene anche stanze tranquille.",
    watering:
      "Lascia asciugare una buona parte del vaso prima di irrigare di nuovo, evitando sottovasi pieni.",
    feeding: "Concime leggero ogni 5-6 settimane nei mesi piu attivi.",
    pruning: "Rimuovi foglie basse o secche e controlla l'allungamento dei fusti.",
    needs: ["luce indiretta", "acqua moderata", "temperature stabili"],
    watchouts: ["troppa acqua", "fluoro e acqua dura", "sole diretto forte"],
    source: {
      label: "NC State Dracaena",
      url: "https://plants.ces.ncsu.edu/plants/dracaena-fragrans/",
    },
    water: {
      intervalDays: 9,
      description: "Controlla il vaso e irriga solo quando il substrato ha perso buona parte dell'umidita.",
      priority: "medium",
      baseAmountMl: [170, 260],
      dueOnFirstLoad: true,
    },
    fertilize: {
      intervalDays: 50,
      description: "Una dose leggera e saltuaria e sufficiente per tenere attivo il fogliame.",
      priority: "low",
      months: GROWING_MONTHS,
    },
    illustrationTone: { leaf: "#5c8657", accent: "#b4d292", pot: "#e0d3c4" },
  }),
  sansevieria: createProfile({
    key: "sansevieria",
    name: "Sansevieria",
    scientificName: "Dracaena trifasciata",
    environmentLabel: "Casa",
    sunlight: "Luce media o brillante, ma sa adattarsi anche a meno luce.",
    watering:
      "Molto prudente con l'acqua: lascia asciugare bene il vaso prima di ogni nuovo giro.",
    feeding: "Concime leggero e raro, solo nei mesi di crescita.",
    pruning: "Elimina foglie danneggiate alla base e controlla che il colletto resti asciutto.",
    needs: ["drenaggio eccellente", "poca acqua", "vaso stabile"],
    watchouts: ["troppa acqua", "freddo prolungato", "colletto sempre umido"],
    source: {
      label: "NC State Sansevieria",
      url: "https://plants.ces.ncsu.edu/plants/dracaena-trifasciata/",
    },
    water: {
      intervalDays: 14,
      description: "Bagna solo quando il vaso e davvero asciutto e leggero.",
      priority: "low",
      baseAmountMl: [120, 180],
      dueOnFirstLoad: true,
    },
    fertilize: {
      intervalDays: 60,
      description: "Una sola piccola dose periodica e piu che sufficiente.",
      priority: "low",
      months: GROWING_MONTHS,
    },
    illustrationTone: { leaf: "#4f8c59", accent: "#d8db9f", pot: "#ddd0c1" },
  }),
  zamioculcas: createProfile({
    key: "zamioculcas",
    name: "Zamioculcas",
    scientificName: "Zamioculcas zamiifolia",
    environmentLabel: "Casa",
    sunlight: "Luce media o brillante indiretta; molto adattabile in interno.",
    watering:
      "I fusti carnosi immagazzinano acqua: meglio attendere bene tra un'annaffiatura e l'altra.",
    feeding: "Concime leggero e non frequente durante la crescita.",
    pruning: "Elimina solo foglie o rami danneggiati, senza potature pesanti.",
    needs: ["drenaggio", "poca acqua", "stabilita"],
    watchouts: ["ristagni", "sovrairrigazione", "terriccio troppo compatto"],
    source: {
      label: "NC State ZZ Plant",
      url: "https://plants.ces.ncsu.edu/plants/zamioculcas-zamiifolia/common-name/zz-plant/",
    },
    water: {
      intervalDays: 16,
      description: "Irriga con calma solo quando il terriccio e asciutto fino in profondita.",
      priority: "low",
      baseAmountMl: [130, 190],
      dueOnFirstLoad: true,
    },
    fertilize: {
      intervalDays: 60,
      description: "Una piccola dose saltuaria sostiene il fogliame senza rischiare eccessi.",
      priority: "low",
      months: GROWING_MONTHS,
    },
    illustrationTone: { leaf: "#588453", accent: "#bcd29d", pot: "#ddd2c6" },
  }),
  "aloe-vera": createProfile({
    key: "aloe-vera",
    name: "Aloe vera",
    scientificName: "Aloe vera",
    environmentLabel: "Casa",
    sunlight: "Tanta luce e anche un po di sole diretto non aggressivo.",
    watering:
      "Come succulenta vuole irrigazioni distanziate, con terriccio che asciughi bene prima del turno successivo.",
    feeding: "Concime leggero e raro durante la bella stagione.",
    pruning: "Rimuovi foglie vecchie o danneggiate alla base e controlla il drenaggio.",
    needs: ["molta luce", "substrato drenante", "poca acqua"],
    watchouts: ["freddo", "ristagni", "vasi senza drenaggio"],
    source: {
      label: "NC State Aloe vera",
      url: "https://plants.ces.ncsu.edu/plants/aloe-vera/",
    },
    water: {
      intervalDays: 16,
      description: "Bagna con prudenza e lascia asciugare bene il vaso.",
      priority: "low",
      baseAmountMl: [120, 180],
      dueOnFirstLoad: true,
    },
    fertilize: {
      intervalDays: 70,
      description: "Una dose lieve in stagione calda basta per sostenerla.",
      priority: "low",
      months: GROWING_MONTHS,
    },
    illustrationTone: { leaf: "#6ca55e", accent: "#b6d68d", pot: "#e0d2c2" },
  }),
  crassula: createProfile({
    key: "crassula",
    name: "Crassula",
    scientificName: "Crassula ovata",
    environmentLabel: "Casa",
    sunlight: "Molta luce e qualche ora di sole diretto se acclimatata bene.",
    watering:
      "Richiede poca acqua e solo quando il substrato e ben asciutto; il vaso deve drenare in fretta.",
    feeding: "Concime leggero e raro nella bella stagione.",
    pruning: "Spunta solo se vuoi contenerne la forma o rimuovere parti secche.",
    needs: ["luce", "drenaggio", "vaso asciutto"],
    watchouts: ["acqua eccessiva", "freddo", "vasi troppo grandi e bagnati"],
    source: {
      label: "NC State Crassula",
      url: "https://plants.ces.ncsu.edu/plants/crassula-ovata/",
    },
    water: {
      intervalDays: 12,
      description: "Procedi solo quando il terriccio si e asciugato bene in tutto il vaso.",
      priority: "low",
      baseAmountMl: [110, 170],
      dueOnFirstLoad: true,
    },
    fertilize: {
      intervalDays: 70,
      description: "Una piccola dose in crescita attiva e sufficiente.",
      priority: "low",
      months: GROWING_MONTHS,
    },
    illustrationTone: { leaf: "#78a15f", accent: "#d2cb8e", pot: "#e2d5c7" },
  }),
  tradescantia: createProfile({
    key: "tradescantia",
    name: "Tradescantia",
    scientificName: "Tradescantia zebrina",
    environmentLabel: "Casa",
    sunlight: "Luce brillante indiretta per mantenere colori e internodi compatti.",
    watering:
      "Terriccio leggermente umido ma non fradicio, con piccoli asciugamenti tra i turni.",
    feeding: "Concime leggero ogni 4-6 settimane nella stagione di crescita.",
    pruning: "Cima spesso i tralci per mantenerla piena e non troppo allungata.",
    needs: ["luce abbondante", "potature leggere", "vaso drenante"],
    watchouts: ["poca luce", "eccesso d'acqua", "tratti spogli"],
    source: {
      label: "NC State Tradescantia",
      url: "https://plants.ces.ncsu.edu/plants/tradescantia-zebrina/",
    },
    water: {
      intervalDays: 6,
      description: "Mantieni il substrato appena umido ma evita ristagni persistenti.",
      priority: "medium",
      baseAmountMl: [150, 220],
      dueOnFirstLoad: true,
    },
    fertilize: {
      intervalDays: 45,
      description: "Una dose regolare ma leggera aiuta nuova crescita compatta.",
      priority: "low",
      months: GROWING_MONTHS,
    },
    illustrationTone: { leaf: "#628761", accent: "#c39bd0", pot: "#e1d6ca" },
  }),
  "ficus-elastica": createProfile({
    key: "ficus-elastica",
    name: "Ficus elastica",
    scientificName: "Ficus elastica",
    environmentLabel: "Casa",
    sunlight: "Luce brillante indiretta, meglio se molto stabile.",
    watering:
      "Bagna quando il primo strato del terriccio si asciuga, senza lasciare acqua ferma nel sottovaso.",
    feeding: "Concime ogni 4-6 settimane durante la stagione attiva.",
    pruning: "Pota leggermente o cimala se vuoi contenerla e renderla piu folta.",
    needs: ["luce brillante", "stabilita", "terriccio drenante"],
    watchouts: ["spostamenti continui", "eccesso d'acqua", "sole forte sulle foglie"],
    source: {
      label: "NC State Ficus elastica",
      url: "https://plants.ces.ncsu.edu/plants/ficus-elastica/",
    },
    water: {
      intervalDays: 8,
      description: "Controlla il vaso e irriga quando il terriccio ha perso l'umidita superficiale.",
      priority: "medium",
      baseAmountMl: [220, 320],
      dueOnFirstLoad: true,
    },
    fertilize: {
      intervalDays: 35,
      description: "Una routine regolare aiuta a mantenere foglie grandi e nuova crescita.",
      priority: "medium",
      months: GROWING_MONTHS,
    },
    illustrationTone: { leaf: "#3d7748", accent: "#a8c77d", pot: "#ddd2c3" },
  }),
  "ficus-lyrata": createProfile({
    key: "ficus-lyrata",
    name: "Ficus lyrata",
    scientificName: "Ficus lyrata",
    environmentLabel: "Casa",
    sunlight: "Tanta luce indiretta e posizione stabile vicino a una finestra luminosa.",
    watering:
      "Bagna a fondo e lascia poi asciugare il primo strato di terriccio prima del turno successivo.",
    feeding: "Concime regolare in primavera-estate per sostenere nuova crescita.",
    pruning: "Pulisci foglie e controlla eventuali sbilanciamenti del fusto.",
    needs: ["luce abbondante", "stabilita", "aria"],
    watchouts: ["poca luce", "eccesso d'acqua", "spostamenti frequenti"],
    source: {
      label: "NC State Ficus lyrata",
      url: "https://plants.ces.ncsu.edu/plants/ficus-lyrata/",
    },
    water: {
      intervalDays: 7,
      description: "Controlla il vaso con costanza e irriga solo dopo un leggero asciugamento.",
      priority: "medium",
      baseAmountMl: [240, 360],
      dueOnFirstLoad: true,
    },
    fertilize: {
      intervalDays: 35,
      description: "Una dose costante ma moderata sostiene nuove foglie e crescita verticale.",
      priority: "medium",
      months: GROWING_MONTHS,
    },
    illustrationTone: { leaf: "#47794b", accent: "#b6cf8c", pot: "#ded3c4" },
  }),
  caffe: createProfile({
    key: "caffe",
    name: "Caffe",
    scientificName: "Coffea arabica",
    environmentLabel: "Casa",
    sunlight: "Luce intensa ma non aggressiva, con una buona umidita ambientale.",
    watering:
      "Substrato costantemente umido ma non zuppo; evita asciugature troppo lunghe.",
    feeding: "Concime bilanciato durante la crescita attiva, circa una volta al mese.",
    pruning: "Potature leggere di contenimento solo se la pianta si allunga troppo.",
    needs: ["umidita", "luce brillante", "substrato ricco", "temperature stabili"],
    watchouts: ["aria troppo secca", "terriccio fradicio", "freddo sotto i 13 C circa"],
    source: {
      label: "NC State Coffee Plant",
      url: "https://plants.ces.ncsu.edu/plants/coffea-arabica/",
    },
    water: {
      intervalDays: 4,
      description: "Tieni il terriccio uniformemente umido, senza ristagni.",
      priority: "urgent",
      baseAmountMl: [180, 240],
      dueOnFirstLoad: true,
    },
    fertilize: {
      intervalDays: 30,
      description: "Piccole dosi regolari aiutano foglie e nuova crescita.",
      priority: "medium",
      months: GROWING_MONTHS,
    },
    illustrationTone: { leaf: "#2f6a3d", accent: "#b33a2e", pot: "#d9cbb9" },
  }),
  avocado: createProfile({
    key: "avocado",
    name: "Avocado",
    scientificName: "Persea americana",
    environmentLabel: "Casa",
    sunlight: "Molta luce e terriccio ben drenante; essendo tropicale apprezza calore stabile.",
    watering:
      "Irrigazione profonda ma non troppo ravvicinata: il substrato deve iniziare ad asciugare in superficie.",
    feeding: "Concime mensile leggero durante la crescita attiva.",
    pruning: "Cima gli apici se vuoi mantenerlo piu compatto.",
    needs: ["luce forte", "drenaggio", "vaso capiente", "calore"],
    watchouts: ["ristagni", "poca luce", "sbalzi di temperatura"],
    source: {
      label: "NC State Avocado",
      url: "https://plants.ces.ncsu.edu/plants/persea-americana/",
    },
    water: {
      intervalDays: 5,
      description: "Bagna a fondo e controlla che l'acqua dreni bene.",
      priority: "urgent",
      baseAmountMl: [300, 450],
      dueOnFirstLoad: true,
    },
    fertilize: {
      intervalDays: 30,
      description: "Una dose leggera in primavera-estate aiuta il vigore vegetativo.",
      priority: "medium",
      months: GROWING_MONTHS,
    },
    illustrationTone: { leaf: "#4c8d4a", accent: "#95c86f", pot: "#dfd5c9" },
  }),
  custom: createProfile({
    key: "custom",
    name: "Pianta personalizzata",
    scientificName: "Specie da definire",
    environmentLabel: "Casa o balcone",
    sunlight: "Completa luce, esposizione e routine per ricevere suggerimenti piu accurati.",
    watering:
      "Senza specie precisa la dashboard propone solo regole prudenziali e promemoria generici.",
    feeding: "Aggiungi note dedicate per concimazione e substrato.",
    pruning: "Usa le note per personalizzare potature e controlli.",
    needs: ["nome specie", "luce", "tipo di vaso", "routine personale"],
    watchouts: ["profilo incompleto", "suggerimenti meno precisi"],
    source: {
      label: "Profilo da completare",
      url: "https://orto.vercel.app",
    },
    water: {
      intervalDays: 6,
      label: "Controlla e annaffia se serve",
      description: "Promemoria prudenziale finche il profilo non viene personalizzato.",
      priority: "medium",
      dueOnFirstLoad: true,
    },
    illustrationTone: { leaf: "#6d8f58", accent: "#b6d28d", pot: "#dfd7c9" },
  }),
} as Record<SpeciesKey, PlantProfile>;

export function getPlantProfile(speciesKey: SpeciesKey) {
  return PLANT_PROFILES[speciesKey] ?? PLANT_PROFILES.custom;
}

export function getEnvironmentLabel(environment: Plant["environment"]) {
  return environment === "balcone" ? "Balcone" : "Casa";
}

export function getDisplayPlantName(plant: Plant) {
  const baseName = plant.customName.trim();
  return plant.quantity > 1 ? `${plant.quantity} x ${baseName}` : baseName;
}

export function getSpeciesLabel(speciesKey: SpeciesKey) {
  return (
    SPECIES_OPTIONS.find((option) => option.value === speciesKey)?.label ??
    PLANT_PROFILES.custom.name
  );
}

export function createSeedState(): StoreState {
  const today = getRomeDate();
  const createdAt = `${today}T07:30:00.000Z`;
  const plants: Plant[] = [
    {
      id: "balcone-basilico",
      speciesKey: "basilico",
      customName: "Basilico",
      environment: "balcone",
      quantity: 10,
      potType: "vaso",
      exposure: "Sud-est",
      addedAt: createdAt,
      notes: "Balcone esposto a sud-est.",
    },
    {
      id: "balcone-limone",
      speciesKey: "limone",
      customName: "Limone",
      environment: "balcone",
      quantity: 1,
      potType: "vaso",
      exposure: "Sud-est",
      addedAt: createdAt,
    },
    {
      id: "balcone-salvia",
      speciesKey: "salvia",
      customName: "Salvia",
      environment: "balcone",
      quantity: 1,
      potType: "vaso",
      exposure: "Sud-est",
      addedAt: createdAt,
    },
    {
      id: "balcone-rosmarino",
      speciesKey: "rosmarino",
      customName: "Rosmarino",
      environment: "balcone",
      quantity: 1,
      potType: "vaso",
      exposure: "Sud-est",
      addedAt: createdAt,
    },
    {
      id: "balcone-gelsomino",
      speciesKey: "gelsomino",
      customName: "Gelsomino",
      environment: "balcone",
      quantity: 1,
      potType: "vaso",
      exposure: "Sud-est",
      addedAt: createdAt,
    },
    {
      id: "balcone-bulbi-fiori",
      speciesKey: "bulbi-fiori",
      customName: "Bulbi da fiore",
      environment: "balcone",
      quantity: 1,
      potType: "vaso",
      exposure: "Sud-est",
      addedAt: createdAt,
      notes: "Gruppo generico da dettagliare per specie quando vuoi.",
    },
    {
      id: "balcone-fiori-seminati",
      speciesKey: "fiori-seminati",
      customName: "Fiori seminati",
      environment: "balcone",
      quantity: 1,
      potType: "vaso",
      exposure: "Sud-est",
      addedAt: createdAt,
      notes: "Semina floreale generica da rifinire per specie.",
    },
    {
      id: "casa-pothos",
      speciesKey: "pothos",
      customName: "Pothos",
      environment: "casa",
      quantity: 2,
      potType: "vaso",
      addedAt: createdAt,
    },
    {
      id: "casa-caffe",
      speciesKey: "caffe",
      customName: "Caffe",
      environment: "casa",
      quantity: 1,
      potType: "vaso",
      addedAt: createdAt,
    },
    {
      id: "casa-monstera",
      speciesKey: "monstera",
      customName: "Monstera",
      environment: "casa",
      quantity: 2,
      potType: "vaso",
      addedAt: createdAt,
    },
    {
      id: "casa-avocado",
      speciesKey: "avocado",
      customName: "Avocado",
      environment: "casa",
      quantity: 2,
      potType: "vaso",
      addedAt: createdAt,
    },
    {
      id: "casa-pothos-acqua",
      speciesKey: "pothos-acqua",
      customName: "Pothos in acquacoltura",
      environment: "casa",
      quantity: 2,
      potType: "acquacoltura",
      addedAt: createdAt,
    },
  ];

  const initialCompletions = [
    buildSeedCompletion(today, "balcone-basilico", "water", 1),
    buildSeedCompletion(today, "balcone-limone", "water", 3),
    buildSeedCompletion(today, "balcone-salvia", "water", 2),
    buildSeedCompletion(today, "balcone-rosmarino", "water", 3),
    buildSeedCompletion(today, "balcone-gelsomino", "water", 2),
    buildSeedCompletion(today, "balcone-bulbi-fiori", "water", 2),
    buildSeedCompletion(today, "balcone-fiori-seminati", "water", 1),
    buildSeedCompletion(today, "casa-pothos", "water", 5),
    buildSeedCompletion(today, "casa-caffe", "water", 4),
    buildSeedCompletion(today, "casa-monstera", "water", 6),
    buildSeedCompletion(today, "casa-avocado", "water", 5),
    buildSeedCompletion(today, "casa-pothos-acqua", "change-water", 6),
    buildSeedCompletion(today, "casa-pothos-acqua", "water", 2),
  ].reduce<Record<string, TaskCompletion>>((accumulator, completion) => {
    accumulator[completion.taskId] = completion;
    return accumulator;
  }, {});

  return {
    version: 1,
    createdAt,
    updatedAt: createdAt,
    plants,
    taskCompletions: initialCompletions,
  };
}

function createProfile(definition: ProfileDefinition): PlantProfile {
  const tasks: PlantTaskRule[] = [
    buildTask("water", definition.water, "Annaffia"),
    ...(definition.fertilize
      ? [buildTask("fertilize", definition.fertilize, "Concima")]
      : []),
    ...(definition.prune ? [buildTask("prune", definition.prune, "Pota")] : []),
    ...(definition.harvest
      ? [buildTask("harvest", definition.harvest, "Raccogli")]
      : []),
    ...(definition.extraTasks ?? []),
  ];

  return {
    key: definition.key,
    name: definition.name,
    scientificName: definition.scientificName,
    environmentLabel: definition.environmentLabel,
    sunlight: definition.sunlight,
    watering: definition.watering,
    feeding: definition.feeding,
    pruning: definition.pruning,
    needs: definition.needs,
    watchouts: definition.watchouts,
    source: definition.source,
    tasks,
    illustrationTone: definition.illustrationTone,
  };
}

function buildTask(
  type: PlantTaskRule["type"],
  definition: ScheduledTaskDefinition,
  fallbackLabel: string,
): PlantTaskRule {
  return {
    type,
    intervalDays: definition.intervalDays,
    label: definition.label ?? fallbackLabel,
    description: definition.description,
    priority: definition.priority,
    months: definition.months,
    weatherSensitive: definition.weatherSensitive,
    skipWhenRainMm: definition.skipWhenRainMm,
    dryWeatherReduction: definition.dryWeatherReduction,
    baseAmountMl: definition.baseAmountMl,
    amountLabel: definition.amountLabel,
    dueOnFirstLoad: definition.dueOnFirstLoad,
  };
}

function buildSeedCompletion(
  today: string,
  plantId: string,
  taskType: TaskCompletion["taskType"],
  daysAgo: number,
): TaskCompletion {
  const taskDate = addDays(today, -daysAgo);
  const taskId = buildTaskId(taskDate, plantId, taskType);

  return {
    taskId,
    plantId,
    taskType,
    taskDate,
    completedBy: "Setup",
    completedAt: toCompletionTimestamp(taskDate),
  };
}
