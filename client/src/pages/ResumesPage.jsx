import { useState, useCallback, useRef, useEffect } from 'react';
import {
  Upload, FileText, Search, Filter, CheckCircle2, AlertCircle,
  Clock, Eye, Download, Trash2, Zap, Star, ChevronDown, X, User,
} from 'lucide-react';
import toast from 'react-hot-toast';
import ScoreRing from '../components/ui/ScoreRing';
import { resumeService } from '../lib/resumeService';
import { jobService } from '../lib/jobService';

/* ─── API Data Management ──────────────────────────────────────────────────────────── */

/* ─── Helpers ────────────────────────────────────────────────────────────── */
function formatDate(iso) {
  if (!iso) return "Unknown";
  return new Date(iso).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
}

function formatResume(r) {
  return {
    id: r.id,
    candidateName: r.candidate?.name || 'Parsing...',
    email: r.candidate?.email || '...',
    position: r.candidate?.job?.title || 'Unknown',
    uploadedAt: r.created_at,
    status: r.status,
    score: r.candidate?.ranking?.match_score || 0,
    skills: r.candidate?.skills || [],
    experience: r.candidate?.experience_years ? `${r.candidate.experience_years} years` : 'N/A',
    education: r.candidate?.education_level || 'N/A',
    fileName: r.original_filename,
    candidate: r.candidate
  };
}

function StatusBadge({ status }) {
  if (status === 'parsed') {
    return (
      <span className="badge-teal">
        <CheckCircle2 size={11} />
        Parsed
      </span>
    );
  }
  if (status === 'parsing') {
    return (
      <span className="badge-amber flex items-center gap-1">
        <svg className="animate-spin" width={11} height={11} viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="60" strokeDashoffset="20" strokeLinecap="round" />
        </svg>
        Parsing…
      </span>
    );
  }
  return (
    <span className="badge-coral">
      <AlertCircle size={11} />
      Failed
    </span>
  );
}

/* ─── Upload Zone ────────────────────────────────────────────────────────── */
function UploadZone({ onUpload }) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef(null);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files).filter(
      (f) => f.type === 'application/pdf' || f.name.endsWith('.pdf')
    );
    if (files.length === 0) {
      toast.error('Please drop PDF files only.');
      return;
    }
    onUpload(files);
  }, [onUpload]);

  const handleFileInput = useCallback((e) => {
    const files = Array.from(e.target.files);
    if (files.length) onUpload(files);
    e.target.value = '';
  }, [onUpload]);

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      className={`
        relative flex flex-col items-center justify-center gap-4
        rounded-2xl border-2 border-dashed px-8 py-12 cursor-pointer
        transition-all duration-300 select-none overflow-hidden
        ${isDragging
          ? 'border-violet-500 bg-violet-500/[0.07] shadow-[0_0_40px_rgba(139,92,246,0.18)]'
          : 'border-white/[0.1] bg-carbon-800 hover:border-violet-500/40 hover:bg-violet-500/[0.03]'
        }
      `}
    >
      {/* Radial glow when dragging */}
      {isDragging && (
        <div className="pointer-events-none absolute inset-0 rounded-2xl"
          style={{
            background: 'radial-gradient(ellipse at center, rgba(139,92,246,0.13) 0%, transparent 70%)',
          }}
        />
      )}

      {/* Icon */}
      <div className={`
        w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-300
        ${isDragging ? 'bg-violet-500/20 scale-110' : 'bg-carbon-750'}
      `}>
        <Upload
          size={28}
          className={`transition-colors duration-300 ${isDragging ? 'text-violet-400' : 'text-gray-500'}`}
        />
      </div>

      {/* Text */}
      <div className="text-center">
        <p className={`text-base font-semibold transition-colors duration-200 ${isDragging ? 'text-violet-300' : 'text-gray-300'}`}>
          {isDragging ? 'Release to upload resumes' : '+ Drop PDF resumes here or click to browse'}
        </p>
        <p className="mt-1 text-xs text-gray-500">
          Supports multiple files · PDF format · AI parsing powered by HireSense
        </p>
      </div>

      {/* Tags */}
      <div className="flex items-center gap-2">
        <span className="chip"><Zap size={10} />AI Parsing</span>
        <span className="chip"><Star size={10} />Auto Scoring</span>
        <span className="chip"><FileText size={10} />PDF Only</span>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept=".pdf,application/pdf"
        multiple
        className="hidden"
        onChange={handleFileInput}
      />
    </div>
  );
}

