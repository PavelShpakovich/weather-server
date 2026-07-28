// 20 Belarusian cities with coordinates for Open-Meteo geocoding.
// nameCN contains RUSSIAN names so the weather app's local SQL search
// (which searches by nameCN) works with Russian queries like "Минск".
"use strict";

const BY_CITIES = [
  {
    id: "BY_01",
    nameCN: "Минск",
    nameEN: "Minsk",
    provCN: "Беларусь",
    provEN: "Belarus",
    districtCN: "Минская обл.",
    districtEN: "Minsk Region",
    lat: 53.9006,
    lon: 27.559,
  },
  {
    id: "BY_02",
    nameCN: "Брест",
    nameEN: "Brest",
    provCN: "Беларусь",
    provEN: "Belarus",
    districtCN: "Брестская обл.",
    districtEN: "Brest Region",
    lat: 52.0975,
    lon: 23.7341,
  },
  {
    id: "BY_03",
    nameCN: "Гродно",
    nameEN: "Grodno",
    provCN: "Беларусь",
    provEN: "Belarus",
    districtCN: "Гродненская обл.",
    districtEN: "Grodno Region",
    lat: 53.6778,
    lon: 23.8295,
  },
  {
    id: "BY_04",
    nameCN: "Витебск",
    nameEN: "Vitebsk",
    provCN: "Беларусь",
    provEN: "Belarus",
    districtCN: "Витебская обл.",
    districtEN: "Vitebsk Region",
    lat: 55.1904,
    lon: 30.2049,
  },
  {
    id: "BY_05",
    nameCN: "Могилёв",
    nameEN: "Mogilev",
    provCN: "Беларусь",
    provEN: "Belarus",
    districtCN: "Могилёвская обл.",
    districtEN: "Mogilev Region",
    lat: 53.9007,
    lon: 30.3313,
  },
  {
    id: "BY_06",
    nameCN: "Гомель",
    nameEN: "Gomel",
    provCN: "Беларусь",
    provEN: "Belarus",
    districtCN: "Гомельская обл.",
    districtEN: "Gomel Region",
    lat: 52.4345,
    lon: 30.9754,
  },
  {
    id: "BY_07",
    nameCN: "Барановичи",
    nameEN: "Baranovichi",
    provCN: "Беларусь",
    provEN: "Belarus",
    districtCN: "Брестская обл.",
    districtEN: "Brest Region",
    lat: 53.1327,
    lon: 26.0139,
  },
  {
    id: "BY_08",
    nameCN: "Бобруйск",
    nameEN: "Bobruisk",
    provCN: "Беларусь",
    provEN: "Belarus",
    districtCN: "Могилёвская обл.",
    districtEN: "Mogilev Region",
    lat: 53.1384,
    lon: 29.2214,
  },
  {
    id: "BY_09",
    nameCN: "Борисов",
    nameEN: "Borisov",
    provCN: "Беларусь",
    provEN: "Belarus",
    districtCN: "Минская обл.",
    districtEN: "Minsk Region",
    lat: 54.2279,
    lon: 28.5053,
  },
  {
    id: "BY_10",
    nameCN: "Пинск",
    nameEN: "Pinsk",
    provCN: "Беларусь",
    provEN: "Belarus",
    districtCN: "Брестская обл.",
    districtEN: "Brest Region",
    lat: 52.1229,
    lon: 26.0951,
  },
  {
    id: "BY_11",
    nameCN: "Орша",
    nameEN: "Orsha",
    provCN: "Беларусь",
    provEN: "Belarus",
    districtCN: "Витебская обл.",
    districtEN: "Vitebsk Region",
    lat: 54.5081,
    lon: 30.4172,
  },
  {
    id: "BY_12",
    nameCN: "Мозырь",
    nameEN: "Mozyr",
    provCN: "Беларусь",
    provEN: "Belarus",
    districtCN: "Гомельская обл.",
    districtEN: "Gomel Region",
    lat: 52.0472,
    lon: 29.2453,
  },
  {
    id: "BY_13",
    nameCN: "Солигорск",
    nameEN: "Soligorsk",
    provCN: "Беларусь",
    provEN: "Belarus",
    districtCN: "Минская обл.",
    districtEN: "Minsk Region",
    lat: 52.7878,
    lon: 27.5411,
  },
  {
    id: "BY_14",
    nameCN: "Новополоцк",
    nameEN: "Novopolotsk",
    provCN: "Беларусь",
    provEN: "Belarus",
    districtCN: "Витебская обл.",
    districtEN: "Vitebsk Region",
    lat: 55.5322,
    lon: 28.65,
  },
  {
    id: "BY_15",
    nameCN: "Лида",
    nameEN: "Lida",
    provCN: "Беларусь",
    provEN: "Belarus",
    districtCN: "Гродненская обл.",
    districtEN: "Grodno Region",
    lat: 53.8884,
    lon: 25.2991,
  },
  {
    id: "BY_16",
    nameCN: "Молодечно",
    nameEN: "Molodechno",
    provCN: "Беларусь",
    provEN: "Belarus",
    districtCN: "Минская обл.",
    districtEN: "Minsk Region",
    lat: 54.3167,
    lon: 26.846,
  },
  {
    id: "BY_17",
    nameCN: "Полоцк",
    nameEN: "Polotsk",
    provCN: "Беларусь",
    provEN: "Belarus",
    districtCN: "Витебская обл.",
    districtEN: "Vitebsk Region",
    lat: 55.4868,
    lon: 28.7864,
  },
  {
    id: "BY_18",
    nameCN: "Жлобин",
    nameEN: "Zhlobin",
    provCN: "Беларусь",
    provEN: "Belarus",
    districtCN: "Гомельская обл.",
    districtEN: "Gomel Region",
    lat: 52.8953,
    lon: 30.0383,
  },
  {
    id: "BY_19",
    nameCN: "Речица",
    nameEN: "Rechitsa",
    provCN: "Беларусь",
    provEN: "Belarus",
    districtCN: "Гомельская обл.",
    districtEN: "Gomel Region",
    lat: 52.3628,
    lon: 30.3951,
  },
  {
    id: "BY_20",
    nameCN: "Слуцк",
    nameEN: "Slutsk",
    provCN: "Беларусь",
    provEN: "Belarus",
    districtCN: "Минская обл.",
    districtEN: "Minsk Region",
    lat: 53.0276,
    lon: 27.5587,
  },
];

const byId = new Map(BY_CITIES.map((c) => [c.id, c]));

function cityBean(c) {
  return {
    areaId: c.id,
    direct: 0,
    districtCN: c.districtCN,
    districtEN: c.districtEN,
    nameCN: c.nameCN,
    nameEN: c.nameEN,
    provCN: c.provCN,
    provEN: c.provEN,
  };
}

function nearestBYCity(lat, lon) {
  let best = BY_CITIES[0],
    bestD = Infinity;
  for (const c of BY_CITIES) {
    const d = (c.lat - lat) ** 2 + (c.lon - lon) ** 2;
    if (d < bestD) {
      bestD = d;
      best = c;
    }
  }
  return best;
}

function isInBelarus(lat, lon) {
  return lat >= 51.2 && lat <= 56.2 && lon >= 23.1 && lon <= 32.8;
}

module.exports = { BY_CITIES, byId, cityBean, nearestBYCity, isInBelarus };
