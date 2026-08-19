// In-memory "management list" (bound cities) store.
// Vercel functions are stateless across cold starts, so this only survives
// for the lifetime of a warm instance — good enough for a single vehicle's
// session, but the list resets to the BY_CITIES default after a cold start.
"use strict";

const { BY_CITIES, byId } = require("./cities");

function defaultCities() {
  return BY_CITIES.slice(0, 3).map((c) => ({
    areaId: c.id,
    nameCN: c.nameCN,
    nameEN: c.nameEN,
    provCN: c.provCN,
    provEN: c.provEN,
    districtCN: c.districtCN,
    districtEN: c.districtEN,
    // client deserializes /climate/cityList as CityItem, whose field is `addressType` (not CityBean's `direct`)
    addressType: 0,
    lat: c.lat,
    lon: c.lon,
  }));
}

// areaId -> stored record. Populated lazily so a fresh cold start still
// shows the same default cities as before this store existed.
let store = null;

function ensureStore() {
  if (!store) {
    store = new Map(defaultCities().map((c) => [c.areaId, c]));
  }
  return store;
}

function coordsForAreaId(areaId) {
  const byCity = byId.get(areaId);
  if (byCity) return { lat: byCity.lat, lon: byCity.lon };
  const match = /^OM_(-?\d+(?:\.\d+)?)_(-?\d+(?:\.\d+)?)$/.exec(areaId);
  if (!match) return null;
  return { lat: Number(match[1]), lon: Number(match[2]) };
}

function addCity(param) {
  const s = ensureStore();
  const areaId = param.areaId || "";
  const nameCN = param.nameCN || "";
  const districtCN = param.districtCN || "";
  if (!areaId || (!nameCN && !districtCN)) return;
  const coords = coordsForAreaId(areaId);
  s.set(areaId, {
    areaId,
    nameCN,
    nameEN: param.nameEN || nameCN,
    provCN: param.provCN || "",
    provEN: param.provEN || param.provCN || "",
    districtCN,
    districtEN: param.districtEN || districtCN,
    addressType: Number(param.addressType) || 0,
    lat: coords ? coords.lat : undefined,
    lon: coords ? coords.lon : undefined,
  });
}

function removeCities(addressList) {
  const s = ensureStore();
  const ids = (addressList || "")
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean);
  for (const id of ids) s.delete(id);
}

function listCities() {
  return Array.from(ensureStore().values());
}

module.exports = { addCity, removeCities, listCities };
