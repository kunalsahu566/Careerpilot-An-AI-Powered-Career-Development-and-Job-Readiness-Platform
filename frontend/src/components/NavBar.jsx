import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const LINKS = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/profile", label: "Profile" },
  { to: "/skill-gap", label: "Skill Gap" },
  { to: "/readiness", label: "Readiness" },
  { to: "/learning", label: "Learning" },
  { to: "/study-plan", label: "Study Plan" },
  { to: "/jobs", label: "Jobs" },
  { to: "/applications", label: "Applications" },
];

function linkClasses({ isActive }) {
  return `px-3 py-1.5 rounded-lg text-sm font-medium transition ${
    isActive
      ? "bg-blue-50 text-blue-700"
      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
  }`;
}

export default function NavBar() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200">
      <div className="max-w-6xl mx-auto h-14 px-4 flex items-center justify-between">
        <Link to="/dashboard" className="text-lg font-bold text-slate-800">
          Career<span className="text-blue-600">Pilot</span>
        </Link>

        {/* Desktop navigation */}
        <nav className="hidden lg:flex items-center gap-1">
          {LINKS.map((link) => (
            <NavLink key={link.to} to={link.to} className={linkClasses}>
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden lg:flex items-center gap-3">
          <span className="text-sm text-slate-500">{user?.name}</span>
          <button onClick={logout} className="text-sm text-slate-500 hover:text-red-600">
            Log out
          </button>
        </div>

        {/* Mobile menu button */}
        <button
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
          className="lg:hidden text-slate-600 text-xl px-2"
        >
          {open ? "✕" : "☰"}
        </button>
      </div>

      {/* Mobile dropdown */}
      {open && (
        <nav className="lg:hidden border-t border-slate-100 bg-white px-4 py-3 flex flex-col gap-1">
          {LINKS.map((link) => (
            <NavLink key={link.to} to={link.to} className={linkClasses} onClick={() => setOpen(false)}>
              {link.label}
            </NavLink>
          ))}
          <div className="flex justify-between items-center mt-2 pt-3 border-t border-slate-100">
            <span className="text-sm text-slate-500">{user?.name}</span>
            <button onClick={logout} className="text-sm text-slate-500 hover:text-red-600">
              Log out
            </button>
          </div>
        </nav>
      )}
    </header>
  );
}
