export type Tour = "IPS" | "ASP" | "WSL";

export type WaveType = "beach" | "reef" | "point" | "river" | "mixed";

export type Contest = {
  id: string;
  name: string;
  year: number;
  eventGender: "men" | "women" | "both";
  tour: Tour;
  country: string;
  region: string;
  city: string;
  venueKey: string;
  latitude: number;
  longitude: number;
  waveType: WaveType;
  searchText?: string;

  winnerName: string;
  winnerProfileUrl?: string;
  winnerCountryCode: string;
  runnerUpName: string;
  runnerUpProfileUrl?: string;
  runnerUpCountryCode: string;

  womenWinnerName?: string;
  womenWinnerProfileUrl?: string;
  womenWinnerCountryCode?: string;
  womenRunnerUpName?: string;
  womenRunnerUpProfileUrl?: string;
  womenRunnerUpCountryCode?: string;

  conditions: string;
  notes: string;
  website?: string;
};
