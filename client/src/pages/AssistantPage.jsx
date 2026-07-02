import { useState, useRef, useEffect } from 'react';
import {
  Bot,
  Send,
  User,
  Zap,
  Sparkles,
  Copy,
  ThumbsUp,
  ThumbsDown,
  RotateCcw,
  Paperclip,
  Mic,
  Briefcase,
  Users,
  FileText,
  Trophy,
  ChevronRight,
  Plus,
} from 'lucide-react';
import toast from 'react-hot-toast';

// ─── Mock Data ────────────────────────────────────────────────────────────────

const INITIAL_MESSAGES = [
  {
    id: 1,
    role: 'assistant',
    content:
      "Hello! I'm HireSense AI, your intelligent hiring copilot. I can help you rank candidates, analyze resumes, generate job descriptions, and surface talent insights. What would you like to explore today?",
    timestamp: new Date(Date.now() - 12 * 60 * 1000),
  },
  {
    id: 2,
    role: 'user',
    content: 'Can you help me rank the candidates for the Senior Frontend Engineer role?',
    timestamp: new Date(Date.now() - 11 * 60 * 1000),
  },
  {
    id: 3,
    role: 'assistant',
    content:
      "Absolutely! I've analyzed all 24 applicants for the **Senior Frontend Engineer** role. Here's the top-tier ranking:\n\n🥇 **Sarah Chen** — 97/100 match score\n- 6 years React/TypeScript experience\n- Open-source contributor (12k GitHub stars)\n- Led migration to micro-frontends at Stripe\n\n🥈 **Marcus Williams** — 93/100 match score\n- 5 years with proven leadership background\n- Strong performance optimization portfolio\n\n🥉 **Priya Nair** — 91/100 match score\n- Exceptional system design skills\n- Excellent cultural fit indicators\n\nWould you like me to draft outreach emails for these candidates or dig deeper into any specific profile?",
    timestamp: new Date(Date.now() - 10 * 60 * 1000),
  },
  {
    id: 4,
    role: 'user',
    content: "Great! Let's draft an outreach email for Sarah Chen.",
    timestamp: new Date(Date.now() - 8 * 60 * 1000),
  },
  {
    id: 5,
    role: 'assistant',
    content:
      "Here's a personalized outreach email for Sarah Chen:\n\n---\n\n**Subject:** Exciting Senior Frontend Opportunity at Acme Corp — Made for You, Sarah\n\nHi Sarah,\n\nI came across your impressive work on open-source React libraries and your contributions to the micro-frontend architecture at Stripe — truly inspiring work.\n\nWe're building something ambitious at **Acme Corp**, and your expertise in React, TypeScript, and large-scale frontend systems aligns perfectly with what our team needs.\n\nWould you be open to a 20-minute exploratory call this week?\n\nBest regards,\n[Your Name]\n\n---\n\nThis email has a **personalised hook** based on her GitHub activity and career history. Want me to adjust the tone or add specific details about compensation or tech stack?",
    timestamp: new Date(Date.now() - 7 * 60 * 1000),
  },
];

