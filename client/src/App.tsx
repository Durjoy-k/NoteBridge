import { FormEvent, useEffect, useState } from 'react';
import {
  ArrowRight,
  Bookmark,
  BookOpen,
  Check,
  ChevronDown,
  FileText,
  Home,
  LogOut,
  Menu,
  MessageCircle,
  Search,
  Sparkles,
  Star,
  TrendingUp,
  Upload,
  Users,
  X,
  type LucideIcon,
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:4000';

type User = { id: string; name: string; email: string; role: 'student' | 'admin' };

const resources = [
  { type: 'PDF', title: 'Binary Trees — Complete Notes', course: 'Data Structures', meta: '42 pages · 12 min ago', rating: '4.9', color: 'rose' },
  { type: 'PPT', title: 'OOP Concepts — Inheritance', course: 'Object Oriented Programming', meta: '36 slides · 86 saves', rating: '4.8', color: 'blue' },
  { type: 'DOC', title: 'How to prepare for DSA final exam?', course: 'Ask & answer guide', meta: '18 helpful votes · by Nirjhar', rating: 'Guide', color: 'green' },
];

const navItems: { label: string; icon: LucideIcon; badge?: string; count?: string }[] = [
  { label: 'Dashboard', icon: Home },
  { label: 'Explore resources', icon: Search },
  { label: 'My library', icon: Bookmark },
  { label: 'Ask & answer', icon: MessageCircle, count: '7' },
  { label: 'Share a resource', icon: Upload },
  { label: 'AI Study Assistant', icon: Sparkles, badge: 'NEW' },
  { label: 'Previous questions', icon: FileText },
];

function Logo() {
  return <a className="brand" href="/" onClick={(event) => { event.preventDefault(); window.history.pushState({}, '', '/'); window.dispatchEvent(new PopStateEvent('popstate')); }}><span className="brand-mark"><BookOpen size={21} /></span><span>NoteBridge</span></a>;
}

function App() {
  const [path, setPath] = useState(window.location.pathname);
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('notebridge_user');
    return saved ? JSON.parse(saved) : null;
  });

  useEffect(() => {
    const onPopState = () => setPath(window.location.pathname);
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  const go = (to: string) => { window.history.pushState({}, '', to); setPath(to); window.scrollTo({ top: 0, behavior: 'smooth' }); };
  const handleLogin = (nextUser: User) => { localStorage.setItem('notebridge_user', JSON.stringify(nextUser)); setUser(nextUser); go('/dashboard'); };
  const logout = () => { localStorage.removeItem('notebridge_user'); setUser(null); go('/login'); };

  if (path === '/login' || path === '/register') return <AuthPage mode={path === '/register' ? 'register' : 'login'} onLogin={handleLogin} go={go} />;
  if (path === '/dashboard') return user ? <Dashboard user={user} onLogout={logout} go={go} /> : <AuthPage mode="login" onLogin={handleLogin} go={go} />;
  return <LandingPage user={user} go={go} />;
}

function LandingPage({ user, go }: { user: User | null; go: (path: string) => void }) {
  return <main className="landing-page">
    <nav className="landing-nav"><Logo /><div className="landing-links"><a href="#why">Why NoteBridge</a><a href="#how">How it works</a><a href="#ai">AI study tools</a></div><div className="landing-actions">{user ? <button className="outline-button nav-dashboard" onClick={() => go('/dashboard')}>Open dashboard <ArrowRight size={15} /></button> : <><button className="landing-login" onClick={() => go('/login')}>Sign in</button><button className="primary-button nav-cta" onClick={() => go('/register')}>Join your university <ArrowRight size={15} /></button></>}</div><button className="icon-only landing-menu"><Menu size={20} /></button></nav>
    <section className="landing-hero"><div className="hero-copy"><span className="eyebrow dark"><span className="live-dot" /> A trusted space for university students</span><h1>Turn your notes into <span>shared knowledge.</span></h1><p>NoteBridge helps students find better resources, share what they know, and use AI to prepare with confidence—all in one university-verified space.</p><div className="hero-actions"><button className="primary-button" onClick={() => go('/register')}>Start sharing for free <ArrowRight size={17} /></button><button className="watch-button" onClick={() => document.getElementById('how')?.scrollIntoView({ behavior: 'smooth' })}><span className="play-icon">▶</span> See how it works</button></div><div className="hero-proof"><div className="avatar-stack"><span>RA</span><span>MH</span><span>FS</span><span>+</span></div><span><strong>2,486 students</strong><small>already sharing what works</small></span></div></div><div className="hero-visual"><div className="visual-glow" /><div className="floating-note note-one"><span className="file-icon rose">PDF</span><span><strong>Binary Trees Notes</strong><small>Saved by 42 students</small></span><Bookmark size={17} /></div><div className="dashboard-preview"><div className="preview-top"><span className="mini-logo"><BookOpen size={14} /> NoteBridge</span><span className="preview-avatar">NS</span></div><div className="preview-welcome"><small>STUDENT SPACE</small><strong>Welcome back, Nirjhar</strong><span>Here’s what’s happening with your learning.</span></div><div className="preview-stats"><span><b>24</b><small>Resources shared</small></span><span><b>18</b><small>Saved resources</small></span><span><b>620</b><small>Contribution XP</small></span></div><div className="preview-content"><div className="preview-resources"><div className="preview-heading"><strong>Recent resources</strong><span>View library</span></div>{['Binary Trees — Complete Notes', 'OOP Concepts — Inheritance', 'DSA Exam Guide'].map((title, index) => <div className="preview-row" key={title}><span className={`preview-file pf-${index}`}>{index === 0 ? 'PDF' : index === 1 ? 'PPT' : 'DOC'}</span><span><strong>{title}</strong><small>{index === 0 ? 'Data Structures' : index === 1 ? 'Object Oriented Programming' : 'Ask & answer guide'}</small></span><Star size={12} /></div>)}</div><div className="preview-ai"><span className="ai-preview-icon"><Sparkles size={18} /></span><strong>AI Study Assistant</strong><small>Summarize a note</small><small>Generate a quiz</small><small>Analyze past questions</small></div></div></div><div className="floating-note note-two"><span className="ai-preview-icon"><Sparkles size={17} /></span><span><strong>AI quiz ready</strong><small>10 questions generated</small></span><Check size={16} /></div></div></section>
    <section className="trust-strip"><span>BUILT FOR THE WAY STUDENTS ACTUALLY STUDY</span><div><span><ShieldMini /> University verified</span><span><Users size={17} /> Student powered</span><span><Sparkles size={17} /> AI assisted</span></div></section>
    <section className="landing-section" id="why"><div className="section-intro"><span className="eyebrow dark">Everything students need</span><h2>A better starting point for every course.</h2><p>From the first lecture to the final exam, NoteBridge keeps useful resources and helpful conversations easy to find.</p></div><div className="feature-grid"><Feature icon={Search} title="Find resources faster" text="Search notes, slides, previous questions, and study guides by course and topic." tone="blue" /><Feature icon={Upload} title="Share what works" text="Upload useful material once and give the next student a better starting point." tone="purple" /><Feature icon={MessageCircle} title="Ask & answer together" text="Get help from students who have already worked through the same challenge." tone="green" /></div></section>
    <section className="ai-section" id="ai"><div className="ai-section-copy"><span className="eyebrow dark"><Sparkles size={15} /> Your study sidekick</span><h2>Make every resource more useful.</h2><p>NoteBridge’s AI tools turn the material students already share into practical study help—without replacing the community behind it.</p><ul><li><Check size={17} /> Summarize long notes into key ideas</li><li><Check size={17} /> Generate practice quizzes from course material</li><li><Check size={17} /> Spot frequently asked topics in past questions</li></ul><button className="primary-button compact" onClick={() => go('/register')}>Explore AI tools <ArrowRight size={16} /></button></div><div className="ai-demo-card"><div className="ai-demo-head"><span className="ai-preview-icon"><Sparkles size={18} /></span><span><strong>AI Study Assistant</strong><small>Ready to help with your notes</small></span><span className="online-pill">Online</span></div><div className="ai-message user-message">Summarize the key ideas from this Data Structures note.</div><div className="ai-message bot-message"><span className="ai-preview-icon"><Sparkles size={15} /></span><span>Here are the 5 ideas worth remembering: tree traversal, balanced trees, insertion cost, deletion cases, and practical use cases.</span></div><div className="ai-demo-input">Ask about a note… <ArrowRight size={16} /></div></div></section>
    <section className="landing-section how-section" id="how"><div className="section-intro"><span className="eyebrow dark">Simple by design</span><h2>Start with one useful contribution.</h2><p>Every shared note, answer, and helpful vote makes the next student’s path a little clearer.</p></div><div className="steps"><Step number="01" title="Join with your university email" text="Keep the space relevant and trusted for your university." /><Step number="02" title="Find or share a resource" text="Build your library from notes, slides, questions, and answers." /><Step number="03" title="Study smarter with AI" text="Use summaries, quizzes, and topic analysis when you need them." /></div></section>
    <footer className="landing-footer"><Logo /><span>Study better together. Share what works.</span><div><button onClick={() => go('/login')}>Sign in</button><button onClick={() => go('/register')}>Create account</button></div></footer>
  </main>;
}

function Feature({ icon: Icon, title, text, tone }: { icon: LucideIcon; title: string; text: string; tone: string }) { return <article className="feature-card"><span className={`feature-icon ${tone}`}><Icon size={22} /></span><h3>{title}</h3><p>{text}</p><ArrowRight size={17} /></article>; }
function Step({ number, title, text }: { number: string; title: string; text: string }) { return <article className="step"><span>{number}</span><div><h3>{title}</h3><p>{text}</p></div></article>; }
function ShieldMini() { return <span className="shield-mini">✓</span>; }

function AuthPage({ mode, onLogin, go }: { mode: 'login' | 'register'; onLogin: (user: User) => void; go: (path: string) => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault(); setError(''); setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/auth/${mode}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password, name }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message ?? 'Unable to sign in');
      onLogin(data.user);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Unable to sign in');
    } finally { setLoading(false); }
  };

  return <main className="auth-shell">
    <section className="auth-story"><Logo /><div className="story-copy"><span className="eyebrow"><Sparkles size={15} /> Student-powered knowledge</span><h1>Study better together.<br /><span>Share what works.</span></h1><p>Keep useful notes, answers, and AI study help in one trusted university space.</p><div className="story-points"><span><Check size={16} /> University-verified community</span><span><Check size={16} /> Resources shared by students</span><span><Check size={16} /> AI summaries and quizzes</span></div></div><p className="story-footer">Give the next student a better starting point.</p></section>
    <section className="auth-panel"><div className="auth-topline">{mode === 'login' ? <>New to NoteBridge? <button onClick={() => go('/register')}>Create an account</button></> : <>Already have an account? <button onClick={() => go('/login')}>Sign in</button></>}</div><div className="auth-card"><div className="auth-heading"><div className="auth-icon"><BookOpen size={24} /></div><h2>{mode === 'login' ? 'Welcome back' : 'Join NoteBridge'}</h2><p>{mode === 'login' ? 'Sign in to continue to your student space.' : 'Create your verified student account.'}</p></div><form onSubmit={submit} className="auth-form">
      {mode === 'register' && <label>Name<input value={name} onChange={(event) => setName(event.target.value)} placeholder="Your full name" required /></label>}
      <label>University email<div className="input-wrap"><span>@</span><input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@university.edu" required /></div></label>
      <label>Password<div className="input-wrap"><span>••</span><input type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Enter your password" minLength={8} required /></div></label>
      {mode === 'login' && <div className="form-options"><label className="check-label"><input type="checkbox" /> Remember me</label><button type="button" className="text-button">Forgot password?</button></div>}
      {error && <div className="error-message">{error}</div>}
      <button className="primary-button" disabled={loading}>{loading ? 'Please wait…' : mode === 'login' ? 'Sign in' : 'Create account'} <ArrowRight size={17} /></button>
    </form><div className="auth-divider"><span>or</span></div><button className="verify-button"><Users size={17} /> Continue with university verification</button><p className="auth-note">Only verified university students can join NoteBridge.</p></div><p className="auth-legal">Your university email keeps the community trusted.<br />Privacy · Help · Terms</p></section>
  </main>;
}

