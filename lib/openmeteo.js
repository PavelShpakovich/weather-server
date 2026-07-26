// Open-Meteo API → Geely WeatherInfo format mappers.
// Open-Meteo is free, no API key required. https://open-meteo.com/
'use strict';

const WMO = {
  0: 'Ясно', 1: 'Малооблачно', 2: 'Переменная облачность', 3: 'Пасмурно',
  45: 'Туман', 48: 'Туман', 51: 'Морось', 53: 'Морось', 55: 'Морось',
  56: 'Ледяной дождь', 57: 'Ледяной дождь',
  61: 'Небольшой дождь', 63: 'Дождь', 65: 'Сильный дождь',
  66: 'Ледяной дождь', 67: 'Ледяной дождь',
  71: 'Небольшой снег', 73: 'Снег', 75: 'Сильный снег', 77: 'Снежная крупа',
  80: 'Ливень', 81: 'Ливень', 82: 'Сильный ливень',
  85: 'Снегопад', 86: 'Сильный снегопад',
  95: 'Гроза', 96: 'Гроза с градом', 99: 'Гроза с градом',
};

// WMO code → Geely weather3D animation index (pag_* assets)
const WMO_3D = {
  0: 0, 1: 1, 2: 1, 3: 2,
  45: 5, 48: 5, 51: 3, 53: 3, 55: 3, 56: 8, 57: 8,
  61: 3, 63: 3, 65: 3, 66: 8, 67: 8,
  71: 4, 73: 4, 75: 4, 77: 4,
  80: 3, 81: 3, 82: 3, 85: 4, 86: 4,
  95: 3, 96: 3, 99: 3,
};

const WIND_DIRS = ['С', 'СВ', 'В', 'ЮВ', 'Ю', 'ЮЗ', 'З', 'СЗ'];
const degToDir = (deg) => WIND_DIRS[Math.round(deg / 45) % 8];

const BASE = 'https://api.open-meteo.com/v1/forecast';

async function current(city) {
  const url = `${BASE}?latitude=${city.lat}&longitude=${city.lon}` +
    '&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,cloud_cover,pressure_msl,wind_speed_10m,wind_direction_10m,visibility' +
    '&daily=temperature_2m_max,temperature_2m_min,uv_index_max' +
    '&timezone=auto&forecast_days=1';
  const d = await (await fetch(url)).json();
  const c = d.current;
  const daily = d.daily;
  return {
    currentTemp: String(Math.round(c.temperature_2m)),
    sensiTemp: String(Math.round(c.apparent_temperature)),
    allMaxTemp: String(Math.round(daily.temperature_2m_max[0])),
    allMinTemp: String(Math.round(daily.temperature_2m_min[0])),
    currentRelaHumid: String(c.relative_humidity_2m),
    atmoPres: String(Math.round(c.pressure_msl * 0.750062)),
    currentWind: String(Math.round(c.wind_speed_10m)),
    windSpeed: String(Math.round(c.wind_speed_10m)),
    currentWinDir: degToDir(c.wind_direction_10m),
    windDirection: String(c.wind_direction_10m),
    uvInten: String(Math.round(daily.uv_index_max[0] || 0)),
    visibility: c.visibility != null ? String(Math.round(c.visibility / 1000)) : '10',
    cloudCover: String(c.cloud_cover),
    currentPrecipitation: String(c.precipitation),
    dewPointTemp: '0', snowDepth: '0',
    aqi: '50', pm: '0', pmt: '0', ozone: '0',
    nitrogenDioxide: '0', sulfurDioxide: '0', carbonMonoxide: '0',
    addTime: new Date().toISOString().replace('T', ' ').slice(0, 19),
    weathPheno: WMO[c.weather_code] || 'Ясно',
    weather3D: WMO_3D[c.weather_code] ?? 0,
  };
}

async function hours(city) {
  const url = `${BASE}?latitude=${city.lat}&longitude=${city.lon}` +
    '&hourly=temperature_2m,weather_code,wind_speed_10m,relative_humidity_2m' +
    '&timezone=auto&forecast_days=2';
  const d = await (await fetch(url)).json();
  const h = d.hourly;
  const nowISO = new Date().toISOString().slice(0, 13);
  const startIdx = Math.max(0, h.time.findIndex((t) => t.startsWith(nowISO)));
  const list = [];
  for (let i = startIdx; i < Math.min(startIdx + 24, h.time.length); i++) {
    list.push({
      time: h.time[i].slice(11, 16),
      temperature: String(Math.round(h.temperature_2m[i])),
      weathPheno: WMO[h.weather_code[i]] || 'Ясно',
      weather3D: WMO_3D[h.weather_code[i]] ?? 0,
      windSpeed: String(Math.round(h.wind_speed_10m[i])),
      humidity: String(h.relative_humidity_2m[i]),
    });
  }
  return list;
}

async function forecast(city) {
  const url = `${BASE}?latitude=${city.lat}&longitude=${city.lon}` +
    '&daily=weather_code,temperature_2m_max,temperature_2m_min,wind_speed_10m_max,wind_direction_10m_dominant,precipitation_probability_max,uv_index_max' +
    '&timezone=auto&forecast_days=15';
  const d = await (await fetch(url)).json();
  const daily = d.daily;
  return daily.time.map((date, i) => ({
    date,
    maxTemp: String(Math.round(daily.temperature_2m_max[i])),
    minTemp: String(Math.round(daily.temperature_2m_min[i])),
    weathPheno: WMO[daily.weather_code[i]] || 'Ясно',
    weather3D: WMO_3D[daily.weather_code[i]] ?? 0,
    windSpeed: String(Math.round(daily.wind_speed_10m_max[i])),
    windDirection: degToDir(daily.wind_direction_10m_dominant[i]),
    precipitation: String(daily.precipitation_probability_max[i] || 0),
    uvInten: String(Math.round(daily.uv_index_max[i] || 0)),
  }));
}

async function sun(city) {
  const url = `${BASE}?latitude=${city.lat}&longitude=${city.lon}` +
    '&daily=sunrise,sunset&timezone=auto&forecast_days=1';
  const d = await (await fetch(url)).json();
  return {
    sunrise: d.daily.sunrise[0].slice(11, 16),
    sunset: d.daily.sunset[0].slice(11, 16),
  };
}

module.exports = { current, hours, forecast, sun };
