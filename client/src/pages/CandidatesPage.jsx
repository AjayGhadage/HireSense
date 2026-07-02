import { useState, useEffect } from "react";
import { candidateService } from "../lib/candidateService";
import toast from "react-hot-toast";
import {
  Users,
  Search,
  Filter,
  ChevronDown,
  Star,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Eye,
  MessageSquare,
  CheckCircle,
  XCircle,
  Clock,
  Briefcase,
  Award,
  TrendingUp,
} from "lucide-react";
import ScoreRing from "../components/ui/ScoreRing";

// ─── API Data Management ────────────────────────────────────────────────────────

/* ─── Status Config ─────────────────────────────────────────────────────────── */

const STATUS_CONFIG = {
  new:        { label: "New",        color: "badge-gray",   dot: "dot-amber",  icon: Clock,         hex: "#9CA3AF" },
  screening:  { label: "Screening",  color: "badge-violet", dot: "dot-amber",  icon: Eye,           hex: "#8B5CF6" },
  interview:  { label: "Interview",  color: "badge-amber",  dot: "dot-amber",  icon: MessageSquare, hex: "#FBBF24" },
  offer:      { label: "Offer",      color: "badge-teal",   dot: "dot-green",  icon: Award,         hex: "#2DD4BF" },
  hired:      { label: "Hired",      color: "badge-teal",   dot: "dot-green",  icon: CheckCircle,   hex: "#14B8A6" },
  rejected:   { label: "Rejected",   color: "badge-coral",  dot: "dot-red",    icon: XCircle,       hex: "#EF4444" },
};

const PIPELINE_STAGES = ["new", "screening", "interview", "offer", "hired"];

/* ─── Avatar Gradient Map ──────────────────────────────────────────────────── */

const AVATAR_GRADIENTS = [
  "from-violet-500 to-purple-700",
  "from-teal-400 to-cyan-600",
  "from-rose-500 to-pink-700",
  "from-amber-400 to-orange-600",
  "from-blue-500 to-indigo-700",
  "from-emerald-400 to-green-600",
  "from-fuchsia-500 to-violet-700",
  "from-sky-400 to-blue-600",
  "from-orange-400 to-red-600",
  "from-lime-400 to-emerald-600",
  "from-rose-400 to-orange-600",
  "from-purple-400 to-pink-600",
];

/* ─── Helper: score bar color ──────────────────────────────────────────────── */

function barColor(val) {
  if (val >= 85) return "bg-teal-400";
  if (val >= 70) return "bg-violet-400";
  if (val >= 55) return "bg-amber-400";
  return "bg-red-400";
}

const DB_TO_FE_STATUS = {
  new: "new",
  shortlisted: "screening",
  interviewed: "interview",
  rejected: "rejected",
};

const FE_TO_DB_STATUS = {
  new: "new",
  screening: "shortlisted",
  interview: "interviewed",
  offer: "interviewed",
  hired: "interviewed",
  rejected: "rejected",
};

