var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __markAsModule = (target) => __defProp(target, "__esModule", { value: true });
var __export = (target, all) => {
  __markAsModule(target);
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __reExport = (target, module2, desc) => {
  if (module2 && typeof module2 === "object" || typeof module2 === "function") {
    for (let key of __getOwnPropNames(module2))
      if (!__hasOwnProp.call(target, key) && key !== "default")
        __defProp(target, key, { get: () => module2[key], enumerable: !(desc = __getOwnPropDesc(module2, key)) || desc.enumerable });
  }
  return target;
};
var __toModule = (module2) => {
  return __reExport(__markAsModule(__defProp(module2 != null ? __create(__getProtoOf(module2)) : {}, "default", module2 && module2.__esModule && "default" in module2 ? { get: () => module2.default, enumerable: true } : { value: module2, enumerable: true })), module2);
};

// netlify/functions/contests.ts
__export(exports, {
  handler: () => handler
});
var import_fs = __toModule(require("fs"));
var import_path = __toModule(require("path"));
var MAX_RESULTS = 1e3;
var handler = async (event) => {
  var _a, _b, _c, _d, _e, _f, _g, _h, _i;
  try {
    const filePath = import_path.default.resolve(process.cwd(), "data/private/contests.json");
    const raw = import_fs.default.readFileSync(filePath, "utf-8");
    const contests = JSON.parse(raw);
    const qs = (_a = event.queryStringParameters) != null ? _a : {};
    const allowedParams = [
      "year",
      "decade",
      "tour",
      "country",
      "region",
      "venueKey",
      "eventGender",
      "search",
      "limit",
      "offset"
    ];
    const invalidParam = Object.keys(qs).find((key) => !allowedParams.includes(key));
    if (invalidParam) {
      return {
        statusCode: 400,
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          error: `Invalid query parameter: ${invalidParam}`
        })
      };
    }
    const parsedLimit = qs.limit ? Number(qs.limit) : MAX_RESULTS;
    const parsedYear = qs.year ? Number(qs.year) : void 0;
    const parsedDecade = qs.decade ? Number(qs.decade) : void 0;
    const parsedOffset = qs.offset ? Number(qs.offset) : 0;
    if (!Number.isFinite(parsedLimit) || parsedLimit <= 0) {
      return {
        statusCode: 400,
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          error: "Invalid limit value"
        })
      };
    }
    if (!Number.isInteger(parsedOffset) || parsedOffset < 0) {
      return {
        statusCode: 400,
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          error: "Invalid offset value"
        })
      };
    }
    if (parsedYear !== void 0 && (!Number.isInteger(parsedYear) || parsedYear < 1900 || parsedYear > 2100)) {
      return {
        statusCode: 400,
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          error: "Invalid year value"
        })
      };
    }
    if (parsedDecade !== void 0 && (!Number.isInteger(parsedDecade) || parsedDecade < 1900 || parsedDecade > 2100 || parsedDecade % 10 !== 0)) {
      return {
        statusCode: 400,
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          error: "Invalid decade value"
        })
      };
    }
    const year = (_b = qs.year) == null ? void 0 : _b.trim();
    const decade = (_c = qs.decade) == null ? void 0 : _c.trim();
    const tour = (_d = qs.tour) == null ? void 0 : _d.trim();
    const country = (_e = qs.country) == null ? void 0 : _e.trim();
    const region = (_f = qs.region) == null ? void 0 : _f.trim();
    const venueKey = (_g = qs.venueKey) == null ? void 0 : _g.trim();
    const eventGender = (_h = qs.eventGender) == null ? void 0 : _h.trim();
    const search = (_i = qs.search) == null ? void 0 : _i.trim().toLowerCase();
    const limit = Math.min(parsedLimit, MAX_RESULTS);
    const matched = contests.filter((contest) => {
      var _a2, _b2;
      const matchesYear = !year || String(contest.year) === year;
      const matchesDecade = !decade || contest.year >= Number(decade) && contest.year <= Number(decade) + 9;
      const matchesTour = !tour || contest.tour === tour;
      const matchesCountry = !country || contest.country === country;
      const matchesRegion = !region || contest.region === region;
      const matchesVenue = !venueKey || contest.venueKey === venueKey;
      const matchesEventGender = !eventGender || eventGender === "all" || contest.eventGender === eventGender || contest.eventGender === "both";
      const matchesSearch = !search || contest.name.toLowerCase().includes(search) || contest.city.toLowerCase().includes(search) || contest.region.toLowerCase().includes(search) || contest.country.toLowerCase().includes(search) || contest.winnerName.toLowerCase().includes(search) || contest.runnerUpName.toLowerCase().includes(search) || ((_a2 = contest.womenWinnerName) == null ? void 0 : _a2.toLowerCase().includes(search)) || ((_b2 = contest.womenRunnerUpName) == null ? void 0 : _b2.toLowerCase().includes(search));
      return matchesYear && matchesDecade && matchesTour && matchesCountry && matchesRegion && matchesVenue && matchesEventGender && matchesSearch;
    }).sort((a, b) => b.year - a.year);
    const total = matched.length;
    const filtered = matched.slice(parsedOffset, parsedOffset + limit);
    const publicResults = filtered.map((contest) => ({
      id: contest.id,
      name: contest.name,
      year: contest.year,
      eventGender: contest.eventGender,
      tour: contest.tour,
      country: contest.country,
      region: contest.region,
      city: contest.city,
      venueKey: contest.venueKey,
      latitude: contest.latitude,
      longitude: contest.longitude,
      waveType: contest.waveType,
      winnerName: contest.winnerName,
      winnerProfileUrl: contest.winnerProfileUrl,
      winnerCountryCode: contest.winnerCountryCode,
      runnerUpName: contest.runnerUpName,
      runnerUpProfileUrl: contest.runnerUpProfileUrl,
      runnerUpCountryCode: contest.runnerUpCountryCode,
      womenWinnerName: contest.womenWinnerName,
      womenWinnerProfileUrl: contest.womenWinnerProfileUrl,
      womenWinnerCountryCode: contest.womenWinnerCountryCode,
      womenRunnerUpName: contest.womenRunnerUpName,
      womenRunnerUpProfileUrl: contest.womenRunnerUpProfileUrl,
      womenRunnerUpCountryCode: contest.womenRunnerUpCountryCode,
      conditions: contest.conditions,
      notes: contest.notes,
      website: contest.website,
      searchText: [
        contest.name,
        contest.city,
        contest.region,
        contest.country,
        contest.winnerName,
        contest.runnerUpName,
        contest.womenWinnerName,
        contest.womenRunnerUpName
      ].filter(Boolean).join(" ")
    }));
    const responseBody = {
      total,
      results: publicResults
    };
    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public, max-age=300"
      },
      body: JSON.stringify(responseBody)
    };
  } catch (error) {
    console.error("Contests function failed:", error);
    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        error: "Failed to load contests."
      })
    };
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  handler
});
//# sourceMappingURL=contests.js.map
