import { useState } from 'react';
import {
  BarChart3, TrendingUp, Users, Clock, Download, Calendar,
  Filter, ArrowUp, ArrowDown, FileText, Briefcase, Target, Zap
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  PieChart, Pie, Cell, XAxis, YAxis, Tooltip, Legend,
  ResponsiveContainer, CartesianGrid
} from 'recharts';

/* ─────────────────────────────────────────────────────────────────
   Mock Data
───────────────────────────────────────────────────────────────── */

const PERIODS = [
  { key: '7d',  label: '7 Days' },
  { key: '30d', label: '30 Days' },
  { key: '90d', label: '90 Days' },
  { key: '1y',  label: '1 Year' },
];

const KPI_CARDS = [
  {
    label: 'Offer Acceptance Rate',
    value: '87%',
    trend: +4.2,
    icon: Target,
    iconBg: 'bg-violet-500/15',
    iconColor: 'text-violet-400',
    suffix: 'vs last period',
  },
  {
    label: 'Time to Hire',
    value: '18 days',
    trend: -2.1,
    icon: Clock,
    iconBg: 'bg-teal-500/15',
    iconColor: 'text-teal-400',
    suffix: 'vs last period',
  },
  {
    label: 'Cost per Hire',
    value: '$2,400',
    trend: -5.8,
    icon: Briefcase,
    iconBg: 'bg-amber-500/15',
    iconColor: 'text-amber-400',
    suffix: 'vs last period',
  },
  {
    label: 'Quality of Hire',
    value: '4.2 / 5',
    trend: +0.3,
    icon: Zap,
    iconBg: 'bg-coral-500/15',
    iconColor: 'text-coral-400',
    suffix: 'vs last period',
  },
];

const FUNNEL = [
  { stage: 'Applied',     count: 1847, color: '#8B5CF6' },
  { stage: 'Screened',    count: 623,  color: '#7C3AED' },
  { stage: 'Interviewed', count: 124,  color: '#6D28D9' },
  { stage: 'Offered',     count: 31,   color: '#5B21B6' },
  { stage: 'Hired',       count: 18,   color: '#4C1D95' },
];

const MONTHLY_HIRES = [
  { month: 'Aug',  hires: 8,  applications: 142 },
  { month: 'Sep',  hires: 12, applications: 178 },
  { month: 'Oct',  hires: 10, applications: 163 },
  { month: 'Nov',  hires: 15, applications: 201 },
  { month: 'Dec',  hires: 7,  applications: 119 },
  { month: 'Jan',  hires: 18, applications: 224 },
  { month: 'Feb',  hires: 14, applications: 198 },
  { month: 'Mar',  hires: 22, applications: 267 },
  { month: 'Apr',  hires: 19, applications: 241 },
  { month: 'May',  hires: 25, applications: 312 },
  { month: 'Jun',  hires: 21, applications: 289 },
  { month: 'Jul',  hires: 18, applications: 258 },
];

const SOURCE_DATA = [
  { name: 'LinkedIn',   value: 42, color: '#8B5CF6' },
  { name: 'Job Boards', value: 28, color: '#14B8A6' },
  { name: 'Referral',   value: 18, color: '#F59E0B' },
  { name: 'Direct',     value: 12, color: '#EF4444' },
];

const TIME_TO_HIRE = [
  { dept: 'Engineering', days: 24 },
  { dept: 'Design',      days: 16 },
  { dept: 'Product',     days: 20 },
  { dept: 'Marketing',   days: 14 },
  { dept: 'Sales',       days: 11 },
];

const DEPT_PERF = [
  { dept: 'Engineering', hired: 8,  interviews: 42, offers: 10 },
  { dept: 'Design',      hired: 4,  interviews: 18, offers: 5  },
  { dept: 'Product',     hired: 3,  interviews: 14, offers: 4  },
  { dept: 'Marketing',   hired: 2,  interviews: 9,  offers: 3  },
  { dept: 'Sales',       hired: 1,  interviews: 6,  offers: 2  },
];

