import { useState } from 'react';
import {
  User, Bell, Shield, Palette, Building2, CreditCard, Key, Globe,
  Moon, Sun, Save, Upload, Mail, Phone, MapPin, Briefcase, Check, X,
  AlertCircle, ChevronRight, ExternalLink, Zap, Camera, Copy, Eye, EyeOff,
  Trash2, CheckCircle
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../lib/auth';

// ─── Toggle Switch ────────────────────────────────────────────────────────────
const Toggle = ({ checked, onChange, label, description }) => (
  <div className="flex items-start justify-between py-4 border-b border-white/5 last:border-0">
    <div className="flex-1 pr-6">
      <p className="text-sm font-medium text-white">{label}</p>
      {description && <p className="text-xs text-gray-400 mt-0.5">{description}</p>}
    </div>
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 transition-colors duration-200 ease-in-out focus:outline-none ${
        checked ? 'bg-violet-600 border-violet-600' : 'bg-white/10 border-white/10'
      }`}
    >
      <span
        className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-lg transition-transform duration-200 ease-in-out ${
          checked ? 'translate-x-5' : 'translate-x-0'
        }`}
      />
    </button>
  </div>
);

// ─── Section Header ───────────────────────────────────────────────────────────
const SectionHeader = ({ title, description }) => (
  <div className="mb-6">
    <h2 className="text-xl font-semibold text-white">{title}</h2>
    {description && <p className="text-sm text-gray-400 mt-1">{description}</p>}
  </div>
);

