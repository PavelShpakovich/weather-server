// Open-Meteo Geocoding API adapter for worldwide city search.
"use strict";

const BASE = "https://geocoding-api.open-meteo.com/v1/search";

function cityBean(result) {
  const latitude = Number(result.latitude);
  const longitude = Number(result.longitude);
  const lat = latitude.toFixed(4);
  const lon = longitude.toFixed(4);
  const name = result.name || "";
  const region = result.admin1 || result.admin2 || "";
  const country = result.country || "";
  return {
    areaId: `OM_${lat}_${lon}`,
    nameCN: name,
    nameEN: result.name || name,
    provCN: country,
    provEN: country,
    districtCN: region,
    districtEN: region,
    direct: 0,
    latitude,
    longitude,
  };
}

async function search(query, count = 20) {
  const params = new URLSearchParams({
    name: query,
    count: String(count),
    language: "ru",
    format: "json",
  });
  const response = await fetch(`${BASE}?${params}`);
  if (!response.ok) {
    throw new Error(`Geocoding API returned ${response.status}`);
  }
  const body = await response.json();
  return Array.isArray(body.results) ? body.results.map(cityBean) : [];
}

module.exports = { search };
