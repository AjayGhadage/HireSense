import { useState, useEffect } from "react";
import {
  Trophy,
  Medal,
  Star,
  TrendingUp,
  ChevronDown,
  Search,
  Zap,
  Award,
  Target,
  BarChart2,
  Users,
  ArrowUp,
  ArrowDown,
  Crown,
  X,
  RefreshCw,
} from "lucide-react";
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import ScoreRing from "../components/ui/ScoreRing";
import { rankingService } from "../lib/rankingService";
import { jobService } from "../lib/jobService";
import toast from "react-hot-toast";

// ─── Rank Medal Component ─────────────────────────────────────────────────────
function RankBadge({ rank }) {
  if (rank === 1) return <Crown size={16} className="text-violet-400" />;
  if (rank === 2) return <Medal size={16} className="text-teal-400" />;
  if (rank === 3) return <Award size={16} className="text-amber-400" />;
  return <span className="text-sm font-bold text-carbon-400">#{rank}</span>;
}

// ─── Radar Tooltip ────────────────────────────────────────────────────────────
function CustomRadarTooltip({ active, payload }) {
  if (active && payload && payload.length) {
    return (
      <div className="card px-3 py-2 text-xs">
        <p className="font-semibold text-white">{payload[0].payload.subject}</p>
        <p className="text-violet-400 font-bold">{payload[0].value}</p>
      </div>
    );
  }
  return null;
}

