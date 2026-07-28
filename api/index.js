// Vercel serverless handler — Geely weather proxy v3.0
// Routes /geely/znzc/oneos/climate/* : BY cities → Open-Meteo, rest → Geely cloud + CN→RU translation.
// v3.0: added /searchCity endpoint + keyword filtering in /citys
"use strict";

const {
  BY_CITIES,
  byId,
  cityBean,
  nearestBYCity,
  isInBelarus,
} = require("../lib/cities");
const openmeteo = require("../lib/openmeteo");
const { translateResponse } = require("../lib/translate");

const GEELY_BASE = process.env.GEELY_UPSTREAM || "https://oneoss-ecu.geely.com";

function ok(data) {
  return { code: 200, message: "success", success: true, data };
}

async function proxyGeely(req, path) {
  const url = `${GEELY_BASE}${path}`;
  const headers = {};
  for (const [k, v] of Object.entries(req.headers)) {
    if (
      ![
        "host",
        "connection",
        "x-forwarded-for",
        "x-forwarded-proto",
        "x-vercel-proxy",
      ].includes(k.toLowerCase())
    ) {
      headers[k] = v;
    }
  }
  const opts = { method: req.method, headers };
  if (req.method === "POST" && req.body) {
    opts.body =
      typeof req.body === "string" ? req.body : JSON.stringify(req.body);
    headers["content-type"] = "application/json";
  }
  const res = await fetch(url, opts);
  const body = await res.text();
  return { status: res.status, body };
}

module.exports = async (req, res) => {
  const url = new URL(req.url, `https://${req.headers.host || "localhost"}`);
  const path = url.pathname;
  const areaId = url.searchParams.get("areaId") || "";
  const isBY = areaId.startsWith("BY_");
  const city = byId.get(areaId);

  try {
    // --- City list (with optional keyword filter) ---
    if (path.endsWith("/climate/citys")) {
      const page = parseInt(url.searchParams.get("page") || "1", 10);
      const keyword = (
        url.searchParams.get("keyword") ||
        url.searchParams.get("cityName") ||
        ""
      ).toLowerCase();
      if (page === 1) {
        let cities = BY_CITIES;
        if (keyword) {
          cities = cities.filter(
            (c) =>
              c.nameCN.toLowerCase().includes(keyword) ||
              c.nameEN.toLowerCase().includes(keyword) ||
              c.districtCN.toLowerCase().includes(keyword),
          );
        }
        return res.status(200).json(ok(cities.map(cityBean)));
      }
      const r = await proxyGeely(req, req.url);
      return res.status(r.status).send(translateResponse(r.body));
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
      const results = BY_CITIES.filter(
        (c) =>
          c.nameCN.toLowerCase().includes(q) ||
          c.nameEN.toLowerCase().includes(q) ||
          c.districtCN.toLowerCase().includes(q) ||
          c.provCN.toLowerCase().includes(q),
      ).map(cityBean);
      return res.status(200).json(ok(results));
    }

    // --- City management list (per VIN) ---
    if (path.endsWith("/climate/cityList")) {
      const r = await proxyGeely(req, req.url);
      try {
        const bean = JSON.parse(r.body);
        if (bean.code === 200 && Array.isArray(bean.data)) {
          if (!bean.data.some((c) => c.areaId?.startsWith("BY_"))) {
            bean.data.unshift(cityBean(BY_CITIES[0]));
          }
        }
        return res.status(r.status).json(bean);
      } catch {
        return res.status(r.status).send(r.body);
      }
    }

    // --- Current weather ---
    if (path.endsWith("/climate/current")) {
      if (isBY && city)
        return res.status(200).json(ok(await openmeteo.current(city)));
      const r = await proxyGeely(req, req.url);
      return res.status(r.status).send(translateResponse(r.body));
    }

    // --- Hourly forecast ---
    if (path.endsWith("/climate/hours")) {
      if (isBY && city)
        return res.status(200).json(ok(await openmeteo.hours(city)));
      const r = await proxyGeely(req, req.url);
      return res.status(r.status).send(translateResponse(r.body));
    }

    // --- 15-day forecast ---
    if (
      path.endsWith("/climate/newhalfmonth") ||
      path.endsWith("/climate/halfmonth")
    ) {
      if (isBY && city)
        return res.status(200).json(ok(await openmeteo.forecast(city)));
      const r = await proxyGeely(req, req.url);
      return res.status(r.status).send(translateResponse(r.body));
    }

    // --- Sunrise / sunset ---
    if (path.endsWith("/climate/sunriseAndSunset")) {
      if (isBY && city)
        return res.status(200).json(ok(await openmeteo.sun(city)));
      const r = await proxyGeely(req, req.url);
      return res.status(r.status).send(translateResponse(r.body));
    }

    // --- Area lookup by coordinates ---
    if (path.endsWith("/climate/area")) {
      const loc = url.searchParams.get("location") || "";
      const [lat, lon] = loc.split(",").map(Number);
      if (!isNaN(lat) && !isNaN(lon) && isInBelarus(lat, lon)) {
        return res.status(200).json(ok(cityBean(nearestBYCity(lat, lon))));
      }
      const r = await proxyGeely(req, req.url);
      return res.status(r.status).send(translateResponse(r.body));
    }

    // --- Bind/unbind city ---
    if (path.endsWith("/climate/bindcity") && req.method === "POST") {
      const body =
        typeof req.body === "string"
          ? JSON.parse(req.body || "{}")
          : req.body || {};
      if (body.areaId?.startsWith("BY_")) return res.status(200).json(ok(null));
      const r = await proxyGeely(req, req.url);
      return res.status(r.status).send(r.body);
    }

    // --- Everything else: proxy with translation ---
    const r = await proxyGeely(req, req.url);
    res.status(r.status).send(translateResponse(r.body));
  } catch (err) {
    console.error(`[proxy] ${path}: ${err.message}`);
    res
      .status(500)
      .json({ code: 500, message: err.message, success: false, data: null });
  }
};
