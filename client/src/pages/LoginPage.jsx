import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../lib/auth";
import { Eye, EyeOff, ArrowRight } from "lucide-react";
import authBg from "../assets/auth-bg.png";
import logo from "../assets/logo.png";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-carbon-900">
      {/* Left — Branding panel */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden items-center justify-center">
        <img
          src={authBg}
          alt=""
          className="absolute inset-0 w-full h-full object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-carbon-950/90 via-carbon-900/80 to-violet-600/20" />
        <div className="relative z-10 max-w-md px-12">
          <div className="flex items-center gap-3 mb-8">
            <img src={logo} alt="HireSense" className="w-11 h-11 rounded-xl object-cover" />
            <span className="text-2xl font-display font-bold text-white tracking-tight">
              HireSense
            </span>
          </div>
          <h1 className="text-4xl font-display font-bold text-white leading-tight mb-4">
            Recruit smarter,<br />
            <span className="gradient-text">not harder.</span>
          </h1>
          <p className="text-gray-400 text-lg leading-relaxed">
            AI-powered candidate ranking, resume parsing, and interview preparation — all in one platform built for modern recruiters.
          </p>
          <div className="mt-10 flex gap-6">
            <div>
              <p className="text-2xl font-display font-bold text-white">10x</p>
              <p className="text-xs text-gray-500 mt-1">Faster Screening</p>
            </div>
            <div className="w-px bg-white/10" />
            <div>
              <p className="text-2xl font-display font-bold text-white">95%</p>
              <p className="text-xs text-gray-500 mt-1">Match Accuracy</p>
            </div>
            <div className="w-px bg-white/10" />
            <div>
              <p className="text-2xl font-display font-bold text-white">500+</p>
              <p className="text-xs text-gray-500 mt-1">Resumes/min</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right — Login form */}
      <div className="flex-1 flex items-center justify-center px-5 py-12 lg:px-16">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-10">
            <img src={logo} alt="HireSense" className="w-10 h-10 rounded-xl object-cover" />
            <span className="text-xl font-display font-bold text-white">HireSense</span>
          </div>

          <h2 className="text-2xl font-display font-bold text-white mb-1">Welcome back</h2>
          <p className="text-gray-500 mb-8">Sign in to your recruiter account</p>

          {error && (
            <div className="mb-5 px-4 py-3 rounded-xl bg-coral-500/10 border border-coral-500/20 text-coral-400 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="form-group">
              <label className="label">Email</label>
              <input
                type="email"
                className="input"
                placeholder="you@company.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
                autoFocus
              />
            </div>

            <div className="form-group">
              <label className="label">Password</label>
              <div className="relative">
                <input
                  type={showPw ? "text" : "password"}
                  className="input pr-11"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-300"
                >
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full btn-lg group"
            >
              {loading ? (
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Sign In
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </>
              )}
            </button>
          </form>

          <p className="text-center text-gray-600 text-sm mt-8">
            Don't have an account?{" "}
            <Link to="/register" className="text-violet-400 hover:text-violet-300 font-medium">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