const REPORT_CARDS = [
  {
    icon: FileText,
    title: 'Hiring Summary Report',
    desc: 'Full overview of all hiring activity, pipeline stages, and conversion metrics.',
    badge: 'badge-violet',
    badgeText: 'PDF',
    updated: 'Updated today',
    color: 'text-violet-400',
  },
  {
    icon: TrendingUp,
    title: 'Pipeline Analytics',
    desc: 'Stage-by-stage funnel analysis with drop-off rates and time-in-stage breakdowns.',
    badge: 'badge-teal',
    badgeText: 'XLSX',
    updated: 'Updated 2d ago',
    color: 'text-teal-400',
  },
  {
    icon: Users,
    title: 'Diversity & Inclusion',
    desc: 'Candidate demographics report across all open and closed roles by department.',
    badge: 'badge-amber',
    badgeText: 'PDF',
    updated: 'Updated 5d ago',
    color: 'text-amber-400',
  },
  {
    icon: BarChart3,
    title: 'Sourcing Effectiveness',
    desc: 'Channel performance data — cost, volume, and quality-of-hire by source.',
    badge: 'badge-coral',
    badgeText: 'CSV',
    updated: 'Updated 1w ago',
    color: 'text-coral-400',
  },
];

/* ─────────────────────────────────────────────────────────────────
   Custom Tooltip Components
───────────────────────────────────────────────────────────────── */

const DarkTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#1a1c24] border border-violet-500/20 rounded-xl px-4 py-3 shadow-2xl text-xs">
      {label && <p className="text-gray-400 mb-2 font-medium">{label}</p>}
      {payload.map((p, i) => (
        <div key={i} className="flex items-center gap-2 mb-1 last:mb-0">
          <span className="w-2 h-2 rounded-full" style={{ background: p.color || p.fill }} />
          <span className="text-gray-300">{p.name}:</span>
          <span className="text-white font-semibold">{p.value}</span>
        </div>
      ))}
    </div>
  );
};

const PieTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0];
  return (
    <div className="bg-[#1a1c24] border border-violet-500/20 rounded-xl px-4 py-3 shadow-2xl text-xs">
      <div className="flex items-center gap-2">
        <span className="w-2 h-2 rounded-full" style={{ background: d.payload.color }} />
        <span className="text-gray-300">{d.name}:</span>
        <span className="text-white font-semibold">{d.value}%</span>
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────────
   Hiring Funnel Component
───────────────────────────────────────────────────────────────── */

const HiringFunnel = ({ data }) => {
  const max = data[0].count;
  return (
    <div className="flex flex-col gap-3 w-full">
      {data.map((item, i) => {
        const widthPct = Math.round((item.count / max) * 100);
        const convRate = i > 0
          ? Math.round((item.count / data[i - 1].count) * 100)
          : 100;
        return (
          <div key={item.stage} className="flex flex-col gap-1">
            {i > 0 && (
              <div className="flex items-center gap-2 pl-1 -mt-1 mb-0.5">
                <ArrowDown size={12} className="text-gray-600" />
                <span className="text-[11px] text-gray-500 font-medium">
                  {convRate}% conversion
                </span>
              </div>
            )}
            <div className="flex items-center gap-4">
              {/* Stage label */}
              <div className="w-24 flex-shrink-0">
                <span className="text-xs font-medium text-gray-300">{item.stage}</span>
              </div>
              {/* Bar */}
              <div className="flex-1 relative h-9 bg-white/[0.04] rounded-lg overflow-hidden">
                <div
                  className="absolute inset-y-0 left-0 rounded-lg flex items-center justify-end pr-3 transition-all duration-700"
                  style={{
                    width: `${widthPct}%`,
                    background: `linear-gradient(90deg, ${item.color}55, ${item.color})`,
                  }}
                />
                <span
                  className="absolute inset-y-0 left-0 flex items-center pl-3 text-xs font-semibold text-white z-10"
                  style={{ width: `${widthPct}%` }}
                >
                  {widthPct < 25 ? '' : item.count.toLocaleString()}
                </span>
              </div>
              {/* Count */}
              <div className="w-16 text-right">
                <span className="text-sm font-semibold text-white">{item.count.toLocaleString()}</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────────
   Custom Donut Center Label
───────────────────────────────────────────────────────────────── */

const DonutLabel = ({ cx, cy, total }) => (
  <text x={cx} y={cy} textAnchor="middle" dominantBaseline="central">
    <tspan x={cx} dy="-0.4em" className="fill-white text-xl font-bold" fontSize={22} fontWeight={700} fill="#ffffff">
      {total}
    </tspan>
    <tspan x={cx} dy="1.6em" fontSize={11} fill="#6b7280">
      candidates
    </tspan>
  </text>
);

/* ─────────────────────────────────────────────────────────────────
   Main Page
───────────────────────────────────────────────────────────────── */

export default function ReportsPage() {
  const [activePeriod, setActivePeriod] = useState('30d');

  const totalCandidates = SOURCE_DATA.reduce((s, d) => s + d.value, 0);

  return (
    <div className="min-h-screen bg-[#0c0d12] text-[#e2e0dc] p-6 lg:p-8 space-y-8">

      {/* ── PAGE HEADER ─────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2.5">
            <BarChart3 className="text-violet-400" size={26} />
            Reports &amp; Analytics
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Hiring performance, pipeline health, and sourcing intelligence
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Period tabs */}
          <div className="flex items-center gap-1 bg-white/[0.04] border border-white/[0.07] rounded-xl p-1">
            {PERIODS.map(p => (
              <button
                key={p.key}
                onClick={() => setActivePeriod(p.key)}
                className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
                  activePeriod === p.key
                    ? 'bg-violet-500 text-white shadow-lg shadow-violet-500/30'
                    : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Export button */}
          <button className="btn-primary btn-sm flex items-center gap-1.5">
            <Download size={14} />
            Export PDF
          </button>
        </div>
      </div>

      {/* ── KPI CARDS ───────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {KPI_CARDS.map(({ label, value, trend, icon: Icon, iconBg, iconColor, suffix }) => {
          const isUp = trend >= 0;
          /* For cost-per-hire, down is good; for others, up is good */
          const isPositive = label === 'Cost per Hire' || label === 'Time to Hire' ? !isUp : isUp;
          return (
            <div key={label} className="stat-card">
              <div className={`stat-icon ${iconBg}`}>
                <Icon size={20} className={iconColor} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-gray-500 text-xs font-medium uppercase tracking-wider truncate">{label}</p>
                <p className="text-2xl font-bold text-white mt-0.5 leading-tight">{value}</p>
                <div className="flex items-center gap-1 mt-1.5">
                  <span className={`inline-flex items-center gap-0.5 text-xs font-semibold ${isPositive ? 'text-teal-400' : 'text-coral-400'}`}>
                    {isUp
                      ? <ArrowUp size={12} />
                      : <ArrowDown size={12} />}
                    {Math.abs(trend)}{typeof trend === 'number' && label === 'Time to Hire' ? ' days' : '%'}
                  </span>
                  <span className="text-gray-600 text-[11px]">{suffix}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── HIRING FUNNEL ───────────────────────────────────────── */}
      <div className="card">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-base font-semibold text-white">Hiring Funnel</h2>
            <p className="text-gray-500 text-xs mt-0.5">Stage conversion across the full pipeline</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="badge-violet">
              <Target size={10} />
              Overall: {Math.round((FUNNEL[FUNNEL.length - 1].count / FUNNEL[0].count) * 100)}% hired
            </span>
          </div>
        </div>
        <HiringFunnel data={FUNNEL} />
      </div>

      {/* ── 2×2 CHART GRID ──────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Hiring Trend – Area Chart */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-semibold text-white flex items-center gap-2">
                <TrendingUp size={16} className="text-violet-400" />
                Monthly Hiring Trend
              </h2>
              <p className="text-gray-500 text-xs mt-0.5">Hires &amp; applications over 12 months</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={MONTHLY_HIRES} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="areaHires" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#8B5CF6" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="areaApps" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#14B8A6" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#14B8A6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<DarkTooltip />} />
              <Legend
                wrapperStyle={{ fontSize: 11, color: '#9ca3af', paddingTop: 8 }}
                iconType="circle" iconSize={8}
              />
              <Area type="monotone" dataKey="applications" name="Applications" stroke="#14B8A6"
                fill="url(#areaApps)" strokeWidth={2} dot={false} />
              <Area type="monotone" dataKey="hires" name="Hires" stroke="#8B5CF6"
                fill="url(#areaHires)" strokeWidth={2.5} dot={{ r: 3, fill: '#8B5CF6', strokeWidth: 0 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Source of Hire – Donut */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-semibold text-white flex items-center gap-2">
                <Filter size={16} className="text-teal-400" />
                Source of Hire
              </h2>
              <p className="text-gray-500 text-xs mt-0.5">Breakdown by recruitment channel</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <ResponsiveContainer width="55%" height={200}>
              <PieChart>
                <Pie
                  data={SOURCE_DATA}
                  cx="50%" cy="50%"
                  innerRadius={58} outerRadius={88}
                  paddingAngle={3}
                  dataKey="value"
                  startAngle={90} endAngle={-270}
                >
                  {SOURCE_DATA.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} stroke="transparent" />
                  ))}
                  <DonutLabel cx={95} cy={100} total={totalCandidates} />
                </Pie>
                <Tooltip content={<PieTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            {/* Legend */}
            <div className="flex flex-col gap-3 flex-1">
              {SOURCE_DATA.map(({ name, value, color }) => (
                <div key={name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: color }} />
                    <span className="text-xs text-gray-400">{name}</span>
                  </div>
                  <span className="text-sm font-semibold text-white">{value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Time-to-Hire by Department */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-semibold text-white flex items-center gap-2">
                <Clock size={16} className="text-amber-400" />
                Time to Hire by Department
              </h2>
              <p className="text-gray-500 text-xs mt-0.5">Average days from apply to offer</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={210}>
            <BarChart data={TIME_TO_HIRE} layout="vertical" margin={{ top: 0, right: 12, left: 10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false}
                domain={[0, 30]} unit=" d" />
              <YAxis type="category" dataKey="dept" tick={{ fill: '#9ca3af', fontSize: 11 }}
                axisLine={false} tickLine={false} width={80} />
              <Tooltip
                content={<DarkTooltip />}
                formatter={(v) => [`${v} days`, 'Avg. Days']}
              />
              <Bar dataKey="days" name="Days" radius={[0, 6, 6, 0]} maxBarSize={22}>
                {TIME_TO_HIRE.map((entry, i) => {
                  const shade = ['#8B5CF6', '#7C3AED', '#14B8A6', '#F59E0B', '#EF4444'][i];
                  return <Cell key={entry.dept} fill={shade} />;
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Department Performance Comparison */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-semibold text-white flex items-center gap-2">
                <Users size={16} className="text-coral-400" />
                Department Performance
              </h2>
              <p className="text-gray-500 text-xs mt-0.5">Interviews, offers, and hires per team</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={210}>
            <BarChart data={DEPT_PERF} margin={{ top: 4, right: 4, left: -20, bottom: 0 }} barGap={3}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="dept" tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<DarkTooltip />} />
              <Legend wrapperStyle={{ fontSize: 11, color: '#9ca3af', paddingTop: 8 }}
                iconType="circle" iconSize={8} />
              <Bar dataKey="interviews" name="Interviews" fill="#374151" radius={[4, 4, 0, 0]} maxBarSize={18} />
              <Bar dataKey="offers"     name="Offers"     fill="#7C3AED" radius={[4, 4, 0, 0]} maxBarSize={18} />
              <Bar dataKey="hired"      name="Hired"      fill="#8B5CF6" radius={[4, 4, 0, 0]} maxBarSize={18} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── DOWNLOADABLE REPORTS ─────────────────────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-semibold text-white flex items-center gap-2">
              <FileText size={16} className="text-gray-400" />
              Downloadable Reports
            </h2>
            <p className="text-gray-500 text-xs mt-0.5">Pre-built reports ready for export</p>
          </div>
          <button className="btn-ghost btn-sm flex items-center gap-1.5">
            <Calendar size={13} />
            Schedule Report
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {REPORT_CARDS.map(({ icon: Icon, title, desc, badge, badgeText, updated, color }) => (
            <div
              key={title}
              className="card-interactive group flex flex-col justify-between gap-4"
            >
              <div>
                <div className="flex items-start justify-between mb-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-white/[0.05] border border-white/[0.07] group-hover:scale-110 transition-transform duration-200`}>
                    <Icon size={18} className={color} />
                  </div>
                  <span className={badge}>{badgeText}</span>
                </div>
                <h3 className="text-sm font-semibold text-white leading-snug mb-1.5">{title}</h3>
                <p className="text-xs text-gray-500 leading-relaxed">{desc}</p>
              </div>

              <div className="divider" />

              <div className="flex items-center justify-between">
                <span className="text-[11px] text-gray-600">{updated}</span>
                <button className="btn-ghost btn-sm flex items-center gap-1 text-xs text-gray-400 hover:text-violet-400 px-2 py-1">
                  <Download size={12} />
                  Download
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