function formatCandidate(c) {
  const dbStatus = c.status || "new";
  const feStatus = DB_TO_FE_STATUS[dbStatus] || "new";
  return {
    id: c.id,
    name: c.name || "Unknown Candidate",
    email: c.email || "No email",
    phone: c.phone || "No phone",
    location: c.job?.location || "Remote",
    appliedJob: c.job?.title || "Unknown Job",
    score: Math.round(c.ranking?.match_score || 0),
    status: feStatus,
    experience: c.experience_years ? `${c.experience_years} years` : "0 years",
    skills: Array.isArray(c.skills) ? c.skills : [],
    avatar: c.name ? c.name.split(" ").map(n => n[0]).join("").substring(0,2).toUpperCase() : "??",
    appliedAt: new Date(c.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    notes: c.notes || "No notes.",
    scoreBreakdown: {
      skills: Math.round(c.ranking?.skill_match_score || 0),
      experience: Math.round(c.ranking?.experience_score || 0),
      communication: Math.round(c.ranking?.education_score || 0),
      culture: Math.round(c.ranking?.project_score || 0)
    },
    raw_parsed_data: c.raw_parsed_data || null,
    experience_details: c.experience_details || [],
    education_details: c.education_details || [],
  };
}

/* ─── Detail Panel ─────────────────────────────────────────────────────────── */

function DetailPanel({ candidate, onClose, onUpdateStatus }) {
  const cfg = STATUS_CONFIG[candidate.status];
  const gradClass = AVATAR_GRADIENTS[(candidate.id - 1) % AVATAR_GRADIENTS.length];
  const StatusIcon = cfg.icon;

  const timeline = [
    { date: candidate.appliedAt, event: "Application Submitted", color: "bg-violet-500" },
    { date: "2026-06-17", event: "Resume Parsed by AI", color: "bg-teal-500" },
    { date: "2026-06-19", event: "Shortlisted for Screening", color: "bg-amber-500" },
    ...(["interview","offer","hired"].includes(candidate.status)
      ? [{ date: "2026-06-24", event: "Moved to Interview Round", color: "bg-blue-500" }]
      : []),
    ...(["offer","hired"].includes(candidate.status)
      ? [{ date: "2026-06-29", event: "Offer Extended", color: "bg-teal-400" }]
      : []),
    ...(candidate.status === "hired"
      ? [{ date: "2026-07-01", event: "Hired — Onboarding Scheduled", color: "bg-emerald-400" }]
      : []),
    ...(candidate.status === "rejected"
      ? [{ date: "2026-06-21", event: "Application Rejected", color: "bg-red-500" }]
      : []),
  ];

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className="fixed right-0 top-0 h-full w-full max-w-[480px] z-50 overflow-y-auto"
        style={{
          background: "#13141b",
          borderLeft: "1px solid rgba(255,255,255,0.07)",
          animation: "slideInRight 0.28s cubic-bezier(0.16,1,0.3,1)",
        }}
      >
        {/* Panel header */}
        <div
          className="sticky top-0 z-10 px-6 py-4 flex items-center justify-between"
          style={{ background: "rgba(19,20,27,0.95)", backdropFilter: "blur(12px)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}
        >
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-widest">Candidate Profile</span>
          <button
            onClick={onClose}
            className="btn-ghost btn-sm w-8 h-8 p-0 flex items-center justify-center rounded-lg"
          >
            <XCircle className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Identity block */}
          <div className="flex items-start gap-4">
            <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${gradClass} flex items-center justify-center text-white font-bold text-xl flex-shrink-0 shadow-lg`}>
              {candidate.avatar}
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-display font-bold text-white truncate">{candidate.name}</h2>
              <p className="text-sm text-violet-400 font-medium mt-0.5 truncate">{candidate.appliedJob}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className={cfg.color}>
                  <StatusIcon className="w-3 h-3" />
                  {cfg.label}
                </span>
                <span className="text-gray-600 text-xs">•</span>
                <span className="text-gray-500 text-xs flex items-center gap-1">
                  <Briefcase className="w-3 h-3" /> {candidate.experience}
                </span>
              </div>
            </div>
            <ScoreRing score={candidate.score} size={60} strokeWidth={5} />
          </div>

          {/* Contact info */}
          <div className="card space-y-2.5">
            <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-widest mb-3">Contact</p>
            <div className="flex items-center gap-3 text-sm text-gray-300">
              <Mail className="w-4 h-4 text-gray-500 flex-shrink-0" />
              <span className="truncate">{candidate.email}</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-300">
              <Phone className="w-4 h-4 text-gray-500 flex-shrink-0" />
              <span>{candidate.phone}</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-300">
              <MapPin className="w-4 h-4 text-gray-500 flex-shrink-0" />
              <span>{candidate.location}</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-300">
              <Calendar className="w-4 h-4 text-gray-500 flex-shrink-0" />
              <span>Applied {candidate.appliedAt}</span>
            </div>
          </div>

          {/* AI Score breakdown */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-widest">AI Score Breakdown</p>
              <span className="text-xs font-bold text-violet-400">{candidate.score} / 100</span>
            </div>
            <div className="space-y-3">
              {Object.entries(candidate.scoreBreakdown).map(([key, val]) => (
                <div key={key}>
                  <div className="flex justify-between mb-1">
                    <span className="text-xs text-gray-400 capitalize">{key}</span>
                    <span className="text-xs font-semibold text-gray-300">{val}%</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-white/[0.06]">
                    <div
                      className={`h-full rounded-full ${barColor(val)} transition-all duration-700`}
                      style={{ width: `${val}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Skills */}
          <div className="card">
            <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-widest mb-3">Skills</p>
            <div className="flex flex-wrap gap-2">
              {candidate.skills.map((sk) => (
                <span key={sk} className="chip">{sk}</span>
              ))}
            </div>
          </div>

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
              respTimeColor = "text-rose-455 animate-pulse font-bold";
              respTimeText = `${respHours} hrs (Slow)`;
            }

            // Check if honeypot flag has been triggered
            const rawSkills = candidate.raw_parsed_data.skills || [];
            const isHoneypot = rawSkills.some(s => 
              s.proficiency?.toLowerCase() === "expert" && (s.duration_months === 0 || s.duration_months < 6)
            ) || (rawSkills.filter(s => s.proficiency?.toLowerCase() === "expert").length > 6 && (signals.years_of_experience || 0) < 3);

            return (
              <div className="card border border-white/[0.05] bg-white/[0.02]">
                <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-widest mb-3 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <TrendingUp className="w-3.5 h-3.5 text-teal-400" /> HireSense Behavioral Signals
                  </span>
                  {isHoneypot && (
                    <span className="px-2 py-0.5 text-[9px] bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded font-bold uppercase tracking-wider animate-pulse">
                      Honeypot Warning
                    </span>
                  )}
                </p>

                {/* Profile Completeness */}
                <div className="mb-4">
                  <div className="flex justify-between mb-1 text-xs">
                    <span className="text-gray-400">Profile Completeness</span>
                    <span className="font-semibold text-teal-400">{signals.profile_completeness_score || 0}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-white/[0.04]">
                    <div
                      className="h-full rounded-full bg-teal-400 transition-all duration-700"
                      style={{ width: `${signals.profile_completeness_score || 0}%` }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-2 rounded bg-white/[0.03] border border-white/[0.04]">
                    <span className="text-gray-500 block mb-1">Notice Period</span>
                    <span className={noticeColor}>{noticeText}</span>
                  </div>
                  <div className="p-2 rounded bg-white/[0.03] border border-white/[0.04]">
                    <span className="text-gray-500 block mb-1">Response Rate</span>
                    <span className={responseColor}>{resRatePercent}%</span>
                  </div>
                  <div className="p-2 rounded bg-white/[0.03] border border-white/[0.04]">
                    <span className="text-gray-500 block mb-1">Avg Response Speed</span>
                    <span className={respTimeColor}>{respTimeText}</span>
                  </div>
                  <div className="p-2 rounded bg-white/[0.03] border border-white/[0.04]">
                    <span className="text-gray-500 block mb-1">Last Active</span>
                    <span className="text-gray-300 font-medium">{signals.last_active_date || "N/A"}</span>
                  </div>
                  <div className="p-2 rounded bg-white/[0.03] border border-white/[0.04]">
                    <span className="text-gray-500 block mb-1">GitHub Commits</span>
                    <span className="text-teal-400 font-bold">{signals.github_activity_score !== -1 ? signals.github_activity_score : "Not Linked"}</span>
                  </div>
                  <div className="p-2 rounded bg-white/[0.03] border border-white/[0.04]">
                    <span className="text-gray-500 block mb-1">Preferences</span>
                    <span className="text-gray-300 block capitalize whitespace-nowrap overflow-hidden text-ellipsis">
                      {signals.preferred_work_mode || "Hybrid"} {signals.willing_to_relocate ? "• Relocates" : ""}
                    </span>
                  </div>
                </div>

                {/* Additional Platform stats */}
                <div className="mt-3 pt-3 border-t border-white/[0.05] flex justify-between text-[11px] text-gray-500">
                  <span>Open to work: <strong className={signals.open_to_work_flag ? "text-teal-400" : "text-gray-400"}>{signals.open_to_work_flag ? "Yes" : "No"}</strong></span>
                  <span>Connections: <strong className="text-gray-300">{signals.connection_count || 0}</strong></span>
                  <span>Verified: <strong className="text-gray-300">{(signals.verified_email && signals.verified_phone) ? "Email & Phone" : signals.verified_email ? "Email" : "None"}</strong></span>
                </div>
              </div>
            );
          })()}

          {/* Career History */}
          {candidate.experience_details && candidate.experience_details.length > 0 && (
            <div className="card">
              <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-widest mb-3">Employment History</p>
              <div className="space-y-4">
                {candidate.experience_details.map((exp, idx) => (
                  <div key={idx} className="border-l border-white/[0.06] pl-3 ml-1 relative">
                    <div className="absolute -left-1 top-1.5 w-2 h-2 rounded-full bg-violet-400" />
                    <p className="text-sm font-semibold text-white">{exp.title || exp.role}</p>
                    <p className="text-xs text-violet-400 font-medium">
                      {exp.company} {exp.duration_months ? `· ${exp.duration_months} mos` : exp.years ? `· ${exp.years} yrs` : ""} {exp.is_current ? "(Current)" : ""}
                    </p>
                    {exp.description && (
                      <p className="text-xs text-gray-400 mt-1 leading-relaxed">{exp.description}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Education Details */}
          {candidate.education_details && candidate.education_details.length > 0 && (
            <div className="card">
              <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-widest mb-3">Education</p>
              <div className="space-y-3">
                {candidate.education_details.map((edu, idx) => (
                  <div key={idx} className="text-xs">
                    <p className="text-sm font-semibold text-white">
                      {edu.degree}{(edu.field_of_study || edu.major) ? ` in ${edu.field_of_study || edu.major}` : ""}
                    </p>
                    <p className="text-gray-450 mt-0.5">{edu.institution || edu.school} {edu.end_year ? `(${edu.end_year})` : ""}</p>
                    {edu.grade && <p className="text-teal-400 mt-0.5 font-medium">Grade: {edu.grade}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          <div className="card">
            <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-widest mb-3">Recruiter Notes</p>
            <p className="text-sm text-gray-300 leading-relaxed">{candidate.notes}</p>
          </div>

          {/* Timeline */}
          <div className="card">
            <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-widest mb-4">Activity Timeline</p>
            <div className="space-y-0">
              {timeline.map((item, i) => (
                <div key={i} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className={`w-2.5 h-2.5 rounded-full ${item.color} flex-shrink-0 mt-0.5`} />
                    {i < timeline.length - 1 && (
                      <div className="w-px flex-1 bg-white/[0.06] my-1" style={{ minHeight: 24 }} />
                    )}
                  </div>
                  <div className="pb-4">
                    <p className="text-sm text-gray-200 font-medium">{item.event}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{item.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action buttons */}
          <div className="space-y-2 pb-4">
            {candidate.status === "new" && (
              <button 
                className="btn-primary w-full"
                onClick={() => onUpdateStatus(candidate.id, "screening")}
              >
                <Eye className="w-4 h-4" /> Move to Screening
              </button>
            )}
            {candidate.status === "screening" && (
              <button 
                className="btn-primary w-full"
                onClick={() => onUpdateStatus(candidate.id, "interview")}
              >
                <MessageSquare className="w-4 h-4" /> Schedule Interview
              </button>
            )}
            {candidate.status === "interview" && (
              <button 
                className="btn-primary w-full"
                onClick={() => onUpdateStatus(candidate.id, "offer")}
              >
                <Award className="w-4 h-4" /> Extend Offer
              </button>
            )}
            {candidate.status === "offer" && (
              <button 
                className="btn-teal w-full"
                onClick={() => onUpdateStatus(candidate.id, "hired")}
              >
                <CheckCircle className="w-4 h-4" /> Mark as Hired
              </button>
            )}
            {candidate.status === "hired" && (
              <button className="btn-secondary w-full" disabled>
                <CheckCircle className="w-4 h-4 text-teal-400" /> Hired — Onboarding Pending
              </button>
            )}
            {candidate.status !== "rejected" && candidate.status !== "hired" && (
              <button 
                className="btn-ghost w-full text-red-400 hover:bg-red-500/10"
                onClick={() => onUpdateStatus(candidate.id, "rejected")}
              >
                <XCircle className="w-4 h-4" /> Reject Candidate
              </button>
            )}
            <button className="btn-secondary w-full">
              <Mail className="w-4 h-4" /> Send Email
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0.5; }
          to   { transform: translateX(0);    opacity: 1; }
        }
      `}</style>
    </>
  );
}

/* ─── Candidate Card ─────────────────────────────────────────────────────────── */

function CandidateCard({ candidate, onClick }) {
  const cfg = STATUS_CONFIG[candidate.status];
  const gradClass = AVATAR_GRADIENTS[(candidate.id - 1) % AVATAR_GRADIENTS.length];
  const StatusIcon = cfg.icon;

  return (
    <div className="card-interactive group" onClick={() => onClick(candidate)}>
      {/* Top row */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-center gap-3 min-w-0">
          <div
            className={`w-11 h-11 rounded-xl bg-gradient-to-br ${gradClass} flex items-center justify-center text-white font-bold text-sm flex-shrink-0 shadow-lg`}
          >
            {candidate.avatar}
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-gray-100 text-sm truncate">{candidate.name}</p>
            <p className="text-xs text-gray-500 truncate mt-0.5">{candidate.appliedJob}</p>
          </div>
        </div>
        <ScoreRing score={candidate.score} size={44} strokeWidth={4} />
      </div>

      {/* Status + location */}
      <div className="flex items-center justify-between mb-3">
        <span className={cfg.color}>
          <StatusIcon className="w-3 h-3" />
          {cfg.label}
        </span>
        <span className="text-xs text-gray-500 flex items-center gap-1">
          <MapPin className="w-3 h-3" /> {candidate.location}
        </span>
      </div>

      {/* Skills */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        {candidate.skills.slice(0, 3).map((sk) => (
          <span key={sk} className="chip text-[10px] py-0.5 px-2">{sk}</span>
        ))}
        {candidate.skills.length > 3 && (
          <span className="chip text-[10px] py-0.5 px-2 bg-white/[0.04] text-gray-500 border-white/[0.08]">
            +{candidate.skills.length - 3}
          </span>
        )}
      </div>

      <div className="divider my-3" />

      {/* Footer */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <Briefcase className="w-3 h-3" /> {candidate.experience}
          </span>
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3" /> {candidate.appliedAt}
          </span>
        </div>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            className="btn-ghost btn-sm p-1.5"
            onClick={(e) => { e.stopPropagation(); }}
          >
            <Mail className="w-3.5 h-3.5" />
          </button>
          <button
            className="btn-ghost btn-sm p-1.5"
            onClick={(e) => { e.stopPropagation(); onClick(candidate); }}
          >
            <Eye className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Main Page ────────────────────────────────────────────────────────────── */

export default function CandidatesPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [viewMode, setViewMode] = useState("card"); // "card" | "list"
  const [selected, setSelected] = useState(null);
  const [sortBy, setSortBy] = useState("score"); // "score" | "date" | "name"
  
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchCandidates = async () => {
    try {
      setLoading(true);
      const res = await candidateService.getAllCandidates();
      setCandidates((res.data?.candidates || []).map(formatCandidate));
    } catch (err) {
      toast.error("Failed to fetch candidates");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCandidates();
  }, []);

  const handleUpdateStatus = async (id, status) => {
    try {
      const dbStatus = FE_TO_DB_STATUS[status] || "new";
      await candidateService.updateStatus(id, dbStatus);
      toast.success("Status updated");
      fetchCandidates();
      setSelected(prev => prev && prev.id === id ? { ...prev, status } : prev);
    } catch (err) {
      console.error("Failed to update status details:", err);
      toast.error(`Failed to update status: ${err.response?.data?.message || err.message}`);
    }
  };

  /* Derived counts */
  const counts = Object.keys(STATUS_CONFIG).reduce((acc, s) => {
    acc[s] = candidates.filter((c) => c.status === s).length;
    return acc;
  }, {});

  /* Filtered + sorted candidates */
  const filtered = candidates
    .filter((c) => {
      const matchesStatus = statusFilter === "all" || c.status === statusFilter;
      const q = search.toLowerCase();
      const matchesSearch =
        !q ||
        c.name.toLowerCase().includes(q) ||
        c.appliedJob.toLowerCase().includes(q) ||
        c.location.toLowerCase().includes(q) ||
        (c.skills || []).some((s) => s.toLowerCase().includes(q));
      return matchesStatus && matchesSearch;
    })
    .sort((a, b) => {
      if (sortBy === "score") return b.score - a.score;
      if (sortBy === "name") return a.name.localeCompare(b.name);
      if (sortBy === "date") return new Date(b.appliedAt) - new Date(a.appliedAt);
      return 0;
    });

  if (loading) {
    return <div className="p-6 text-white">Loading candidates...</div>;
  }

  return (
    <div className="min-h-screen p-6 space-y-6">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-white">
            Candidates
            <span className="ml-2 text-base font-normal text-gray-500">
              ({candidates.length})
            </span>
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage and evaluate your applicant pipeline
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button className="btn-secondary btn-sm">
            <Filter className="w-3.5 h-3.5" /> Advanced Filter
          </button>
          <button className="btn-primary btn-sm">
            <Users className="w-3.5 h-3.5" /> Import Candidates
          </button>
        </div>
      </div>

      {/* ── Pipeline Visualization ── */}
      <div className="card">
        <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-widest mb-4">
          Hiring Pipeline
        </p>
        <div className="flex items-stretch gap-0 overflow-x-auto pb-1">
          {PIPELINE_STAGES.map((stage, i) => {
            const cfg = STATUS_CONFIG[stage];
            const count = counts[stage] || 0;
            const total = candidates.length || 1;
            const pct = Math.round((count / total) * 100);
            const Icon = cfg.icon;

            return (
              <div key={stage} className="flex items-center flex-1 min-w-[100px]">
                <div
                  className={`flex-1 rounded-xl p-3 cursor-pointer transition-all duration-200 ${
                    statusFilter === stage
                      ? "ring-1 ring-violet-500/40 bg-violet-500/10"
                      : "hover:bg-white/[0.03]"
                  }`}
                  onClick={() => setStatusFilter(statusFilter === stage ? "all" : stage)}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Icon className="w-4 h-4" style={{ color: cfg.hex }} />
                    <span className="text-xs font-medium text-gray-400">{cfg.label}</span>
                  </div>
                  <p className="text-2xl font-display font-bold text-white mb-1">{count}</p>
                  <div className="h-1 rounded-full bg-white/[0.06]">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${pct}%`, background: cfg.hex }}
                    />
                  </div>
                  <p className="text-[10px] text-gray-600 mt-1">{pct}% of pool</p>
                </div>
                {i < PIPELINE_STAGES.length - 1 && (
                  <ChevronDown className="w-4 h-4 text-gray-700 rotate-[-90deg] mx-1 flex-shrink-0" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Search + Filter bar ── */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        {/* Status filter pills */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setStatusFilter("all")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 ${
              statusFilter === "all"
                ? "bg-violet-500/20 text-violet-300 border border-violet-500/30"
                : "bg-white/[0.04] text-gray-500 border border-white/[0.06] hover:text-gray-300"
            }`}
          >
            All <span className="ml-1 opacity-60">{candidates.length}</span>
          </button>
          {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
            <button
              key={key}
              onClick={() => setStatusFilter(key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 ${
                statusFilter === key
                  ? "bg-violet-500/20 text-violet-300 border border-violet-500/30"
                  : "bg-white/[0.04] text-gray-500 border border-white/[0.06] hover:text-gray-300"
              }`}
            >
              {cfg.label} <span className="ml-1 opacity-60">{counts[key] || 0}</span>
            </button>
          ))}
        </div>

        {/* Right controls */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              className="input pl-8 py-2 text-xs w-52"
              placeholder="Search candidates…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Sort */}
          <div className="relative">
            <select
              className="input py-2 text-xs pr-7 appearance-none cursor-pointer"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="score">Sort: Score</option>
              <option value="date">Sort: Date</option>
              <option value="name">Sort: Name</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
          </div>

          {/* View toggle */}
          <div className="flex items-center bg-carbon-800 border border-white/[0.06] rounded-xl p-0.5 gap-0.5">
            <button
              onClick={() => setViewMode("card")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 ${
                viewMode === "card"
                  ? "bg-violet-500/20 text-violet-300"
                  : "text-gray-500 hover:text-gray-300"
              }`}
            >
              Cards
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 ${
                viewMode === "list"
                  ? "bg-violet-500/20 text-violet-300"
                  : "text-gray-500 hover:text-gray-300"
              }`}
            >
              List
            </button>
          </div>
        </div>
      </div>

      {/* ── Candidate Grid / List ── */}
      {filtered.length === 0 ? (
        <div className="empty-state">
          <Users className="w-12 h-12 text-gray-700 mb-4" />
          <p className="text-gray-400 font-medium">No candidates found</p>
          <p className="text-gray-600 text-sm mt-1">Try adjusting your search or filters</p>
        </div>
      ) : viewMode === "card" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 stagger">
          {filtered.map((c) => (
            <CandidateCard key={c.id} candidate={c} onClick={setSelected} />
          ))}
        </div>
      ) : (
        /* ── List View ── */
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Candidate</th>
                <th>Role</th>
                <th>Status</th>
                <th>Score</th>
                <th>Experience</th>
                <th>Location</th>
                <th>Applied</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => {
                const cfg = STATUS_CONFIG[c.status];
                const StatusIcon = cfg.icon;
                const gradClass = AVATAR_GRADIENTS[(c.id - 1) % AVATAR_GRADIENTS.length];
                return (
                  <tr
                    key={c.id}
                    className="cursor-pointer"
                    onClick={() => setSelected(c)}
                  >
                    <td>
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-8 h-8 rounded-lg bg-gradient-to-br ${gradClass} flex items-center justify-center text-white font-bold text-[11px] flex-shrink-0`}
                        >
                          {c.avatar}
                        </div>
                        <div>
                          <p className="font-medium text-gray-100 text-sm">{c.name}</p>
                          <p className="text-[11px] text-gray-500">{c.email}</p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="text-sm text-gray-300">{c.appliedJob}</span>
                    </td>
                    <td>
                      <span className={cfg.color}>
                        <StatusIcon className="w-3 h-3" />
                        {cfg.label}
                      </span>
                    </td>
                    <td>
                      <ScoreRing score={c.score} size={38} strokeWidth={3.5} />
                    </td>
                    <td>
                      <span className="text-sm text-gray-400">{c.experience}</span>
                    </td>
                    <td>
                      <span className="text-sm text-gray-400 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-gray-600" /> {c.location}
                      </span>
                    </td>
                    <td>
                      <span className="text-xs text-gray-500">{c.appliedAt}</span>
                    </td>
                    <td>
                      <div className="flex items-center gap-1">
                        <button
                          className="btn-ghost btn-sm p-1.5"
                          onClick={(e) => { e.stopPropagation(); setSelected(c); }}
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          className="btn-ghost btn-sm p-1.5"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Mail className="w-3.5 h-3.5" />
                        </button>
                        <button
                          className="btn-ghost btn-sm p-1.5"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Star className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {selected && <DetailPanel candidate={selected} onClose={() => setSelected(null)} onUpdateStatus={handleUpdateStatus} />}
    </div>
  );
}
