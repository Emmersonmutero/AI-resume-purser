import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { HR_LINKS, CANDIDATE_LINKS } from "../utils/roleRoutes"; // Import role-specific links
import NotificationBell from "./NotificationBell";
import ThemeToggle from "./ThemeToggle";
import ProfileDropdown from "./ProfileDropdown"; // Import the new component
import "../styles/Navbar.css"; // Ensure you have this CSS file for styling
import logo from "../assets/logo.svg";

export default function Navbar() {
  const { user, profile } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const links = (profile?.role === "hr" || profile?.role === "admin") ? HR_LINKS : CANDIDATE_LINKS;

  return (
    <header className={`navbar navbar--${profile?.role || 'guest'}`}>
      <div className="navbar__container">
        <Link to="/" className="navbar__brand">
          <img src={logo} alt="AI Resume Parser Logo" className="navbar__logo" />
        </Link>

        <button
          className={`navbar__menu-button ${isMenuOpen ? "navbar__menu-button--open" : ""}`}
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            {isMenuOpen ? (
              <path d="M6 18L18 6M6 6l12 12" />
            ) : (
              <>
                <path d="M4 6h16" />
                <path d="M4 12h16" />
                <path d="M4 18h16" />
              </>
            )}
          </svg>
        </button>

        <div className="navbar__actions">
          <ThemeToggle className="navbar__theme-toggle" />
          {user && <NotificationBell />}
          {user && <ProfileDropdown />}
        </div>

        <nav className={`navbar__nav ${isMenuOpen ? "navbar__nav--open" : ""}`}>
          {user ? (
            <>
              {links.map(l => (
                <Link key={l.to} to={l.to} className="navbar__link">{l.label}</Link>
              ))}
            </>
          ) : (
            <>
              <Link to="/login" className="navbar__link">Login</Link>
              <Link to="/register" className="navbar__button navbar__button--primary">
                Get Started
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
