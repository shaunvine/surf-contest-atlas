import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import type { Contest } from "../types/contest";

type Filters = {
  eventGender: string;
  search: string;
  country: string;
  region: string;
  year: string;
  tour: string;
  decade: string;
  venueKey: string;
};

type FilterContextType = {
  contests: Contest[];
  filteredContests: Contest[];
  filters: Filters;
  setFilters: React.Dispatch<React.SetStateAction<Filters>>;
  selectedContestId: string | null;
  setSelectedContestId: React.Dispatch<React.SetStateAction<string | null>>;
  selectedContest: Contest | null;
  pendingScrollContestId: string | null;
  setPendingScrollContestId: React.Dispatch<
    React.SetStateAction<string | null>
  >;
  totalContests: number;
  hasMore: boolean;
  isLoadingMore: boolean;
  loadMoreContests: () => Promise<void>;
  allContests: Contest[];
};

const FilterContext = createContext<FilterContextType | null>(null);

const PAGE_SIZE = 15;

export function FilterProvider({ children }: { children: ReactNode }) {
  const [contests, setContests] = useState<Contest[]>([]);

  const [allContests, setAllContests] = useState<Contest[]>([]);

  const [totalContests, setTotalContests] = useState(0);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const [filters, setFilters] = useState<Filters>({
    eventGender: "all",
    search: "",
    country: "all",
    region: "all",
    year: "all",
    tour: "all",
    decade: "all",
    venueKey: "all",
  });

  const [selectedContestId, setSelectedContestId] = useState<string | null>(
    null,
  );

  const [pendingScrollContestId, setPendingScrollContestId] = useState<
    string | null
  >(null);

  function buildContestsUrl(offset: number) {
    const params = new URLSearchParams();

    params.set("limit", String(PAGE_SIZE));
    params.set("offset", String(offset));

    if (filters.eventGender !== "all")
      params.set("eventGender", filters.eventGender);
    if (filters.search.trim() !== "")
      params.set("search", filters.search.trim());
    if (filters.country !== "all") params.set("country", filters.country);
    if (filters.region !== "all") params.set("region", filters.region);
    if (filters.year !== "all") params.set("year", filters.year);
    if (filters.tour !== "all") params.set("tour", filters.tour);
    if (filters.decade !== "all") params.set("decade", filters.decade);
    if (filters.venueKey !== "all") params.set("venueKey", filters.venueKey);

    return `/.netlify/functions/contests?${params.toString()}`;
  }

  useEffect(() => {
    let isCancelled = false;

    async function loadContests() {
      try {
        // FULL dataset for filters only
        const fullResponse = await fetch(
          "/.netlify/functions/contests?limit=1000&offset=0",
        );

        if (!fullResponse.ok) {
          throw new Error(
            `Failed to load full contests: ${fullResponse.status}`,
          );
        }

        const fullData = await fullResponse.json();
        const fullResults = Array.isArray(fullData.results)
          ? fullData.results
          : [];

        // PAGINATED dataset for list
        const response = await fetch(buildContestsUrl(0));

        if (!response.ok) {
          throw new Error(`Failed to load contests: ${response.status}`);
        }

        const data = await response.json();
        const results = Array.isArray(data.results) ? data.results : [];

        if (!isCancelled) {
          setAllContests(fullResults); // ← NEW
          setContests(results); // ← existing
          setTotalContests(data.total ?? 0);
        }
      } catch (error) {
        console.error("Failed to fetch contests:", error);

        if (!isCancelled) {
          setAllContests([]);
          setContests([]);
        }
      }
    }

    loadContests();

    return () => {
      isCancelled = true;
    };
  }, [filters]);

  const filteredContests = useMemo(() => {
    const safeContests = Array.isArray(contests) ? contests : [];

    return safeContests.filter((contest) => {
      const searchValue = filters.search.toLowerCase().trim();

      const matchesSearch =
        searchValue === "" ||
        contest.searchText?.toLowerCase().includes(searchValue);

      const matchesCountry =
        filters.country === "all" || contest.country === filters.country;

      const matchesRegion =
        filters.region === "all" || contest.region === filters.region;

      const matchesYear =
        filters.year === "all" || contest.year === Number(filters.year);

      const matchesEventGender =
        filters.eventGender === "all" ||
        contest.eventGender === filters.eventGender ||
        contest.eventGender === "both";

      const matchesTour =
        filters.tour === "all" || contest.tour === filters.tour;

      const matchesDecade =
        filters.decade === "all" ||
        (contest.year >= Number(filters.decade) &&
          contest.year <= Number(filters.decade) + 9);

      const matchesVenue =
        filters.venueKey === "all" || contest.venueKey === filters.venueKey;

      return (
        matchesSearch &&
        matchesEventGender &&
        matchesCountry &&
        matchesRegion &&
        matchesYear &&
        matchesTour &&
        matchesDecade &&
        matchesVenue
      );
    });
  }, [contests, filters]);

  useEffect(() => {
    if (filteredContests.length === 0) {
      setSelectedContestId(null);
      return;
    }

    const stillVisible = filteredContests.some(
      (contest) => contest.id === selectedContestId,
    );

    if (!stillVisible) {
      setSelectedContestId(filteredContests[0].id);
    }
  }, [filteredContests, selectedContestId]);

  const selectedContest =
    filteredContests.find((contest) => contest.id === selectedContestId) ??
    filteredContests[0] ??
    null;

  const hasMore = contests.length < totalContests;

  async function loadMoreContests() {
    if (isLoadingMore || !hasMore) return;

    try {
      setIsLoadingMore(true);

      const response = await fetch(buildContestsUrl(contests.length));

      if (!response.ok) {
        throw new Error(`Failed to load more contests: ${response.status}`);
      }

      const data = await response.json();
      const newResults = Array.isArray(data.results) ? data.results : [];

      setContests((prev) => [...prev, ...newResults]);

      if (typeof data.total === "number") {
        setTotalContests(data.total);
      }
    } catch (error) {
      console.error("Load more failed:", error);
    } finally {
      setIsLoadingMore(false);
    }
  }

  return (
    <FilterContext.Provider
      value={{
        contests,
        filteredContests,
        filters,
        setFilters,
        selectedContestId,
        setSelectedContestId,
        selectedContest,
        pendingScrollContestId,
        setPendingScrollContestId,
        totalContests,
        hasMore,
        isLoadingMore,
        loadMoreContests,
        allContests,
      }}
    >
      {children}
    </FilterContext.Provider>
  );
}

export function useFilters() {
  const context = useContext(FilterContext);

  if (!context) {
    throw new Error("useFilters must be used inside FilterProvider");
  }

  return context;
}