/* ─── Parsing Progress Toast / Animation ────────────────────────────────── */
function UploadProgressBar({ fileName, progress }) {
  return (
    <div className="flex flex-col gap-1 min-w-[220px]">
      <div className="flex items-center justify-between text-xs text-gray-300 mb-0.5">
        <span className="truncate max-w-[160px] font-medium">{fileName}</span>
        <span className="text-violet-400 font-semibold">{progress}%</span>
      </div>
      <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-violet-500 to-teal-400 transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}

/* ─── Main Component ─────────────────────────────────────────────────────── */
export default function ResumesPage() {
  const [resumes, setResumes] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [selectedJobId, setSelectedJobId] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [filterOpen, setFilterOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [resumesData, jobsData] = await Promise.all([
        resumeService.getAllResumes(),
        jobService.getJobs()
      ]);
      setResumes((resumesData.data || []).map(formatResume));
      const jData = jobsData.data?.jobs || [];
      setJobs(jData);
      if (jData.length > 0 && !selectedJobId) {
        setSelectedJobId(jData[0].id);
      }
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  /* ── Stats ── */
  const stats = {
    total: resumes.length,
    parsed: resumes.filter((r) => r.status === 'parsed').length,
    parsing: resumes.filter((r) => r.status === 'parsing').length,
    failed: resumes.filter((r) => r.status === 'failed').length,
  };

  /* ── Filtered list ── */
  const filtered = resumes.filter((r) => {
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      r.candidateName.toLowerCase().includes(q) ||
      r.email.toLowerCase().includes(q) ||
      r.position.toLowerCase().includes(q) ||
      r.skills.some((s) => s.toLowerCase().includes(q));
    const matchStatus = statusFilter === 'all' || r.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const handleUpload = useCallback(async (files) => {
    if (!selectedJobId) {
      toast.error("Please select a job to upload resumes to");
      return;
    }

    const toastId = toast.loading(`Uploading ${files.length} resume(s)...`);
    
    try {
      await resumeService.uploadResumes(selectedJobId, files);
      toast.success(`${files.length} resume(s) uploaded successfully! AI parsing started.`, { id: toastId });
      fetchData(); // Refresh list to show 'parsing' status
    } catch (err) {
      toast.error("Upload failed", { id: toastId });
    }
  }, [selectedJobId]);

  /* ── Actions ── */
  const handleView = (resume) => {
    toast(`Viewing ${resume.candidateName}'s resume`, {
      icon: '👁️',
      style: { background: '#1a1c24', color: '#e2e0dc', border: '1px solid rgba(139,92,246,0.2)' },
    });
  };

  const handleDownload = (resume) => {
    toast.success(`Downloading ${resume.fileName}…`);
  };

  const handleDelete = async (id) => {
    try {
      await resumeService.deleteResume(id);
      setResumes((prev) => prev.filter((r) => r.id !== id));
      toast.success('Resume removed');
    } catch (err) {
      toast.error('Failed to remove resume');
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-[#0c0d12] px-6 py-8 text-white">Loading...</div>;
  }

  /* ── Render ── */
  return (
    <div className="min-h-screen bg-[#0c0d12] px-6 py-8 space-y-7">

      {/* ── Page Header ── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-display text-gray-100 tracking-tight">
            Resume <span className="gradient-text-v">Management</span>
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Upload, parse and score candidate resumes with HireSense AI
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select
            className="input py-1.5 px-3 text-xs appearance-none cursor-pointer border-white/[0.1] bg-carbon-800"
            value={selectedJobId}
            onChange={(e) => setSelectedJobId(e.target.value)}
          >
            <option value="" disabled>Select Job</option>
            {jobs.map(j => (
              <option key={j.id} value={j.id}>{j.title}</option>
            ))}
          </select>
          <button 
            className="btn-primary btn-sm flex items-center gap-1.5"
            onClick={fetchData}
          >
            <Zap size={13} />
            Refresh
          </button>
        </div>
      </div>

      {/* ── Upload Zone ── */}
      <UploadZone onUpload={handleUpload} />



      {/* ── Stats Row ── */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {/* Total */}
        <div className="stat-card">
          <div className="stat-icon bg-violet-500/15">
            <FileText size={18} className="text-violet-400" />
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-wider text-gray-500 font-semibold">Total</p>
            <p className="text-2xl font-bold font-display text-gray-100">{stats.total}</p>
          </div>
        </div>
        {/* Parsed */}
        <div className="stat-card">
          <div className="stat-icon bg-teal-500/15">
            <CheckCircle2 size={18} className="text-teal-400" />
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-wider text-gray-500 font-semibold">Parsed</p>
            <p className="text-2xl font-bold font-display text-teal-400">{stats.parsed}</p>
          </div>
        </div>
        {/* Parsing */}
        <div className="stat-card">
          <div className="stat-icon bg-amber-500/15">
            <Clock size={18} className="text-amber-400" />
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-wider text-gray-500 font-semibold">Parsing</p>
            <p className="text-2xl font-bold font-display text-amber-400">{stats.parsing}</p>
          </div>
        </div>
        {/* Failed */}
        <div className="stat-card">
          <div className="stat-icon bg-red-500/15">
            <AlertCircle size={18} className="text-red-400" />
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-wider text-gray-500 font-semibold">Failed</p>
            <p className="text-2xl font-bold font-display text-red-400">{stats.failed}</p>
          </div>
        </div>
      </div>

      {/* ── Search & Filter ── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
          <input
            type="text"
            placeholder="Search candidates, roles, skills…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input pl-9 pr-9"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
            >
              <X size={13} />
            </button>
          )}
        </div>

        {/* Filter dropdown */}
        <div className="relative">
          <button
            onClick={() => setFilterOpen((p) => !p)}
            className="btn-secondary btn-sm flex items-center gap-1.5"
          >
            <Filter size={13} />
            {statusFilter === 'all' ? 'All Statuses' : statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)}
            <ChevronDown size={13} className={`transition-transform duration-200 ${filterOpen ? 'rotate-180' : ''}`} />
          </button>

          {filterOpen && (
            <div className="absolute right-0 mt-2 w-44 card z-20 p-1.5 shadow-xl border border-white/[0.08]">
              {['all', 'parsed', 'parsing', 'failed'].map((opt) => (
                <button
                  key={opt}
                  onClick={() => { setStatusFilter(opt); setFilterOpen(false); }}
                  className={`
                    w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors
                    ${statusFilter === opt
                      ? 'bg-violet-500/15 text-violet-300'
                      : 'text-gray-400 hover:bg-white/[0.04] hover:text-gray-200'
                    }
                  `}
                >
                  {opt === 'all' ? 'All Statuses' : opt.charAt(0).toUpperCase() + opt.slice(1)}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Table ── */}
      {filtered.length === 0 ? (
        <div className="empty-state">
          <div className="w-16 h-16 rounded-2xl bg-carbon-800 flex items-center justify-center mb-5">
            <FileText size={28} className="text-gray-600" />
          </div>
          <p className="text-lg font-semibold text-gray-400">No resumes found</p>
          <p className="mt-1 text-sm text-gray-600">
            {search || statusFilter !== 'all'
              ? 'Try adjusting your search or filters'
              : 'Upload your first resume to get started'}
          </p>
          {(search || statusFilter !== 'all') && (
            <button
              onClick={() => { setSearch(''); setStatusFilter('all'); }}
              className="btn-secondary btn-sm mt-4"
            >
              Clear filters
            </button>
          )}
        </div>
      ) : (
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Candidate</th>
                <th>Position Applied</th>
                <th>Skills</th>
                <th>Score</th>
                <th>Status</th>
                <th>Uploaded</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((resume) => (
                <tr key={resume.id} className="group">

                  {/* Candidate */}
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500/30 to-indigo-500/20 flex items-center justify-center flex-shrink-0">
                        <User size={14} className="text-violet-300" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-200 text-[13px] leading-tight">
                          {resume.candidateName}
                        </p>
                        <p className="text-[11px] text-gray-500 mt-0.5">{resume.email}</p>
                      </div>
                    </div>
                  </td>

                  {/* Position */}
                  <td>
                    <span className="text-gray-300 text-[13px] font-medium">{resume.position}</span>
                    <p className="text-[11px] text-gray-500 mt-0.5">{resume.experience} · {resume.education}</p>
                  </td>

                  {/* Skills */}
                  <td>
                    <div className="flex flex-wrap gap-1 max-w-[200px]">
                      {resume.skills.slice(0, 3).map((skill) => (
                        <span
                          key={skill}
                          className="inline-block px-2 py-0.5 text-[10px] font-medium rounded-md
                            bg-white/[0.05] text-gray-400 border border-white/[0.07]"
                        >
                          {skill}
                        </span>
                      ))}
                      {resume.skills.length > 3 && (
                        <span className="inline-block px-2 py-0.5 text-[10px] font-medium rounded-md
                          bg-violet-500/10 text-violet-400 border border-violet-500/20">
                          +{resume.skills.length - 3}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Score */}
                  <td>
                    {resume.status === 'parsed' ? (
                      <ScoreRing score={resume.score} size={46} strokeWidth={4} />
                    ) : resume.status === 'parsing' ? (
                      <span className="text-[11px] text-amber-400 font-medium">Pending…</span>
                    ) : (
                      <span className="text-[11px] text-red-400 font-medium">N/A</span>
                    )}
                  </td>

                  {/* Status */}
                  <td>
                    <StatusBadge status={resume.status} />
                    {resume.status === 'failed' && (
                      <p className="text-[10px] text-gray-600 mt-1">Parse error</p>
                    )}
                  </td>

                  {/* Uploaded */}
                  <td>
                    <span className="text-[12px] text-gray-500">{formatDate(resume.uploadedAt)}</span>
                  </td>

                  {/* Actions */}
                  <td>
                    <div className="flex items-center gap-1 opacity-60 group-hover:opacity-100 transition-opacity duration-150">
                      <button
                        onClick={() => handleView(resume)}
                        title="View"
                        className="btn-icon hover:bg-violet-500/15 hover:text-violet-300 text-gray-500"
                      >
                        <Eye size={14} />
                      </button>
                      <button
                        onClick={() => handleDownload(resume)}
                        title="Download"
                        className="btn-icon hover:bg-teal-500/15 hover:text-teal-300 text-gray-500"
                      >
                        <Download size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(resume.id)}
                        title="Delete"
                        className="btn-icon hover:bg-red-500/15 hover:text-red-400 text-gray-500"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>

                </tr>
              ))}
            </tbody>
          </table>

          {/* Table footer */}
          <div className="px-4 py-3 border-t border-white/[0.04] flex items-center justify-between">
            <p className="text-[11px] text-gray-600">
              Showing <span className="text-gray-400 font-semibold">{filtered.length}</span> of{' '}
              <span className="text-gray-400 font-semibold">{resumes.length}</span> resumes
            </p>
            <div className="flex items-center gap-1.5">
              <span className="dot dot-green" />
              <span className="text-[11px] text-gray-500">Live — auto-updates on parse</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
