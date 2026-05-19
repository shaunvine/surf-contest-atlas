import { useEffect, useRef } from "react";
import { useFilters } from "../context/FilterContext";
import ContestArchiveCard from "./ContestArchiveCard";

export default function ContestList() {
  const {
    filteredContests,
    totalContests,
    hasMore,
    isLoadingMore,
    loadMoreContests,
    pendingScrollContestId,
    setPendingScrollContestId,
    filters,
    setFilters,
  } = useFilters();

  const previousCountRef = useRef(0);

  const activeFilterLabels = [
    filters.decade !== "all" ? `${filters.decade}s` : null,
    filters.year !== "all" ? filters.year : null,
    filters.tour !== "all" ? filters.tour : null,
    filters.country !== "all" ? filters.country : null,
    filters.region !== "all" ? filters.region : null,
    filters.eventGender !== "all" ? filters.eventGender : null,
    filters.search.trim() !== "" ? `Search: “${filters.search.trim()}”` : null,
  ].filter(Boolean);

  const sortedContests = [...filteredContests].sort((a, b) => b.year - a.year);

  useEffect(() => {
    if (!pendingScrollContestId) return;

    requestAnimationFrame(() => {
      const el = document.getElementById(`contest-${pendingScrollContestId}`);

      if (el) {
        el.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }

      window.setTimeout(() => {
        setPendingScrollContestId(null);
      }, 1600);
    });
  }, [pendingScrollContestId, setPendingScrollContestId]);

  return (
    <section
      className="contest-list panel-card"
      aria-labelledby="contest-list-title"
    >
      {/* <h2 id="contest-list-title" className="sr-only">
        Contest results
      </h2> */}
      <div className="list-header">
        <h4 id="contest-list-title" className="panel-title filter-notification">
          Showing {filteredContests.length} of {totalContests} contests
        </h4>

        {activeFilterLabels.length > 0 && (
          <h4 className="contest-list-filter-summary">
            Filtered by: {activeFilterLabels.join(" · ")}
          </h4>
        )}
      </div>

      {filteredContests.length === 0 ? (
        <p>No contests match the current filters.</p>
      ) : (
        <>
          <div className="contest-card-grid">
            {sortedContests.map((contest, index) => {
              return (
                <div
                  key={contest.id}
                  className={
                    index >= previousCountRef.current
                      ? "contest-card-enter-wrap contest-card--enter"
                      : "contest-card-enter-wrap"
                  }
                >
                  <div
                    className={
                      pendingScrollContestId === contest.id
                        ? "contest-card-highlight"
                        : ""
                    }
                  >
                    <ContestArchiveCard contest={contest} />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="load-more-wrap">
            {hasMore ? (
              <>
                <button
                  type="button"
                  className="btn-primary load-more-button"
                  onClick={() => {
                    previousCountRef.current = filteredContests.length;
                    loadMoreContests();
                  }}
                  disabled={isLoadingMore}
                >
                  {isLoadingMore ? "Loading..." : "Load More"}
                </button>

                <p className="load-more-status" aria-live="polite">
                  {filteredContests.length} of {totalContests} loaded ·{" "}
                  {totalContests - filteredContests.length} remaining
                </p>

                {activeFilterLabels.length > 0 && (
                  <p className="contest-list-filter-summary">
                    Filtered by: {activeFilterLabels.join(" · ")}
                  </p>
                )}
              </>
            ) : (
              <>
                <p className="end-of-list-message" aria-live="polite">
                  {totalContests} of {totalContests} loaded · End of list
                </p>

                {activeFilterLabels.length > 0 && (
                  <p className="contest-list-filter-summary ">
                    Filtered by: {activeFilterLabels.join(" · ")}
                  </p>
                )}
              </>
            )}
          </div>
        </>
      )}
      <button
        type="button"
        className="btn-secondary btn-secondary--small reset-filter"
        onClick={() => {
          setFilters({
            search: "",
            decade: "all",
            year: "all",
            country: "all",
            region: "all",
            tour: "all",
            eventGender: "all",
            venueKey: "all",
          });

          document.getElementById("map-title")?.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }}
      >
        Reset Filters / Map
      </button>
    </section>
  );
}
