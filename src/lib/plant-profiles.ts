import { addDays, buildTaskId, getRomeDate, toCompletionTimestamp } from "@/lib/date-utils";
import type {
  Plant,
  PlantProfile,
  SpeciesKey,
  StoreState,
  TaskCompletion,
} from "@/lib/orto-types";

export const SPECIES_OPTIONS: Array<{ value: SpeciesKey; label: string }> = [
  { value: "basilico", label: "Basilico" },
  { value: "limone", label: "Limone" },
  { value: "salvia", label: "Salvia" },
  { value: "rosmarino", label: "Rosmarino" },
  { value: "gelsomino", label: "Gelsomino" },
  { value: "bulbi-fiori", label: "Bulbi da fiore" },
  { value: "fiori-seminati", label: "Fiori seminati" },
  { value: "pothos", label: "Pothos" },
  { value: "caffe", label: "Caffè" },
  { value: "monstera", label: "Monstera" },
  { value: "avocado", label: "Avocado" },
  { value: "pothos-acqua", label: "Pothos in acquacoltura" },
  { value: "custom", label: "Pianta personalizzata" },
];

export const ENVIRONMENT_OPTIONS = [
  { value: "casa", label: "Casa" },
  { value: "balcone", label: "Balcone" },
] as const;

export const POT_OPTIONS = [
  { value: "vaso", label: "Vaso" },
  { value: "terra", label: "Terra" },
  { value: "acquacoltura", label: "Acquacoltura" },
] as const;

