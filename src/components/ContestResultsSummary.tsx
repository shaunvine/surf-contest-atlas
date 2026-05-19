import { useFilters } from "../context/FilterContext";

export default function ContestResultsSummary() {
  const { filteredContests, totalContests, filters } = useFilters();

  const activeFilterLabels = [
    filters.decade !== "all" ? `${filters.decade}s` : null,
    filters.year !== "all" ? filters.year : null,
    filters.tour !== "all" ? filters.tour : null,
    filters.country !== "all" ? filters.country : null,
    filters.region !== "all" ? filters.region : null,
    filters.eventGender !== "all" ? filters.eventGender : null,
    filters.search.trim() !== "" ? `Search: “${filters.search.trim()}”` : null,
  ].filter(Boolean);

  return (
    <section className="contest-results-summary panel-card">
      <h3 className="panel-title results-title filter-notification">
        Showing {filteredContests.length} of {totalContests} contests
      </h3>

      <div className="filter-chip-group" aria-label="Active filters">
        {activeFilterLabels.length > 0 ? (
          <>
            <span className="filter-chip-label">Filtered by:</span>

            {activeFilterLabels.map((label) => {
              const chipClass =
                label === "IPS"
                  ? "filter-chip filter-chip--ips"
                  : label === "ASP"
                  ? "filter-chip filter-chip--asp"
                  : label === "WSL"
                  ? "filter-chip filter-chip--wsl"
                  : "filter-chip";

              return (
                <span key={label} className={chipClass}>
                  {label}
                </span>
              );
            })}
          </>
        ) : (
          <span className="filter-chip-label">No filters applied</span>
        )}
      </div>
    </section>
  );
}
