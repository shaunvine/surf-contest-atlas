import { useEffect, useState } from "react";
import Logo from "./Logo";

type HeaderProps = {
  navHidden: boolean;
};

export default function Header({ navHidden }: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 769) {
        setMenuOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    document.body.classList.toggle("menu-open", menuOpen);
    return () => document.body.classList.remove("menu-open");
  }, [menuOpen]);

  const closeMenu = () => setMenuOpen(false);
  const toggleMenu = () => setMenuOpen((prev) => !prev);

  return (
    <>
      <header
        className={`site-header ${navHidden ? "site-header--hidden" : ""} ${
          menuOpen ? "site-header--menu-open" : ""
        }`}
      >
        <div className="container site-header__inner">
          <a href="#top" className="logo" aria-label="Surf Contest Atlas home">
            <Logo width={100} />
          </a>

          <nav
            className="site-nav site-nav--desktop"
            aria-label="Primary navigation"
          >
            <a href="#atlas">Map</a>
            <a href="#about">About</a>
            <a href="#contact">Contact</a>
          </nav>

          <button
            type="button"
            className={`nav-toggle ${menuOpen ? "nav-toggle--open" : ""}`}
            aria-expanded={menuOpen}
            aria-controls="mobile-nav-drawer"
            aria-label={
              menuOpen ? "Close navigation menu" : "Open navigation menu"
            }
            onClick={toggleMenu}
          >
            <span className="nav-toggle__bar" />
            <span className="nav-toggle__bar" />
            <span className="nav-toggle__bar" />
          </button>
        </div>
      </header>

      <button
        type="button"
        className={`mobile-nav-overlay ${
          menuOpen ? "mobile-nav-overlay--open" : ""
        }`}
        onClick={closeMenu}
        aria-label="Close navigation menu"
      />

      <aside
        id="mobile-nav-drawer"
        className={`mobile-nav-drawer ${
          menuOpen ? "mobile-nav-drawer--open" : ""
        }`}
        aria-label="Mobile navigation"
      >
        <div className="mobile-nav-drawer__inner">
          <div className="mobile-nav-drawer__top">
            <div className="mobile-nav-drawer__header">
              <a
                href="#top"
                className="logo mobile-nav-drawer__logo"
                aria-label="Surf Contest Atlas home"
                onClick={closeMenu}
              >
                <Logo width={160} />
              </a>

              <button
                type="button"
                className="mobile-nav-drawer__close"
                aria-label="Close navigation menu"
                onClick={closeMenu}
              >
                <span className="mobile-nav-drawer__close-line" />
                <span className="mobile-nav-drawer__close-line" />
              </button>
            </div>

            <nav className="mobile-nav" aria-label="Mobile primary navigation">
              <a href="#atlas" onClick={closeMenu}>
                Map
              </a>
              <a href="#about" onClick={closeMenu}>
                About
              </a>
              <a href="#contact" onClick={closeMenu}>
                Contact
              </a>
            </nav>
          </div>

          <div
            className="mobile-nav-drawer__footer"
            aria-label="Social media links"
          >
            <a
              href="https://www.facebook.com/surfcontestatlas"
              aria-label="Facebook"
            >
              f
            </a>
            <a
              href="https://www.instagram.com/surfcontestatlas/"
              aria-label="Instagram"
            >
              ig
            </a>
          </div>
        </div>
      </aside>
    </>
  );
}
