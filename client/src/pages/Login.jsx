import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  LogIn, UserPlus, Eye, EyeOff, Zap, Users, TrendingUp,
  CheckCircle2, BarChart3, Calendar, Award, ArrowRight, Building2
} from 'lucide-react';
import ParticleBackground from '../components/ParticleBackground';

/* ── Static data ── */
const features = [
  { icon: BarChart3, label: 'AI Resume Analysis',   desc: 'Smart scoring & instant feedback'     },
  { icon: Calendar,  label: 'Bulk Scheduling',       desc: 'Interview slots at scale'              },
  { icon: TrendingUp,label: 'Live Leaderboard',      desc: 'Real-time placement rankings'         },
  { icon: Building2, label: 'Company Integrations',  desc: '8+ top recruiters connected'          },
];

const stats = [
  { value: '87+',  label: 'Students Placed' },
  { value: '92%',  label: 'Success Rate'    },
  { value: '8',    label: 'Companies'       },
];

/* ── Floating notification card ── */
const FloatingCard = ({ icon: Icon, title, subtitle, accent, style }) => (
  <div
    className="absolute flex items-center gap-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl px-4 py-3 shadow-2xl"
    style={style}
  >
    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white ${accent}`}>
      <Icon size={14} />
    </div>
    <div className="min-w-0">
      <p className="text-white text-xs font-semibold truncate">{title}</p>
      <p className="text-white/60 text-[10px] truncate">{subtitle}</p>
    </div>
  </div>
);

/* ══════════════════════════════════════════════════════════════ */
const Login = () => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [showPassword, setShowPassword]   = useState(false);
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', rollNumber: '', branch: '', batch: '', role: 'student',
  });
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);
  const { login, register } = useAuth();

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const result = isRegistering
      ? await register(formData)
      : await login(formData.email, formData.password, formData.role);
    if (!result.success) setError(result.message);
    setLoading(false);
  };

  const switchMode = (reg) => { setIsRegistering(reg); setError(''); };

  /* ── shared input style ── */
  const inputCls =
    'w-full px-4 py-3 rounded-xl border border-slate-200 bg-white/80 text-slate-800 ' +
    'placeholder:text-slate-400 text-sm outline-none login-input transition-all duration-300';

  return (
    <div className="login-page min-h-screen flex overflow-hidden">
      {/* ═══════════════════════════════════════
          LEFT — HERO
      ═══════════════════════════════════════ */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden flex-col justify-between p-12"
           style={{ background: 'linear-gradient(135deg, #000000 0%, #3b0764 45%, #1e3a8a 100%)' }}>

        {/* Animated gradient overlay */}
        <div className="login-gradient-bg absolute inset-0 pointer-events-none" />

        {/* Grid pattern */}
        <div className="login-grid absolute inset-0 pointer-events-none opacity-[0.06]" />

        {/* Floating notification cards */}
        <FloatingCard
          icon={Award}
          title="AI Resume Score"
          subtitle="Priya Sharma · 95/100 · Top 5%"
          accent="bg-purple-500"
          style={{ top: '18%', right: '-1rem', animation: 'floatCard 4s ease-in-out infinite' }}
        />
        <FloatingCard
          icon={CheckCircle2}
          title="Offer Received"
          subtitle="Arjun Kumar · TCS · 6 LPA"
          accent="bg-emerald-500"
          style={{ bottom: '22%', right: '-1rem', animation: 'floatCard 4s ease-in-out infinite 2s' }}
        />

        {/* ── Logo ── */}
        <div className="relative z-10 login-fade-up" style={{ animationDelay: '0ms' }}>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg">
              <Zap size={20} className="text-white" />
            </div>
            <span className="text-white text-xl font-black tracking-tight">PlaceMate</span>
          </div>
          <span className="inline-block text-xs font-semibold text-violet-300 border border-violet-500/40 rounded-full px-3 py-1 mt-1">
            AI-Powered Placement Portal
          </span>
        </div>

        {/* ── Headline ── */}
        <div className="relative z-10 flex-1 flex flex-col justify-center py-8">
          <h1 className="text-4xl xl:text-5xl font-black text-white leading-tight mb-4 login-fade-up"
              style={{ animationDelay: '100ms' }}>
            Get <span className="login-gradient-text">Placement Ready</span><br />in Record Time
          </h1>
          <p className="text-slate-300 text-base leading-relaxed mb-8 max-w-sm login-fade-up"
             style={{ animationDelay: '220ms' }}>
            Manage drives, schedule interviews, analyze resumes with AI, and track every
            student's placement journey — all in one place.
          </p>

          {/* Features list */}
          <ul className="space-y-4">
            {features.map(({ icon: Icon, label, desc }, i) => (
              <li key={label}
                  className="flex items-center gap-3 login-fade-up"
                  style={{ animationDelay: `${320 + i * 90}ms` }}>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-white/10 border border-white/15 flex-shrink-0">
                  <Icon size={16} className="text-violet-300" />
                </div>
                <div>
                  <span className="text-white text-sm font-semibold">{label}</span>
                  <span className="text-slate-400 text-xs ml-2">{desc}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* ── Stats ── */}
        <div className="relative z-10">
          <div className="flex gap-8 login-scale-in" style={{ animationDelay: '700ms' }}>
            {stats.map(({ value, label }) => (
              <div key={label}>
                <p className="text-3xl font-black login-gradient-text">{value}</p>
                <p className="text-slate-400 text-xs mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════
          RIGHT — FORM
      ═══════════════════════════════════════ */}
      <div className="login-right-panel w-full lg:w-1/2 flex items-center justify-center relative">
        <ParticleBackground />

        {/* ── EFFECT 2: Orbit 1 — top-right ── */}
        <div className="rp-orbit" style={{
          width: 120, height: 120,
          top: '10%', right: '8%',
          border: '1px solid rgba(124,58,237,0.12)',
        }}>
          <div className="rp-orbit-dot" style={{
            width: 8, height: 8,
            background: '#7C3AED',
            opacity: 0.7,
            '--orbit-r': '60px',
            animationDuration: '8s',
          }} />
        </div>

        {/* ── EFFECT 2: Orbit 2 — bottom-left ── */}
        <div className="rp-orbit" style={{
          width: 160, height: 160,
          bottom: '8%', left: '6%',
          border: '1px solid rgba(99,102,241,0.10)',
        }}>
          <div className="rp-orbit-dot" style={{
            width: 6, height: 6,
            background: '#4F46E5',
            opacity: 0.6,
            '--orbit-r': '80px',
            animationDuration: '12s',
            animationDirection: 'reverse',
          }} />
        </div>

        {/* ── EFFECT 3: Neon accent lines ── */}
        <div className="rp-neon-line" style={{
          width: 80, height: 2,
          background: 'linear-gradient(90deg, transparent, rgba(124,58,237,0.35), transparent)',
          top: '14%', left: '6%',
          animationDuration: '3s',
        }} />
        <div className="rp-neon-line" style={{
          width: 50, height: 2,
          background: 'linear-gradient(90deg, transparent, rgba(99,102,241,0.28), transparent)',
          bottom: '24%', right: '7%',
          animationDuration: '4s',
          animationDelay: '1s',
        }} />
        <div className="rp-neon-line" style={{
          width: 2, height: 70,
          background: 'linear-gradient(180deg, transparent, rgba(124,58,237,0.28), transparent)',
          top: '38%', right: '11%',
          animationDuration: '3.5s',
          animationDelay: '0.5s',
        }} />
        <div className="rp-neon-line" style={{
          width: 40, height: 1,
          background: 'linear-gradient(90deg, transparent, rgba(192,132,252,0.25), transparent)',
          top: '65%', left: '10%',
          animationDuration: '5s',
          animationDelay: '2s',
        }} />
        <div className="rp-neon-line" style={{
          width: 2, height: 45,
          background: 'linear-gradient(180deg, transparent, rgba(99,102,241,0.2), transparent)',
          bottom: '40%', left: '14%',
          animationDuration: '4s',
          animationDelay: '1.5s',
        }} />

        {/* ── EFFECT 4: Ripple burst circles ── */}
        <div className="rp-ripple" style={{
          width: 40, height: 40,
          top: '18%', left: '14%',
          animationDelay: '0s',
        }} />
        <div className="rp-ripple" style={{
          width: 40, height: 40,
          bottom: '28%', right: '14%',
          animationDelay: '2s',
        }} />
        <div className="rp-ripple" style={{
          width: 30, height: 30,
          top: '55%', left: '8%',
          animationDelay: '1s',
        }} />
        <div className="rp-ripple" style={{
          width: 30, height: 30,
          top: '35%', right: '6%',
          animationDelay: '3s',
        }} />

        {/* ── Corner bracket — top-right ── */}
        <div className="rp-corner rp-corner-h" style={{ width: 50, top: 16, right: 16, animationDelay: '0s' }} />
        <div className="rp-corner rp-corner-v" style={{ height: 50, top: 16, right: 16, animationDelay: '0s' }} />

        {/* ── Corner bracket — bottom-left ── */}
        <div className="rp-corner rp-corner-h" style={{ width: 50, bottom: 16, left: 16, animationDelay: '0.3s' }} />
        <div className="rp-corner rp-corner-v" style={{ height: 50, bottom: 16, left: 16, animationDelay: '0.3s' }} />

        <div className="w-full max-w-md login-form-anim relative z-10 py-10 px-6 sm:px-10">

          {/* Header */}
          <div className="mb-8">
            {/* Mobile logo */}
            <div className="flex items-center gap-2 mb-6 lg:hidden">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
                <Zap size={16} className="text-white" />
              </div>
              <span className="text-slate-800 text-lg font-black">PlaceMate</span>
            </div>
            <h2 className="text-3xl font-black text-slate-900 mb-1">
              {isRegistering ? 'Create Account' : 'Welcome back'}
            </h2>
            <p className="text-slate-500 text-sm">
              {isRegistering ? 'Register as a new student' : 'Sign in to your placement portal'}
            </p>
          </div>

          {/* Role pills (login only) */}
          {!isRegistering && (
            <div className="grid grid-cols-2 gap-3 mb-7">
              {[
                { role: 'student', icon: Users, title: 'Student', sub: 'View your profile' },
                { role: 'admin',   icon: Award, title: 'Admin',   sub: 'Manage placements' },
              ].map(({ role, icon: Icon, title, sub }) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => setFormData(f => ({ ...f, role }))}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 text-left transition-all duration-200 ${
                    formData.role === role
                      ? 'border-violet-500 bg-violet-50 shadow-sm'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    formData.role === role ? 'bg-violet-100' : 'bg-slate-100'
                  }`}>
                    <Icon size={15} className={formData.role === role ? 'text-violet-600' : 'text-slate-500'} />
                  </div>
                  <div>
                    <p className={`text-sm font-semibold ${formData.role === role ? 'text-violet-700' : 'text-slate-700'}`}>{title}</p>
                    <p className="text-[11px] text-slate-400">{sub}</p>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Error banner */}
          {error && (
            <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 mb-5 text-sm">
              <span className="mt-0.5">⚠</span>
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegistering && (
              <>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">Full Name</label>
                  <input type="text" name="name" value={formData.name} onChange={handleChange}
                    required className={inputCls} placeholder="John Doe" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">Roll Number</label>
                    <input type="text" name="rollNumber" value={formData.rollNumber} onChange={handleChange}
                      required className={inputCls} placeholder="CSE2024001" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">Branch</label>
                    <select name="branch" value={formData.branch} onChange={handleChange}
                      required className={inputCls + ' bg-white'}>
                      <option value="">Select</option>
                      {['CSE','ECE','ME','CE','EEE','IT'].map(b => (
                        <option key={b} value={b}>{b}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">Batch Year</label>
                  <input type="text" name="batch" value={formData.batch} onChange={handleChange}
                    required className={inputCls} placeholder="2024" />
                </div>
              </>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">Email Address</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange}
                required className={inputCls} placeholder="name@university.edu" autoComplete="email" />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider">Password</label>
                {!isRegistering && (
                  <button type="button" className="text-xs text-violet-600 hover:underline font-medium">
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  minLength={6}
                  className={inputCls + ' pr-11'}
                  placeholder="••••••••"
                  autoComplete={isRegistering ? 'new-password' : 'current-password'}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(s => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors"
                >
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="login-btn w-full mt-2 flex items-center justify-center gap-2 text-white font-bold py-3.5 rounded-xl text-sm transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              ) : isRegistering ? (
                <><UserPlus size={17} /> Create Account</>
              ) : (
                <><LogIn size={17} /> Sign In <ArrowRight size={15} /></>
              )}
            </button>
          </form>

          {/* Switch mode */}
          <p className="text-center text-sm text-slate-500 mt-7">
            {isRegistering ? "Already have an account? " : "Don't have an account? "}
            <button
              type="button"
              onClick={() => switchMode(!isRegistering)}
              className="text-violet-600 font-bold hover:underline focus:outline-none"
            >
              {isRegistering ? 'Sign In' : 'Register here'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
