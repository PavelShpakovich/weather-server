// CN → RU translation for Geely weather API responses.
// Applied to all proxied (non-BY) responses so the weather app shows Russian.
"use strict";

// Translations match the Russian strings in WeatherUtil.smali sparse-switch
// so icons work for non-BY cities (original Geely API → translated).
const CN_RU_WEATHER = {
  晴: "Ясно",
  阴: "Пасмурно",
  多云: "Малооблачно",
  少云: "Малооблачно",
  小雨: "Небольшой дождь",
  中雨: "Морось",
  大雨: "Сильный дождь",
  暴雨: "Сильный ливень",
  大暴雨: "Очень сильный ливень",
  特大暴雨: "Экстремальный ливень",
  阵雨: "Ливень",
  雷阵雨: "Гроза",
  雷阵雨伴有冰雹: "Гроза с градом",
  雨夹雪: "Мокрый снег",
  冻雨: "Ледяной дождь",
  小到中雨: "От небольшого до умеренного дождя",
  中到大雨: "От умеренного до сильного дождя",
  大到暴雨: "От сильного дождя до ливня",
  暴雨到大暴雨: "От ливня до сильного ливня",
  大暴雨到特大暴雨: "От сильного до очень сильного ливня",
  小雪: "Небольшой снег",
  中雪: "Снегопад",
  大雪: "Сильный снег",
  暴雪: "Сильная метель",
  阵雪: "Сильный снегопад",
  小到中雪: "От небольшого до умеренного снега",
  中到大雪: "От умеренного до сильного снега",
  大到暴雪: "От сильного снега до метели",
  雾: "Туман",
  大雾: "Густой туман",
  浓雾: "Очень густой туман",
  强浓雾: "Сильный туман",
  特强浓雾: "Очень сильный туман",
  霾: "Дымка",
  中度霾: "Умеренная дымка",
  重度霾: "Сильная дымка",
  严重霾: "Очень сильная дымка",
  浮尘: "Пыль",
  扬沙: "Песок",
  沙尘暴: "Песчаная буря",
  强沙尘暴: "Сильная пыльная буря",
  雨: "Дождь",
  雪: "Снег",
};

const CN_RU_WIND = {
  无风: "Штиль",
  北风: "Северный",
  东北风: "Северо-восточный",
  东风: "Восточный",
  东南风: "Юго-восточный",
  南风: "Южный",
  西南风: "Юго-западный",
  西风: "Западный",
  西北风: "Северо-западный",
  北: "С",
  东北: "СВ",
  东: "В",
  东南: "ЮВ",
  南: "Ю",
  西南: "ЮЗ",
  西: "З",
  西北: "СЗ",
};

function translateWindLevel(s) {
  if (!s) return s;
  return s.replace(/(\d+)级/, "$1 м/с").replace(/级/, " м/с");
}

function translateCN(str) {
  if (!str || typeof str !== "string") return str;
  if (CN_RU_WEATHER[str]) return CN_RU_WEATHER[str];
  if (CN_RU_WIND[str]) return CN_RU_WIND[str];
  for (const [cn, ru] of Object.entries(CN_RU_WIND)) {
    if (str.startsWith(cn)) {
      return ru + " " + translateWindLevel(str.slice(cn.length));
    }
  }
  return str;
}

const TRANSLATE_FIELDS = new Set([
  "weathPheno",
  "dayWeathPheno",
  "nightWeathPheno",
  "currentWinDir",
  "dayWindDir",
  "nightWindDir",
  "windDirection",
]);

function translateObj(obj) {
  if (!obj || typeof obj !== "object") return obj;
  if (Array.isArray(obj)) return obj.map(translateObj);
  const out = {};
  for (const [k, v] of Object.entries(obj)) {
    if (typeof v === "string" && TRANSLATE_FIELDS.has(k)) {
      out[k] = translateCN(v);
    } else if (typeof v === "object" && v !== null) {
      out[k] = translateObj(v);
    } else {
      out[k] = v;
    }
  }
  return out;
}

function translateResponse(body) {
  try {
    const parsed = JSON.parse(body);
    if (parsed.data) parsed.data = translateObj(parsed.data);
    return JSON.stringify(parsed);
  } catch {
    return body;
  }
}

module.exports = { translateCN, translateObj, translateResponse };
