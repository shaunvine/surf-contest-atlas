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

// netlify/functions/contests-map.ts
__export(exports, {
  handler: () => handler
});
var import_fs = __toModule(require("fs"));
var import_path = __toModule(require("path"));
var handler = async () => {
  try {
    const filePath = import_path.default.resolve(process.cwd(), "data/private/contests.json");
    const raw = import_fs.default.readFileSync(filePath, "utf-8");
    const contests = JSON.parse(raw);
    const mapResults = contests.map((contest) => ({
      id: contest.id,
      name: contest.name,
      year: contest.year,
      tour: contest.tour,
      country: contest.country,
      region: contest.region,
      city: contest.city,
      venueKey: contest.venueKey,
      latitude: contest.latitude,
      longitude: contest.longitude,
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
    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public, max-age=300"
      },
      body: JSON.stringify({
        total: mapResults.length,
        results: mapResults
      })
    };
  } catch (error) {
    console.error("Contests map function failed:", error);
    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        error: "Failed to load map contests."
      })
    };
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  handler
});
//# sourceMappingURL=contests-map.js.map