const CANNED_RESPONSES = {
  ranking: `I've run a deep analysis across your candidate pipeline. Here are the **top-ranked applicants** based on skill match, experience, and culture fit:

🥇 **Candidate #1** — 96/100
- Perfect technical alignment with the JD
- 7 years of domain-specific experience

🥈 **Candidate #2** — 91/100
- Strong communication and leadership signals

🥉 **Candidate #3** — 88/100
- High growth trajectory, great team fit

Want me to generate personalised interview kits for any of these candidates?`,

  resume: `I've analyzed the resume in detail. Here's my assessment:

**Overall Score: 87/100** ✅

**Strengths:**
- Strong technical depth in relevant technologies
- Quantified achievements (e.g., "reduced load time by 40%")
- Clear career progression over 5+ years

**Areas to Note:**
- No mention of leadership or mentoring experience
- Missing keywords: "system design", "scalability"

**Recommendation:** Shortlist for a technical screening call. I'd suggest asking about their approach to large-scale architecture challenges.

Would you like a set of tailored interview questions?`,

  job: `Here are insights for your current job posting:

📊 **Market Intelligence**
- Average salary range: $130k–$165k
- Top competing companies: Stripe, Figma, Linear
- Time-to-hire benchmark: 28 days

📈 **Your Posting Performance**
- 342 views in last 7 days
- 18% application conversion rate (industry avg: 12%)
- Top traffic source: LinkedIn (67%)

🔑 **Suggested Optimizations:**
- Add "remote-friendly" tag to boost applications by ~23%
- Emphasize equity compensation — top motivator in current market

Want me to rewrite the job description with these optimizations?`,

  candidate: `I've searched across our talent pool and external sources. Here are the best-fit candidates:

🔍 **12 high-potential profiles found**

**Top Picks:**
1. **Alex Morgan** — Available now, 5 yrs exp, React + Node specialist
2. **Jamie Park** — Passively looking, ex-Google, strong culture signals
3. **Riya Shah** — Open to opportunities, domain expert in fintech

All three have been pre-screened against your role requirements. Would you like me to draft personalised outreach for all three simultaneously?`,

  default: `Great question! Based on my analysis of your hiring data and market trends, here's what I recommend:

**Key Insight:** Your current pipeline shows strong top-of-funnel activity, but there's a drop-off at the technical interview stage (42% pass rate vs. 60% industry benchmark).

**Suggested Actions:**
1. Calibrate your technical assessments to better reflect day-to-day work
2. Add a structured debrief template for interviewers
3. Consider async video interviews to reduce scheduling friction

This could improve your offer acceptance rate by an estimated **15–20%**. Want me to generate specific templates or reports for any of these areas?`,
};

const QUICK_ACTIONS = [
  { icon: Trophy, label: 'Rank Candidates', color: 'text-violet-400', keyword: 'ranking' },
  { icon: FileText, label: 'Analyze Resume', color: 'text-teal-400', keyword: 'resume' },
  { icon: Briefcase, label: 'Job Insights', color: 'text-amber-400', keyword: 'job' },
  { icon: Users, label: 'Find Talent', color: 'text-coral-400', keyword: 'candidate' },
];

const SUGGESTED_QUESTIONS = [
  'Who are the top candidates for my open roles?',
  'Analyze the latest resume submissions',
  'What are the current hiring market trends?',
  'Draft an outreach email for my top candidate',
  'Generate interview questions for a backend role',
  'Summarize my pipeline health this week',
];

const CONVERSATION_HISTORY = [
  { id: 'h1', title: 'Senior Frontend Engineer ranking' },
  { id: 'h2', title: 'Resume analysis – Product Designer' },
  { id: 'h3', title: 'Outreach email templates' },
  { id: 'h4', title: 'Q3 hiring pipeline review' },
];

const WELCOME_FEATURES = [
  {
    icon: Trophy,
    title: 'Smart Candidate Ranking',
    desc: 'AI scores and ranks applicants based on your JD, culture, and past hires.',
    color: 'text-violet-400',
    bg: 'bg-violet-500/10 border-violet-500/20',
  },
  {
    icon: FileText,
    title: 'Deep Resume Analysis',
    desc: 'Instant structured breakdown of any resume with actionable hiring signals.',
    color: 'text-teal-400',
    bg: 'bg-teal-500/10 border-teal-500/20',
  },
  {
    icon: Zap,
    title: 'Instant Outreach Drafts',
    desc: 'Personalised candidate emails written in seconds, tailored to each profile.',
    color: 'text-amber-400',
    bg: 'bg-amber-500/10 border-amber-500/20',
  },
];

