import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../lib/auth";
import logo from "../../assets/logo.png";
import {
  LayoutDashboard, Briefcase, FileText, Users, Trophy,
  Bot, BarChart3, Settings, LogOut, Zap, X,
} from "lucide-react";

const navItems = [
  { to: "/dashboard",  icon: LayoutDashboard, label: "Dashboard" },
  { to: "/jobs",        icon: Briefcase,       label: "Jobs" },
  { to: "/resumes",     icon: FileText,        label: "Resumes" },
  { to: "/candidates",  icon: Users,           label: "Candidates" },
  { to: "/rankings",    icon: Trophy,          label: "Rankings" },
  { to: "/assistant",   icon: Bot,             label: "AI Assistant" },
  { to: "/reports",     icon: BarChart3,       label: "Reports" },
  { to: "/settings",    icon: Settings,        label: "Settings" },
];

export default function Sidebar({ open, onClose }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <aside
      className={`
        fixed left-0 top-0 bottom-0 w-64 bg-carbon-850 border-r border-white/[0.05]
        flex flex-col z-40 transition-transform duration-300
        lg:translate-x-0
        ${open ? "translate-x-0" : "-translate-x-full"}
      `}
    >
      {/* Logo */}
      <div className="px-5 py-4 border-b border-white/[0.05] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img
            src={logo}
            alt="HireSense Logo"
            className="w-9 h-9 rounded-xl object-cover"
          />
          <div>
            <p className="text-sm font-bold text-white font-display tracking-tight">
              HireSense
            </p>
            <p className="text-[10px] text-gray-500 uppercase tracking-widest">
              AI Platform
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="lg:hidden btn-icon text-gray-500 hover:text-white hover:bg-white/[0.05]"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        <p className="px-3 mb-2 text-[10px] text-gray-600 uppercase tracking-widest font-semibold">
          Menu
        </p>
        {navItems.slice(0, 6).map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            onClick={onClose}
            className={({ isActive }) =>
              `nav-item group ${isActive ? "nav-item-active" : ""}`
            }
          >
            <Icon className="w-[18px] h-[18px] flex-shrink-0" />
            <span className="flex-1">{label}</span>
          </NavLink>
        ))}

        <div className="divider !my-3" />
        <p className="px-3 mb-2 text-[10px] text-gray-600 uppercase tracking-widest font-semibold">
          Insights
        </p>
        {navItems.slice(6).map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            onClick={onClose}
            className={({ isActive }) =>
              `nav-item group ${isActive ? "nav-item-active" : ""}`
            }
          >
            <Icon className="w-[18px] h-[18px] flex-shrink-0" />
            <span className="flex-1">{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* User */}
      <div className="px-3 pb-4 pt-2 border-t border-white/[0.05]">
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-white text-xs font-bold"
            style={{ background: "linear-gradient(135deg, #8B5CF6, #EF4444)" }}
          >
            {user?.full_name?.[0]?.toUpperCase() || "U"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-200 truncate">
              {user?.full_name || "Recruiter"}
            </p>
            <p className="text-[11px] text-gray-600 truncate">{user?.email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="btn-icon text-gray-600 hover:text-coral-400 hover:bg-coral-500/10"
            title="Logout"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
