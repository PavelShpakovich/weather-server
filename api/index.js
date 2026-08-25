// Vercel serverless handler — worldwide Open-Meteo weather proxy.
// Routes /geely/znzc/oneos/climate/* using BY_xx or OM_<lat>_<lon> area IDs.
"use strict";

const {
  BY_CITIES,
  byId,
  cityBean,
  nearestBYCity,
  isInBelarus,
} = require("../lib/cities");
const openmeteo = require("../lib/openmeteo");
const geocoding = require("../lib/geocoding");

const LEGACY_AREA_IDS = new Map([["110105", "BY_01"]]);
const MAX_CITY_LIST_ENTRIES = 50;
const MAX_CITY_LIST_JSON_LENGTH = 20_000;

function ok(data) {
  return { code: 200, message: "success", success: true, data };
}

function fail(res, status, message) {
  return res.status(status).json({
    code: status,
    message,
    success: false,
    data: null,
  });
}

function parsePage(url) {
  const raw =
    url.searchParams.get("page") || url.searchParams.get("pageNo") || "1";
  const page = parseInt(raw, 10);
  return Number.isNaN(page) ? 1 : page;
}

function byKeyword(keyword) {
  if (!keyword) return BY_CITIES;
  return BY_CITIES.filter(
    (c) =>
      c.nameCN.toLowerCase().includes(keyword) ||
      c.nameEN.toLowerCase().includes(keyword) ||
      c.districtCN.toLowerCase().includes(keyword) ||
      c.provCN.toLowerCase().includes(keyword),
  );
}

function cityForAreaId(areaId) {
  const canonicalAreaId = LEGACY_AREA_IDS.get(areaId) || areaId;
  const byCity = byId.get(canonicalAreaId);
  if (byCity) return byCity;
  const match = /^OM_(-?\d+(?:\.\d+)?)_(-?\d+(?:\.\d+)?)$/.exec(areaId);
  if (!match) return null;
  return {
    id: areaId,
    lat: Number(match[1]),
    lon: Number(match[2]),
  };
}