function Dashboard({ user, onLogout, go }: { user: User | null; onLogout: () => void; go: (path: string) => void }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [saved, setSaved] = useState<string[]>([]);
  const displayName = user?.name?.split(' ')[0] ?? 'Nirjhar';
  return <div className="app-shell"><aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}><div className="sidebar-head"><Logo /><button className="icon-only mobile-close" onClick={() => setSidebarOpen(false)}><X size={21} /></button></div><div className="space-label">STUDENT SPACE</div><nav>{navItems.map(({ label, icon: Icon, badge, count }, index) => <button className={`nav-item ${index === 0 ? 'active' : ''}`} key={label} onClick={() => { if (label === 'Share a resource') go('/share'); setSidebarOpen(false); }}><Icon size={19} /><span>{label}</span>{badge && <b>{badge}</b>}{count && <em>{count}</em>}</button>)}</nav><div className="contribution"><div className="contribution-title"><span className="small-icon purple"><Star size={16} /></span><span><strong>Knowledge sharer</strong><small>Level 4 contributor</small></span></div><div className="progress"><span /></div><small>620 / 1,000 XP</small><div className="contribution-stats"><span><strong>12</strong>Shared</span><span><strong>18</strong>Answers</span><span><strong>56</strong>Helpful votes</span></div></div><div className="profile"><span className="avatar">NS</span><span><strong>{user?.name ?? 'Guest student'}</strong><small>{user ? 'CSE · Batch 21' : 'Explore as guest'}</small></span><button className="icon-only" onClick={user ? onLogout : () => go('/login')} aria-label={user ? 'Sign out' : 'Sign in'}>{user ? <LogOut size={17} /> : <ArrowRight size={17} />}</button></div></aside><div className="main"><header className="topbar"><button className="icon-only mobile-menu" onClick={() => setSidebarOpen(true)}><Menu size={22} /></button><span className="top-context">Student workspace</span><div className="global-search"><Search size={18} /><span>Search notes, courses, topics...</span><kbd>⌘ K</kbd></div><button className="notification"><span><BellIcon /></span><i>3</i></button>{user ? <div className="top-user"><span className="avatar">NS</span><span><strong>{displayName}</strong><small>Student account</small></span><ChevronDown size={16} /></div> : <button className="sign-in-link" onClick={() => go('/login')}>Sign in <ArrowRight size={15} /></button>}</header><main className="dashboard-content"><section className="welcome-row"><div><p className="eyebrow dark"><Sparkles size={15} /> Student-powered learning space</p><h1>Welcome back, {displayName}!</h1><p>Share what you know, find what you need, and study smarter with AI.</p></div><button className="primary-button compact" onClick={() => go('/share')}><Upload size={17} /> Share a resource <ArrowRight size={16} /></button></section><section className="stat-grid"><Stat icon={Upload} tone="blue" label="Resources shared" value="24" note="+4 this month" /><Stat icon={Bookmark} tone="green" label="Saved resources" value="18" note="5 new updates" /><Stat icon={MessageCircle} tone="purple" label="Answers posted" value="7" note="2 best answers" /><Stat icon={Star} tone="orange" label="Contribution points" value="620" note="Level 4" /></section><div className="dashboard-grid"><ResourceActivity saved={saved} setSaved={setSaved} /><AiAssistant go={go} /><CourseExplore /><Community /></div></main></div></div>;
}