// ─── Score Breakdown Modal ────────────────────────────────────────────────────
function ScoreModal({ candidate, onClose }) {
  const radarData = [
    { subject: "Technical", value: candidate.technicalScore },
    { subject: "Communication", value: candidate.communicationScore },
    { subject: "Culture Fit", value: candidate.cultureFitScore },
    { subject: "Relevance", value: candidate.relevanceScore },
    { subject: "Overall", value: candidate.score },
  ];

  const scoreColor = (s) =>
    s >= 90 ? "text-teal-400" : s >= 75 ? "text-violet-400" : s >= 60 ? "text-amber-400" : "text-red-400";

  const barColor = (s) =>
    s >= 90 ? "bg-teal-400" : s >= 75 ? "bg-violet-500" : s >= 60 ? "bg-amber-400" : "bg-red-400";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(6px)" }}
    >
      <div
        className="card relative w-full max-w-xl"
        style={{ border: "1px solid rgba(139,92,246,0.35)", maxHeight: "90vh", overflowY: "auto" }}
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 btn-ghost p-1.5 rounded-lg text-carbon-400 hover:text-white"
        >
          <X size={16} />
        </button>

        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg text-white"
            style={{ background: "linear-gradient(135deg,#7c3aed,#06b6d4)" }}
          >
            {candidate.name.charAt(0)}
          </div>
          <div>
            <h3 className="font-bold text-white text-lg">{candidate.name}</h3>
            <p className="text-carbon-400 text-sm">
              Rank #{candidate.rank} · {candidate.experience} experience
            </p>
          </div>
          <div className="ml-auto">
            <ScoreRing score={candidate.score} size={56} strokeWidth={5} />
          </div>
        </div>

        {/* Radar Chart */}
        <div className="mb-6" style={{ height: 220 }}>
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={radarData} margin={{ top: 10, right: 30, bottom: 10, left: 30 }}>
              <PolarGrid stroke="rgba(255,255,255,0.06)" />
              <PolarAngleAxis
                dataKey="subject"
                tick={{ fill: "#9ca3af", fontSize: 11, fontFamily: "inherit" }}
              />
              <Radar
                name="Score"
                dataKey="value"
                stroke="#8b5cf6"
                fill="#8b5cf6"
                fillOpacity={0.25}
                strokeWidth={2}
              />
              <Tooltip content={<CustomRadarTooltip />} />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Score Bars */}
        <div className="space-y-3">
          {[
            { label: "Technical Score", value: candidate.technicalScore },
            { label: "Experience Fit", value: candidate.communicationScore },
            { label: "Education Fit", value: candidate.cultureFitScore },
            { label: "Project Relevance", value: candidate.relevanceScore },
          ].map(({ label, value }) => (
            <div key={label}>
              <div className="flex justify-between mb-1">
                <span className="text-xs text-carbon-400">{label}</span>
                <span className={`text-xs font-bold ${scoreColor(value)}`}>{value}</span>
              </div>
              <div className="h-1.5 rounded-full" style={{ background: "rgba(255,255,255,0.06)" }}>
                <div
                  className={`h-1.5 rounded-full transition-all ${barColor(value)}`}
                  style={{ width: `${value}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* AI Explanation */}
        {candidate.explanation && (
          <div className="mt-5 p-3 rounded-lg bg-violet-500/5 border border-violet-500/10 text-xs">
            <p className="font-semibold text-violet-400 mb-1 flex items-center gap-1">
              <Zap size={12} /> AI Feedback
            </p>
            <p className="text-carbon-300 leading-relaxed">{candidate.explanation}</p>
          </div>
        )}

        {/* HireSense Behavioral Signals */}
        {candidate.raw_parsed_data?.redrob_signals && (() => {
          const signals = candidate.raw_parsed_data.redrob_signals;
          const resRatePercent = Math.round((signals.recruiter_response_rate || 0) * 100);
          
          // Determine notice period badge type
          const noticeDays = signals.notice_period_days !== undefined ? signals.notice_period_days : 60;
          let noticeColor = "text-amber-400";
          let noticeText = `${noticeDays} Days`;
          if (noticeDays <= 30) {
            noticeColor = "text-teal-400 font-bold";
            noticeText = `${noticeDays} Days (Sub-30d)`;
          } else if (noticeDays > 90) {
            noticeColor = "text-rose-400 font-bold";
            noticeText = `${noticeDays} Days (Long Period)`;
          }

          // Determine response rate badge
          let responseColor = "text-amber-400";
          if (resRatePercent >= 80) responseColor = "text-teal-400 font-bold";
          else if (resRatePercent < 30) responseColor = "text-rose-400";

          // Determine avg response time badge
          const respHours = signals.avg_response_time_hours || 0;
          let respTimeText = `${respHours} hrs`;
          let respTimeColor = "text-gray-300";
          if (respHours < 24) {
            respTimeColor = "text-teal-400 font-bold";
            respTimeText = `${respHours} hrs (Very Fast)`;
          } else if (respHours > 120) {
            respTimeColor = "text-rose-450";
            respTimeText = `${respHours} hrs (Slow)`;
          }

          // Check if honeypot flag has been triggered
          const rawSkills = candidate.raw_parsed_data.skills || [];
          const isHoneypot = rawSkills.some(s => 
            s.proficiency?.toLowerCase() === "expert" && (s.duration_months === 0 || s.duration_months < 6)
          ) || (rawSkills.filter(s => s.proficiency?.toLowerCase() === "expert").length > 6 && (candidate.experience_years || 0) < 3);

          return (
            <div className="mt-5 p-3 rounded-lg bg-white/[0.02] border border-white/[0.04] text-xs">
              <p className="font-semibold text-teal-400 mb-3 flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <TrendingUp size={12} className="text-teal-400" /> HireSense Behavioral Signals
                </span>
                {isHoneypot && (
                  <span className="px-2 py-0.5 text-[9px] bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded font-bold uppercase tracking-wider animate-pulse">
                    Honeypot Warning
                  </span>
                )}
              </p>

              {/* Grid of Signals */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                <div className="p-2 rounded bg-white/[0.02] border border-white/[0.03]">
                  <span className="text-carbon-500 block text-[10px]">Notice Period</span>
                  <span className={noticeColor}>{noticeText}</span>
                </div>
                <div className="p-2 rounded bg-white/[0.02] border border-white/[0.03]">
                  <span className="text-carbon-500 block text-[10px]">Response Rate</span>
                  <span className={responseColor}>{resRatePercent}%</span>
                </div>
                <div className="p-2 rounded bg-white/[0.02] border border-white/[0.03]">
                  <span className="text-carbon-500 block text-[10px]">Avg Resp Time</span>
                  <span className={respTimeColor}>{respTimeText}</span>
                </div>
                <div className="p-2 rounded bg-white/[0.02] border border-white/[0.03]">
                  <span className="text-carbon-500 block text-[10px]">Last Active</span>
                  <span className="text-gray-300">{signals.last_active_date || "N/A"}</span>
                </div>
                <div className="p-2 rounded bg-white/[0.02] border border-white/[0.03]">
                  <span className="text-carbon-500 block text-[10px]">GitHub Activity</span>
                  <span className="text-teal-400 font-semibold">{signals.github_activity_score !== -1 ? `${signals.github_activity_score}/100` : "Not Linked"}</span>
                </div>
                <div className="p-2 rounded bg-white/[0.02] border border-white/[0.03]">
                  <span className="text-carbon-500 block text-[10px]">Work Preferences</span>
                  <span className="text-gray-300 capitalize truncate block">
                    {signals.preferred_work_mode || "Hybrid"} {signals.willing_to_relocate ? "(Will Relocate)" : ""}
                  </span>
                </div>
              </div>

              {/* Progress: Profile Completeness */}
              <div className="mt-3 pt-2 border-t border-white/[0.03]">
                <div className="flex justify-between items-center mb-1 text-[11px]">
                  <span className="text-carbon-500">Profile Completeness</span>
                  <span className="font-semibold text-teal-400">{signals.profile_completeness_score || 0}%</span>
                </div>
                <div className="h-1 bg-white/[0.04] rounded-full">
                  <div 
                    className="h-full bg-teal-400 rounded-full" 
                    style={{ width: `${signals.profile_completeness_score || 0}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })()}

        {/* Strengths & Skill Gaps */}
        <div className="grid grid-cols-2 gap-4 mt-5">
          {candidate.strengths?.length > 0 && (
            <div>
              <p className="text-xs text-teal-400 font-semibold mb-2 flex items-center gap-1">
                <ArrowUp size={12} /> Key Strengths
              </p>
              <div className="space-y-1.5">
                {candidate.strengths.map((str, i) => (
                  <div key={i} className="text-xs text-carbon-300 flex items-start gap-1">
                    <span className="text-teal-400">•</span>
                    <span>{str}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {candidate.skillGaps?.length > 0 && (
            <div>
              <p className="text-xs text-amber-500 font-semibold mb-2 flex items-center gap-1">
                <ArrowDown size={12} /> Skill Gaps
              </p>
              <div className="space-y-1.5">
                {candidate.skillGaps.map((gap, i) => (
                  <div key={i} className="text-xs text-carbon-300 flex items-start gap-1">
                    <span className="text-amber-500">•</span>
                    <span>{gap}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Skills */}
        {candidate.skills?.length > 0 && (
          <div className="mt-5">
            <p className="text-xs text-carbon-400 mb-2">Skills</p>
            <div className="flex flex-wrap gap-2">
              {candidate.skills.map((s) => (
                <span key={s} className="chip text-xs px-2 py-0.5">{s}</span>
              ))}
            </div>
          </div>
        )}

        {/* Career History */}
        {candidate.experience_details && candidate.experience_details.length > 0 && (
          <div className="mt-5 pt-4 border-t border-white/[0.05]">
            <p className="text-xs text-carbon-400 mb-3 font-semibold uppercase tracking-wider">Employment History</p>
            <div className="space-y-4">
              {candidate.experience_details.map((exp, idx) => (
                <div key={idx} className="border-l border-white/[0.06] pl-3 ml-1 relative">
                  <div className="absolute -left-1 top-1.5 w-2 h-2 rounded-full bg-violet-400" />
                  <p className="text-sm font-semibold text-white">{exp.title || exp.role}</p>
                  <p className="text-xs text-violet-400 font-medium">
                    {exp.company} {exp.duration_months ? `· ${exp.duration_months} mos` : exp.years ? `· ${exp.years} yrs` : ""} {exp.is_current ? "(Current)" : ""}
                  </p>
                  {exp.description && (
                    <p className="text-xs text-carbon-300 mt-1 leading-relaxed">{exp.description}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Education Details */}
        {candidate.education_details && candidate.education_details.length > 0 && (
          <div className="mt-5 pt-4 border-t border-white/[0.05]">
            <p className="text-xs text-carbon-400 mb-3 font-semibold uppercase tracking-wider">Education</p>
            <div className="space-y-3">
              {candidate.education_details.map((edu, idx) => (
                <div key={idx} className="text-xs">
                  <p className="text-sm font-semibold text-white">
                    {edu.degree}{(edu.field_of_study || edu.major) ? ` in ${edu.field_of_study || edu.major}` : ""}
                  </p>
                  <p className="text-carbon-450 mt-0.5">{edu.institution || edu.school} {edu.end_year ? `(${edu.end_year})` : ""}</p>
                  {edu.grade && <p className="text-teal-400 mt-0.5 font-medium">Grade: {edu.grade}</p>}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Podium Card ──────────────────────────────────────────────────────────────
function PodiumCard({ candidate, position, onClick }) {
  const configs = {
    1: {
      order: "order-2",
      scale: "scale-105",
      gradient: "linear-gradient(135deg, rgba(139,92,246,0.3), rgba(109,40,217,0.15))",
      border: "1px solid rgba(139,92,246,0.55)",
      glow: "0 0 40px rgba(139,92,246,0.35)",
      icon: <Crown size={20} className="text-violet-400" />,
      label: "1st Place",
      labelColor: "text-violet-400",
      bgLabel: "rgba(139,92,246,0.15)",
      height: "h-40",
    },
    2: {
      order: "order-1",
      scale: "",
      gradient: "linear-gradient(135deg, rgba(20,184,166,0.2), rgba(6,182,212,0.08))",
      border: "1px solid rgba(20,184,166,0.45)",
      glow: "0 0 24px rgba(20,184,166,0.2)",
      icon: <Medal size={18} className="text-teal-400" />,
      label: "2nd Place",
      labelColor: "text-teal-400",
      bgLabel: "rgba(20,184,166,0.15)",
      height: "h-32",
    },
    3: {
      order: "order-3",
      scale: "",
      gradient: "linear-gradient(135deg, rgba(251,191,36,0.18), rgba(245,158,11,0.08))",
      border: "1px solid rgba(251,191,36,0.4)",
      glow: "0 0 24px rgba(251,191,36,0.18)",
      icon: <Award size={18} className="text-amber-400" />,
      label: "3rd Place",
      labelColor: "text-amber-400",
      bgLabel: "rgba(251,191,36,0.12)",
      height: "h-24",
    },
  };

  const cfg = configs[position];

  if (!candidate) {
    return (
      <div className={`${cfg.order} flex flex-col items-center gap-3 opacity-30 select-none`}>
        <div className="w-14 h-14 rounded-full bg-white/5 border border-dashed border-white/20 flex items-center justify-center text-xs font-semibold text-carbon-500">
          -
        </div>
        <div
          className="w-full rounded-2xl p-4 flex flex-col items-center justify-center gap-2 bg-white/[0.02] border border-dashed border-white/5"
          style={{ minWidth: 160, minHeight: 120 }}
        >
          <p className="text-xs text-carbon-500 font-medium">Spots Available</p>
        </div>
        <div
          className={`${cfg.height} w-full bg-white/[0.01] border border-dashed border-white/5 rounded-t-lg`}
        />
      </div>
    );
  }

  return (
    <div
      className={`${cfg.order} flex flex-col items-center gap-3 cursor-pointer group`}
      onClick={() => onClick(candidate)}
    >
      {/* Avatar + Score Ring */}
      <div className="relative">
        <div
          className={`w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold text-white ${cfg.scale} transition-transform group-hover:scale-110`}
          style={{
            background: position === 1
              ? "linear-gradient(135deg,#7c3aed,#06b6d4)"
              : position === 2
              ? "linear-gradient(135deg,#14b8a6,#0284c7)"
              : "linear-gradient(135deg,#f59e0b,#ef4444)",
          }}
        >
          {candidate.name.charAt(0)}
        </div>
        <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center"
          style={{ background: cfg.bgLabel }}>
          {cfg.icon}
        </div>
        <div className="absolute -bottom-3 left-1/2 -translate-x-1/2">
          <ScoreRing score={candidate.score} size={32} strokeWidth={3.5} />
        </div>
      </div>

      {/* Card body */}
      <div
        className="w-full rounded-2xl p-4 pt-6 flex flex-col items-center gap-2 transition-all group-hover:scale-[1.02]"
        style={{
          background: cfg.gradient,
          border: cfg.border,
          boxShadow: cfg.glow,
          minWidth: 160,
        }}
      >
        {/* Place label */}
        <span
          className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full ${cfg.labelColor}`}
          style={{ background: cfg.bgLabel }}
        >
          {cfg.label}
        </span>
        <p className="font-bold text-white text-sm text-center leading-tight">
          {candidate.name}
        </p>
        <p className="text-carbon-400 text-xs">{candidate.experience}</p>
        {candidate.skills?.length > 0 && (
          <div className="flex flex-wrap justify-center gap-1 mt-1">
            {candidate.skills.slice(0, 2).map((s) => (
              <span key={s} className="chip text-[10px] px-1.5 py-0.5">{s}</span>
            ))}
          </div>
        )}
      </div>

      {/* Podium stand */}
      <div
        className={`${cfg.height} w-full rounded-t-lg flex items-end justify-center pb-2`}
        style={{
          background: position === 1
            ? "linear-gradient(to top, rgba(139,92,246,0.3), rgba(139,92,246,0.08))"
            : position === 2
            ? "linear-gradient(to top, rgba(20,184,166,0.2), rgba(20,184,166,0.05))"
            : "linear-gradient(to top, rgba(251,191,36,0.2), rgba(251,191,36,0.05))",
          border: cfg.border,
          borderBottom: "none",
        }}
      >
        <span className={`text-2xl font-black ${cfg.labelColor} opacity-30`}>
          {position}
        </span>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function RankingsPage() {
  const [jobs, setJobs] = useState([]);
  const [selectedJobId, setSelectedJobId] = useState("");
  const [selectedJobTitle, setSelectedJobTitle] = useState("");
  const [jobDropdownOpen, setJobDropdownOpen] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [rankings, setRankings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [triggering, setTriggering] = useState(false);

  // Helper mappings
  const mapLeaderboardRow = (r) => {
    const c = r.candidate || {};
    return {
      id: c.id,
      rank: r.rank_position,
      name: c.name || "Unknown Candidate",
      score: Math.round(r.match_score),
      skills: Array.isArray(c.skills) ? c.skills : [],
      experience: `${c.experience_years || 0} yrs`,
      technicalScore: Math.round(r.skill_match_score),
      communicationScore: Math.round(r.experience_score),
      cultureFitScore: Math.round(r.education_score),
      relevanceScore: Math.round(r.project_score),
      trend: r.rank_position % 2 === 0 ? "up" : "down",
      strengths: Array.isArray(r.strengths) ? r.strengths : [],
      skillGaps: Array.isArray(r.skill_gaps) ? r.skill_gaps : [],
      explanation: r.ai_explanation || "",
      interviewRecommendation: r.interview_recommendation,
      raw_parsed_data: c.raw_parsed_data || null,
      experience_details: c.experience_details || [],
      education_details: c.education_details || [],
    };
  };

  const fetchRankings = async (jobId) => {
    if (!jobId) return;
    try {
      setLoading(true);
      const res = await rankingService.getLeaderboard(jobId);
      const mapped = (res.data || []).map(mapLeaderboardRow);
      setRankings(mapped);
    } catch (err) {
      toast.error("Failed to fetch rankings");
    } finally {
      setLoading(false);
    }
  };

  // Load jobs on mount
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const res = await jobService.getJobs();
        const list = res.data?.jobs || res.data || [];
        setJobs(list);
        if (list.length > 0) {
          setSelectedJobId(list[0].id);
          setSelectedJobTitle(list[0].title);
        }
      } catch (err) {
        toast.error("Failed to load jobs");
      }
    };
    fetchJobs();
  }, []);

  // Fetch rankings when job selection changes
  useEffect(() => {
    if (selectedJobId) {
      fetchRankings(selectedJobId);
    } else {
      setRankings([]);
    }
  }, [selectedJobId]);

  const handleTriggerRanking = async () => {
    if (!selectedJobId) return;
    try {
      setTriggering(true);
      const hostPromise = rankingService.triggerRanking(selectedJobId);
      toast.promise(hostPromise, {
        loading: "Running AI Ranking for candidates... This may take up to 20 seconds.",
        success: (res) => res.message || "AI Ranking completed",
        error: (err) => err.response?.data?.message || err.message || "Failed to trigger AI ranking",
      }, { id: "ranking" });

      await hostPromise;
      fetchRankings(selectedJobId);
    } catch (err) {
      console.error(err);
    } finally {
      setTriggering(false);
    }
  };

  const top3 = rankings.slice(0, 3);
  const rest = rankings.slice(3).filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Compute insights dynamically
  const insights = {
    recommendation: rankings[0]?.explanation || "No recommendation available. Run AI ranking to generate advice.",
    recommended: rankings.length > 0 
      ? rankings.slice(0, 2).map((r) => r.name)
      : [],
    skillsGap: [...new Set(rankings.flatMap((r) => r.skillGaps || []))].slice(0, 3),
    poolStrength: rankings.length > 0 
      ? Math.round(rankings.reduce((sum, r) => sum + r.score, 0) / rankings.length) 
      : 0
  };

  const scoreColor = (s) =>
    s >= 90 ? "text-teal-400" : s >= 75 ? "text-violet-400" : s >= 60 ? "text-amber-400" : "text-red-400";

  return (
    <div className="min-h-screen p-6 space-y-6 bg-[#0c0d12]">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Trophy size={22} className="text-violet-400" />
            <h1 className="text-2xl font-black gradient-text">AI-Powered Rankings</h1>
          </div>
          <p className="text-carbon-400 text-sm">
            Candidates ranked by AI across multiple dimensions
          </p>
        </div>

        {/* Job selector and recalculate controls */}
        <div className="flex items-center gap-3">
          {selectedJobId && (
            <button
              onClick={handleTriggerRanking}
              disabled={triggering || loading}
              className="btn-primary flex items-center gap-2"
            >
              <RefreshCw size={15} className={triggering ? "animate-spin" : ""} />
              Force AI Recalclulate
            </button>
          )}

          {/* Dropdown */}
          <div className="relative">
            <button
              onClick={() => setJobDropdownOpen((v) => !v)}
              className="btn-secondary flex items-center gap-2 min-w-[220px] justify-between"
            >
              <span className="font-medium truncate">{selectedJobTitle || "Select Job..."}</span>
              <ChevronDown
                size={15}
                className={`transition-transform ${jobDropdownOpen ? "rotate-180" : ""}`}
              />
            </button>
            {jobDropdownOpen && (
              <div
                className="absolute right-0 top-full mt-2 w-full rounded-xl shadow-2xl z-30 overflow-hidden"
                style={{ background: "#1a1a2e", border: "1px solid rgba(139,92,246,0.25)" }}
              >
                {jobs.map((job) => (
                  <button
                    key={job.id}
                    onClick={() => {
                      setSelectedJobId(job.id);
                      setSelectedJobTitle(job.title);
                      setJobDropdownOpen(false);
                    }}
                    className={`w-full text-left px-4 py-3 text-sm transition-colors hover:bg-violet-500/10 ${
                      job.id === selectedJobId ? "text-violet-400 font-semibold bg-violet-500/10" : "text-carbon-300"
                    }`}
                  >
                    {job.title}
                  </button>
                ))}
                {jobs.length === 0 && (
                  <div className="px-4 py-3 text-xs text-carbon-500 text-center">
                    No jobs found
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {rankings.length === 0 ? (
        <div className="card p-12 text-center flex flex-col items-center justify-center bg-white/[0.02] border border-white/5 rounded-2xl">
          <div className="w-16 h-16 rounded-full bg-violet-500/10 flex items-center justify-center mb-4">
            <Zap size={32} className="text-violet-400 animate-pulse" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">No AI Rankings Available</h2>
          <p className="text-carbon-400 text-sm max-w-md mb-6 leading-relaxed">
            There are no rankings generated for this job yet. Trigger the AI evaluation engine to screen and rank parsed candidates.
          </p>
          {selectedJobId && (
            <button
              onClick={handleTriggerRanking}
              disabled={triggering || loading}
              className="btn-primary flex items-center gap-2 px-6 py-2.5 rounded-xl shadow-lg shadow-violet-500/25"
            >
              <RefreshCw size={16} className={triggering ? "animate-spin" : ""} />
              Generate AI Rankings
            </button>
          )}
        </div>
      ) : (
        <>
          {/* ── Stats Row ── */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: "Total Candidates", value: rankings.length, icon: <Users size={16} />, color: "text-violet-400", bg: "rgba(139,92,246,0.12)" },
              { label: "Avg. AI Score", value: `${insights.poolStrength}%`, icon: <BarChart2 size={16} />, color: "text-teal-400", bg: "rgba(20,184,166,0.12)" },
              { label: "Pool Strength", value: `${insights.poolStrength}%`, icon: <TrendingUp size={16} />, color: "text-amber-400", bg: "rgba(251,191,36,0.12)" },
              { label: "Top Score", value: rankings.length > 0 ? `${rankings[0].score}%` : "-", icon: <Zap size={16} />, color: "text-violet-400", bg: "rgba(139,92,246,0.12)" },
            ].map(({ label, value, icon, color, bg }) => (
              <div key={label} className="stat-card">
                <div className="stat-icon" style={{ background: bg, color }}>
                  {icon}
                </div>
                <p className="text-xs text-carbon-400 mt-3">{label}</p>
                <p className={`text-xl font-black mt-0.5 ${color}`}>{value}</p>
              </div>
            ))}
          </div>

          {/* ── Podium + Insights ── */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Podium */}
            <div className="xl:col-span-2 card">
              <div className="flex items-center gap-2 mb-8">
                <Trophy size={16} className="text-violet-400" />
                <h2 className="font-bold text-white">Top Performers</h2>
                <span className="badge-violet ml-auto">Click to inspect</span>
              </div>

              <div className="flex items-end justify-center gap-4 px-4">
                {/* Render placeholders if there's less than 3 candidates */}
                <PodiumCard candidate={top3[1]} position={2} onClick={setSelectedCandidate} />
                <PodiumCard candidate={top3[0]} position={1} onClick={setSelectedCandidate} />
                <PodiumCard candidate={top3[2]} position={3} onClick={setSelectedCandidate} />
              </div>
            </div>

            {/* AI Insights */}
            <div className="card space-y-5">
              <div className="flex items-center gap-2">
                <Zap size={16} className="text-violet-400" />
                <h2 className="font-bold text-white">AI Insights</h2>
              </div>

              {/* Hiring Recommendation */}
              <div
                className="rounded-xl p-4"
                style={{ background: "rgba(139,92,246,0.08)", border: "1px solid rgba(139,92,246,0.2)" }}
              >
                <p className="text-xs text-violet-400 font-semibold mb-2 flex items-center gap-1">
                  <Star size={11} /> Hiring Recommendation
                </p>
                <p className="text-sm text-carbon-300 leading-relaxed">
                  {insights.recommendation}
                </p>
              </div>

              {/* Recommended candidates */}
              {insights.recommended.length > 0 && (
                <div>
                  <p className="text-xs text-carbon-400 font-semibold mb-3 flex items-center gap-1">
                    <Target size={11} /> Recommended to Advance
                  </p>
                  <div className="space-y-2">
                    {insights.recommended.map((name, i) => {
                      const c = rankings.find((x) => x.name === name);
                      return (
                        <div
                          key={name}
                          className="flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors hover:bg-violet-500/10"
                          onClick={() => c && setSelectedCandidate(c)}
                        >
                          <div
                            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                            style={{ background: i === 0 ? "linear-gradient(135deg,#7c3aed,#06b6d4)" : "linear-gradient(135deg,#14b8a6,#0284c7)" }}
                          >
                            {name.charAt(0)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-white truncate">{name}</p>
                            <p className="text-xs text-carbon-400">Score: {c?.score}%</p>
                          </div>
                          <ArrowUp size={13} className="text-teal-400" />
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="divider" />

              {/* Skills Gap */}
              <div>
                <p className="text-xs text-carbon-400 font-semibold mb-3 flex items-center gap-1">
                  <BarChart2 size={11} /> Skills Gap Detected
                </p>
                {insights.skillsGap.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {insights.skillsGap.map((skill) => (
                      <span
                        key={skill}
                        className="chip text-xs px-2 py-1"
                        style={{ borderColor: "rgba(251,191,36,0.4)", color: "#fbbf24" }}
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-carbon-500">No major skills gaps detected.</p>
                )}
                {insights.skillsGap.length > 0 && (
                  <p className="text-xs text-carbon-500 mt-2">
                    These skills are rare in the current pool — consider training or broadening the search.
                  </p>
                )}
              </div>

              {/* Pool Strength Bar */}
              <div>
                <div className="flex justify-between mb-1.5">
                  <p className="text-xs text-carbon-400 font-semibold">Pool Strength</p>
                  <p className="text-xs font-bold text-violet-400">{insights.poolStrength}%</p>
                </div>
                <div className="h-2 rounded-full" style={{ background: "rgba(255,255,255,0.06)" }}>
                  <div
                    className="h-2 rounded-full"
                    style={{
                      width: `${insights.poolStrength}%`,
                      background: "linear-gradient(90deg,#7c3aed,#06b6d4)",
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* ── Rankings Table (4+) ── */}
          <div className="card">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
              <div className="flex items-center gap-2">
                <Medal size={16} className="text-teal-400" />
                <h2 className="font-bold text-white">Full Rankings</h2>
                <span className="badge-teal">Positions 4+</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-carbon-500" />
                  <input
                    className="input pl-8 py-1.5 text-sm w-48"
                    placeholder="Search candidates..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="table-wrapper">
              <table className="table">
                <thead>
                  <tr>
                    <th>Rank</th>
                    <th>Candidate</th>
                    <th>Overall Score</th>
                    <th className="hidden md:table-cell">Technical</th>
                    <th className="hidden md:table-cell">Experience Fit</th>
                    <th className="hidden lg:table-cell">Education Fit</th>
                    <th className="hidden lg:table-cell">Project Relevance</th>
                    <th>Trend</th>
                  </tr>
                </thead>
                <tbody>
                  {rest.map((c) => (
                    <tr
                      key={c.id}
                      className="cursor-pointer"
                      onClick={() => setSelectedCandidate(c)}
                    >
                      <td>
                        <div className="flex items-center gap-1.5">
                          <RankBadge rank={c.rank} />
                        </div>
                      </td>
                      <td>
                        <div className="flex items-center gap-3">
                          <div
                            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                            style={{ background: "linear-gradient(135deg,#4c1d95,#1e3a5f)" }}
                          >
                            {c.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-semibold text-white text-sm">{c.name}</p>
                            <p className="text-carbon-500 text-xs">{c.experience}</p>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="flex items-center gap-2">
                          <ScoreRing score={c.score} size={32} strokeWidth={3.5} />
                        </div>
                      </td>
                      <td className="hidden md:table-cell">
                        <span className={`text-sm font-bold ${scoreColor(c.technicalScore)}`}>
                          {c.technicalScore}
                        </span>
                      </td>
                      <td className="hidden md:table-cell">
                        <span className={`text-sm font-bold ${scoreColor(c.communicationScore)}`}>
                          {c.communicationScore}
                        </span>
                      </td>
                      <td className="hidden lg:table-cell">
                        <span className={`text-sm font-bold ${scoreColor(c.cultureFitScore)}`}>
                          {c.cultureFitScore}
                        </span>
                      </td>
                      <td className="hidden lg:table-cell">
                        <span className={`text-sm font-bold ${scoreColor(c.relevanceScore)}`}>
                          {c.relevanceScore}
                        </span>
                      </td>
                      <td>
                        {c.trend === "up" ? (
                          <div className="flex items-center gap-1 text-teal-400">
                            <ArrowUp size={14} />
                            <span className="text-xs font-semibold">Up</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 text-red-400">
                            <ArrowDown size={14} />
                            <span className="text-xs font-semibold">Down</span>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                  {rest.length === 0 && (
                    <tr>
                      <td colSpan={8}>
                        <div className="empty-state py-8">
                          <Search size={28} className="text-carbon-600 mx-auto mb-2" />
                          <p className="text-carbon-400 text-sm">No candidates match your search</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* ── Score Breakdown Modal ── */}
      {selectedCandidate && (
        <ScoreModal
          candidate={selectedCandidate}
          onClose={() => setSelectedCandidate(null)}
        />
      )}
    </div>
  );
}
