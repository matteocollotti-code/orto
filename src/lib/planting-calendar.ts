import { monthOf } from "@/lib/date-utils";
import type {
  PlantingCalendarEntry,
  SeasonalPlantingGuide,
  WeatherSnapshot,
} from "@/lib/orto-types";

const MONTH_LABELS = [
  "Gennaio",
  "Febbraio",
  "Marzo",
  "Aprile",
  "Maggio",
  "Giugno",
  "Luglio",
  "Agosto",
  "Settembre",
  "Ottobre",
  "Novembre",
  "Dicembre",
];

const CALENDAR: PlantingCalendarEntry[] = [
  {
    month: 1,
    monthLabel: "Gennaio",
    summary:
      "Mese di preparazione e semine protette: meglio puntare su colture da riparo e prime piante rustiche.",
    seeds: [
      "microgreens e piselli da germoglio al chiuso",
      "piselli odorosi in vasetto",
      "lattughini da taglio in cassone freddo o sul davanzale",
    ],
    seedlings: [
      "aglio e scalogni in contenitore se il substrato non gela",
      "frutti rossi in vaso a radice nuda",
      "erbette rustiche da vivaio da tenere riparate la notte",
    ],
    caution:
      "Con gelo o nebbie persistenti evita trapianti delicati e proteggi i contenitori dal ristagno freddo.",
  },
  {
    month: 2,
    monthLabel: "Febbraio",
    summary:
      "Le prime semine serie ripartono sotto riparo, mentre all'esterno si lavora solo con specie robuste.",
    seeds: [
      "pomodoro e peperoncino al caldo",
      "lattuga, spinacio e ravanello in contenitore riparato",
      "prezzemolo ed erba cipollina in posizione luminosa",
    ],
    seedlings: [
      "aglio, cipolle e scalogni",
      "fragole in vaso",
      "insalate rustiche da trapiantare sotto tessuto o mini serra",
    ],
    caution:
      "Le notti sono ancora fredde: basilico, pomodoro e altre specie tenere restano al chiuso.",
  },
  {
    month: 3,
    monthLabel: "Marzo",
    summary:
      "Con la luce che aumenta si aprono le semine da balcone: insalate, piselli e radici leggere partono bene.",
    seeds: [
      "piselli, lattuga e spinacio",
      "ravanello, carota e barbabietola",
      "prezzemolo, bietola e fiori annuali rustici",
    ],
    seedlings: [
      "fragole",
      "cipolle e agli",
      "cavoli primaverili o fave gia avviate",
    ],
    caution:
      "Se arrivano colpi di freddo copri le giovani semine e non lasciare fuori peperoncini o basilico.",
  },
  {
    month: 4,
    monthLabel: "Aprile",
    summary:
      "Aprile e il mese piu ricco per seminare ortaggi veloci e per preparare le piantine estive sotto riparo.",
    seeds: [
      "lattuga, ravanello, spinacio e bietola",
      "barbabietola, carota, piselli e cipollotti",
      "pomodoro, peperoncino e cetriolo al caldo o sotto riparo",
    ],
    seedlings: [
      "fragole",
      "cipolle, fave e cavoli primaverili",
      "aromatiche rustiche come menta, timo e origano",
    ],
    caution:
      "A Milano le notti possono restare fresche: basilico, pomodoro e peperoncino fuori tutta notte solo con clima stabile.",
  },
  {
    month: 5,
    monthLabel: "Maggio",
    summary:
      "Quando il rischio di freddo cala, il balcone passa alle colture estive da produzione e ai fiori da piena stagione.",
    seeds: [
      "fagiolini e fagioli nani",
      "basilico, cetriolo e zucchina",
      "nasturzi, calendule e altri fiori annuali da sole",
    ],
    seedlings: [
      "pomodoro, peperoncino e melanzana",
      "basilico gia formato",
      "gerani, petunie e annuali fiorite",
    ],
    caution:
      "Trapianta le specie tenere solo dopo le ultime notti fredde e abituale al sole in modo graduale.",
  },
  {
    month: 6,
    monthLabel: "Giugno",
    summary:
      "Si continua con semine scalari e si mettono a dimora le ultime piantine estive, puntando su irrigazione costante.",
    seeds: [
      "lattughe scalari e ravanelli",
      "barbabietola, basilico e fagiolini tardivi",
      "cicorie estive da raccolta successiva",
    ],
    seedlings: [
      "peperoni e cetrioli tardivi",
      "sedano e porri",
      "cavoli da inverno gia allevati",
    ],
    caution:
      "Con caldo e vento le semine in cassette vanno ombreggiate leggermente e tenute sempre fresche.",
  },
  {
    month: 7,
    monthLabel: "Luglio",
    summary:
      "Il focus si sposta sulle colture autunnali: si semina per settembre-ottobre e si trapianta nelle ore piu fresche.",
    seeds: [
      "cicoria, finocchio e ravanelli",
      "lattughe e insalate da autunno",
      "cavolo primaverile e brassiche da svernamento",
    ],
    seedlings: [
      "porri",
      "cavoli da inverno",
      "sedano o bietole gia cresciute",
    ],
    caution:
      "A fine luglio il problema non e il freddo ma l'asciugatura: semina solo se riesci a seguire bene l'acqua.",
  },
  {
    month: 8,
    monthLabel: "Agosto",
    summary:
      "Agosto apre il balcone autunnale: ottimo per ripartire con insalate, spinaci e nuovi vasi di fragola.",
    seeds: [
      "spinacio, rucola e ravanello",
      "lattughe d'autunno e valerianella",
      "cavoli primaverili e sovescio leggero",
    ],
    seedlings: [
      "fragole da stolone",
      "cavoli e brassiche autunnali",
      "insalate gia formate da sistemare in vaschetta",
    ],
    caution:
      "Durante ferie e ondate di caldo prepara una riserva d'acqua o evita di riempire troppo il balcone di nuove semine.",
  },
  {
    month: 9,
    monthLabel: "Settembre",
    summary:
      "Settembre e molto favorevole per nuove semine fresche e per piantare colture che devono radicare prima dell'inverno.",
    seeds: [
      "spinacio, lattuga invernale e valerianella",
      "ravanello, pak choi e altre orientali rapide",
      "fiori biennali e miscele da fiore per primavera",
    ],
    seedlings: [
      "fragole",
      "cavoli primaverili",
      "cipolle da inverno e aromatiche robuste",
    ],
    caution:
      "La crescita rallenta con giornate corte: meglio piante sane e non troppo grandi rispetto a trapianti stressati.",
  },
  {
    month: 10,
    monthLabel: "Ottobre",
    summary:
      "Entrano in gioco colture da svernamento, bulbi e biennali: e il momento di impostare la primavera successiva.",
    seeds: [
      "fave e piselli da svernamento in posizioni riparate",
      "piselli odorosi",
      "insalate sotto tunnel o mini serra",
    ],
    seedlings: [
      "cipolle e aglio",
      "viola del pensiero, bellis e altri biennali",
      "bulbi primaverili in ciotola o cassetta",
    ],
    caution:
      "Con piogge frequenti verifica drenaggio e sottovasi: il rischio principale torna a essere il ristagno.",
  },
  {
    month: 11,
    monthLabel: "Novembre",
    summary:
      "Si continua con impianti rustici e colture lente, mentre al chiuso restano attive solo semine molto protette.",
    seeds: [
      "fave da svernamento",
      "microgreens e piselli da germoglio",
      "piselli odorosi nelle zone piu miti e riparate",
    ],
    seedlings: [
      "aglio e scalogno",
      "bulbi tardivi come tulipani e giacinti",
      "viole, ciclamini e piccoli frutti rustici in vaso",
    ],
    caution:
      "Se arrivano nebbia fitta o gelate, lavora poco sul substrato e non forzare semine all'aperto.",
  },
  {
    month: 12,
    monthLabel: "Dicembre",
    summary:
      "Dicembre serve piu a preparare che a spingere: meglio poche semine protette e piantagioni robuste ben drenate.",
    seeds: [
      "microgreens al chiuso",
      "piselli da germoglio sul davanzale",
      "erbette da cucina in mini vasetti protetti",
    ],
    seedlings: [
      "aglio e cipolle solo se il clima e mite",
      "bulbi primaverili tardivi in contenitore",
      "frutti rossi rustici da mettere a riposo in vaso",
    ],
    caution:
      "Evita trapianti delicati con substrato gelato o troppo zuppo e prepara gia semenze e spazi per febbraio-marzo.",
  },
];

