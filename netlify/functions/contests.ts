import fs from "fs";
import path from "path";

const MAX_RESULTS = 1000;

type ContestsApiResponse = {
  total: number;
  results: unknown[];
};

export const handler = async (event: any) => {
  try {
    // Load the private JSON file from the server-side data folder
    const filePath = path.resolve(process.cwd(), "data/private/contests.json");
    const raw = fs.readFileSync(filePath, "utf-8");
    const contests = JSON.parse(raw);

    // Read incoming query params
    const qs = event.queryStringParameters ?? {};

    // Only allow known query params
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
      "offset",
    ];

    // Reject unknown params before doing anything else
    const invalidParam = Object.keys(qs).find(
      (key) => !allowedParams.includes(key),
    );

    if (invalidParam) {
      return {
        statusCode: 400,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          error: `Invalid query parameter: ${invalidParam}`,
        }),
      };
    }

    // Parse values safely
    const parsedLimit = qs.limit ? Number(qs.limit) : MAX_RESULTS;
    const parsedYear = qs.year ? Number(qs.year) : undefined;
    const parsedDecade = qs.decade ? Number(qs.decade) : undefined;
    const parsedOffset = qs.offset ? Number(qs.offset) : 0;

    // Validate limit
    if (!Number.isFinite(parsedLimit) || parsedLimit <= 0) {
      return {
        statusCode: 400,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          error: "Invalid limit value",
        }),
      };
    }

    if (!Number.isInteger(parsedOffset) || parsedOffset < 0) {
      return {
        statusCode: 400,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          error: "Invalid offset value",
        }),
      };
    }

    // Validate year
    if (
      parsedYear !== undefined &&
      (!Number.isInteger(parsedYear) || parsedYear < 1900 || parsedYear > 2100)
    ) {
      return {
        statusCode: 400,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          error: "Invalid year value",
        }),
      };
    }

    // Validate decade
    if (
      parsedDecade !== undefined &&
      (!Number.isInteger(parsedDecade) ||
        parsedDecade < 1900 ||
        parsedDecade > 2100 ||
        parsedDecade % 10 !== 0)
    ) {
      return {
        statusCode: 400,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          error: "Invalid decade value",
        }),
      };
    }

    // Normalize validated query values
    const year = qs.year?.trim();
    const decade = qs.decade?.trim();
    const tour = qs.tour?.trim();
    const country = qs.country?.trim();
    const region = qs.region?.trim();
    const venueKey = qs.venueKey?.trim();
    const eventGender = qs.eventGender?.trim();
    const search = qs.search?.trim().toLowerCase();
    const limit = Math.min(parsedLimit, MAX_RESULTS);

    // Filter and sort all matching contests
    const matched = contests
      .filter((contest: any) => {
        const matchesYear = !year || String(contest.year) === year;

        const matchesDecade =
          !decade ||
          (contest.year >= Number(decade) &&
            contest.year <= Number(decade) + 9);

        const matchesTour = !tour || contest.tour === tour;
        const matchesCountry = !country || contest.country === country;
        const matchesRegion = !region || contest.region === region;
        const matchesVenue = !venueKey || contest.venueKey === venueKey;

        const matchesEventGender =
          !eventGender ||
          eventGender === "all" ||
          contest.eventGender === eventGender ||
          contest.eventGender === "both";

        const matchesSearch =
          !search ||
          contest.name.toLowerCase().includes(search) ||
          contest.city.toLowerCase().includes(search) ||
          contest.region.toLowerCase().includes(search) ||
          contest.country.toLowerCase().includes(search) ||
          contest.winnerName.toLowerCase().includes(search) ||
          contest.runnerUpName.toLowerCase().includes(search) ||
          contest.womenWinnerName?.toLowerCase().includes(search) ||
          contest.womenRunnerUpName?.toLowerCase().includes(search);

        return (
          matchesYear &&
          matchesDecade &&
          matchesTour &&
          matchesCountry &&
          matchesRegion &&
          matchesVenue &&
          matchesEventGender &&
          matchesSearch
        );
      })
      .sort((a: any, b: any) => b.year - a.year);

    // Keep the full matching total for UI count accuracy
    const total = matched.length;

    // Slice after total is calculated
    const filtered = matched.slice(parsedOffset, parsedOffset + limit);

    // Return the public fields the current UI needs
    const publicResults = filtered.map((contest: any) => ({
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
      source: contest.source,

      // Flattened search field keeps surfer-name search working
      searchText: [
        contest.name,
        contest.city,
        contest.region,
        contest.country,
        contest.winnerName,
        contest.runnerUpName,
        contest.womenWinnerName,
        contest.womenRunnerUpName,
      ]
        .filter(Boolean)
        .join(" "),
    }));

    const responseBody: ContestsApiResponse = {
      total,
      results: publicResults,
    };

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public, max-age=300",
      },
      body: JSON.stringify(responseBody),
    };
  } catch (error) {
    console.error("Contests function failed:", error);

    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        error: "Failed to load contests.",
      }),
    };
  }
};
