// 20 Belarusian cities with coordinates for Open-Meteo geocoding.
// areaId format: BY_01 … BY_20 (recognised by the proxy to route to Open-Meteo).
'use strict';

const BY_CITIES = [
  { id: 'BY_01', nameCN: '明斯克', nameEN: 'Minsk', provCN: '白俄罗斯', provEN: 'Belarus', districtCN: '明斯克州', districtEN: 'Minsk Region', lat: 53.9006, lon: 27.5590 },
  { id: 'BY_02', nameCN: '布列斯特', nameEN: 'Brest', provCN: '白俄罗斯', provEN: 'Belarus', districtCN: '布列斯特州', districtEN: 'Brest Region', lat: 52.0975, lon: 23.7341 },
  { id: 'BY_03', nameCN: '格罗德诺', nameEN: 'Grodno', provCN: '白俄罗斯', provEN: 'Belarus', districtCN: '格罗德诺州', districtEN: 'Grodno Region', lat: 53.6778, lon: 23.8295 },
  { id: 'BY_04', nameCN: '维捷布斯克', nameEN: 'Vitebsk', provCN: '白俄罗斯', provEN: 'Belarus', districtCN: '维捷布斯克州', districtEN: 'Vitebsk Region', lat: 55.1904, lon: 30.2049 },
  { id: 'BY_05', nameCN: '莫吉廖夫', nameEN: 'Mogilev', provCN: '白俄罗斯', provEN: 'Belarus', districtCN: '莫吉廖夫州', districtEN: 'Mogilev Region', lat: 53.9007, lon: 30.3313 },
  { id: 'BY_06', nameCN: '戈梅利', nameEN: 'Gomel', provCN: '白俄罗斯', provEN: 'Belarus', districtCN: '戈梅利州', districtEN: 'Gomel Region', lat: 52.4345, lon: 30.9754 },
  { id: 'BY_07', nameCN: '巴拉诺维奇', nameEN: 'Baranovichi', provCN: '白俄罗斯', provEN: 'Belarus', districtCN: '布列斯特州', districtEN: 'Brest Region', lat: 53.1327, lon: 26.0139 },
  { id: 'BY_08', nameCN: '博布鲁伊斯克', nameEN: 'Bobruisk', provCN: '白俄罗斯', provEN: 'Belarus', districtCN: '莫吉廖夫州', districtEN: 'Mogilev Region', lat: 53.1384, lon: 29.2214 },
  { id: 'BY_09', nameCN: '鲍里索夫', nameEN: 'Borisov', provCN: '白俄罗斯', provEN: 'Belarus', districtCN: '明斯克州', districtEN: 'Minsk Region', lat: 54.2279, lon: 28.5053 },
  { id: 'BY_10', nameCN: '平斯克', nameEN: 'Pinsk', provCN: '白俄罗斯', provEN: 'Belarus', districtCN: '布列斯特州', districtEN: 'Brest Region', lat: 52.1229, lon: 26.0951 },
  { id: 'BY_11', nameCN: '奥尔沙', nameEN: 'Orsha', provCN: '白俄罗斯', provEN: 'Belarus', districtCN: '维捷布斯克州', districtEN: 'Vitebsk Region', lat: 54.5081, lon: 30.4172 },
  { id: 'BY_12', nameCN: '莫济里', nameEN: 'Mozyr', provCN: '白俄罗斯', provEN: 'Belarus', districtCN: '戈梅利州', districtEN: 'Gomel Region', lat: 52.0472, lon: 29.2453 },
  { id: 'BY_13', nameCN: '索利戈尔斯克', nameEN: 'Soligorsk', provCN: '白俄罗斯', provEN: 'Belarus', districtCN: '明斯克州', districtEN: 'Minsk Region', lat: 52.7878, lon: 27.5411 },
  { id: 'BY_14', nameCN: '新波洛茨克', nameEN: 'Novopolotsk', provCN: '白俄罗斯', provEN: 'Belarus', districtCN: '维捷布斯克州', districtEN: 'Vitebsk Region', lat: 55.5322, lon: 28.6500 },
  { id: 'BY_15', nameCN: '利达', nameEN: 'Lida', provCN: '白俄罗斯', provEN: 'Belarus', districtCN: '格罗德诺州', districtEN: 'Grodno Region', lat: 53.8884, lon: 25.2991 },
  { id: 'BY_16', nameCN: '莫洛杰奇诺', nameEN: 'Molodechno', provCN: '白俄罗斯', provEN: 'Belarus', districtCN: '明斯克州', districtEN: 'Minsk Region', lat: 54.3167, lon: 26.8460 },
  { id: 'BY_17', nameCN: '波洛茨克', nameEN: 'Polotsk', provCN: '白俄罗斯', provEN: 'Belarus', districtCN: '维捷布斯克州', districtEN: 'Vitebsk Region', lat: 55.4868, lon: 28.7864 },
  { id: 'BY_18', nameCN: '日洛宾', nameEN: 'Zhlobin', provCN: '白俄罗斯', provEN: 'Belarus', districtCN: '戈梅利州', districtEN: 'Gomel Region', lat: 52.8953, lon: 30.0383 },
  { id: 'BY_19', nameCN: '列奇察', nameEN: 'Rechitsa', provCN: '白俄罗斯', provEN: 'Belarus', districtCN: '戈梅利州', districtEN: 'Gomel Region', lat: 52.3628, lon: 30.3951 },
  { id: 'BY_20', nameCN: '斯卢茨克', nameEN: 'Slutsk', provCN: '白俄罗斯', provEN: 'Belarus', districtCN: '明斯克州', districtEN: 'Minsk Region', lat: 53.0276, lon: 27.5587 },
];

const byId = new Map(BY_CITIES.map((c) => [c.id, c]));

function cityBean(c) {
  return {
    areaId: c.id, direct: 0,
    districtCN: c.districtCN, districtEN: c.districtEN,
    nameCN: c.nameCN, nameEN: c.nameEN,
    provCN: c.provCN, provEN: c.provEN,
  };
}

// Belarus bounding box for reverse-geocode
function nearestBYCity(lat, lon) {
  let best = BY_CITIES[0], bestD = Infinity;
  for (const c of BY_CITIES) {
    const d = (c.lat - lat) ** 2 + (c.lon - lon) ** 2;
    if (d < bestD) { bestD = d; best = c; }
  }
  return best;
}

function isInBelarus(lat, lon) {
  return lat >= 51.2 && lat <= 56.2 && lon >= 23.1 && lon <= 32.8;
}

module.exports = { BY_CITIES, byId, cityBean, nearestBYCity, isInBelarus };
