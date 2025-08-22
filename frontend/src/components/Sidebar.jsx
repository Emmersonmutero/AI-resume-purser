import React from "react";
import { NavLink } from "react-router-dom";
import { HR_LINKS, CANDIDATE_LINKS } from "../utils/roleRoutes";
import { useAuth } from "../context/AuthContext";

export default function Sidebar() {
  const { profile } = useAuth();
  const links = (profile?.role === "hr" || profile?.role === "admin") ? HR_LINKS : CANDIDATE_LINKS;
  return (
    <aside className="sidebar">
      <div className="sidebar__title">Menu</div>
      <nav className="sidebar__nav">
        {links.map((l) => (
          <NavLink
            key={l.to}
            to={l.to}
            className={({ isActive }) => "navlink" + (isActive ? " navlink--active" : "")}
          >
            <span className="mr-2">{l.icon}</span>{l.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