function BellIcon() { return <span className="bell-dot"><span /></span>; }
function Stat({ icon: Icon, tone, label, value, note }: { icon: typeof Upload; tone: string; label: string; value: string; note: string }) { return <article className="stat-card"><span className={`stat-icon ${tone}`}><Icon size={21} /></span><div><span>{label}</span><strong>{value}</strong><small className={tone}>{note}</small></div></article>; }
function ResourceActivity({ saved, setSaved }: { saved: string[]; setSaved: (value: string[]) => void }) { return <section className="panel resource-panel"><PanelHeader title="Recent resource activity" action="View library" /><span className="panel-kicker">LATEST CONTRIBUTIONS <small>Updated today</small></span>{resources.map((resource) => <article className="resource-row" key={resource.title}><span className={`file-icon ${resource.color}`}>{resource.type}</span><div><strong>{resource.title}</strong><small>{resource.course} · {resource.meta}</small></div><span className={`tag ${resource.color}`}>{resource.rating === 'Guide' ? 'Guide' : resource.rating === '4.9' ? 'New upload' : 'Popular'}</span><button className={`icon-only save-button ${saved.includes(resource.title) ? 'saved' : ''}`} aria-label="Save resource" onClick={() => setSaved(saved.includes(resource.title) ? saved.filter((item) => item !== resource.title) : [...saved, resource.title])}><Bookmark size={17} /></button></article>)}</section>; }
const aiTools: { title: string; text: string; icon: LucideIcon; color: string }[] = [['Summarize a note', 'Key ideas in seconds', BookOpen, 'green'], ['Generate an AI quiz', 'Test your understanding', Sparkles, 'purple'], ['Analyze past questions', 'Find frequent topics', TrendingUp, 'orange']].map(([title, text, icon, color]) => ({ title: String(title), text: String(text), icon: icon as LucideIcon, color: String(color) }));
function AiAssistant({ go }: { go: (path: string) => void }) { return <section className="panel ai-panel"><PanelHeader title="AI Study Assistant" action="Open AI tools" purple /><div className="ai-hero"><span className="ai-orb"><Sparkles size={22} /></span><div><strong>Study smarter with AI</strong><small>Turn shared notes into useful study help.</small></div></div><span className="panel-kicker">QUICK TOOLS</span>{aiTools.map(({ title, text, icon: Icon, color }) => <button className="ai-tool" key={title} onClick={() => go('/ai')}><span className={`tool-icon ${color}`}><Icon size={17} /></span><span><strong>{title}</strong><small>{text}</small></span><ArrowRight size={16} /></button>)}</section>; }
function CourseExplore() { return <section className="panel course-panel"><PanelHeader title="Explore by course" action="Browse all courses" /><span className="panel-kicker">YOUR ACTIVE COURSES</span><div className="course-grid">{[['DB', 'Data Structures', '42 resources · 8 new', 'purple'], ['OOP', 'Object Oriented', '36 resources · 3 new', 'blue'], ['AI', 'Introduction to AI', '28 resources · 5 new', 'green']].map(([initials, title, meta, color]) => <button className="course-card" key={title}><span className={`course-icon ${color}`}>{initials}</span><span><strong>{title}</strong><small>{meta}</small></span><ArrowRight size={16} /></button>)}</div><div className="community-count"><Users size={17} /> 2,486 students sharing knowledge</div></section>; }
function Community() { return <section className="panel community-panel"><PanelHeader title="Community questions" action="View all" purple />{[['How do AVL rotations work?', '4 answers · 12 helpful votes', 'blue'], ['Best resources for OOP lab?', '7 answers · 9 helpful votes', 'purple'], ['Which topics repeat in exams?', '3 answers · 6 helpful votes', 'green']].map(([title, meta, color]) => <article className="question-row" key={title}><span className={`question-icon ${color}`}><MessageCircle size={17} /></span><div><strong>{title}</strong><small>{meta}</small></div></article>)}<button className="outline-button">Ask a new question <ArrowRight size={15} /></button></section>; }
function PanelHeader({ title, action, purple = false }: { title: string; action: string; purple?: boolean }) { return <div className="panel-header"><h2>{title}</h2><button className={purple ? 'purple-link' : 'blue-link'}>{action} <ArrowRight size={14} /></button></div>; }

export default App;
