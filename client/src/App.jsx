import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./lib/auth";
import ProtectedRoute from "./components/layout/ProtectedRoute";
import AppLayout from "./components/layout/AppLayout";

import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";

// Lazy-loaded pages (will be created)
import DashboardPage from "./pages/DashboardPage";
import JobsPage from "./pages/JobsPage";
import ResumesPage from "./pages/ResumesPage";
import CandidatesPage from "./pages/CandidatesPage";
import RankingsPage from "./pages/RankingsPage";
import AssistantPage from "./pages/AssistantPage";
import ReportsPage from "./pages/ReportsPage";
import SettingsPage from "./pages/SettingsPage";

import { useEffect } from "react";

export default function App() {
  useEffect(() => {
    const theme = localStorage.getItem("theme") || "dark";
    const accent = localStorage.getItem("accent") || "Violet";
    document.documentElement.classList.toggle("dark", theme === "dark");
    document.documentElement.classList.toggle("light", theme === "light");
    document.documentElement.setAttribute("data-accent", accent.toLowerCase());
  }, []);

  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Protected app routes */}
          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/jobs" element={<JobsPage />} />
              <Route path="/resumes" element={<ResumesPage />} />
              <Route path="/candidates" element={<CandidatesPage />} />
              <Route path="/rankings" element={<RankingsPage />} />
              <Route path="/assistant" element={<AssistantPage />} />
              <Route path="/reports" element={<ReportsPage />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Route>
          </Route>

          {/* Redirects */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>

      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: "#1a1c24",
            color: "#e2e0dc",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: "12px",
            fontSize: "14px",
          },
          success: {
            iconTheme: { primary: "#2DD4BF", secondary: "#1a1c24" },
          },
          error: {
            iconTheme: { primary: "#EF4444", secondary: "#1a1c24" },
          },
        }}
      />
    </AuthProvider>
  );
}