export function buildSeasonalPlantingGuide(
  today: string,
  weather: WeatherSnapshot,
): SeasonalPlantingGuide {
  const currentMonth = monthOf(today);
  const current = CALENDAR.find((entry) => entry.month === currentMonth) ?? CALENDAR[0];
  const next = CALENDAR.find((entry) => entry.month === getNextMonth(currentMonth)) ?? CALENDAR[0];
  const currentPeriodLabel = getPeriodLabel(today);

  return {
    location: "Milano",
    scope: "Balcone e orto domestico in vaso, adattati a un clima del nord Italia.",
    currentPeriodLabel,
    currentHeadline: buildCurrentHeadline(current, currentPeriodLabel),
    weatherNote: buildWeatherNote(currentMonth, weather),
    current,
    next,
    calendar: CALENDAR,
    sources: [
      {
        label: "RHS Crop Planner",
        url: "https://www.rhs.org.uk/Advice/PDFs/Beginners-Guide/VegPlanner.pdf",
      },
      {
        label: "RHS April Jobs",
        url: "https://www.rhs.org.uk/advice/grow-your-own/in-month/april-jobs",
      },
      {
        label: "RHS Annuals and Biennials",
        url: "https://www.rhs.org.uk/plants/types/annuals-biennials",
      },
      {
        label: "RHS Tomato Guide",
        url: "https://www.rhs.org.uk/vegetables/tomatoes/grow-your-own",
      },
    ],
  };
}

function getNextMonth(month: number) {
  return month === 12 ? 1 : month + 1;
}

function getPeriodLabel(dateIso: string) {
  const [year, month, day] = dateIso.split("-").map(Number);
  const segment = day <= 10 ? "inizio" : day <= 20 ? "meta" : "fine";
  return `${segment} ${MONTH_LABELS[month - 1]} ${year}`;
}

function buildCurrentHeadline(entry: PlantingCalendarEntry, currentPeriodLabel: string) {
  return `${capitalize(currentPeriodLabel)} e un ottimo momento per ${entry.seeds[0]} e per mettere a dimora ${entry.seedlings[0]}.`;
}

function buildWeatherNote(month: number, weather: WeatherSnapshot) {
  if (month >= 3 && month <= 5 && weather.today.tempMin < 10) {
    return "Le minime restano fresche: tieni ancora al riparo basilico, pomodoro e peperoncino nelle notti piu fredde.";
  }

  if (month >= 6 && month <= 8 && weather.irrigationBias === "high") {
    return "Con clima asciutto e evaporazione alta, semine e piantine nuove vanno controllate ogni giorno nelle ore fresche.";
  }

  if (month >= 9 && month <= 11) {
    return "Autunno utile per radicare bene: privilegia trapianti compatti e vasi molto drenanti, senza accelerare troppo con l'acqua.";
  }

  return "Usa questo planner come guida stagionale e anticipa o ritarda di qualche settimana se Milano entra in una fase molto fredda o molto mite.";
}

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}
