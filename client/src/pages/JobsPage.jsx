import { useState, useEffect } from "react";
import { jobService } from "../lib/jobService";
import {
  Plus,
  Search,
  Filter,
  Briefcase,
  MapPin,
  Clock,
  Users,
  ChevronRight,
  Edit2,
  Trash2,
  MoreHorizontal,
  Building2,
  Star,
  CheckCircle2,
} from "lucide-react";
import toast from "react-hot-toast";

// ─── API Data Management ────────────────────────────────────────────────────────

const DEPARTMENTS = ["Engineering", "AI & Data", "Design", "Infrastructure", "Quality", "Marketing"];
const JOB_TYPES = ["Remote", "Hybrid", "On-site"];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function typeBadge(type) {
  if (type === "Remote") return "badge-teal";
  if (type === "Hybrid") return "badge-amber";
  return "badge-gray";
}

function statusDot(status) {
  if (status === "Published" || status === "Active") return "dot dot-green";
  if (status === "Draft") return "dot dot-amber";
  return "dot dot-red";
}

function statusLabel(status) {
  if (status === "Published" || status === "Active") return "text-emerald-400";
  if (status === "Draft") return "text-amber-400";
  return "text-rose-400";
}

function formatJob(backendJob) {
  return {
    ...backendJob,
    type: backendJob.employment_type || "Remote",
    status: backendJob.status === "Published" ? "Active" : backendJob.status,
    skills: Array.isArray(backendJob.skills) 
      ? backendJob.skills.map((s) => (typeof s === "string" ? s : s.skill)) 
      : [],
    applicants: 0,
    daysLeft: backendJob.application_deadline 
      ? Math.max(0, Math.ceil((new Date(backendJob.application_deadline) - new Date()) / (1000 * 60 * 60 * 24)))
      : 30,
    postedDate: new Date(backendJob.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
    salaryRange: `$${backendJob.salary_min || 0} – $${backendJob.salary_max || 0}`,
  };
}

// ─── Post New Job Modal ───────────────────────────────────────────────────────
function PostJobModal({ onClose, onJobCreated }) {
  const [form, setForm] = useState({
    title: "",
    department: "",
    location: "",
    employment_type: "Remote",
    experience: "1-3 years",
    description: "",
    salary_min: "",
    salary_max: "",
  });

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.department || !form.location || !form.description) {
      toast.error("Please fill in all required fields.");
      return;
    }
    
    try {
      const newJob = await jobService.createJob({
        ...form,
        salary_min: parseInt(form.salary_min) || 0,
        salary_max: parseInt(form.salary_max) || 0,
        status: "Published",
      });
      toast.success(`Job "${form.title}" posted successfully!`);
      if (onJobCreated) onJobCreated(newJob.data);
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create job.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-lg mx-4 card p-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-white">Post New Job</h2>
            <p className="text-sm text-slate-400 mt-0.5">
              Fill in the details to publish a new opening.
            </p>
          </div>
          <button
            onClick={onClose}
            className="btn-ghost btn-sm rounded-full w-8 h-8 flex items-center justify-center text-slate-400 hover:text-white"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Job Title */}
          <div className="form-group">
            <label className="label" htmlFor="title">
              Job Title <span className="text-rose-400">*</span>
            </label>
            <input
              id="title"
              name="title"
              className="input"
              placeholder="e.g. Senior React Developer"
              value={form.title}
              onChange={handleChange}
            />
          </div>

          {/* Department */}
          <div className="form-group">
            <label className="label" htmlFor="department">
              Department <span className="text-rose-400">*</span>
            </label>
            <select
              id="department"
              name="department"
              className="input"
              value={form.department}
              onChange={handleChange}
            >
              <option value="">Select department</option>
              {DEPARTMENTS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          {/* Location + Type */}
          <div className="grid grid-cols-2 gap-3">
            <div className="form-group">
              <label className="label" htmlFor="location">
                Location <span className="text-rose-400">*</span>
              </label>
              <input
                id="location"
                name="location"
                className="input"
                placeholder="City, State or Remote"
                value={form.location}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label className="label" htmlFor="type">
                Job Type
              </label>
              <select
                id="type"
                name="employment_type"
                className="input"
                value={form.employment_type}
                onChange={handleChange}
              >
                {JOB_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Salary Range */}
          <div className="grid grid-cols-2 gap-3">
            <div className="form-group">
              <label className="label" htmlFor="salary_min">
                Min Salary (USD)
              </label>
              <input
                id="salary_min"
                name="salary_min"
                className="input"
                placeholder="e.g. 120000"
                type="number"
                value={form.salary_min}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label className="label" htmlFor="salary_max">
                Max Salary (USD)
              </label>
              <input
                id="salary_max"
                name="salary_max"
                className="input"
                placeholder="e.g. 160000"
                type="number"
                value={form.salary_max}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Description */}
          <div className="form-group">
            <label className="label" htmlFor="description">
              Job Description
            </label>
            <textarea
              id="description"
              name="description"
              className="input min-h-[100px] resize-none"
              placeholder="Describe responsibilities, requirements, and perks…"
              value={form.description}
              onChange={handleChange}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button type="button" className="btn-secondary flex-1" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary flex-1 flex items-center justify-center gap-2">
              <CheckCircle2 size={16} />
              Post Job
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Job Detail Panel ─────────────────────────────────────────────────────────
function JobDetailPanel({ job, onClose }) {
  if (!job) return null;

  return (
    <div className="fixed inset-0 z-40 flex justify-end">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="relative z-10 w-full max-w-md h-full card rounded-none rounded-l-2xl p-6 overflow-y-auto shadow-2xl flex flex-col gap-5">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="stat-icon">
              <Briefcase size={20} className="text-violet-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white leading-tight">{job.title}</h2>
              <p className="text-sm text-slate-400">{job.department}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="btn-ghost btn-sm text-slate-400 hover:text-white rounded-full w-8 h-8 flex items-center justify-center"
          >
            ✕
          </button>
        </div>

        <div className="divider" />

        {/* Status + Type */}
        <div className="flex items-center gap-3 flex-wrap">
          <span className={`chip flex items-center gap-1.5 ${statusLabel(job.status)}`}>
            <span className={statusDot(job.status)} />
            {job.status}
          </span>
          <span className={`chip ${typeBadge(job.type)}`}>{job.type}</span>
          <span className="chip badge-gray flex items-center gap-1">
            <MapPin size={11} />
            {job.location}
          </span>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { icon: Users, label: "Applicants", value: job.applicants },
            { icon: Clock, label: "Days Left", value: job.daysLeft > 0 ? job.daysLeft : "Closed" },
            { icon: Star, label: "Posted", value: job.postedDate },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="card p-3 text-center">
              <Icon size={16} className="text-violet-400 mx-auto mb-1" />
              <p className="text-white font-bold text-sm">{value}</p>
              <p className="text-slate-500 text-xs">{label}</p>
            </div>
          ))}
        </div>

        {/* Salary */}
        <div>
          <p className="label mb-1">Salary Range</p>
          <p className="gradient-text text-xl font-bold">{job.salaryRange}</p>
        </div>

        {/* Skills */}
        <div>
          <p className="label mb-2">Required Skills</p>
          <div className="flex flex-wrap gap-2">
            {job.skills.map((s) => (
              <span key={s} className="chip badge-gray text-xs">
                {s}
              </span>
            ))}
          </div>
        </div>

        <div className="divider" />

        {/* Actions */}
        <div className="flex gap-3">
          <button
            className="btn-secondary flex-1 flex items-center justify-center gap-2"
            onClick={() => toast("Edit coming soon!", { icon: "✏️" })}
          >
            <Edit2 size={14} />
            Edit Job
          </button>
          <button
            className="btn-primary flex-1 flex items-center justify-center gap-2"
            onClick={() => toast(`Viewing applicants for ${job.title}`, { icon: "👥" })}
          >
            <Users size={14} />
            View Applicants
          </button>
        </div>

        <button
          className="btn-ghost btn-sm text-rose-400 hover:text-rose-300 flex items-center gap-2 justify-center"
          onClick={async () => {
            try {
              await jobService.deleteJob(job.id);
              toast.error(`Job "${job.title}" deleted.`);
              onClose(true); // pass true to indicate deletion
            } catch (err) {
              toast.error("Failed to delete job.");
            }
          }}
        >
          <Trash2 size={14} />
          Delete Job
        </button>
      </div>
    </div>
  );
}

