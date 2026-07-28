// Open-Meteo API → Geely WeatherInfo format mappers.
// Open-Meteo is free, no API key required. https://open-meteo.com/
// v3.0 — field names match Geely API exactly (temp, updateTime, windCode, etc.)
"use strict";

const WMO = {
  0: "Ясно",
  1: "Малооблачно",
  2: "Переменная облачность",
  3: "Пасмурно",
  45: "Туман",
  48: "Туман",
  51: "Морось",
  53: "Морось",
  55: "Морось",
  56: "Ледяной дождь",
  57: "Ледяной дождь",
  61: "Небольшой дождь",
  63: "Дождь",
  65: "Сильный дождь",
  66: "Ледяной дождь",
  67: "Ледяной дождь",
  71: "Небольшой снег",
  73: "Снег",
  75: "Сильный снег",
  77: "Снежная крупа",
  80: "Ливень",
  81: "Ливень",
  82: "Сильный ливень",
  85: "Снегопад",
  86: "Сильный снегопад",
  95: "Гроза",
  96: "Гроза с градом",
  99: "Гроза с градом",
};

const WMO_3D = {
  0: 0,
  1: 1,
  2: 1,
  3: 2,
  45: 5,
  48: 5,
  51: 3,
  53: 3,
  55: 3,
  56: 8,
  57: 8,
  61: 3,
  63: 3,
  65: 3,
  66: 8,
  67: 8,
  71: 4,
  73: 4,
  75: 4,
  77: 4,
  80: 3,
  81: 3,
  82: 3,
  85: 4,
  86: 4,
  95: 3,
  96: 3,
  99: 3,
};

const WIND_DIRS = ["С", "СВ", "В", "ЮВ", "Ю", "ЮЗ", "З", "СЗ"];
const degToDir = (deg) => WIND_DIRS[Math.round(deg / 45) % 8];

// --- Wind speed helpers (km/h → Beaufort / m/s / description) ---------------
const BEAUFORT_LIMITS = [1, 5, 11, 19, 28, 38, 49, 61, 74, 88, 102, 117, 999];
const WIND_DESC_RU = [
  "Штиль",
  "Тихий",
  "Лёгкий",
  "Слабый",
  "Умеренный",
  "Свежий",
  "Сильный",
  "Крепкий",
  "Очень крепкий",
  "Шторм",
  "Сильный шторм",
  "Жестокий шторм",
  "Ураган",
];
function kmhToBeaufort(kmh) {
  for (let i = 0; i < BEAUFORT_LIMITS.length; i++) {
    if (kmh <= BEAUFORT_LIMITS[i]) return i;
  }
  return 12;
}
const kmhToMs = (kmh) => (kmh / 3.6).toFixed(1);
const windLevelStr = (kmh) => kmhToBeaufort(kmh) + "级";
const windDescRu = (kmh) => WIND_DESC_RU[kmhToBeaufort(kmh)] || "Умеренный";

// --- UV index description ---------------------------------------------------
function uvDescRu(uv) {
  if (uv <= 2) return "Слабый";
  if (uv <= 5) return "Умеренный";
  if (uv <= 7) return "Сильный";
  if (uv <= 10) return "Очень сильный";
  return "Экстремальный";
}

const wmoToModelCode = (wmo) => String(WMO_3D[wmo] ?? 0);

const BASE = "https://api.open-meteo.com/v1/forecast";

