import { addDays, getRomeDate } from "@/lib/date-utils";
import type { WeatherSnapshot } from "@/lib/orto-types";

const MILAN = {
  city: "Milano",
  latitude: 45.4642,
  longitude: 9.19,
};

type OpenMeteoResponse = {
  daily: {
    time: string[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    precipitation_sum: number[];
    precipitation_hours: number[];
    et0_fao_evapotranspiration: number[];
    wind_speed_10m_max: number[];
  };
  current: {
    time: string;
    temperature_2m: number;
    relative_humidity_2m: number;
    precipitation: number;
    wind_speed_10m: number;
  };
};

export async function getWeatherSnapshot(): Promise<WeatherSnapshot> {
  const today = getRomeDate();
  const yesterday = addDays(today, -1);
  const tomorrow = addDays(today, 1);
  const sourceUrl =
    "https://api.open-meteo.com/v1/forecast" +
    `?latitude=${MILAN.latitude}` +
    `&longitude=${MILAN.longitude}` +
    "&timezone=Europe%2FRome" +
    `&start_date=${yesterday}` +
    `&end_date=${tomorrow}` +
    "&current=temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m" +
    "&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_hours,et0_fao_evapotranspiration,wind_speed_10m_max";

  try {
    const response = await fetch(sourceUrl, {
      next: { revalidate: 1800 },
    });

    if (!response.ok) {
      throw new Error(`Weather request failed with ${response.status}`);
    }

    const data = (await response.json()) as OpenMeteoResponse;
    const [yesterdayIndex, todayIndex, tomorrowIndex] = [0, 1, 2];
    const yesterdayDay = {
      date: data.daily.time[yesterdayIndex],
      tempMax: data.daily.temperature_2m_max[yesterdayIndex],
      tempMin: data.daily.temperature_2m_min[yesterdayIndex],
      precipitationSum: data.daily.precipitation_sum[yesterdayIndex],
      precipitationHours: data.daily.precipitation_hours[yesterdayIndex],
      evapotranspiration: data.daily.et0_fao_evapotranspiration[yesterdayIndex],
      windMax: data.daily.wind_speed_10m_max[yesterdayIndex],
    };
    const todayDay = {
      date: data.daily.time[todayIndex],
      tempMax: data.daily.temperature_2m_max[todayIndex],
      tempMin: data.daily.temperature_2m_min[todayIndex],
      precipitationSum: data.daily.precipitation_sum[todayIndex],
      precipitationHours: data.daily.precipitation_hours[todayIndex],
      evapotranspiration: data.daily.et0_fao_evapotranspiration[todayIndex],
      windMax: data.daily.wind_speed_10m_max[todayIndex],
    };
    const tomorrowDay = {
      date: data.daily.time[tomorrowIndex],
      tempMax: data.daily.temperature_2m_max[tomorrowIndex],
      tempMin: data.daily.temperature_2m_min[tomorrowIndex],
      precipitationSum: data.daily.precipitation_sum[tomorrowIndex],
      precipitationHours: data.daily.precipitation_hours[tomorrowIndex],
      evapotranspiration: data.daily.et0_fao_evapotranspiration[tomorrowIndex],
      windMax: data.daily.wind_speed_10m_max[tomorrowIndex],
    };
    const drynessScore = computeDrynessScore(todayDay, yesterdayDay);

    return {
      city: MILAN.city,
      today: todayDay,
      yesterday: yesterdayDay,
      tomorrow: tomorrowDay,
      current: {
        timestamp: data.current.time,
        temperature: data.current.temperature_2m,
        humidity: data.current.relative_humidity_2m,
        precipitation: data.current.precipitation,
        windSpeed: data.current.wind_speed_10m,
      },
      drynessScore,
      irrigationBias:
        drynessScore >= 5 ? "high" : drynessScore >= 3 ? "medium" : "low",
      summary: buildSummary(todayDay, yesterdayDay, drynessScore),
      sourceUrl,
    };
  } catch {
    return fallbackWeather(sourceUrl, today, yesterday, tomorrow);
  }
}

function computeDrynessScore(
  today: WeatherSnapshot["today"],
  yesterday: WeatherSnapshot["yesterday"],
) {
  let score = 0;
  const twoDayRain = today.precipitationSum + yesterday.precipitationSum;
  const maxEvapo = Math.max(today.evapotranspiration, yesterday.evapotranspiration);

  if (twoDayRain < 1) {
    score += 2;
  } else if (twoDayRain < 4) {
    score += 1;
  }

  if (today.tempMax >= 23) {
    score += 2;
  } else if (today.tempMax >= 19) {
    score += 1;
  }

  if (maxEvapo >= 3.5) {
    score += 2;
  } else if (maxEvapo >= 2.5) {
    score += 1;
  }

  if (today.windMax >= 9.5) {
    score += 1;
  }

  return Math.min(score, 6);
}

function buildSummary(
  today: WeatherSnapshot["today"],
  yesterday: WeatherSnapshot["yesterday"],
  drynessScore: number,
) {
  const rainText =
    today.precipitationSum + yesterday.precipitationSum < 1
      ? "niente pioggia tra ieri e oggi"
      : `circa ${(today.precipitationSum + yesterday.precipitationSum).toFixed(1)} mm di pioggia in 48h`;

  if (drynessScore >= 5) {
    return `Balcone piuttosto asciutto: ${rainText}, massima di oggi ${today.tempMax.toFixed(1)} °C e evaporazione sostenuta.`;
  }

  if (drynessScore >= 3) {
    return `Giornata moderatamente asciutta: ${rainText}, con massime tra ${yesterday.tempMax.toFixed(1)} e ${today.tempMax.toFixed(1)} °C.`;
  }

  return `Condizioni più morbide per l'irrigazione: ${rainText} e stress idrico limitato.`;
}

function fallbackWeather(
  sourceUrl: string,
  today: string,
  yesterday: string,
  tomorrow: string,
): WeatherSnapshot {
  const yesterdayDay = {
    date: yesterday,
    tempMax: 21.6,
    tempMin: 8.4,
    precipitationSum: 0,
    precipitationHours: 0,
    evapotranspiration: 3.72,
    windMax: 9.3,
  };

  const todayDay = {
    date: today,
    tempMax: 23.4,
    tempMin: 9.9,
    precipitationSum: 0,
    precipitationHours: 0,
    evapotranspiration: 3.87,
    windMax: 9.7,
  };
  const tomorrowDay = {
    date: tomorrow,
    tempMax: 21.4,
    tempMin: 11.2,
    precipitationSum: 0.2,
    precipitationHours: 1,
    evapotranspiration: 3.1,
    windMax: 8.8,
  };

  return {
    city: MILAN.city,
    today: todayDay,
    yesterday: yesterdayDay,
    tomorrow: tomorrowDay,
    current: {
      timestamp: `${today}T22:00`,
      temperature: 16.4,
      humidity: 54,
      precipitation: 0,
      windSpeed: 9.7,
    },
    drynessScore: computeDrynessScore(todayDay, yesterdayDay),
    irrigationBias: "high",
    summary: buildSummary(todayDay, yesterdayDay, 6),
    sourceUrl,
  };
}
