import fs from "fs";
import path from "path";

type MapContest = {
  id: string;
  name: string;
  year: number;
  tour: string;
  country: string;
  region: string;
  city: string;
  venueKey: string;
  latitude: number;
  longitude: number;
  searchText: string;
};

export const handler = async () => {
  try {
    const filePath = path.resolve(process.cwd(), "data/private/contests.json");
    const raw = fs.readFileSync(filePath, "utf-8");
    const contests = JSON.parse(raw);

    const mapResults: MapContest[] = contests.map((contest: any) => ({
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
        contest.womenRunnerUpName,
      ]
        .filter(Boolean)
        .join(" "),
    }));

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public, max-age=300",
      },
      body: JSON.stringify({
        total: mapResults.length,
        results: mapResults,
      }),
    };
  } catch (error) {
    console.error("Contests map function failed:", error);

    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        error: "Failed to load map contests.",
      }),
    };
  }
};