async function current(city) {
  const url =
    `${BASE}?latitude=${city.lat}&longitude=${city.lon}` +
    "&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,cloud_cover,pressure_msl,wind_speed_10m,wind_direction_10m,visibility" +
    "&daily=temperature_2m_max,temperature_2m_min,uv_index_max" +
    "&timezone=auto&forecast_days=1";
  const d = await (await fetch(url)).json();
  const c = d.current;
  const daily = d.daily;
  const wmo = c.weather_code;
  const pheno = WMO[wmo] || "Ясно";
  const uvVal = Math.round(daily.uv_index_max[0] || 0);
  const windKmh = Math.round(c.wind_speed_10m);
  return {
    areaId: city.id,
    currentTemp: String(Math.round(c.temperature_2m)),
    weathPheno: pheno,
    currentRelaHumid: String(c.relative_humidity_2m),
    sensiTemp: String(Math.round(c.apparent_temperature)),
    uvintenValue: String(uvVal),
    currentWinDir: degToDir(c.wind_direction_10m),
    currentWind: windLevelStr(windKmh),
    atmoPres: String(Math.round(c.pressure_msl * 0.750062)),
    addTime: new Date().toTimeString().slice(0, 5),
    currentPrecipitation: String(c.precipitation),
    visibility:
      c.visibility != null ? String(Math.round(c.visibility / 1000)) : "10",
    windDirection: String(c.wind_direction_10m),
    windSpeed: kmhToMs(windKmh),
    cloudCover: String(c.cloud_cover),
    dewPointTemp: "0",
    snowDepth: "",
    uvInten: uvDescRu(uvVal),
    nitrogenDioxide: "0",
    ozone: "0",
    pm: "0",
    sulfurDioxide: "0",
    carbonMonoxide: "0",
    pmt: "0",
    allMaxTemp: String(Math.round(daily.temperature_2m_max[0])),
    allMinTemp: String(Math.round(daily.temperature_2m_min[0])),
    weatherModel: pheno,
    weatherModelCode: wmoToModelCode(wmo),
    aqi: "50",
  };
}

async function hours(city) {
  const url =
    `${BASE}?latitude=${city.lat}&longitude=${city.lon}` +
    "&hourly=temperature_2m,weather_code,wind_speed_10m,wind_direction_10m" +
    "&timezone=auto&forecast_days=2";
  const d = await (await fetch(url)).json();
  const h = d.hourly;
  const now = new Date();
  const nowHour = now.getHours();
  const todayStr = now.toISOString().slice(0, 10);
  const startIdx = Math.max(
    0,
    h.time.findIndex((t) => {
      const hour = parseInt(t.slice(11, 13), 10);
      const day = t.slice(0, 10);
      return day === todayStr && hour >= nowHour;
    }),
  );
  const idx = startIdx >= 0 ? startIdx : nowHour;
  const list = [];
  for (let i = idx; i < Math.min(idx + 24, h.time.length); i++) {
    const windKmh = Math.round(h.wind_speed_10m[i]);
    const hourStr = h.time[i].slice(11, 16);
    list.push({
      areaId: city.id,
      id: String(851031807 + i),
      temp: String(Math.round(h.temperature_2m[i])),
      weathPheno: WMO[h.weather_code[i]] || "Ясно",
      windDirCode: degToDir(h.wind_direction_10m[i]),
      windCode: windDescRu(windKmh),
      updateTime: todayStr + " " + hourStr,
    });
  }
  return list;
}

async function forecast(city) {
  const url =
    `${BASE}?latitude=${city.lat}&longitude=${city.lon}` +
    "&daily=weather_code,temperature_2m_max,temperature_2m_min,wind_speed_10m_max,wind_direction_10m_dominant,precipitation_probability_max,uv_index_max" +
    "&timezone=auto&forecast_days=15";
  const d = await (await fetch(url)).json();
  const daily = d.daily;
  return daily.time.map((date, i) => {
    const wmo = daily.weather_code[i];
    const pheno = WMO[wmo] || "Ясно";
    const windKmh = Math.round(daily.wind_speed_10m_max[i]);
    const dir = degToDir(daily.wind_direction_10m_dominant[i]);
    return {
      areaId: city.id,
      date,
      dayTemp: String(Math.round(daily.temperature_2m_max[i])),
      nightTemp: String(Math.round(daily.temperature_2m_min[i])),
      dayWeathPheno: pheno,
      nightWeathPheno: pheno,
      dayWindDir: dir,
      nightWindDir: dir,
      dayWind: windLevelStr(windKmh),
      nightWind: windLevelStr(windKmh),
      dayWindCode: windDescRu(windKmh),
      nightWindCode: windDescRu(windKmh),
      uvInten: uvDescRu(Math.round(daily.uv_index_max[i] || 0)),
      precipitation: String(daily.precipitation_probability_max[i] || 0),
    };
  });
}

async function sun(city) {
  const url =
    `${BASE}?latitude=${city.lat}&longitude=${city.lon}` +
    "&daily=sunrise,sunset&timezone=auto&forecast_days=1";
  const d = await (await fetch(url)).json();
  return {
    sunrise: d.daily.sunrise[0].slice(11, 16),
    sunset: d.daily.sunset[0].slice(11, 16),
  };
}

module.exports = { current, hours, forecast, sun };