// ─── Job Card ─────────────────────────────────────────────────────────────────
function JobCard({ job, onClick, isSelected }) {
  return (
    <div
      className={`card-interactive p-5 flex flex-col gap-4 cursor-pointer transition-all duration-200 ${
        isSelected
          ? "ring-2 ring-violet-500/60 border-violet-500/40"
          : ""
      }`}
      onClick={onClick}
    >
      {/* Top row */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="stat-icon flex-shrink-0">
            <Briefcase size={18} className="text-violet-400" />
          </div>
          <div className="min-w-0">
            <h3 className="text-white font-semibold text-sm leading-tight truncate">
              {job.title}
            </h3>
            <p className="text-slate-500 text-xs mt-0.5 flex items-center gap-1">
              <Building2 size={10} />
              {job.department}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 flex-shrink-0">
          <span className={`flex items-center gap-1 text-xs font-medium ${statusLabel(job.status)}`}>
            <span className={statusDot(job.status)} />
            {job.status}
          </span>
        </div>
      </div>

      {/* Chips row */}
      <div className="flex flex-wrap gap-1.5">
        <span className={`chip text-xs ${typeBadge(job.type)}`}>{job.type}</span>
        <span className="chip badge-gray text-xs flex items-center gap-1">
          <MapPin size={10} />
          {job.location}
        </span>
      </div>

      {/* Skills */}
      <div className="flex flex-wrap gap-1.5">
        {job.skills.slice(0, 3).map((skill) => (
          <span
            key={skill}
            className="chip badge-gray text-xs"
          >
            {skill}
          </span>
        ))}
        {job.skills.length > 3 && (
          <span className="chip badge-gray text-xs text-slate-400">
            +{job.skills.length - 3}
          </span>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-1 border-t border-white/5">
        <div className="flex items-center gap-3 text-xs text-slate-400">
          <span className="flex items-center gap-1">
            <Users size={12} className="text-violet-400" />
            <span className="text-white font-medium">{job.applicants}</span> applicants
          </span>
          <span className="flex items-center gap-1">
            <Clock size={12} className="text-amber-400" />
            {job.daysLeft > 0 ? (
              <span>
                <span className="text-white font-medium">{job.daysLeft}</span>d left
              </span>
            ) : (
              <span className="text-rose-400 font-medium">Closed</span>
            )}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
          <button
            className="btn-ghost btn-sm flex items-center gap-1 text-xs text-slate-400 hover:text-violet-300"
            onClick={() => toast("Edit mode coming soon!", { icon: "✏️" })}
          >
            <Edit2 size={12} />
          </button>
          <button
            className="btn-ghost btn-sm text-xs text-violet-400 hover:text-violet-200 flex items-center gap-1"
            onClick={() => {}}
          >
            View
            <ChevronRight size={12} />
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function JobsPage() {
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("All");
  const [selectedJob, setSelectedJob] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const res = await jobService.getJobs();
      const jobList = res.data?.jobs || res.data || [];
      setJobs(jobList.map(formatJob));
    } catch (err) {
      toast.error("Failed to fetch jobs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const tabs = ["All", "Active", "Draft", "Closed"];

  // Filtering
  const filtered = jobs.filter((job) => {
    const matchSearch =
      job.title.toLowerCase().includes(search.toLowerCase()) ||
      job.department.toLowerCase().includes(search.toLowerCase()) ||
      (job.skills || []).some((s) => s.toLowerCase().includes(search.toLowerCase()));
    const matchTab = activeTab === "All" || job.status === activeTab;
    return matchSearch && matchTab;
  });

  // Stats
  const totalApplicants = jobs.reduce((s, j) => s + (j.applicants || 0), 0);
  const activeJobs = jobs.filter((j) => j.status === "Active");
  const avgApplicants = jobs.length > 0 ? Math.round(totalApplicants / jobs.length) : 0;

  if (loading) {
    return <div className="p-6 text-white">Loading jobs...</div>;
  }

  return (
    <div className="min-h-screen p-6 space-y-6">
      {/* ── Page Header ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold gradient-text">Jobs</h1>
          <p className="text-slate-400 text-sm mt-1">
            Manage your open positions and track applicant pipelines.
          </p>
        </div>
        <button
          className="btn-primary flex items-center gap-2 self-start sm:self-auto"
          onClick={() => setShowModal(true)}
        >
          <Plus size={16} />
          Post New Job
        </button>
      </div>

      {/* ── Stats Bar ────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            icon: Briefcase,
            label: "Total Jobs",
            value: jobs.length,
            color: "text-violet-400",
            bg: "bg-violet-500/10",
          },
          {
            icon: CheckCircle2,
            label: "Active Jobs",
            value: activeJobs.length,
            color: "text-emerald-400",
            bg: "bg-emerald-500/10",
          },
          {
            icon: Users,
            label: "Total Applicants",
            value: totalApplicants.toLocaleString(),
            color: "text-sky-400",
            bg: "bg-sky-500/10",
          },
          {
            icon: Star,
            label: "Avg. Applicants/Job",
            value: avgApplicants,
            color: "text-amber-400",
            bg: "bg-amber-500/10",
          },
        ].map(({ icon: Icon, label, value, color, bg }) => (
          <div key={label} className="stat-card flex items-center gap-4">
            <div className={`stat-icon ${bg}`}>
              <Icon size={20} className={color} />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{value}</p>
              <p className="text-slate-400 text-xs">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Search + Filter ───────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        {/* Search */}
        <div className="relative w-full sm:max-w-xs">
          <Search
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
          />
          <input
            className="input pl-9 w-full"
            placeholder="Search jobs, skills, dept…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Status Tabs */}
        <div className="flex items-center gap-1 bg-white/5 rounded-lg p-1 border border-white/10">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-150 ${
                activeTab === tab
                  ? "bg-violet-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              {tab}
              {tab !== "All" && (
                <span className="ml-1.5 opacity-60">
                  ({jobs.filter((j) => j.status === tab).length})
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ── Jobs Grid ─────────────────────────────────────────────────────────── */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filtered.map((job) => (
            <JobCard
              key={job.id}
              job={job}
              isSelected={selectedJob?.id === job.id}
              onClick={() =>
                setSelectedJob((prev) => (prev?.id === job.id ? null : job))
              }
            />
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <Briefcase size={40} className="text-slate-600 mb-3" />
          <p className="text-slate-400 font-medium">No jobs found</p>
          <p className="text-slate-600 text-sm mt-1">
            Try a different search or filter.
          </p>
          <button
            className="btn-primary mt-4 flex items-center gap-2"
            onClick={() => {
              setSearch("");
              setActiveTab("All");
            }}
          >
            <Filter size={14} />
            Clear Filters
          </button>
        </div>
      )}

      {/* ── Detail Panel ──────────────────────────────────────────────────────── */}
      {selectedJob && (
        <JobDetailPanel
          job={selectedJob}
          onClose={(deleted) => {
            setSelectedJob(null);
            if (deleted) fetchJobs();
          }}
        />
      )}

      {/* ── Post Job Modal ────────────────────────────────────────────────────── */}
      {showModal && <PostJobModal onClose={() => setShowModal(false)} onJobCreated={fetchJobs} />}
    </div>
  );
}
