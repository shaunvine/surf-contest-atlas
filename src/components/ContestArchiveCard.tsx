import type { Contest } from "../types/contest";
import { useFilters } from "../context/FilterContext";

type ContestArchiveCardProps = {
  contest: Contest;
};

function hasText(value?: string) {
  return typeof value === "string" && value.trim() !== "";
}

// Renders a surfer name as a link only when a profile URL exists.
// If no URL exists, it returns plain text so historical/incomplete data still works.
function renderSurferName(name?: string, profileUrl?: string) {
  if (!hasText(name)) return null;

  if (hasText(profileUrl)) {
    return (
      <a
        href={profileUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="surfer-profile-link"
      >
        {name}
      </a>
    );
  }

  return name;
}

export default function ContestArchiveCard({
  contest,
}: ContestArchiveCardProps) {
  const { filters } = useFilters();
  const hasWebsite =
    typeof contest.website === "string" && contest.website.trim() !== "";

  // These booleans only check whether result data exists.
  // The linked surfer names are rendered later inside the JSX.
  const hasMenWinner =
    hasText(contest.winnerName) && hasText(contest.winnerCountryCode);

  const hasMenRunnerUp =
    hasText(contest.runnerUpName) && hasText(contest.runnerUpCountryCode);

  const hasWomenWinner =
    hasText(contest.womenWinnerName) && hasText(contest.womenWinnerCountryCode);

  const hasWomenRunnerUp =
    hasText(contest.womenRunnerUpName) &&
    hasText(contest.womenRunnerUpCountryCode);

  const hasAnyResults =
    hasMenWinner || hasMenRunnerUp || hasWomenWinner || hasWomenRunnerUp;

  const showMenResults =
    filters.eventGender === "all" || filters.eventGender === "men";

  const showWomenResults =
    filters.eventGender === "all" || filters.eventGender === "women";

  const SHOW_EXTRA_DETAILS = false;

  return (
    <article id={`contest-${contest.id}`} className="contest-archive-card">
      <div className="contest-archive-card__tags" aria-label="Tour">
        <span
          className={`tag ${
            contest.tour === "IPS"
              ? "tag--ips"
              : contest.tour === "ASP"
              ? "tag--asp"
              : "tag--wsl"
          }`}
        >
          {contest.tour}
        </span>
      </div>

      <h3 className="contest-archive-card__title">{contest.name}</h3>

      <div className="contest-archive-card__meta">
        <p>
          {contest.year} · {contest.tour}
        </p>
        <p>
          {contest.city}, {contest.region}, {contest.country}
        </p>
      </div>

      {hasAnyResults && <div className="contest-archive-card__rule" />}

      {hasAnyResults && (
        <div className="contest-archive-card__section">
          {showMenResults && (hasMenWinner || hasMenRunnerUp) && (
            <div className="contest-archive-card__results-group">
              <h4 className="contest-archive-card__results-heading">Men</h4>

              {hasMenWinner && (
                <p>
                  <strong>1st:</strong>{" "}
                  {renderSurferName(
                    contest.winnerName,
                    contest.winnerProfileUrl,
                  )}{" "}
                  ({contest.winnerCountryCode})
                </p>
              )}

              {hasMenRunnerUp && (
                <p>
                  <strong>2nd:</strong>{" "}
                  {renderSurferName(
                    contest.runnerUpName,
                    contest.runnerUpProfileUrl,
                  )}{" "}
                  ({contest.runnerUpCountryCode})
                </p>
              )}
            </div>
          )}

          {showWomenResults && (hasWomenWinner || hasWomenRunnerUp) && (
            <>
              {showMenResults && (hasMenWinner || hasMenRunnerUp) && (
                <div className="contest-archive-card__rule" />
              )}
              <div className="contest-archive-card__results-group">
                <h4 className="contest-archive-card__results-heading">Women</h4>

                {hasWomenWinner && (
                  <p>
                    <strong>1st:</strong>{" "}
                    {renderSurferName(
                      contest.womenWinnerName,
                      contest.womenWinnerProfileUrl,
                    )}{" "}
                    ({contest.womenWinnerCountryCode})
                  </p>
                )}

                {hasWomenRunnerUp && (
                  <p>
                    <strong>2nd:</strong>{" "}
                    {renderSurferName(
                      contest.womenRunnerUpName,
                      contest.womenRunnerUpProfileUrl,
                    )}{" "}
                    ({contest.womenRunnerUpCountryCode})
                  </p>
                )}
              </div>
            </>
          )}
        </div>
      )}

      <div className="contest-archive-card__rule" />

      {SHOW_EXTRA_DETAILS && (
        <>
          <div className="contest-archive-card__section">
            <p>
              <strong>Wave type:</strong> {contest.waveType}
            </p>
            <p>
              <strong>Conditions:</strong> {contest.conditions}
            </p>
          </div>

          <div className="contest-archive-card__rule" />

          <p className="contest-archive-card__notes">{contest.notes}</p>
        </>
      )}

      {hasWebsite && (
        <a
          className="contest-archive-card__link"
          href={contest.website}
          target="_blank"
          rel="noreferrer"
        >
          View contest site
        </a>
      )}
    </article>
  );
}
