import { useState, useMemo, useEffect } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  Briefcase,
  Users,
  FileText,
  Trophy,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  Star,
  RefreshCw,
} from "lucide-react";
import ScoreRing from "../components/ui/ScoreRing";
import { useAuth } from "../lib/auth";
import { analyticsService } from "../lib/analyticsService";
import { candidateService } from "../lib/candidateService";
import toast from "react-hot-toast";

/* ─────────────────── Sub-components ─────────────────── */

const statusConfig = {
  new: { label: "New", cls: "badge-amber" },
  shortlisted: { label: "Shortlisted", cls: "badge-violet" },
  interviewed: { label: "Interviewed", cls: "badge-teal" },
  rejected: { label: "Rejected", cls: "badge-coral" },
};

function AvatarBubble({ initials, colorIndex = 0 }) {
  const palettes = [
    "from-violet-500 to-purple-700",
    "from-teal-500 to-cyan-700",
    "from-amber-500 to-orange-600",
    "from-rose-500 to-pink-700",
    "from-indigo-500 to-blue-700",
  ];
  return (
    <div
      className={`w-9 h-9 rounded-full bg-gradient-to-br ${palettes[colorIndex % palettes.length]} flex items-center justify-center text-white text-xs font-bold font-display flex-shrink-0`}
    >
      {initials}
    </div>
  );
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="card px-3 py-2 text-xs space-y-1 min-w-[120px]">
      <p className="text-white/50 font-medium">{label}</p>
      {payload.map((p) => (
        <div key={p.dataKey} className="flex items-center justify-between gap-4">
          <span style={{ color: p.color }}>{p.name}</span>
          <span className="font-bold text-white">{p.value}</span>
        </div>
      ))}
    </div>
  );
}

function StatCard({ icon: Icon, label, value, sub, subPositive, iconClass }) {
  return (
    <div className="stat-card group">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-white/50 text-xs font-medium uppercase tracking-wider mb-1">
            {label}
          </p>
          <p className="text-3xl font-bold font-display gradient-text">{value}</p>
          {sub && (
            <p
              className={`text-xs mt-1 font-medium ${subPositive ? "text-teal-400" : "text-red-400"}`}
            >
              {sub}
            </p>
          )}
        </div>
        <div className={`stat-icon ${iconClass}`}>
          <Icon size={20} />
        </div>
      </div>
    </div>
  );
}

/* ──────────────────────── Page ─────────────────────────── */

