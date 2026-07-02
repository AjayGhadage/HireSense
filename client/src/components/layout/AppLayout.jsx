import { useState } from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import { Outlet } from "react-router-dom";

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-carbon-900 texture">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="sidebar-overlay lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <Topbar onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />

      <main className="lg:ml-64 pt-16 min-h-screen">
        <div className="p-4 sm:p-6 animate-fade-in">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
