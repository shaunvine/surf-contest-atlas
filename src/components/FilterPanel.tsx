import { useMemo, useRef, useEffect } from "react";
import type { PointerEvent } from "react";
import { useFilters } from "../context/FilterContext";

export default function FilterPanel() {
  // Toggle visibility of the "Show All Decades" button
  // true  = show button
  // false = hide button
  const SHOW_ALL_DECADES_BUTTON = false;
  const { allContests, filters, setFilters } = useFilters();
  const sliderRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (
        e.key === "/" &&
        document.activeElement?.tagName !== "INPUT" &&
        document.activeElement?.tagName !== "TEXTAREA"
      ) {
        e.preventDefault();
        document.getElementById("search")?.focus();
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const countries = [
    "all",
    ...Array.from(new Set(allContests.map((c) => c.country))).sort((a, b) =>
      a.localeCompare(b),
    ),
  ];

  const regions = [
    "all",
    ...Array.from(
      new Set(
        allContests
          .filter((contest) => {
            return (
              filters.country === "all" || contest.country === filters.country
            );
          })
          .map((contest) => contest.region),
      ),
    ).sort((a, b) => a.localeCompare(b)),
  ];

  const years = [
    "all",
    ...new Set(allContests.map((c) => String(c.year))),
  ].sort((a, b) => {
    if (a === "all") return -1;
    if (b === "all") return 1;
    return Number(b) - Number(a);
  });

  const tours = ["all", ...new Set(allContests.map((c) => c.tour))];

  const decades = useMemo(() => {
    const decadeValues = allContests.map(
      (contest) => Math.floor(contest.year / 10) * 10,
    );

    return [...new Set(decadeValues)].sort((a, b) => a - b);
  }, [allContests]);

  const selectedDecadeIndex =
    filters.decade === "all"
      ? 0
      : Math.max(decades.indexOf(Number(filters.decade)), 0);

  const sliderFillPercent =
    decades.length <= 1
      ? 0
      : (selectedDecadeIndex / (decades.length - 1)) * 100;

  const handleDecadeChange = (value: string) => {
    const index = Number(value);
    const selectedDecade = decades[index];

    setFilters((prev) => ({
      ...prev,
      decade: String(selectedDecade),
      year: "all",
    }));
  };

  const handleSliderPointerDown = (event: PointerEvent<HTMLInputElement>) => {
    const input = sliderRef.current;
    if (!input || decades.length === 0) return;

    const rect = input.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const percent = Math.min(Math.max(x / rect.width, 0), 1);

    const maxIndex = decades.length - 1;
    const nextIndex = Math.round(percent * maxIndex);

    handleDecadeChange(String(nextIndex));
  };

  const activeDecadeText =
    filters.decade === "all"
      ? "Showing: All decades"
      : `Showing: ${filters.decade}–${Number(filters.decade) + 9}`;

  return (
    <section id="map-section" className="panel-card filter-panel">
      <div className="filter-column filter-column--primary">
        <h3 className="panel-title">Filter Contests</h3>

        <button
          type="button"
          className="btn-secondary reset-filter"
          onClick={() => {
            setFilters({
              eventGender: "all",
              search: "",
              country: "all",
              region: "all",
              year: "all",
              tour: "all",
              decade: "all",
              venueKey: "all",
            });

            document
              .getElementById("map-title")
              ?.scrollIntoView({ behavior: "smooth", block: "start" });
          }}
        >
          Reset Filters / Map
        </button>

        <div className="filter-control">
          <label htmlFor="search">Search</label>
          <input
            id="search"
            type="text"
            aria-describedby="search-help"
            placeholder="Search contest, surfer, city, region, country"
            autoCapitalize="off"
            value={filters.search}
            onChange={(e) =>
              setFilters((prev) => ({
                ...prev,
                search: e.target.value,
                country: "all",
                region: "all",
                year: "all",
                decade: "all",
                venueKey: "all",
                tour: "all",
              }))
            }
          />
          <p id="search-help" className="sr-only">
            Search by contest name, surfer, city, region, or country
          </p>
        </div>
      </div>

      <div className="filter-column filter-column--decade">
        <div className="filter-control">
          {/* NEW SR: Provides an accessible name for the range slider */}
          <label
            id="decade-slider-label"
            htmlFor="decade-slider"
            className="sr-only"
          >
            Filter contests by decade
          </label>

          {/* NEW SR: Visible status text showing the active decade filter */}
          <div className="decade-label">{activeDecadeText}</div>

          <div className="decade-slider-wrap">
            <div className="decade-slider-rail" aria-hidden="true" />
            <div
              className="decade-slider-fill"
              aria-hidden="true"
              style={{ width: `${sliderFillPercent}%` }}
            />

            <input
              ref={sliderRef}
              id="decade-slider"
              className="decade-slider"
              type="range"
              min="0"
              max={String(Math.max(decades.length - 1, 0))}
              step="1"
              value={selectedDecadeIndex}
              aria-labelledby="decade-slider-label"
              aria-valuetext={activeDecadeText}
              onChange={(e) => handleDecadeChange(e.target.value)}
              onPointerDown={handleSliderPointerDown}
            />
          </div>

          <div className="decade-ticks">
            {decades.map((decade) => {
              const isActive = filters.decade === String(decade);

              return (
                <button
                  key={decade}
                  type="button"
                  className={`decade-tick-button ${
                    isActive ? "decade-tick-button--active" : ""
                  }`}
                  onClick={() =>
                    setFilters((prev) => ({
                      ...prev,
                      decade: String(decade),
                      year: "all",
                    }))
                  }
                  aria-pressed={isActive}
                >
                  {decade}s
                </button>
              );
            })}
          </div>

          {SHOW_ALL_DECADES_BUTTON && (
            <button
              type="button"
              className="btn-secondary btn-secondary--small"
              onClick={() =>
                setFilters((prev) => ({
                  ...prev,
                  decade: "all",
                  year: "all",
                }))
              }
            >
              Show All Decades
            </button>
          )}
        </div>
      </div>

      <div className="filter-column filter-column--details">
        <div className="filter-control">
          <label htmlFor="eventGender">Division</label>
          <select
            id="eventGender"
            value={filters.eventGender}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, eventGender: e.target.value }))
            }
          >
            <option value="all">all</option>
            <option value="men">Men</option>
            <option value="women">Women</option>
          </select>
        </div>

        <div className="filter-control">
          <label htmlFor="country">Country</label>
          <select
            id="country"
            value={filters.country}
            onChange={(e) =>
              setFilters((prev) => ({
                ...prev,
                country: e.target.value,
                region: "all",
                venueKey: "all",
                year: "all",
              }))
            }
          >
            {countries.map((country) => (
              <option key={country} value={country}>
                {country}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-control">
          <label htmlFor="region">Region</label>
          <select
            id="region"
            value={filters.region}
            onChange={(e) =>
              setFilters((prev) => ({
                ...prev,
                region: e.target.value,
                venueKey: "all",
                year: "all",
              }))
            }
          >
            {regions.map((region) => (
              <option key={region} value={region}>
                {region}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="filter-column filter-column--time">
        <div className="filter-control">
          <label htmlFor="year">Year</label>
          <select
            id="year"
            value={filters.year}
            onChange={(e) =>
              setFilters((prev) => ({
                ...prev,
                year: e.target.value,
                decade: e.target.value === "all" ? prev.decade : "all",
              }))
            }
          >
            {years.map((year) => (
              <option key={year} value={year}>
                {year === "all" ? "all" : year}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-control">
          <label htmlFor="tour">Tour</label>
          <select
            id="tour"
            value={filters.tour}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, tour: e.target.value }))
            }
          >
            {tours.map((tour) => (
              <option key={tour} value={tour}>
                {tour}
              </option>
            ))}
          </select>
        </div>
      </div>
    </section>
  );
}