export default function DashboardPage() {
  const { user } = useAuth();
  const firstName = user?.full_name?.split(" ")[0] ?? "Recruiter";

  const [stats, setStats] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const resStats = await analyticsService.getDashboardStats();
      setStats(resStats.data);

      const resCandidates = await candidateService.getAllCandidates();
      setCandidates(resCandidates.data?.candidates || []);
    } catch (err) {
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const today = useMemo(() => {
    return new Date().toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }, []);

  // Compute pipeline data dynamically
  const pieData = useMemo(() => {
    if (!stats?.candidatesByStatus) return [];
    
    // Group counts
    const statusCounts = stats.candidatesByStatus || [];
    const mapping = {
      new: { name: "New", color: "#F59E0B" },
      shortlisted: { name: "Shortlisted", color: "#8B5CF6" },
      interviewed: { name: "Interviewed", color: "#2DD4BF" },
      rejected: { name: "Rejected", color: "#EF4444" },
    };

    const total = statusCounts.reduce((sum, curr) => sum + parseInt(curr.count || 0), 0) || 1;

    return statusCounts.map((sc) => {
      const config = mapping[sc.status] || { name: sc.status, color: "#8B5CF6" };
      return {
        name: config.name,
        value: Math.round((parseInt(sc.count || 0) / total) * 100),
        color: config.color,
      };
    });
  }, [stats]);

  // Fallback / Mock daily resume activity since logs are parsed over time
  const areaChartData = [
    { day: "Mon", resumes: 12, hired: 1 },
    { day: "Tue", resumes: 28, hired: 3 },
    { day: "Wed", resumes: 24, hired: 2 },
    { day: "Thu", resumes: 45, hired: 5 },
    { day: "Fri", resumes: 31, hired: 4 },
    { day: "Sat", resumes: 10, hired: 1 },
    { day: "Sun", resumes: 18, hired: 2 },
  ];

  // Map activities dynamically from recent candidates
  const activityFeed = useMemo(() => {
    const list = candidates.slice(0, 5);
    if (list.length === 0) {
      return [
        {
          id: 1,
          icon: Clock,
          iconColor: "text-violet-400",
          bg: "bg-violet-400/10",
          title: "System ready",
          sub: "Upload resumes to show activity feed",
          time: "Now",
        }
      ];
    }
    return list.map((c) => {
      const score = Math.round(c.ranking?.match_score || 0);
      let icon = FileText;
      let iconColor = "text-violet-400";
      let bg = "bg-violet-400/10";
      let title = `Candidate ${c.name || "Unknown"} parsed`;
      let sub = `${c.job?.title || "Founding AI Engineer"}`;

      if (c.status === "shortlisted") {
        icon = Star;
        iconColor = "text-amber-400";
        bg = "bg-amber-400/10";
        title = `Candidate ${c.name} Shortlisted`;
        sub = `Match Score: ${score}%`;
      } else if (c.status === "interviewed") {
        icon = CheckCircle2;
        iconColor = "text-teal-400";
        bg = "bg-teal-400/10";
        title = `Interviewing ${c.name}`;
      } else if (c.status === "rejected") {
        icon = AlertCircle;
        iconColor = "text-coral-400";
        bg = "bg-red-400/10";
        title = `${c.name} Rejected`;
        sub = `Score: ${score}%`;
      }

      return {
        id: c.id,
        icon,
        iconColor,
        bg,
        title,
        sub,
        time: new Date(c.created_at).toLocaleDateString([], { month: "short", day: "numeric" }),
      };
    });
  }, [candidates]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0A0F] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="animate-spin text-violet-400" size={32} />
          <p className="text-carbon-400 text-sm">Loading HireSense Recruiter Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0F] px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-display text-white">
            Good morning,{" "}
            <span className="gradient-text">{firstName}</span>! 👋
          </h1>
          <p className="text-white/40 text-sm mt-1 flex items-center gap-1.5">
            <Clock size={13} />
            {today}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="chip">
            <span className="dot dot-green" />
            AI Engine Active
          </span>
          <button onClick={fetchStats} className="btn-secondary btn-sm flex items-center gap-1.5">
            <RefreshCw size={14} />
            Sync Dashboard
          </button>
        </div>
      </div>

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Briefcase}
          label="Total Jobs"
          value={stats?.totalJobs || "0"}
          sub="Published roles"
          subPositive
          iconClass="bg-violet-500/15 text-violet-400"
        />
        <StatCard
          icon={Users}
          label="Active Candidates"
          value={stats?.totalCandidates || "0"}
          sub="Total parsed profiles"
          subPositive
          iconClass="bg-teal-500/15 text-teal-400"
        />
        <StatCard
          icon={FileText}
          label="Candidates Interviewed"
          value={stats?.interviewed || "0"}
          sub="In process"
          subPositive
          iconClass="bg-amber-500/15 text-amber-400"
        />
        <StatCard
          icon={Trophy}
          label="Avg Match Score"
          value={stats?.avgMatchScore ? `${stats.avgMatchScore}%` : "0%"}
          sub="Current pool alignment"
          subPositive={stats?.avgMatchScore >= 70}
          iconClass="bg-rose-500/15 text-rose-400"
        />
      </div>

      {/* ── Charts Row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Area Chart (2/3) */}
        <div className="lg:col-span-2 card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold font-display text-white">
                Resume Activity
              </h2>
              <p className="text-white/40 text-xs mt-0.5">Daily parsed applications</p>
            </div>
            <div className="flex items-center gap-4 text-xs text-white/50">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-violet-500 inline-block" />
                Parsed
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-teal-400 inline-block" />
                Shortlisted
              </span>
            </div>
          </div>

          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={areaChartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="gradResumes" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradHired" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2DD4BF" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#2DD4BF" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="day"
                tick={{ fill: "rgba(255,255,255,0.35)", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: "rgba(255,255,255,0.35)", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: "rgba(255,255,255,0.06)" }} />
              <Area
                type="monotone"
                dataKey="resumes"
                name="Parsed"
                stroke="#8B5CF6"
                strokeWidth={2}
                fill="url(#gradResumes)"
                dot={false}
                activeDot={{ r: 5, fill: "#8B5CF6", stroke: "#0A0A0F", strokeWidth: 2 }}
              />
              <Area
                type="monotone"
                dataKey="hired"
                name="Shortlisted"
                stroke="#2DD4BF"
                strokeWidth={2}
                fill="url(#gradHired)"
                dot={false}
                activeDot={{ r: 5, fill: "#2DD4BF", stroke: "#0A0A0F", strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Pipeline Breakdowns (1/3) */}
        <div className="card p-6 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold font-display text-white">Platform Summary</h2>
          </div>

          <div className="space-y-4 flex-1">
            <p className="text-xs text-white/40 uppercase tracking-wider font-medium">Recent Job Postings</p>
            <div className="space-y-3">
              {(stats?.recentJobs || []).map((job) => (
                <div key={job.id} className="flex items-center justify-between border-b border-white/5 pb-2 text-sm">
                  <div>
                    <p className="font-semibold text-white truncate max-w-[180px]">{job.title}</p>
                    <p className="text-[10px] text-white/40">Created {new Date(job.created_at).toLocaleDateString()}</p>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full ${job.status === "Published" ? "badge-teal" : "badge-amber"}`}>
                    {job.status}
                  </span>
                </div>
              ))}
              {(!stats?.recentJobs || stats?.recentJobs.length === 0) && (
                <div className="text-xs text-white/30 text-center py-4">No active job postings.</div>
              )}
            </div>
          </div>

          <div className="divider" />
          <div>
            <p className="text-xs text-white/40 mb-3 uppercase tracking-wider font-medium">
              Pipeline Breakdown
            </p>
            <div className="flex items-center gap-4">
              {pieData.length > 0 ? (
                <>
                  <PieChart width={72} height={72}>
                    <Pie
                      data={pieData}
                      cx={32}
                      cy={32}
                      innerRadius={22}
                      outerRadius={34}
                      paddingAngle={3}
                      dataKey="value"
                      stroke="none"
                    >
                      {pieData.map((entry) => (
                        <Cell key={entry.name} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                  <div className="space-y-1.5 flex-1">
                    {pieData.map((d) => (
                      <div key={d.name} className="flex items-center gap-2">
                        <span
                          className="w-2 h-2 rounded-full flex-shrink-0"
                          style={{ background: d.color }}
                        />
                        <span className="text-xs text-white/50">{d.name}</span>
                        <span className="text-xs font-bold text-white ml-auto tabular-nums">
                          {d.value}%
                        </span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <p className="text-xs text-white/30">No candidate statistics.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Bottom Row: Table + Activity ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Candidates Table (2/3) */}
        <div className="lg:col-span-2 card p-0 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4">
            <div>
              <h2 className="text-base font-semibold font-display text-white">
                Recent Candidates
              </h2>
              <p className="text-xs text-white/40 mt-0.5">Latest applicants across all jobs</p>
            </div>
          </div>

          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>Candidate</th>
                  <th>Job Applied</th>
                  <th>Match Score</th>
                  <th>Status</th>
                  <th>Applied</th>
                </tr>
              </thead>
              <tbody>
                {candidates.slice(0, 5).map((c, i) => {
                  const initials = (c.name || "U").split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);
                  const config = statusConfig[c.status] || { label: c.status, cls: "badge-amber" };
                  return (
                    <tr key={c.id}>
                      <td>
                        <div className="flex items-center gap-3">
                          <AvatarBubble initials={initials} colorIndex={i} />
                          <div>
                            <p className="text-sm font-medium text-white">{c.name}</p>
                            <p className="text-xs text-white/40">{c.email}</p>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="text-sm text-white/70">{c.job?.title || "Founding AI Engineer"}</span>
                      </td>
                      <td>
                        <div className="flex items-center gap-2.5">
                          <ScoreRing score={Math.round(c.ranking?.match_score || 0)} size={40} strokeWidth={4} />
                        </div>
                      </td>
                      <td>
                        <span className={config.cls}>{config.label}</span>
                      </td>
                      <td>
                        <span className="text-xs text-white/40">
                          {new Date(c.created_at).toLocaleDateString([], { month: "short", day: "numeric" })}
                        </span>
                      </td>
                    </tr>
                  );
                })}
                {candidates.length === 0 && (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-white/30 text-xs">
                      No candidates parsed yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Activity Feed (1/3) */}
        <div className="card p-6 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold font-display text-white">Activity Log</h2>
            <span className="chip">Live updates</span>
          </div>

          <div className="space-y-1 flex-1">
            {activityFeed.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div key={item.id || idx}>
                  <div className="flex items-start gap-3 py-3 group">
                    <div
                      className={`w-8 h-8 rounded-lg ${item.bg} flex items-center justify-center flex-shrink-0`}
                    >
                      <Icon size={15} className={item.iconColor} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white leading-tight truncate">
                        {item.title}
                      </p>
                      <p className="text-xs text-white/40 mt-0.5 truncate">{item.sub}</p>
                    </div>
                    <span className="text-[11px] text-white/30 flex-shrink-0 mt-0.5">
                      {item.time}
                    </span>
                  </div>
                  {idx < activityFeed.length - 1 && <div className="divider" />}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