module.exports = async (req, res) => {
  const url = new URL(req.url, `https://${req.headers.host || "localhost"}`);
  const path = url.pathname;
  const areaId = url.searchParams.get("areaId") || "";
  const city = cityForAreaId(areaId);

  try {
    // --- City list (with optional keyword filter) ---
    if (path.endsWith("/climate/citys")) {
      const page = parsePage(url);
      const keyword = (
        url.searchParams.get("keyword") ||
        url.searchParams.get("cityName") ||
        ""
      ).toLowerCase();
      const byMatches = byKeyword(keyword).map(cityBean);

      if (page > 1) {
        return res.status(200).json(
          ok({
            list: [],
            pageNo: page,
            pageSize: 0,
            total: String(byMatches.length),
            end: true,
          }),
        );
      }
      return res.status(200).json(
        ok({
          list: byMatches,
          pageNo: page,
          pageSize: byMatches.length,
          total: String(byMatches.length),
          end: true,
        }),
      );
    }

    // --- City search (by name) ---
    if (
      path.endsWith("/climate/searchCity") ||
      path.endsWith("/climate/search")
    ) {
      const q = (
        url.searchParams.get("keyword") ||
        url.searchParams.get("cityName") ||
        url.searchParams.get("q") ||
        ""
      ).toLowerCase();
      if (!q) return res.status(200).json(ok([]));
      const localResults = BY_CITIES.filter(
        (c) =>
          c.nameCN.toLowerCase().includes(q) ||
          c.nameEN.toLowerCase().includes(q) ||
          c.districtCN.toLowerCase().includes(q) ||
          c.provCN.toLowerCase().includes(q),
      ).map(cityBean);
      const remoteResults = await geocoding.search(q);
      const seen = new Set();
      const results = [...localResults, ...remoteResults].filter((item) => {
        if (seen.has(item.areaId)) return false;
        seen.add(item.areaId);
        return true;
      });
      return res.status(200).json(ok(results));
    }

    // --- City management list: stateless, built from the client's own local city set ---
    // The app sends its SP `CityOrderBean` JSON (areaId/districtCN/nameCN/addressType/order) as
    // `citys`; we only attach live weather. No server-side storage, no default seed city list.
    if (path.endsWith("/climate/cityList")) {
      const raw = url.searchParams.get("citys") || "[]";
      if (raw.length > MAX_CITY_LIST_JSON_LENGTH) {
        return fail(res, 413, "city list is too large");
      }
      let entries;
      try {
        entries = JSON.parse(raw);
      } catch {
        return fail(res, 400, "invalid city list");
      }
      if (!Array.isArray(entries)) return fail(res, 400, "invalid city list");
      if (entries.length > MAX_CITY_LIST_ENTRIES) {
        return fail(res, 400, "too many cities");
      }

      const list = await Promise.all(
        entries
          .filter((entry) => entry && entry.areaId && (entry.nameCN || entry.districtCN))
          .map(async (entry) => {
            const bean = {
              areaId: entry.areaId,
              nameCN: entry.nameCN || "",
              districtCN: entry.districtCN || "",
              addressType: entry.addressType != null ? entry.addressType : 1,
            };
            const city = cityForAreaId(entry.areaId);
            if (city) {
              try {
                Object.assign(bean, await openmeteo.current(city));
              } catch {
                // Keep the city visible when weather fetch is temporarily unavailable.
              }
            }
            return bean;
          }),
      );
      return res.status(200).json(ok(list));
    }

    // --- Current weather ---
    if (path.endsWith("/climate/current")) {
      if (!city) return fail(res, 400, "unknown areaId");
      return res.status(200).json(ok(await openmeteo.current(city)));
    }

    // --- Hourly forecast ---
    if (path.endsWith("/climate/hours")) {
      if (!city) return fail(res, 400, "unknown areaId");
      return res.status(200).json(ok(await openmeteo.hours(city)));
    }

    // --- 15-day forecast ---
    if (
      path.endsWith("/climate/newhalfmonth") ||
      path.endsWith("/climate/halfmonth")
    ) {
      if (!city) return fail(res, 400, "unknown areaId");
      return res.status(200).json(ok(await openmeteo.forecast(city)));
    }

    // --- Sunrise / sunset ---
    if (path.endsWith("/climate/sunriseAndSunset")) {
      if (!city) return fail(res, 400, "unknown areaId");
      return res.status(200).json(ok(await openmeteo.sun(city)));
    }

    // --- Area lookup by coordinates ---
    if (path.endsWith("/climate/area")) {
      const loc = url.searchParams.get("location") || "";
      const [lat, lon] = loc.split(",").map(Number);
      if (!isNaN(lat) && !isNaN(lon) && isInBelarus(lat, lon)) {
        return res.status(200).json(ok(cityBean(nearestBYCity(lat, lon))));
      }
      if (!isNaN(lat) && !isNaN(lon)) {
        return res.status(200).json(
          ok({
            areaId: `OM_${lat.toFixed(4)}_${lon.toFixed(4)}`,
            nameCN: "",
            nameEN: "",
            provCN: "",
            provEN: "",
            districtCN: "",
            districtEN: "",
            direct: 0,
          }),
        );
      }
      return fail(res, 400, "invalid location");
    }

    // --- Bind/unbind city: no-op. The city set lives on-device, not on the server. ---
    if (path.endsWith("/climate/bindcity") && req.method === "POST") {
      return res.status(200).json(ok(null));
    }

    return res.status(404).json({
      code: 404,
      message: "Unknown climate endpoint",
      success: false,
      data: null,
    });
  } catch (err) {
    console.error(`[proxy] ${path}: ${err.message}`);
    fail(res, 502, "weather upstream is unavailable");
  }
};