// ─── Progress Bar ─────────────────────────────────────────────────────────────
const ProgressBar = ({ label, used, total, unit = '', color = 'violet' }) => {
  const pct = Math.round((used / total) * 100);
  const colorMap = {
    violet: 'bg-violet-500',
    teal: 'bg-teal-500',
    coral: 'bg-coral-500',
    amber: 'bg-amber-500',
  };
  return (
    <div className="mb-4">
      <div className="flex justify-between text-xs text-gray-400 mb-1.5">
        <span>{label}</span>
        <span>{used}{unit} / {total}{unit}</span>
      </div>
      <div className="h-2 w-full rounded-full bg-white/10">
        <div
          className={`h-2 rounded-full transition-all ${colorMap[color] || 'bg-violet-500'}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="text-xs text-gray-500 mt-1">{pct}% used</p>
    </div>
  );
};

// ─── Mock Data ────────────────────────────────────────────────────────────────
const SESSIONS = [
  { id: 1, device: 'Chrome on Windows 11', location: 'Mumbai, India', lastActive: 'Active now', current: true },
  { id: 2, device: 'Safari on iPhone 15', location: 'Mumbai, India', lastActive: '2 hours ago', current: false },
  { id: 3, device: 'Firefox on macOS', location: 'Pune, India', lastActive: '3 days ago', current: false },
];

const PLAN_FEATURES = [
  'Unlimited job postings',
  'AI-powered candidate ranking',
  'Advanced analytics dashboard',
  'Bulk email campaigns',
  'API access (10k calls/mo)',
  'Priority support',
  'Custom branding',
  'Team collaboration (5 seats)',
];

const ACCENT_COLORS = [
  { name: 'Violet', class: 'bg-violet-500', ring: 'ring-violet-500' },
  { name: 'Teal', class: 'bg-teal-500', ring: 'ring-teal-500' },
  { name: 'Blue', class: 'bg-blue-500', ring: 'ring-blue-500' },
  { name: 'Rose', class: 'bg-rose-500', ring: 'ring-rose-500' },
  { name: 'Amber', class: 'bg-amber-500', ring: 'ring-amber-500' },
];

// ─── Tab Definitions ──────────────────────────────────────────────────────────
const TABS = [
  { id: 'profile',       label: 'Profile',       icon: User },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'security',      label: 'Security',      icon: Shield },
  { id: 'appearance',    label: 'Appearance',    icon: Palette },
  { id: 'company',       label: 'Company',       icon: Building2 },
  { id: 'billing',       label: 'Billing',       icon: CreditCard },
];

// ═══════════════════════════════════════════════════════════════════════════════
// TAB PANELS
// ═══════════════════════════════════════════════════════════════════════════════

// ─── Profile Tab ─────────────────────────────────────────────────────────────
const ProfileTab = ({ user }) => {
  const [profile, setProfile] = useState({
    fullName: user?.full_name || 'HireSense Recruiter',
    email: user?.email || 'recruiter@hiresense.ai',
    phone: '+91 98765 43210',
    jobTitle: 'Senior Talent Acquisition Lead',
    company: 'HireSense AI',
    location: 'Mumbai, Maharashtra',
    bio: 'Experienced recruiter with 8+ years in tech hiring. Passionate about using AI to find the best talent efficiently.',
  });

  const handleSave = () => toast.success('Profile updated successfully!');

  return (
    <div>
      <SectionHeader title="Profile Settings" description="Manage your personal information and public profile." />

      {/* Avatar Upload */}
      <div className="card p-6 mb-6">
        <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-4">Profile Photo</h3>
        <div className="flex items-center gap-6">
          <div className="relative group">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-violet-500 via-purple-500 to-indigo-600 flex items-center justify-center text-white text-3xl font-bold shadow-lg shadow-violet-500/30">
              PS
            </div>
            <div className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
              <Camera className="w-6 h-6 text-white" />
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-white mb-1">Upload a new photo</p>
            <p className="text-xs text-gray-400 mb-3">JPG, PNG or GIF. Max size 2MB.</p>
            <div className="flex gap-2">
              <button className="btn-secondary btn-sm flex items-center gap-2">
                <Upload className="w-3.5 h-3.5" />
                Upload Photo
              </button>
              <button className="btn-ghost btn-sm text-red-400 hover:text-red-300">Remove</button>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Form */}
      <div className="card p-6 mb-6">
        <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-4">Personal Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="form-group">
            <label className="label">Full Name</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                className="input pl-10"
                value={profile.fullName}
                onChange={e => setProfile({ ...profile, fullName: e.target.value })}
              />
            </div>
          </div>
          <div className="form-group">
            <label className="label">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                className="input pl-10"
                type="email"
                value={profile.email}
                onChange={e => setProfile({ ...profile, email: e.target.value })}
              />
            </div>
          </div>
          <div className="form-group">
            <label className="label">Phone Number</label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                className="input pl-10"
                value={profile.phone}
                onChange={e => setProfile({ ...profile, phone: e.target.value })}
              />
            </div>
          </div>
          <div className="form-group">
            <label className="label">Job Title</label>
            <div className="relative">
              <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                className="input pl-10"
                value={profile.jobTitle}
                onChange={e => setProfile({ ...profile, jobTitle: e.target.value })}
              />
            </div>
          </div>
          <div className="form-group">
            <label className="label">Company</label>
            <div className="relative">
              <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                className="input pl-10"
                value={profile.company}
                onChange={e => setProfile({ ...profile, company: e.target.value })}
              />
            </div>
          </div>
          <div className="form-group">
            <label className="label">Location</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                className="input pl-10"
                value={profile.location}
                onChange={e => setProfile({ ...profile, location: e.target.value })}
              />
            </div>
          </div>
        </div>
        <div className="form-group mt-2">
          <label className="label">Bio</label>
          <textarea
            className="input min-h-[100px] resize-none"
            rows={4}
            value={profile.bio}
            onChange={e => setProfile({ ...profile, bio: e.target.value })}
          />
          <p className="text-xs text-gray-500 mt-1">{profile.bio.length} / 300 characters</p>
        </div>
      </div>

      <div className="flex justify-end">
        <button onClick={handleSave} className="btn-primary flex items-center gap-2">
          <Save className="w-4 h-4" />
          Save Changes
        </button>
      </div>
    </div>
  );
};

// ─── Notifications Tab ────────────────────────────────────────────────────────
const NotificationsTab = () => {
  const [notifs, setNotifs] = useState({
    emailNotifs: true,
    pushNotifs: false,
    weeklyDigest: true,
    candidateUpdates: true,
    jobAlerts: false,
    aiInsights: true,
  });

  const toggle = key => setNotifs(prev => ({ ...prev, [key]: !prev[key] }));
  const handleSave = () => toast.success('Notification preferences saved!');

  return (
    <div>
      <SectionHeader title="Notification Preferences" description="Choose how and when you want to be notified." />

      <div className="card p-6 mb-6">
        <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-2">Channels</h3>
        <Toggle
          checked={notifs.emailNotifs}
          onChange={() => toggle('emailNotifs')}
          label="Email Notifications"
          description="Receive important updates and alerts via email"
        />
        <Toggle
          checked={notifs.pushNotifs}
          onChange={() => toggle('pushNotifs')}
          label="Push Notifications"
          description="Get real-time browser push notifications"
        />
        <Toggle
          checked={notifs.weeklyDigest}
          onChange={() => toggle('weeklyDigest')}
          label="Weekly Digest"
          description="A weekly summary of your recruitment activity"
        />
      </div>

      <div className="card p-6 mb-6">
        <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-2">Activity</h3>
        <Toggle
          checked={notifs.candidateUpdates}
          onChange={() => toggle('candidateUpdates')}
          label="Candidate Updates"
          description="Notify when candidates move through pipeline stages"
        />
        <Toggle
          checked={notifs.jobAlerts}
          onChange={() => toggle('jobAlerts')}
          label="Job Alerts"
          description="Alert when job postings receive new applications"
        />
        <Toggle
          checked={notifs.aiInsights}
          onChange={() => toggle('aiInsights')}
          label="AI Insights"
          description="Receive AI-generated recommendations and insights"
        />
      </div>

      <div className="flex justify-end">
        <button onClick={handleSave} className="btn-primary flex items-center gap-2">
          <Save className="w-4 h-4" />
          Save Preferences
        </button>
      </div>
    </div>
  );
};

// ─── Security Tab ─────────────────────────────────────────────────────────────
const SecurityTab = () => {
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [twoFA, setTwoFA] = useState(false);
  const [apiKey] = useState('hs_live_7f3k9x2mP8qRtLw5vNjYcBdE1oZsA4i');
  const [copied, setCopied] = useState(false);

  const handlePasswordSave = () => toast.success('Password updated successfully!');

  const handleCopyKey = () => {
    navigator.clipboard.writeText(apiKey).then(() => {
      setCopied(true);
      toast.success('API key copied!');
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleRevokeSession = (id) => toast.success(`Session ${id} revoked`);

  return (
    <div>
      <SectionHeader title="Security Settings" description="Manage your password, 2FA, and active sessions." />

      {/* Change Password */}
      <div className="card p-6 mb-6">
        <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-4">Change Password</h3>
        <div className="space-y-4 max-w-md">
          {[
            { label: 'Current Password', show: showCurrent, setShow: setShowCurrent },
            { label: 'New Password', show: showNew, setShow: setShowNew },
            { label: 'Confirm New Password', show: showConfirm, setShow: setShowConfirm },
          ].map(({ label, show, setShow }) => (
            <div key={label} className="form-group">
              <label className="label">{label}</label>
              <div className="relative">
                <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  className="input pl-10 pr-10"
                  type={show ? 'text' : 'password'}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShow(!show)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                >
                  {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          ))}
          <div className="bg-violet-500/10 border border-violet-500/20 rounded-lg p-3 flex gap-2">
            <AlertCircle className="w-4 h-4 text-violet-400 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-violet-300">Password must be at least 8 characters with uppercase, lowercase, number, and symbol.</p>
          </div>
          <button onClick={handlePasswordSave} className="btn-primary flex items-center gap-2">
            <Save className="w-4 h-4" />
            Update Password
          </button>
        </div>
      </div>

      {/* 2FA */}
      <div className="card p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-white">Two-Factor Authentication</h3>
            <p className="text-xs text-gray-400 mt-0.5">Add an extra layer of security to your account</p>
          </div>
          <div className="flex items-center gap-3">
            {twoFA ? (
              <span className="badge-teal">Enabled</span>
            ) : (
              <span className="badge-gray">Disabled</span>
            )}
            <button
              onClick={() => { setTwoFA(!twoFA); toast.success(twoFA ? '2FA disabled' : '2FA enabled!'); }}
              className="btn-secondary btn-sm"
            >
              {twoFA ? 'Disable' : 'Setup 2FA'}
            </button>
          </div>
        </div>
        {twoFA && (
          <div className="mt-4 p-4 bg-teal-500/10 border border-teal-500/20 rounded-lg flex gap-2">
            <CheckCircle className="w-4 h-4 text-teal-400 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-teal-300">Two-factor authentication is active. Your account is protected with an authenticator app.</p>
          </div>
        )}
      </div>

      {/* Active Sessions */}
      <div className="card p-6 mb-6">
        <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-4">Active Sessions</h3>
        <div className="space-y-3">
          {SESSIONS.map(session => (
            <div key={session.id} className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/5">
              <div className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full ${session.current ? 'bg-teal-400' : 'bg-gray-500'}`} />
                <div>
                  <p className="text-sm font-medium text-white">{session.device}</p>
                  <p className="text-xs text-gray-400">{session.location} · {session.lastActive}</p>
                </div>
              </div>
              {session.current ? (
                <span className="badge-teal text-xs">Current</span>
              ) : (
                <button
                  onClick={() => handleRevokeSession(session.id)}
                  className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Revoke
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* API Key */}
      <div className="card p-6">
        <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-4">API Key</h3>
        <p className="text-xs text-gray-400 mb-3">Use this key to authenticate API requests. Keep it secret.</p>
        <div className="flex items-center gap-2">
          <div className="flex-1 flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg px-3 py-2">
            <Key className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <code className="text-xs text-gray-300 font-mono truncate">{apiKey}</code>
          </div>
          <button
            onClick={handleCopyKey}
            className="btn-secondary btn-sm flex items-center gap-1.5"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-teal-400" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copied' : 'Copy'}
          </button>
        </div>
        <button className="mt-3 text-xs text-red-400 hover:text-red-300 transition-colors flex items-center gap-1">
          <AlertCircle className="w-3.5 h-3.5" />
          Regenerate API Key
        </button>
      </div>
    </div>
  );
};

// ─── Appearance Tab ───────────────────────────────────────────────────────────
const AppearanceTab = () => {
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark');
  const [accent, setAccent] = useState(() => localStorage.getItem('accent') || 'Violet');
  const [language, setLanguage] = useState('en');
  const [timezone, setTimezone] = useState('Asia/Kolkata');

  const handleSave = () => {
    localStorage.setItem('theme', theme);
    localStorage.setItem('accent', accent);
    document.documentElement.classList.toggle('dark', theme === 'dark');
    document.documentElement.classList.toggle('light', theme === 'light');
    document.documentElement.setAttribute('data-accent', accent.toLowerCase());
    toast.success('Appearance preferences saved!');
  };

  return (
    <div>
      <SectionHeader title="Appearance" description="Customize the look and feel of the platform." />

      {/* Theme */}
      <div className="card p-6 mb-6">
        <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-4">Theme</h3>
        <div className="grid grid-cols-2 gap-3 max-w-sm">
          {['dark', 'light'].map(t => (
            <button
              key={t}
              onClick={() => setTheme(t)}
              className={`relative flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                theme === t
                  ? 'border-violet-500 bg-violet-500/10'
                  : 'border-white/10 bg-white/5 hover:border-white/20'
              }`}
            >
              {t === 'dark'
                ? <Moon className={`w-6 h-6 ${theme === t ? 'text-violet-400' : 'text-gray-400'}`} />
                : <Sun className={`w-6 h-6 ${theme === t ? 'text-violet-400' : 'text-gray-400'}`} />
              }
              <span className={`text-sm font-medium capitalize ${theme === t ? 'text-white' : 'text-gray-400'}`}>
                {t === 'dark' ? 'Dark Mode' : 'Light Mode'}
              </span>
              {theme === t && (
                <span className="absolute top-2 right-2 w-4 h-4 rounded-full bg-violet-500 flex items-center justify-center">
                  <Check className="w-2.5 h-2.5 text-white" />
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Accent Colors */}
      <div className="card p-6 mb-6">
        <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-4">Accent Color</h3>
        <div className="flex items-center gap-3">
          {ACCENT_COLORS.map(color => (
            <button
              key={color.name}
              onClick={() => setAccent(color.name)}
              title={color.name}
              className={`w-8 h-8 rounded-full ${color.class} transition-all hover:scale-110 ${
                accent === color.name ? `ring-2 ring-offset-2 ring-offset-[#0f0f14] ${color.ring}` : ''
              }`}
            >
              {accent === color.name && <Check className="w-4 h-4 text-white mx-auto" />}
            </button>
          ))}
        </div>
        <p className="text-xs text-gray-500 mt-3">Selected: <span className="text-gray-300">{accent}</span></p>
      </div>

      {/* Language & Timezone */}
      <div className="card p-6 mb-6">
        <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-4">Localization</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="form-group">
            <label className="label flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5" /> Language
            </label>
            <select
              className="input"
              value={language}
              onChange={e => setLanguage(e.target.value)}
            >
              <option value="en">English (US)</option>
              <option value="en-gb">English (UK)</option>
              <option value="hi">Hindi</option>
              <option value="es">Spanish</option>
              <option value="fr">French</option>
              <option value="de">German</option>
            </select>
          </div>
          <div className="form-group">
            <label className="label">Timezone</label>
            <select
              className="input"
              value={timezone}
              onChange={e => setTimezone(e.target.value)}
            >
              <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
              <option value="America/New_York">America/New York (EST)</option>
              <option value="America/Los_Angeles">America/Los Angeles (PST)</option>
              <option value="Europe/London">Europe/London (GMT)</option>
              <option value="Europe/Paris">Europe/Paris (CET)</option>
              <option value="Asia/Singapore">Asia/Singapore (SGT)</option>
            </select>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button onClick={handleSave} className="btn-primary flex items-center gap-2">
          <Save className="w-4 h-4" />
          Save Preferences
        </button>
      </div>
    </div>
  );
};

// ─── Company Tab ──────────────────────────────────────────────────────────────
const CompanyTab = () => {
  const [company, setCompany] = useState({
    name: 'HireSense AI',
    website: 'https://hiresense.ai',
    industry: 'technology',
    size: '51-200',
    about: 'HireSense is a next-generation recruitment platform powered by artificial intelligence, helping companies find and hire the best talent faster than ever.',
  });

  const handleSave = () => toast.success('Company profile updated!');

  return (
    <div>
      <SectionHeader title="Company Settings" description="Manage your company profile and branding." />

      {/* Logo Upload */}
      <div className="card p-6 mb-6">
        <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-4">Company Logo</h3>
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-700 flex items-center justify-center shadow-lg shadow-violet-500/20">
            <Building2 className="w-9 h-9 text-white" />
          </div>
          <div>
            <p className="text-sm font-medium text-white mb-1">Upload company logo</p>
            <p className="text-xs text-gray-400 mb-3">PNG or SVG. Recommended size 256×256px.</p>
            <div className="flex gap-2">
              <button className="btn-secondary btn-sm flex items-center gap-2">
                <Upload className="w-3.5 h-3.5" />
                Upload Logo
              </button>
              <button className="btn-ghost btn-sm text-red-400 hover:text-red-300">Remove</button>
            </div>
          </div>
        </div>
      </div>

      {/* Company Form */}
      <div className="card p-6 mb-6">
        <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-4">Company Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="form-group">
            <label className="label">Company Name</label>
            <div className="relative">
              <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                className="input pl-10"
                value={company.name}
                onChange={e => setCompany({ ...company, name: e.target.value })}
              />
            </div>
          </div>
          <div className="form-group">
            <label className="label">Website</label>
            <div className="relative">
              <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                className="input pl-10"
                value={company.website}
                onChange={e => setCompany({ ...company, website: e.target.value })}
              />
            </div>
          </div>
          <div className="form-group">
            <label className="label">Industry</label>
            <select
              className="input"
              value={company.industry}
              onChange={e => setCompany({ ...company, industry: e.target.value })}
            >
              <option value="technology">Technology</option>
              <option value="finance">Finance & Banking</option>
              <option value="healthcare">Healthcare</option>
              <option value="education">Education</option>
              <option value="retail">Retail & E-commerce</option>
              <option value="manufacturing">Manufacturing</option>
              <option value="consulting">Consulting</option>
              <option value="media">Media & Entertainment</option>
            </select>
          </div>
          <div className="form-group">
            <label className="label">Company Size</label>
            <select
              className="input"
              value={company.size}
              onChange={e => setCompany({ ...company, size: e.target.value })}
            >
              <option value="1-10">1–10 employees</option>
              <option value="11-50">11–50 employees</option>
              <option value="51-200">51–200 employees</option>
              <option value="201-500">201–500 employees</option>
              <option value="501-1000">501–1000 employees</option>
              <option value="1000+">1000+ employees</option>
            </select>
          </div>
        </div>
        <div className="form-group mt-2">
          <label className="label">About the Company</label>
          <textarea
            className="input min-h-[100px] resize-none"
            rows={4}
            value={company.about}
            onChange={e => setCompany({ ...company, about: e.target.value })}
          />
        </div>
      </div>

      <div className="flex justify-end">
        <button onClick={handleSave} className="btn-primary flex items-center gap-2">
          <Save className="w-4 h-4" />
          Save Company Profile
        </button>
      </div>
    </div>
  );
};

// ─── Billing Tab ──────────────────────────────────────────────────────────────
const BillingTab = () => {
  const handleUpgrade = () => toast('Contact sales for Enterprise plan!', { icon: '🚀' });

  return (
    <div>
      <SectionHeader title="Billing & Subscription" description="Manage your plan, usage, and payment details." />

      {/* Current Plan */}
      <div className="relative card p-6 mb-6 overflow-hidden">
        {/* Glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-violet-600/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        <div className="relative z-10">
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="badge-violet text-xs font-bold px-2.5 py-0.5">PRO PLAN</span>
                <span className="badge-teal text-xs">Active</span>
              </div>
              <h3 className="text-2xl font-bold text-white mt-2">₹4,999<span className="text-base text-gray-400 font-normal">/month</span></h3>
              <p className="text-xs text-gray-400 mt-1">Billed monthly · Next renewal: Aug 1, 2026</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/30">
              <Zap className="w-6 h-6 text-white" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 mt-4">
            {PLAN_FEATURES.map(feat => (
              <div key={feat} className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-violet-400 flex-shrink-0" />
                <span className="text-xs text-gray-300">{feat}</span>
              </div>
            ))}
          </div>

          <div className="flex gap-3 mt-6">
            <button onClick={handleUpgrade} className="btn-primary flex items-center gap-2">
              <Zap className="w-4 h-4" />
              Upgrade to Enterprise
            </button>
            <button className="btn-ghost btn-sm text-red-400 hover:text-red-300">
              Cancel Subscription
            </button>
          </div>
        </div>
      </div>

      {/* Usage Stats */}
      <div className="card p-6 mb-6">
        <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-4">Usage This Month</h3>
        <ProgressBar label="Job Postings" used={18} total={50} color="violet" />
        <ProgressBar label="AI Screenings" used={342} total={500} color="teal" />
        <ProgressBar label="API Calls" used={7843} total={10000} color="amber" />
        <ProgressBar label="Team Seats" used={3} total={5} color="violet" />
        <div className="mt-4 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg flex gap-2">
          <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-amber-300">You've used 78% of your API calls. Consider upgrading to avoid disruptions.</p>
        </div>
      </div>

      {/* Payment Method */}
      <div className="card p-6">
        <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-4">Payment Method</h3>
        <div className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-xl">
          <div className="flex items-center gap-3">
            <div className="w-12 h-8 bg-gradient-to-r from-blue-600 to-blue-800 rounded-md flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-white">Visa ending in 4242</p>
              <p className="text-xs text-gray-400">Expires 09/2028</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button className="btn-ghost btn-sm">Update</button>
            <button className="btn-secondary btn-sm flex items-center gap-1.5">
              <ExternalLink className="w-3.5 h-3.5" />
              Invoices
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN SETTINGS PAGE
// ═══════════════════════════════════════════════════════════════════════════════
const TAB_COMPONENTS = {
  profile: ProfileTab,
  notifications: NotificationsTab,
  security: SecurityTab,
  appearance: AppearanceTab,
  company: CompanyTab,
  billing: BillingTab,
};

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('profile');
  const { user } = useAuth();
  const ActivePanel = TAB_COMPONENTS[activeTab];

  return (
    <div className="min-h-screen bg-[#0f0f14] text-white">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold gradient-text">Settings</h1>
          <p className="text-gray-400 mt-1">Manage your account, preferences, and platform configuration.</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* ── Sidebar ── */}
          <aside className="lg:w-60 flex-shrink-0">
            <nav className="card p-2 flex flex-col gap-1">
              {TABS.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all text-left w-full group ${
                    activeTab === id
                      ? 'bg-violet-600/20 text-violet-300 border border-violet-500/30'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon className={`w-4 h-4 flex-shrink-0 ${activeTab === id ? 'text-violet-400' : 'text-gray-500 group-hover:text-gray-300'}`} />
                  <span>{label}</span>
                  {activeTab === id && <ChevronRight className="w-3.5 h-3.5 ml-auto text-violet-400" />}
                </button>
              ))}
            </nav>

            {/* Help Card */}
            <div className="card p-4 mt-4 bg-gradient-to-br from-violet-600/10 to-indigo-600/10 border-violet-500/20">
              <p className="text-xs font-semibold text-violet-300 mb-1">Need Help?</p>
              <p className="text-xs text-gray-400 mb-3">Check our docs or contact support for assistance.</p>
              <a
                href="#"
                className="text-xs text-violet-400 hover:text-violet-300 flex items-center gap-1 transition-colors"
              >
                View Documentation <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </aside>

          {/* ── Main Content ── */}
          <main className="flex-1 min-w-0">
            <ActivePanel user={user} />
          </main>
        </div>
      </div>
    </div>
  );
}