const QUICK_STARTS = [
  'Rank my candidates for the open React role',
  'Analyze the latest resume submission',
  'What are hiring trends for senior engineers?',
  'Draft an outreach email for my top candidate',
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getResponse(message) {
  const lower = message.toLowerCase();
  if (lower.includes('rank') || lower.includes('ranking') || lower.includes('score'))
    return CANNED_RESPONSES.ranking;
  if (lower.includes('resume') || lower.includes('cv') || lower.includes('analyze'))
    return CANNED_RESPONSES.resume;
  if (lower.includes('job') || lower.includes('posting') || lower.includes('insight'))
    return CANNED_RESPONSES.job;
  if (lower.includes('candidate') || lower.includes('talent') || lower.includes('find'))
    return CANNED_RESPONSES.candidate;
  return CANNED_RESPONSES.default;
}

function formatTime(date) {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function TypingIndicator() {
  return (
    <div className="flex items-end gap-3 mb-6">
      {/* AI Avatar */}
      <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg shadow-violet-500/30">
        <Bot size={16} className="text-white" />
      </div>
      <div className="card px-4 py-3 rounded-2xl rounded-bl-md">
        <div className="flex items-center gap-1.5 h-5">
          <span
            className="w-2 h-2 rounded-full bg-violet-400 animate-bounce"
            style={{ animationDelay: '0ms' }}
          />
          <span
            className="w-2 h-2 rounded-full bg-violet-400 animate-bounce"
            style={{ animationDelay: '150ms' }}
          />
          <span
            className="w-2 h-2 rounded-full bg-violet-400 animate-bounce"
            style={{ animationDelay: '300ms' }}
          />
        </div>
      </div>
    </div>
  );
}

function MessageBubble({ message }) {
  const [hovered, setHovered] = useState(false);
  const isAI = message.role === 'assistant';

  function handleCopy() {
    navigator.clipboard.writeText(message.content);
    toast.success('Copied to clipboard');
  }

  // Render markdown-lite: bold + line breaks
  function renderContent(text) {
    return text.split('\n').map((line, i) => {
      const parts = line.split(/\*\*(.*?)\*\*/g);
      return (
        <span key={i}>
          {parts.map((part, j) =>
            j % 2 === 1 ? (
              <strong key={j} className="font-semibold text-white">
                {part}
              </strong>
            ) : (
              <span key={j}>{part}</span>
            )
          )}
          {i < text.split('\n').length - 1 && <br />}
        </span>
      );
    });
  }

  if (!isAI) {
    return (
      <div className="flex items-end gap-3 mb-6 flex-row-reverse">
        {/* User Avatar */}
        <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 bg-gradient-to-br from-slate-600 to-slate-700 border border-white/10">
          <User size={16} className="text-slate-300" />
        </div>
        <div
          className="max-w-[70%] px-4 py-3 rounded-2xl rounded-br-md text-sm leading-relaxed"
          style={{
            background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
            color: '#f3f4f6',
          }}
        >
          {message.content}
        </div>
      </div>
    );
  }

  return (
    <div
      className="flex items-end gap-3 mb-6 group"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* AI Avatar */}
      <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg shadow-violet-500/30">
        <Bot size={16} className="text-white" />
      </div>

      <div className="max-w-[72%] flex flex-col gap-2">
        {/* Bubble */}
        <div className="card px-4 py-3 rounded-2xl rounded-bl-md text-sm leading-relaxed text-slate-200">
          {renderContent(message.content)}
        </div>

        {/* Actions Row */}
        <div
          className={`flex items-center gap-1 transition-all duration-200 ${
            hovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-1 pointer-events-none'
          }`}
        >
          <span className="text-xs text-slate-500 mr-2">{formatTime(message.timestamp)}</span>
          <button
            onClick={handleCopy}
            className="p-1.5 rounded-lg hover:bg-white/5 text-slate-500 hover:text-slate-300 transition-colors"
            title="Copy"
          >
            <Copy size={13} />
          </button>
          <button
            className="p-1.5 rounded-lg hover:bg-white/5 text-slate-500 hover:text-teal-400 transition-colors"
            title="Helpful"
          >
            <ThumbsUp size={13} />
          </button>
          <button
            className="p-1.5 rounded-lg hover:bg-white/5 text-slate-500 hover:text-coral-400 transition-colors"
            title="Not helpful"
          >
            <ThumbsDown size={13} />
          </button>
          <button
            className="p-1.5 rounded-lg hover:bg-white/5 text-slate-500 hover:text-amber-400 transition-colors"
            title="Regenerate"
          >
            <RotateCcw size={13} />
          </button>
        </div>
      </div>
    </div>
  );
}

function WelcomeScreen({ onPrompt }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 text-center">
      {/* Icon */}
      <div className="relative mb-6">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-2xl shadow-violet-500/40 mx-auto">
          <Bot size={36} className="text-white" />
        </div>
        <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg">
          <Sparkles size={12} className="text-white" />
        </div>
      </div>

      {/* Heading */}
      <h1 className="text-4xl font-bold mb-3">
        <span className="gradient-text">Your AI Hiring Copilot</span>
      </h1>
      <p className="text-slate-400 text-base max-w-md mb-10 leading-relaxed">
        Supercharge your recruitment with AI-powered insights. Rank candidates, analyze resumes,
        and craft perfect outreach — all in one conversation.
      </p>

      {/* Feature Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl w-full mb-10">
        {WELCOME_FEATURES.map((feat) => (
          <div
            key={feat.title}
            className={`card border rounded-xl p-4 text-left ${feat.bg}`}
          >
            <feat.icon size={20} className={`${feat.color} mb-3`} />
            <p className="text-sm font-semibold text-white mb-1">{feat.title}</p>
            <p className="text-xs text-slate-400 leading-relaxed">{feat.desc}</p>
          </div>
        ))}
      </div>

      {/* Quick Start Prompts */}
      <p className="text-xs uppercase tracking-widest text-slate-500 mb-4 font-semibold">
        Quick starts
      </p>
      <div className="flex flex-wrap gap-2 justify-center max-w-xl">
        {QUICK_STARTS.map((q) => (
          <button
            key={q}
            onClick={() => onPrompt(q)}
            className="chip hover:border-violet-500/60 hover:text-violet-300 transition-all duration-200 text-sm cursor-pointer"
          >
            {q}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function AssistantPage() {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [activeHistory, setActiveHistory] = useState('h1');
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const fileInputRef = useRef(null);

  // Load initial conversation
  useEffect(() => {
    setMessages(INITIAL_MESSAGES);
  }, []);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  function sendMessage(text) {
    const content = text.trim();
    if (!content || isTyping) return;

    const userMsg = {
      id: Date.now(),
      role: 'user',
      content,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');
    setIsTyping(true);

    // Simulate AI thinking delay
    setTimeout(() => {
      const aiMsg = {
        id: Date.now() + 1,
        role: 'assistant',
        content: getResponse(content),
        timestamp: new Date(),
      };
      setIsTyping(false);
      setMessages((prev) => [...prev, aiMsg]);
    }, 1600);
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(inputValue);
    }
  }

  function handleQuickAction(keyword) {
    const prompts = {
      ranking: 'Rank the candidates for my current open roles',
      resume: 'Analyze the most recent resume submission',
      job: 'Give me insights on my current job posting performance',
      candidate: 'Find top talent for my open Senior Engineer position',
    };
    sendMessage(prompts[keyword] || keyword);
  }

  function startNewChat() {
    setMessages([]);
    setActiveHistory(null);
    inputRef.current?.focus();
  }

  const hasMessages = messages.length > 0;

  return (
    <div className="flex h-screen bg-[#0a0a0f] overflow-hidden">
      {/* ── Left Sidebar ──────────────────────────────────────────────────── */}
      <aside className="w-64 flex-shrink-0 border-r border-white/5 flex flex-col bg-[#0d0d14]">
        {/* Header */}
        <div className="p-4 border-b border-white/5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
              <Bot size={14} className="text-white" />
            </div>
            <span className="font-semibold text-white text-sm">AI Assistant</span>
            <div className="ml-auto">
              <span className="dot dot-green" />
            </div>
          </div>
          <button
            onClick={startNewChat}
            className="btn-primary btn-sm w-full flex items-center justify-center gap-2"
          >
            <Plus size={14} />
            New Chat
          </button>
        </div>

        {/* Quick Actions */}
        <div className="p-4 border-b border-white/5">
          <p className="text-xs uppercase tracking-widest text-slate-500 font-semibold mb-3">
            Quick Actions
          </p>
          <div className="flex flex-col gap-1">
            {QUICK_ACTIONS.map((action) => (
              <button
                key={action.label}
                onClick={() => handleQuickAction(action.keyword)}
                className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/5 transition-colors group text-left"
              >
                <action.icon size={15} className={action.color} />
                <span className="text-sm text-slate-300 group-hover:text-white transition-colors">
                  {action.label}
                </span>
                <ChevronRight
                  size={13}
                  className="ml-auto text-slate-600 group-hover:text-slate-400 transition-colors"
                />
              </button>
            ))}
          </div>
        </div>

        {/* Suggested Questions */}
        <div className="p-4 border-b border-white/5">
          <p className="text-xs uppercase tracking-widest text-slate-500 font-semibold mb-3">
            Suggested
          </p>
          <div className="flex flex-col gap-1">
            {SUGGESTED_QUESTIONS.slice(0, 4).map((q) => (
              <button
                key={q}
                onClick={() => sendMessage(q)}
                className="text-left text-xs text-slate-400 hover:text-slate-200 px-2 py-1.5 rounded-lg hover:bg-white/5 transition-colors leading-relaxed"
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        {/* Chat History */}
        <div className="p-4 flex-1 overflow-y-auto">
          <p className="text-xs uppercase tracking-widest text-slate-500 font-semibold mb-3">
            History
          </p>
          <div className="flex flex-col gap-1">
            {CONVERSATION_HISTORY.map((hist) => (
              <button
                key={hist.id}
                onClick={() => setActiveHistory(hist.id)}
                className={`text-left text-xs px-3 py-2 rounded-lg transition-colors leading-relaxed ${
                  activeHistory === hist.id
                    ? 'bg-violet-500/15 text-violet-300 border border-violet-500/25'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                }`}
              >
                {hist.title}
              </button>
            ))}
          </div>
        </div>
      </aside>

      {/* ── Main Chat Area ────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="h-14 border-b border-white/5 flex items-center px-6 gap-3 flex-shrink-0 bg-[#0a0a0f]/80 backdrop-blur-sm">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-sm text-slate-300 font-medium">HireSense AI</span>
          </div>
          <span className="text-slate-600 text-xs">•</span>
          <span className="text-xs text-slate-500">Powered by GPT-4o + Proprietary Models</span>
          <div className="ml-auto flex items-center gap-2">
            <span className="badge-violet text-xs">Pro</span>
            <span className="text-xs text-slate-500">1,247 tokens used today</span>
          </div>
        </header>

        {/* Messages / Welcome */}
        <div className="flex-1 overflow-y-auto">
          {!hasMessages ? (
            <WelcomeScreen onPrompt={sendMessage} />
          ) : (
            <div className="max-w-3xl mx-auto px-6 py-8">
              {messages.map((msg) => (
                <MessageBubble key={msg.id} message={msg} />
              ))}
              {isTyping && <TypingIndicator />}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="flex-shrink-0 border-t border-white/5 bg-[#0a0a0f]/90 backdrop-blur-sm p-4">
          <div className="max-w-3xl mx-auto">
            <div
              className="card flex items-end gap-3 p-3 rounded-2xl border border-white/8 focus-within:border-violet-500/40 transition-all duration-200"
              style={{ boxShadow: 'none' }}
            >
              {/* Attach */}
              <button
                onClick={() => fileInputRef.current?.click()}
                className="p-2 rounded-xl hover:bg-white/5 text-slate-500 hover:text-slate-300 transition-colors flex-shrink-0 self-end mb-0.5"
                title="Attach file"
              >
                <Paperclip size={16} />
              </button>
              <input ref={fileInputRef} type="file" className="hidden" />

              {/* Textarea */}
              <textarea
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask HireSense AI anything about your hiring pipeline…"
                rows={1}
                className="flex-1 bg-transparent text-sm text-slate-200 placeholder-slate-500 outline-none resize-none leading-6 py-1 max-h-40 overflow-y-auto"
                style={{ minHeight: '28px' }}
                onInput={(e) => {
                  e.target.style.height = 'auto';
                  e.target.style.height = Math.min(e.target.scrollHeight, 160) + 'px';
                }}
              />

              {/* Mic */}
              <button
                className="p-2 rounded-xl hover:bg-white/5 text-slate-500 hover:text-slate-300 transition-colors flex-shrink-0 self-end mb-0.5"
                title="Voice input"
              >
                <Mic size={16} />
              </button>

              {/* Send */}
              <button
                onClick={() => sendMessage(inputValue)}
                disabled={!inputValue.trim() || isTyping}
                className="btn-primary btn-sm flex-shrink-0 self-end flex items-center justify-center gap-1.5 px-4 rounded-xl disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200"
                style={{
                  boxShadow: inputValue.trim() ? '0 0 18px rgba(139,92,246,0.45)' : 'none',
                }}
              >
                <Send size={14} />
                <span className="hidden sm:inline">Send</span>
              </button>
            </div>

            <p className="text-center text-xs text-slate-600 mt-2">
              HireSense AI can make mistakes. Always verify candidate information before proceeding.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
