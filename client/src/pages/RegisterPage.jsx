import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../lib/auth";
import { Eye, EyeOff, ArrowRight, CheckCircle } from "lucide-react";
import authBg from "../assets/auth-bg.png";
import logo from "../assets/logo.png";

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ full_name: "", email: "", password: "", confirm: "" });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (form.password !== form.confirm) {
      setError("Passwords don't match");
      return;
    }
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    setLoading(true);
    try {
      await register(form.full_name, form.email, form.password);
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-carbon-900">
      {/* Left branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden items-center justify-center">
        <img src={authBg} alt="" className="absolute inset-0 w-full h-full object-cover opacity-40" />
        <div className="absolute inset-0 bg-gradient-to-br from-carbon-950/90 via-carbon-900/80 to-violet-600/20" />
        <div className="relative z-10 max-w-md px-12">
          <div className="flex items-center gap-3 mb-8">
            <img src={logo} alt="HireSense" className="w-11 h-11 rounded-xl object-cover" />
            <span className="text-2xl font-display font-bold text-white tracking-tight">HireSense</span>
          </div>
          <h1 className="text-4xl font-display font-bold text-white leading-tight mb-6">
            Start hiring<br />
            <span className="gradient-text">with intelligence.</span>
          </h1>
          <div className="space-y-4 text-gray-300">
            {[
              "AI-powered resume parsing in seconds",
              "Semantic candidate ranking & scoring",
              "Intelligent interview question generation",
              "Natural language recruiter assistant",
            ].map((item) => (
              <div key={item} className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-teal-400 flex-shrink-0 mt-0.5" />
                <span className="text-sm">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right form */}
      <div className="flex-1 flex items-center justify-center px-5 py-12 lg:px-16">
        <div className="w-full max-w-sm">
          <div className="lg:hidden flex items-center gap-3 mb-10">
            <img src={logo} alt="HireSense" className="w-10 h-10 rounded-xl object-cover" />
            <span className="text-xl font-display font-bold text-white">HireSense</span>
          </div>

          <h2 className="text-2xl font-display font-bold text-white mb-1">Create account</h2>
          <p className="text-gray-500 mb-8">Get started with your free recruiter account</p>

          {error && (
            <div className="mb-5 px-4 py-3 rounded-xl bg-coral-500/10 border border-coral-500/20 text-coral-400 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="form-group">
              <label className="label">Full Name</label>
              <input type="text" className="input" placeholder="Jane Smith"
                value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} required autoFocus />
            </div>

            <div className="form-group">
              <label className="label">Email</label>
              <input type="email" className="input" placeholder="jane@company.com"
                value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
            </div>

            <div className="form-group">
              <label className="label">Password</label>
              <div className="relative">
                <input type={showPw ? "text" : "password"} className="input pr-11" placeholder="Min 6 characters"
                  value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-300">
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="form-group">
              <label className="label">Confirm Password</label>
              <input type="password" className="input" placeholder="••••••••"
                value={form.confirm} onChange={(e) => setForm({ ...form, confirm: e.target.value })} required />
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full btn-lg group">
              {loading ? (
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>Create Account <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" /></>
              )}
            </button>
          </form>

          <p className="text-center text-gray-600 text-sm mt-8">
            Already have an account?{" "}
            <Link to="/login" className="text-violet-400 hover:text-violet-300 font-medium">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
