import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  Mail, 
  ArrowRight, 
  Sparkles, 
  AlertCircle, 
  Eye, 
  EyeOff, 
  UserCheck, 
  ShieldAlert,
  CheckCircle2,
  Building2
} from 'lucide-react';
import { loginUser, loginDemo, DEMO_ACCOUNTS } from '../../services/authService';

export default function LoginPage({ onLoginSuccess, onNavigateToSignUp }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [selectedDemoRole, setSelectedDemoRole] = useState('analyst'); // 'analyst' | 'admin'

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    try {
      const user = await loginUser({ email, password, rememberMe });
      if (onLoginSuccess) onLoginSuccess(user);
    } catch (err) {
      setErrorMsg(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemoLogin = (role) => {
    setErrorMsg(null);
    setLoading(true);
    try {
      const user = loginDemo(role, rememberMe);
      if (onLoginSuccess) onLoginSuccess(user);
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fillDemoInputs = (role) => {
    setSelectedDemoRole(role);
    const demo = DEMO_ACCOUNTS[role];
    if (demo) {
      setEmail(demo.email);
      setPassword(demo.password);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#090d16] text-slate-100 relative overflow-hidden selection:bg-cyan-500 selection:text-white">
      
      {/* Dynamic Ambient Background Glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-md relative z-10 space-y-6">
        
        {/* Brand Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-600 to-blue-600 shadow-xl shadow-cyan-500/20 mb-1">
            <ShieldCheck className="w-8 h-8 text-white" />
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center justify-center gap-2">
            <span>PhishGuard</span>
            <span className="px-2 py-0.5 rounded-md text-xs font-bold bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              AI
            </span>
          </h1>

          <p className="text-xs sm:text-sm text-slate-400 max-w-sm mx-auto leading-relaxed">
            Intelligent phishing detection and security awareness platform
          </p>
        </div>

        {/* Login Card */}
        <div className="glass-panel p-6 sm:p-8 rounded-3xl space-y-6 shadow-2xl border border-slate-800/80 bg-slate-950/80 backdrop-blur-xl">
          
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Lock className="w-4 h-4 text-cyan-400" />
              <span>Sign In to SOC Console</span>
            </h2>
            <span className="text-[11px] font-mono text-slate-500">Enterprise Access</span>
          </div>

          {/* Error Banner */}
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-red-950/80 border border-red-500/60 text-red-200 text-xs flex items-center gap-2 animate-fadeIn">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Sign In Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Email Field */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300">
                Work Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold text-slate-300">
                  Password
                </label>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl pl-10 pr-10 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-400 select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded bg-slate-900 border-slate-700 text-cyan-600 focus:ring-0 w-3.5 h-3.5"
                />
                <span>Remember this device</span>
              </label>
            </div>

            {/* Sign In CTA */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2 transition active:scale-95 disabled:opacity-50"
            >
              <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Demo Account Quick Access Divider */}
          <div className="relative flex items-center justify-center">
            <div className="border-t border-slate-800 w-full"></div>
            <span className="bg-slate-950 px-3 text-[11px] font-mono text-cyan-400 uppercase tracking-wider shrink-0">
              Demo Access (Hackathon Evaluation)
            </span>
          </div>

          {/* Demo Credentials Quick Switcher */}
          <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5 text-cyan-400" />
                Select Demo Role:
              </span>
              <span className="text-[10px] text-slate-500 font-mono">One-Click Auto Login</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickDemoLogin('analyst')}
                className="p-2.5 rounded-xl border border-cyan-500/40 bg-cyan-950/40 hover:bg-cyan-900/50 text-left transition group"
              >
                <div className="text-xs font-bold text-cyan-300 group-hover:text-white flex items-center justify-between">
                  <span>Demo Analyst</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                </div>
                <div className="text-[10px] text-slate-400 truncate mt-0.5">
                  analyst@phishguard.demo
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemoLogin('admin')}
                className="p-2.5 rounded-xl border border-slate-700 bg-slate-900 hover:bg-slate-850 text-left transition group"
              >
                <div className="text-xs font-bold text-slate-200 group-hover:text-white flex items-center justify-between">
                  <span>Demo Admin</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
                </div>
                <div className="text-[10px] text-slate-400 truncate mt-0.5">
                  admin@phishguard.demo
                </div>
              </button>
            </div>

            <p className="text-[10px] text-slate-500 leading-relaxed italic">
              * Demo accounts are pre-configured for evaluation. Passwords: <code>Demo@12345</code> / <code>Admin@12345</code>.
            </p>
          </div>

          {/* Create Account Switcher */}
          <div className="pt-2 text-center">
            <span className="text-xs text-slate-400">Don't have an account yet? </span>
            <button
              type="button"
              onClick={onNavigateToSignUp}
              className="text-xs font-bold text-cyan-400 hover:text-cyan-300 hover:underline transition"
            >
              Create Account
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
