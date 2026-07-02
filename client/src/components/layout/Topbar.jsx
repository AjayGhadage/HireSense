import { Bell, Search, Menu } from "lucide-react";
import { useAuth } from "../../lib/auth";
import { useLocation } from "react-router-dom";

const pageTitles = {
  "/dashboard": "Dashboard",
  "/jobs": "Jobs",
  "/resumes": "Resumes",
  "/candidates": "Candidates",
  "/rankings": "Rankings",
  "/assistant": "AI Assistant",
  "/reports": "Reports",
  "/settings": "Settings",
};

export default function Topbar({ onMenuToggle }) {
  const { user } = useAuth();
  const location = useLocation();
  const title =
    pageTitles[location.pathname] ||
    Object.entries(pageTitles).find(([k]) =>
      location.pathname.startsWith(k)
    )?.[1] ||
    "HireSense";

  return (
    <header className="fixed top-0 right-0 left-0 lg:left-64 h-16 bg-carbon-900/85 backdrop-blur-xl border-b border-white/[0.04] z-30 flex items-center px-4 sm:px-6 gap-3">
      {/* Mobile menu trigger */}
      <button
        onClick={onMenuToggle}
        className="lg:hidden btn-icon text-gray-400 hover:text-white hover:bg-white/[0.05]"
      >
        <Menu className="w-5 h-5" />
      </button>

      <div className="flex-1 min-w-0">
        <h1 className="text-lg font-display font-semibold text-gray-100 truncate">
          {title}
        </h1>
      </div>

      {/* Search */}
      <div className="relative hidden md:flex items-center">
        <Search className="absolute left-3 w-4 h-4 text-gray-600" />
        <input
          type="text"
          placeholder="Search anything..."
          className="input pl-9 w-52 py-2 text-sm bg-carbon-800"
        />
      </div>

      {/* Notifications */}
      <button className="btn-icon text-gray-500 hover:text-gray-200 hover:bg-white/[0.05] relative">
        <Bell className="w-5 h-5" />
        <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-coral-500 rounded-full ring-2 ring-carbon-900" />
      </button>

      {/* Avatar */}
      <div
        className="w-8 h-8 rounded-full flex items-center justify-center cursor-pointer flex-shrink-0 text-white text-xs font-bold"
        style={{ background: "linear-gradient(135deg, #8B5CF6, #EF4444)" }}
      >
        {user?.full_name?.[0]?.toUpperCase() || "U"}
      </div>
    </header>
  );
}
