import { useEffect, useMemo, useRef, useState } from "react";
import { useFilters } from "../context/FilterContext";

const TOUR_COLORS = {
  IPS: "#07683F",
  ASP: "#0b3c5d",
  WSL: "#780000",
} as const;

// Toggle decade browsing section inside the Google Maps popup.
// true  = show "Browse by decade" buttons
// false = hide the entire decade section
const SHOW_BROWSE_BY_DECADE = false;

function getTourColor(tour: "IPS" | "ASP" | "WSL") {
  return TOUR_COLORS[tour];
}

function createPinIcon(color: string) {
  const svg = `
    <svg width="36" height="48" viewBox="0 0 36 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M18 47C18 47 33 29.5 33 18C33 9.71573 26.2843 3 18 3C9.71573 3 3 9.71573 3 18C3 29.5 18 47 18 47Z"
            fill="${color}" stroke="#ffffff" stroke-width="2"/>
      <circle cx="18" cy="18" r="5.5" fill="#ffffff" fill-opacity="0.35"/>
    </svg>
  `;

  return {
    url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`,
    scaledSize: new google.maps.Size(36, 48),
    anchor: new google.maps.Point(18, 46),
  };
}

function buildVenueInfoWindowContent(
  contests: {
    id: string;
    name: string;
    year: number;
    tour: "IPS" | "ASP" | "WSL";
    city: string;
    country: string;
    venueKey: string;
  }[],
  activeTour: string,
) {
  const sortedContests = [...contests].sort((a, b) => b.year - a.year);
  const latestFive = sortedContests.slice(0, 5);

  const firstContest = sortedContests[0];
  const oldestYear = sortedContests[sortedContests.length - 1]?.year;
  const newestYear = sortedContests[0]?.year;

  const decades = Array.from(
    new Set(sortedContests.map((c) => Math.floor(c.year / 10) * 10)),
  ).sort((a, b) => b - a);

  const decadeItems = decades
    .map(
      (decade) => `
      <button
        class="map-popup__decade-btn"
        data-decade="${decade}"
      >
        ${decade}s
      </button>
    `,
    )
    .join("");

  return `
  <div class="map-popup">
    <h3 class="map-popup__title">
  ${firstContest.name}
</h3>

<p class="map-popup__sub">
  ${firstContest.city}
</p>

    <p class="map-popup__meta">
      ${firstContest.country} · ${sortedContests.length} contest${
    sortedContests.length !== 1 ? "s" : ""
  } · ${oldestYear}–${newestYear}
    </p>

    <div class="map-popup__venue-section">
      <h4 class="map-popup__results-heading">Showing latest 5</h4>
      <div class="map-popup__chip-row">
        ${latestFive
          .map(
            (contest) => `
              <button
                class="map-popup__year-btn ${
                  activeTour !== "all"
                    ? `map-popup__year-btn--${activeTour.toLowerCase()}`
                    : ""
                }"
                data-id="${contest.id}"
              >
                ${contest.year}
              </button>
            `,
          )
          .join("")}
      </div>
    </div>

    ${
      SHOW_BROWSE_BY_DECADE
        ? `
<!-- Browse by decade section -->
<!-- Toggle with SHOW_BROWSE_BY_DECADE -->

<div class="map-popup__venue-section">
  <h4 class="map-popup__results-heading">Browse by decade</h4>
  <div class="map-popup__chip-row">
    ${decadeItems}
  </div>
</div>
`
        : ""
    }

    <div class="map-popup__venue-section">
      <button
        class="map-popup__view-all-btn"
        data-venue="${firstContest.venueKey}"
      >
        View all contests
      </button>
    </div>
  </div>
`;
}

export default function MapSection() {
  const mapElementRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const infoWindowRef = useRef<google.maps.InfoWindow | null>(null);
  const shouldPanToSelectedRef = useRef(false);
  const infoWindowDomReadyListenerRef =
    useRef<google.maps.MapsEventListener | null>(null);

  const {
    filteredContests,
    selectedContestId,
    setSelectedContestId,
    filters,
    setFilters,
    setPendingScrollContestId,
  } = useFilters();

  const [mapContests, setMapContests] = useState<any[]>([]);

  useEffect(() => {
    let isCancelled = false;

    async function loadMapData() {
      try {
        const response = await fetch("/.netlify/functions/contests-map");

        if (!response.ok) {
          throw new Error(`Failed to load map data: ${response.status}`);
        }

        const data = await response.json();

        if (!isCancelled) {
          setMapContests(data.results || []);
        }
      } catch (error) {
        console.error("Failed to fetch map contests:", error);

        if (!isCancelled) {
          setMapContests([]);
        }
      }
    }

    loadMapData();

    return () => {
      isCancelled = true;
    };
  }, []);

  const activeTimeLabel =
    filters.year !== "all"
      ? filters.year
      : filters.decade !== "all"
      ? `${filters.decade}–${Number(filters.decade) + 9}`
      : "All years";

  const labelParts = useMemo(() => {
    const parts = [activeTimeLabel];
    if (filters.region !== "all") {
      parts.push(filters.region);
    }
    return parts;
  }, [activeTimeLabel, filters.region]);

  const filteredMapContests = useMemo(() => {
    const searchValue = filters.search.toLowerCase().trim();

    return mapContests.filter((contest) => {
      const matchesSearch =
        searchValue === "" ||
        contest.searchText?.toLowerCase().includes(searchValue);

      const matchesCountry =
        filters.country === "all" || contest.country === filters.country;

      const matchesRegion =
        filters.region === "all" || contest.region === filters.region;

      const matchesYear =
        filters.year === "all" || contest.year === Number(filters.year);

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
        matchesCountry &&
        matchesRegion &&
        matchesYear &&
        matchesTour &&
        matchesDecade &&
        matchesVenue
      );
    });
  }, [mapContests, filters]);

  const groupedByVenue = useMemo(() => {
    const map = new Map<string, typeof mapContests>();

    filteredMapContests.forEach((contest) => {
      if (!map.has(contest.venueKey)) {
        map.set(contest.venueKey, []);
      }
      map.get(contest.venueKey)!.push(contest);
    });

    return Array.from(map.entries()).map(([venueKey, contests]) => ({
      venueKey,
      contests,
    }));
  }, [filteredMapContests]);

  useEffect(() => {
    if (!mapElementRef.current) return;
    if (!window.google || !window.google.maps) return;

    if (!mapRef.current) {
      mapRef.current = new google.maps.Map(mapElementRef.current, {
        center: { lat: 15, lng: 0 },
        zoom: 2,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: true,
        mapTypeId: "hybrid",
      });

      infoWindowRef.current = new google.maps.InfoWindow();
    }

    markersRef.current.forEach((marker) => {
      google.maps.event.clearInstanceListeners(marker);
      marker.setMap(null);
    });
    markersRef.current = [];

    const bounds = new google.maps.LatLngBounds();

    groupedByVenue.forEach((group) => {
      const contest = group.contests[0]; // anchor point
      const marker = new google.maps.Marker({
        position: { lat: contest.latitude, lng: contest.longitude },
        map: mapRef.current!,
        title: contest.name,
        icon: createPinIcon(getTourColor(contest.tour)),
      });

      marker.addListener("click", () => {
        shouldPanToSelectedRef.current = true;
        setSelectedContestId(contest.id);

        infoWindowRef.current?.setContent(
          buildVenueInfoWindowContent(group.contests, filters.tour),
        );

        if (mapRef.current && infoWindowRef.current) {
          infoWindowRef.current.open({
            map: mapRef.current,
            anchor: marker,
          });

          infoWindowDomReadyListenerRef.current?.remove();

          infoWindowDomReadyListenerRef.current =
            google.maps.event.addListenerOnce(
              infoWindowRef.current,
              "domready",
              () => {
                // YEAR BUTTONS (filter by venue + year)
                const yearButtons = document.querySelectorAll(
                  ".map-popup__year-btn",
                );

                yearButtons.forEach((btn) => {
                  btn.addEventListener("click", () => {
                    const id = btn.getAttribute("data-id");
                    if (!id) return;

                    const selectedContest = group.contests.find(
                      (contest) => contest.id === id,
                    );

                    if (!selectedContest) return;

                    setSelectedContestId(selectedContest.id);
                    setPendingScrollContestId(selectedContest.id);

                    setFilters((prev) => ({
                      ...prev,
                      venueKey: selectedContest.venueKey,
                      year: "all",
                      decade: "all",
                    }));

                    document
                      .getElementById("contest-list-title")
                      ?.scrollIntoView({
                        behavior: "smooth",
                        block: "start",
                      });
                  });
                });

                // DECADE BUTTONS (apply filter)
                const decadeButtons = document.querySelectorAll(
                  ".map-popup__decade-btn",
                );

                decadeButtons.forEach((btn) => {
                  btn.addEventListener("click", () => {
                    const decade = btn.getAttribute("data-decade");
                    if (!decade) return;

                    setFilters((prev) => ({
                      ...prev,
                      decade,
                      year: "all",
                    }));
                    document
                      .getElementById("contest-list-title")
                      ?.scrollIntoView({ behavior: "smooth", block: "start" });
                  });
                });

                // VIEW ALL (filter by venue)
                const viewAllBtn = document.querySelector(
                  ".map-popup__view-all-btn",
                );

                if (viewAllBtn) {
                  viewAllBtn.addEventListener("click", () => {
                    const venue = viewAllBtn.getAttribute("data-venue");
                    if (!venue) return;

                    setFilters((prev) => ({
                      ...prev,
                      venueKey: venue,
                      year: "all",
                      decade: "all",
                    }));

                    document
                      .getElementById("contest-list-title")
                      ?.scrollIntoView({ behavior: "smooth", block: "start" });
                  });
                }
              },
            );
        }
      });

      markersRef.current.push(marker);

      bounds.extend({
        lat: contest.latitude,
        lng: contest.longitude,
      });
    });

    if (groupedByVenue.length > 0 && mapRef.current) {
      if (bounds.isEmpty()) return;
      mapRef.current.fitBounds(bounds, {
        top: 20,
        bottom: 20,
        left: 20,
        right: 20,
      });

      google.maps.event.addListenerOnce(mapRef.current, "idle", () => {
        const currentZoom = mapRef.current!.getZoom() ?? 2;

        if (currentZoom < 2) {
          mapRef.current!.setZoom(2);
        }
      });

      if (groupedByVenue.length === 1) {
        mapRef.current.setZoom(5);
      }
    }
    return () => {
      infoWindowDomReadyListenerRef.current?.remove();
      infoWindowDomReadyListenerRef.current = null;
    };
  }, [groupedByVenue, setSelectedContestId, setFilters]);

  useEffect(() => {
    if (!mapRef.current) return;
    if (!selectedContestId) return;
    if (!shouldPanToSelectedRef.current) return;

    const selected = filteredContests.find(
      (contest) => contest.id === selectedContestId,
    );

    if (!selected) return;

    mapRef.current.panTo({
      lat: selected.latitude,
      lng: selected.longitude,
    });

    shouldPanToSelectedRef.current = false;
  }, [selectedContestId, filteredContests]);

  return (
    <section className="panel-card map-panel" aria-labelledby="map-title">
      <div className="map-header-row">
        <div className="map-header-left">
          <h2 id="map-title" className="panel-title">
            Contest Map
          </h2>

          <div className="map-status" aria-live="polite">
            <p className="map-decade-status">
              Decade Filter:{" "}
              <span className="map-decade-value">
                {" "}
                {labelParts.join(" · ")}
              </span>
            </p>

            <p className="map-helper-text">
              Click any colored pin on the map to view contest info.
            </p>
          </div>
        </div>

        <div className="map-header-right">
          <div className="map-tour-filter-label">Filter by Tour:</div>

          <div className="map-tour-filter" aria-label="Tour filter">
            <button
              type="button"
              className={`map-tour-filter__pill ${
                filters.tour === "all"
                  ? "map-tour-filter__pill--active map-tour-filter__pill--all"
                  : ""
              }`}
              onClick={() =>
                // All
                setFilters((prev) => ({
                  ...prev,
                  tour: "all",
                  venueKey: "all",
                  year: "all",
                }))
              }
            >
              All
            </button>

            <button
              type="button"
              className={`map-tour-filter__pill ${
                filters.tour === "IPS"
                  ? "map-tour-filter__pill--active map-tour-filter__pill--ips"
                  : ""
              }`}
              onClick={() =>
                // IPS
                setFilters((prev) => ({
                  ...prev,
                  tour: "IPS",
                  venueKey: "all",
                  year: "all",
                }))
              }
            >
              IPS
            </button>

            <button
              type="button"
              className={`map-tour-filter__pill ${
                filters.tour === "ASP"
                  ? "map-tour-filter__pill--active map-tour-filter__pill--asp"
                  : ""
              }`}
              onClick={() =>
                // ASP
                setFilters((prev) => ({
                  ...prev,
                  tour: "ASP",
                  venueKey: "all",
                  year: "all",
                }))
              }
            >
              ASP
            </button>

            <button
              type="button"
              className={`map-tour-filter__pill ${
                filters.tour === "WSL"
                  ? "map-tour-filter__pill--active map-tour-filter__pill--wsl"
                  : ""
              }`}
              onClick={() =>
                // WSL
                setFilters((prev) => ({
                  ...prev,
                  tour: "WSL",
                  venueKey: "all",
                  year: "all",
                }))
              }
            >
              WSL
            </button>
          </div>
        </div>
      </div>

      <div className="map-wrap">
        {groupedByVenue.length === 0 && (
          <div className="map-empty-overlay">
            No contests match the current filters.
          </div>
        )}

        <div id="map" ref={mapElementRef} />
      </div>
    </section>
  );
}
