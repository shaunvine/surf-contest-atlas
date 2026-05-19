import { useEffect, useMemo, useState } from "react";
import { FilterProvider, useFilters } from "./context/FilterContext";
import FilterPanel from "./components/FilterPanel";
import MapSection from "./components/MapSection";
import ContestList from "./components/ContestList";
import Header from "./components/Header";
import ContactForm from "./components/ContactForm";
import TopWinnersCard from "./components/TopWinnersCard";
import type { Contest } from "./types/contest";
import ContestResultsSummary from "./components/ContestResultsSummary";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFacebookF, faInstagram } from "@fortawesome/free-brands-svg-icons";

function AppShell() {
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [navHidden, setNavHidden] = useState(false);
  const { contests } = useFilters();

  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY;
      setShowBackToTop(currentY > 260);
      setNavHidden(currentY > 60);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const buildTopWinners = (
    contests: Contest[],
    nameKey: "winnerName" | "womenWinnerName",
    countryCodeKey: "winnerCountryCode" | "womenWinnerCountryCode",
    profileUrlKey: "winnerProfileUrl" | "womenWinnerProfileUrl",
  ) => {
    const winCounts = new Map<
      string,
      { name: string; countryCode: string; wins: number; profileUrl?: string }
    >();

    contests.forEach((contest) => {
      const winnerName = contest[nameKey]?.trim();
      const winnerCountryCode = contest[countryCodeKey]?.trim();
      const profileUrl = contest[profileUrlKey]?.trim();

      if (!winnerName || !winnerCountryCode) return;

      const surferKey = `${winnerName}__${winnerCountryCode}`;

      const existing = winCounts.get(surferKey);

      if (existing) {
        winCounts.set(surferKey, {
          ...existing,
          wins: existing.wins + 1,
          profileUrl: existing.profileUrl || profileUrl,
        });
      } else {
        winCounts.set(surferKey, {
          name: winnerName,
          countryCode: winnerCountryCode,
          wins: 1,
          profileUrl,
        });
      }
    });

    return Array.from(winCounts.values())
      .sort((a, b) => b.wins - a.wins || a.name.localeCompare(b.name))
      .slice(0, 10);
  };

  const topMenWinners = useMemo(() => {
    return buildTopWinners(
      contests,
      "winnerName",
      "winnerCountryCode",
      "winnerProfileUrl",
    );
  }, [contests]);

  const topWomenWinners = useMemo(() => {
    return buildTopWinners(
      contests,
      "womenWinnerName",
      "womenWinnerCountryCode",
      "womenWinnerProfileUrl",
    );
  }, [contests]);

  const { filters } = useFilters();

  return (
    <div className="site-shell">
      <div id="top" />
      <Header navHidden={navHidden} />
      <main>
        <section className="hero-section">
          <div className="container hero-panel">
            <div className="hero-content">
              <h1>Surf Contest Atlas</h1>
              <p className="hero-subhead">
                Explore professional surf contests from IPS to WSL across time
                and location
              </p>
            </div>
          </div>
        </section>

        <section id="about" className="content-section">
          <div className="container content-panel">
            <h2>About</h2>

            <div className="about-stack">
              <div>
                <h3>Intro</h3>
                <p className="about-text">
                  Surf Contest Atlas is a living map of professional surfing
                  history, tracking events from the early IPS era through
                  today&apos;s WSL tour.
                </p>
              </div>

              <div>
                <h3>What You Can Explore</h3>
                <p className="about-text">
                  Browse contest locations, timelines, and outcomes across
                  decades. Filter by tour, country, region, year, and decade.
                </p>
              </div>

              <div>
                <h3>Desktop Experience </h3>
                <p className="about-text">
                  Surf Contest Atlas is designed primarily as a desktop
                  experience to better explore the interactive map, filters, and
                  contest data side-by-side. The app can still be viewed on
                  mobile devices, but the best browsing experience is on a
                  desktop or larger screen.
                </p>
              </div>

              <div>
                <h3>Why It Exists</h3>
                <p className="about-text">
                  Surf data is often scattered or difficult to compare. This
                  project brings it together into one visual browsing
                  experience.
                </p>
              </div>

              <div>
                <h3>How to Use It</h3>
                <p className="about-text">
                  Use the filters first, then click a result card or map marker
                  to view contest details.
                </p>
              </div>

              <div>
                <h3>Future Direction</h3>
                <p className="about-text">
                  Later versions will add more contest years, deeper results,
                  media, and richer historical context.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section id="atlas" className="atlas-section">
          <div className="container atlas-layout">
            <MapSection />

            <ContestResultsSummary />

            <FilterPanel />

            <div className="atlas-bottom-grid">
              <aside className="winners-column">
                {filters.eventGender !== "women" && (
                  <TopWinnersCard
                    title="Event Victories - Men"
                    items={topMenWinners}
                    emptyMessage="No men’s winners in the data yet."
                  />
                )}

                {filters.eventGender !== "men" && (
                  <TopWinnersCard
                    title="Event Victories - Women"
                    items={topWomenWinners}
                    emptyMessage="No women’s winners in the data yet."
                  />
                )}
              </aside>

              <div className="contest-column">
                <ContestList />
              </div>
            </div>
          </div>
        </section>

        <section id="contact" className="content-section">
          <div className="container content-panel">
            <h2>Contact</h2>
            <ContactForm
              formspreeEndpoint={import.meta.env.VITE_FORMSPREE_ENDPOINT}
            />
          </div>
        </section>
      </main>
      <footer className="site-footer">
        <div className="container site-footer__inner">
          <p>
            © {new Date().getFullYear()} Surf Contest Atlas · Built by{" "}
            <a
              className="text-link"
              href="https://shaunvinedesign.com/work/"
              target="_blank"
              rel="noopener noreferrer"
            >
              Shaun Vine
            </a>{" "}
            · <span className="version">v1.0</span>
          </p>

          <div className="social-links" aria-label="Social media links">
            <a
              href="https://www.facebook.com/surfcontestatlas"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
            >
              <FontAwesomeIcon icon={faFacebookF} />
            </a>

            <a
              href="https://www.instagram.com/surfcontestatlas/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
            >
              <FontAwesomeIcon icon={faInstagram} />
            </a>
          </div>
        </div>
      </footer>
      <a
        href="#top"
        className={`back-to-top ${showBackToTop ? "back-to-top--visible" : ""}`}
        aria-label="Back to top"
      >
        ↑
      </a>
    </div>
  );
}

export default function App() {
  return (
    <FilterProvider>
      <AppShell />
    </FilterProvider>
  );
}