const PLANT_PROFILES: Record<SpeciesKey, PlantProfile> = {
  basilico: {
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
    tasks: [
      {
        type: "water",
        intervalDays: 1,
        label: "Annaffia",
        description: "Mantieni il terriccio appena umido, senza ristagni.",
        priority: "urgent",
        weatherSensitive: true,
        dryWeatherReduction: 0,
        baseAmountMl: [150, 220],
        dueOnFirstLoad: true,
      },
      {
        type: "fertilize",
        intervalDays: 21,
        label: "Concima",
        description: "Un concime leggero aiuta nuova crescita e raccolti continui.",
        priority: "low",
        months: [4, 5, 6, 7, 8, 9],
      },
      {
        type: "harvest",
        intervalDays: 7,
        label: "Pizzica le cime",
        description: "Raccogli le punte apicali per mantenere il basilico folto.",
        priority: "medium",
        months: [4, 5, 6, 7, 8, 9],
      },
    ],
    illustrationTone: {
      leaf: "#4e9c58",
      accent: "#8ed09b",
      pot: "#ead7bf",
    },
  },
  limone: {
    key: "limone",
    name: "Limone",
    scientificName: "Citrus x limon",
    environmentLabel: "Balcone",
    sunlight: "Sole pieno e posizione riparata; meglio all'aperto nella bella stagione.",
    watering:
      "In estate va controllato spesso: terriccio appena umido, mai fradicio, con drenaggio ottimo.",
    feeding:
      "Concime specifico per agrumi dalla primavera all'inizio dell'autunno.",
    pruning:
      "Potature leggere di contenimento e rimozione dei rami secchi.",
    needs: ["sole", "drenaggio", "umidità moderata", "nutrimento regolare"],
    watchouts: ["radici sensibili ai ristagni", "aria secca indoor", "freddo intenso"],
    source: {
      label: "RHS Citrus Guide",
      url: "https://www.rhs.org.uk/fruit/citrus/grow-your-own",
    },
    tasks: [
      {
        type: "water",
        intervalDays: 3,
        label: "Annaffia",
        description: "Con temperature in aumento il limone richiede irrigazioni più frequenti.",
        priority: "urgent",
        weatherSensitive: true,
        dryWeatherReduction: 1,
        baseAmountMl: [700, 1000],
        dueOnFirstLoad: true,
      },
      {
        type: "fertilize",
        intervalDays: 21,
        label: "Concima",
        description: "Usa un fertilizzante per agrumi durante la crescita attiva.",
        priority: "medium",
        months: [3, 4, 5, 6, 7, 8, 9, 10],
      },
      {
        type: "prune",
        intervalDays: 60,
        label: "Pota leggermente",
        description: "Togli secco e rami disordinati per mantenere forma e aria.",
        priority: "low",
        months: [3, 4, 9],
      },
    ],
    illustrationTone: {
      leaf: "#397a43",
      accent: "#f0d348",
      pot: "#d7d2bb",
      bloom: "#fff7d6",
    },
  },
  salvia: {
    key: "salvia",
    name: "Salvia",
    scientificName: "Salvia officinalis",
    environmentLabel: "Balcone",
    sunlight: "Pieno sole, posizione riparata e suolo molto drenante.",
    watering:
      "Più asciutta che umida: annaffia solo quando il substrato si è asciugato bene in superficie.",
    feeding: "Concime leggero e non troppo frequente in primavera-estate.",
    pruning:
      "Raccogli le foglie giovani e spunta dopo la fioritura per mantenerla compatta.",
    needs: ["sole", "drenaggio", "aria", "potature leggere"],
    watchouts: ["ristagni", "ombra prolungata", "substrato pesante"],
    source: {
      label: "RHS Sage Guide",
      url: "https://www.rhs.org.uk/herbs/sage/grow-your-own",
    },
    tasks: [
      {
        type: "water",
        intervalDays: 5,
        label: "Annaffia",
        description: "Bagna solo se il vaso è asciutto in alto; la salvia è abbastanza tollerante alla siccità.",
        priority: "medium",
        weatherSensitive: true,
        dryWeatherReduction: 1,
        baseAmountMl: [250, 350],
        dueOnFirstLoad: true,
      },
      {
        type: "prune",
        intervalDays: 50,
        label: "Spunta",
        description: "Una piccola spuntatura mantiene la salvia più fitta.",
        priority: "low",
        months: [4, 5, 6, 9],
      },
    ],
    illustrationTone: {
      leaf: "#7c9177",
      accent: "#b6c0a2",
      pot: "#d9cfbf",
    },
  },
  rosmarino: {
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
    tasks: [
      {
        type: "water",
        intervalDays: 6,
        label: "Annaffia",
        description: "Bagna soltanto se il vaso è ben asciutto in superficie.",
        priority: "medium",
        weatherSensitive: true,
        dryWeatherReduction: 1,
        baseAmountMl: [220, 320],
        dueOnFirstLoad: true,
      },
      {
        type: "prune",
        intervalDays: 60,
        label: "Spunta",
        description: "Un taglio leggero dopo la fioritura lo mantiene ordinato.",
        priority: "low",
        months: [4, 5, 6, 9],
      },
    ],
    illustrationTone: {
      leaf: "#4d7d6d",
      accent: "#93b6a8",
      pot: "#ddd6c6",
    },
  },
  gelsomino: {
    key: "gelsomino",
    name: "Gelsomino",
    scientificName: "Jasminum officinale",
    environmentLabel: "Balcone",
    sunlight: "Sole o mezz'ombra luminosa, in posizione calda e ariosa.",
    watering:
      "Gradisce umidità moderata e regolare, senza lasciare il vaso zuppo troppo a lungo.",
    feeding: "Concime in primavera e in estate per sostenere foglie e fiori.",
    pruning: "Pota e guida i getti dopo la fioritura per contenere la crescita.",
    needs: ["supporto", "sole o mezz'ombra", "umidità costante", "spazio per allargarsi"],
    watchouts: ["secchezza prolungata", "crescita disordinata", "poca luce"],
    source: {
      label: "Clemson Jasmine Fact Sheet",
      url: "https://hgic.clemson.edu/factsheet/jasmine/",
    },
    tasks: [
      {
        type: "water",
        intervalDays: 2,
        label: "Annaffia",
        description: "Con giornate asciutte e miti tende ad avere sete più spesso.",
        priority: "urgent",
        weatherSensitive: true,
        dryWeatherReduction: 1,
        baseAmountMl: [450, 650],
        dueOnFirstLoad: true,
      },
      {
        type: "fertilize",
        intervalDays: 21,
        label: "Concima",
        description: "Supporta la fase vegetativa e la futura fioritura.",
        priority: "medium",
        months: [4, 5, 6, 7, 8, 9],
      },
    ],
    illustrationTone: {
      leaf: "#5d8c46",
      accent: "#ffffff",
      pot: "#dbd1c1",
      bloom: "#fffdf7",
    },
  },
  "bulbi-fiori": {
    key: "bulbi-fiori",
    name: "Bulbi da fiore",
    scientificName: "Bulbous flowering plants",
    environmentLabel: "Balcone",
    sunlight:
      "Molti bulbi da fiore gradiscono luce abbondante o sole leggero, con substrato drenante e vaso non fradicio.",
    watering:
      "Durante la crescita attiva il terriccio va tenuto appena umido; dopo la fioritura spesso si riduce gradualmente l'acqua.",
    feeding:
      "Un concime leggero in fase vegetativa puo aiutare fioritura e ricarica del bulbo.",
    pruning:
      "Rimuovi i fiori sfioriti, ma lascia il fogliame finche non ingiallisce per permettere al bulbo di ricaricarsi.",
    needs: ["drenaggio", "luce", "acqua moderata", "gestione stagionale"],
    watchouts: ["ristagni", "vaso sempre bagnato", "tagliare il fogliame troppo presto"],
    source: {
      label: "RHS Bulbs",
      url: "https://www.rhs.org.uk/plants/types/bulbs",
    },
    tasks: [
      {
        type: "water",
        intervalDays: 3,
        label: "Annaffia",
        description:
          "Mantieni il substrato appena umido finche i bulbi sono in crescita attiva.",
        priority: "medium",
        weatherSensitive: true,
        dryWeatherReduction: 1,
        baseAmountMl: [220, 320],
        dueOnFirstLoad: true,
      },
      {
        type: "fertilize",
        intervalDays: 30,
        label: "Concima",
        description:
          "Un apporto leggero in stagione puo sostenere fiori e riserva del bulbo.",
        priority: "low",
        months: [3, 4, 5, 9, 10],
      },
      {
        type: "prune",
        intervalDays: 14,
        label: "Pulisci i fiori sfioriti",
        description:
          "Togli le corolle finite ma lascia il fogliame verde finche non si esaurisce da solo.",
        priority: "medium",
        months: [3, 4, 5, 6],
      },
    ],
    illustrationTone: {
      leaf: "#5f9a54",
      accent: "#f1c86c",
      pot: "#e3d6c7",
      bloom: "#fff2d8",
    },
  },
  "fiori-seminati": {
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
    tasks: [
      {
        type: "water",
        intervalDays: 2,
        label: "Annaffia",
        description:
          "Le semine in vaso richiedono controlli ravvicinati per evitare asciugature complete.",
        priority: "urgent",
        weatherSensitive: true,
        dryWeatherReduction: 1,
        baseAmountMl: [180, 260],
        dueOnFirstLoad: true,
      },
      {
        type: "fertilize",
        intervalDays: 21,
        label: "Concima leggermente",
        description:
          "Procedi solo quando le piantine hanno preso forza e non sono piu in fase appena emersa.",
        priority: "low",
        months: [4, 5, 6, 7, 8, 9],
      },
      {
        type: "prune",
        intervalDays: 10,
        label: "Controlla se diradare",
        description:
          "Se le piantine sono molto fitte, valuta diradamento o piccola cimatura in base alla specie.",
        priority: "medium",
        months: [4, 5, 6],
      },
    ],
    illustrationTone: {
      leaf: "#72a85e",
      accent: "#f4a7b9",
      pot: "#e5d8cb",
      bloom: "#ffe3eb",
    },
  },
  pothos: {
    key: "pothos",
    name: "Pothos",
    scientificName: "Epipremnum aureum",
    environmentLabel: "Casa",
    sunlight: "Luce brillante indiretta; tollera anche meno luce, ma cresce più lentamente.",
    watering:
      "Lascia asciugare il terriccio tra un'annaffiatura e l'altra, poi bagna con moderazione.",
    feeding: "Concime leggero circa a mesi alterni, evitando l'inverno pieno.",
    pruning: "Puoi cimarlo per infoltirlo e contenere i tralci.",
    needs: ["luce indiretta", "umidità media", "terriccio drenante"],
    watchouts: ["eccesso d'acqua", "sottovaso pieno", "sole diretto forte"],
    source: {
      label: "NC State Pothos",
      url: "https://plants.ces.ncsu.edu/plants/epipremnum-aureum/",
    },
    tasks: [
      {
        type: "water",
        intervalDays: 8,
        label: "Annaffia",
        description: "Aspetta che il terriccio asciughi prima di bagnare di nuovo.",
        priority: "medium",
        baseAmountMl: [180, 250],
        dueOnFirstLoad: true,
      },
      {
        type: "fertilize",
        intervalDays: 60,
        label: "Concima",
        description: "Un apporto leggero sostiene la crescita delle foglie.",
        priority: "low",
        months: [3, 4, 5, 6, 7, 8, 9],
      },
    ],
    illustrationTone: {
      leaf: "#6ba75f",
      accent: "#cde58b",
      pot: "#e7d8c5",
    },
  },
  caffe: {
    key: "caffe",
    name: "Caffè",
    scientificName: "Coffea arabica",
    environmentLabel: "Casa",
    sunlight: "Luce intensa ma non aggressiva, con una buona umidità ambientale.",
    watering:
      "Substrato costantemente umido ma non zuppo; evita asciugature troppo lunghe.",
    feeding: "Concime bilanciato durante la crescita attiva, circa una volta al mese.",
    pruning: "Potature leggere di contenimento solo se la pianta si allunga troppo.",
    needs: ["umidità", "luce brillante", "substrato ricco", "temperature stabili"],
    watchouts: ["aria troppo secca", "terriccio fradicio", "freddo sotto i 13 °C circa"],
    source: {
      label: "NC State Coffea arabica",
      url: "https://plants.ces.ncsu.edu/plants/coffea-arabica/",
    },
    tasks: [
      {
        type: "water",
        intervalDays: 4,
        label: "Annaffia",
        description: "Tieni il terriccio uniformemente umido, senza ristagni.",
        priority: "urgent",
        baseAmountMl: [180, 240],
        dueOnFirstLoad: true,
      },
      {
        type: "fertilize",
        intervalDays: 30,
        label: "Concima",
        description: "Piccole dosi regolari aiutano foglie e nuova crescita.",
        priority: "medium",
        months: [3, 4, 5, 6, 7, 8, 9],
      },
    ],
    illustrationTone: {
      leaf: "#2f6a3d",
      accent: "#b33a2e",
      pot: "#d9cbb9",
    },
  },
  monstera: {
    key: "monstera",
    name: "Monstera",
    scientificName: "Monstera deliciosa",
    environmentLabel: "Casa",
    sunlight: "Luce media o brillante ma indiretta, con umidità buona.",
    watering:
      "Bagna a fondo, poi lascia asciugare circa il primo quarto-terzo del substrato.",
    feeding: "Concime mensile nella stagione di crescita.",
    pruning: "Pulisci le foglie e pota o rinvasa in primavera se serve.",
    needs: ["luce indiretta", "supporto", "umidità", "substrato ricco ma drenante"],
    watchouts: ["sole diretto forte", "terriccio sempre zuppo", "aria molto secca"],
    source: {
      label: "NC State Monstera deliciosa",
      url: "https://plants.ces.ncsu.edu/plants/monstera-deliciosa/",
    },
    tasks: [
      {
        type: "water",
        intervalDays: 7,
        label: "Annaffia",
        description: "Bagna bene e lascia poi respirare il vaso.",
        priority: "medium",
        baseAmountMl: [280, 380],
        dueOnFirstLoad: true,
      },
      {
        type: "fertilize",
        intervalDays: 30,
        label: "Concima",
        description: "Una concimazione regolare sostiene foglie grandi e sane.",
        priority: "medium",
        months: [3, 4, 5, 6, 7, 8, 9],
      },
    ],
    illustrationTone: {
      leaf: "#2f7a50",
      accent: "#8fcf9d",
      pot: "#e0d3c2",
    },
  },
  avocado: {
    key: "avocado",
    name: "Avocado",
    scientificName: "Persea americana",
    environmentLabel: "Casa",
    sunlight: "Molta luce e terriccio ben drenante; essendo tropicale apprezza calore stabile.",
    watering:
      "Irrigazione profonda ma non troppo ravvicinata: il substrato deve iniziare ad asciugare in superficie.",
    feeding: "Concime mensile leggero durante la crescita attiva.",
    pruning: "Cima gli apici se vuoi mantenerlo più compatto.",
    needs: ["luce forte", "drenaggio", "vaso capiente", "calore"],
    watchouts: ["ristagni", "poca luce", "sbalzi di temperatura"],
    source: {
      label: "NC State Avocado",
      url: "https://plants.ces.ncsu.edu/plants/persea-americana/",
    },
    tasks: [
      {
        type: "water",
        intervalDays: 5,
        label: "Annaffia",
        description: "Bagna a fondo e controlla che l'acqua dreni bene.",
        priority: "urgent",
        baseAmountMl: [300, 450],
        dueOnFirstLoad: true,
      },
      {
        type: "fertilize",
        intervalDays: 30,
        label: "Concima",
        description: "Una dose leggera in primavera-estate aiuta il vigore vegetativo.",
        priority: "medium",
        months: [3, 4, 5, 6, 7, 8, 9],
      },
    ],
    illustrationTone: {
      leaf: "#4c8d4a",
      accent: "#95c86f",
      pot: "#dfd5c9",
    },
  },
  "pothos-acqua": {
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
    tasks: [
      {
        type: "water",
        intervalDays: 3,
        label: "Rabbocca l'acqua",
        description: "Aggiungi acqua se il livello è sceso sotto le radici principali.",
        priority: "medium",
        amountLabel: "Aggiungi acqua fino a coprire bene le radici.",
        dueOnFirstLoad: true,
      },
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
    illustrationTone: {
      leaf: "#5eab62",
      accent: "#d5efac",
      pot: "#c6eef3",
    },
  },
  custom: {
    key: "custom",
    name: "Pianta personalizzata",
    scientificName: "Specie da definire",
    environmentLabel: "Casa o balcone",
    sunlight: "Completa luce, esposizione e routine per ricevere suggerimenti più accurati.",
    watering:
      "Senza specie precisa la dashboard propone solo regole prudenziali e promemoria generici.",
    feeding: "Aggiungi note dedicate per concimazione e substrato.",
    pruning: "Usa le note per personalizzare potature e controlli.",
    needs: ["nome specie", "luce", "tipo di vaso", "routine personale"],
    watchouts: ["profilo incompleto", "suggerimenti meno precisi"],
    source: {
      label: "Da completare",
      url: "https://orto.vercel.app",
    },
    tasks: [
      {
        type: "water",
        intervalDays: 6,
        label: "Controlla e annaffia se serve",
        description: "Promemoria prudenziale finché il profilo non viene personalizzato.",
        priority: "medium",
        dueOnFirstLoad: true,
      },
    ],
    illustrationTone: {
      leaf: "#6d8f58",
      accent: "#b6d28d",
      pot: "#dfd7c9",
    },
  },
};

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
      customName: "Caffè",
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
