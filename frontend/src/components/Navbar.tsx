import React from 'react';
import { ShieldCheck, Activity, FileText, TrendingUp, BookOpen, User, LogOut } from 'lucide-react';
import { User as UserType } from '../types';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  currentUser: UserType | null;
  onOpenAuth: () => void;
  onLogout: () => void;
  currentLang: string;
  setCurrentLang: (lang: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  currentUser,
  onOpenAuth,
  onLogout,
  currentLang,
  setCurrentLang,
}) => {
  return (
    <header className="sticky top-0 z-50 bg-navy-950/80 backdrop-blur-md border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <div
          className="flex items-center gap-3 cursor-pointer group"
          onClick={() => setCurrentTab('landing')}
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-teal-400 p-0.5 shadow-glow-cyan flex items-center justify-center transition-transform group-hover:scale-105">
            <div className="w-full h-full bg-navy-900 rounded-[10px] flex items-center justify-center">
              <Activity className="w-5 h-5 text-cyan-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-extrabold tracking-tight text-white font-mono">
                Lab<span className="text-cyan-400">Lens</span>
              </span>
              <span className="text-[10px] uppercase tracking-wider font-semibold px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                AAYU '26
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              Understand your report. Prepare for a better conversation.
            </p>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="hidden md:flex items-center gap-1 bg-navy-900/60 p-1 rounded-xl border border-white/5">
          <button
            onClick={() => setCurrentTab('landing')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              currentTab === 'landing'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            Home
          </button>
          <button
            onClick={() => setCurrentTab('dashboard')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              currentTab === 'dashboard' || currentTab === 'verification' || currentTab === 'results'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            Reports
          </button>
          <button
            onClick={() => setCurrentTab('trends')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              currentTab === 'trends'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            Cross-Lab Trends
          </button>
          <button
            onClick={() => setCurrentTab('knowledge')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              currentTab === 'knowledge'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            Medical Hub
          </button>
          {currentUser?.role === 'doctor' && (
            <button
              onClick={() => setCurrentTab('doctor')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                currentTab === 'doctor'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              Doctor Portal
            </button>
          )}
          {currentUser?.role === 'admin' && (
            <button
              onClick={() => setCurrentTab('admin')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                currentTab === 'admin'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              Admin Ops
            </button>
          )}
        </nav>

        {/* Right side controls: Language & Account */}
        <div className="flex items-center gap-3">
          {/* Language Selector */}
          <div className="flex items-center bg-navy-900 border border-white/10 rounded-lg p-0.5 text-xs font-medium">
            <button
              onClick={() => setCurrentLang('en')}
              className={`px-2 py-1 rounded transition-colors ${
                currentLang === 'en' ? 'bg-cyan-500/20 text-cyan-300' : 'text-slate-400 hover:text-white'
              }`}
            >
              EN
            </button>
            <button
              onClick={() => setCurrentLang('hi')}
              className={`px-2 py-1 rounded transition-colors ${
                currentLang === 'hi' ? 'bg-cyan-500/20 text-cyan-300' : 'text-slate-400 hover:text-white'
              }`}
            >
              हिंदी
            </button>
            <button
              onClick={() => setCurrentLang('hinglish')}
              className={`px-2 py-1 rounded transition-colors ${
                currentLang === 'hinglish' ? 'bg-cyan-500/20 text-cyan-300' : 'text-slate-400 hover:text-white'
              }`}
            >
              Hinglish
            </button>
          </div>

          {/* User profile / Auth button */}
          {currentUser ? (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 bg-navy-800 border border-white/10 px-3 py-1.5 rounded-xl">
                <div className="w-6 h-6 rounded-full bg-cyan-500/20 flex items-center justify-center text-cyan-300 text-xs font-bold">
                  {currentUser.full_name[0]}
                </div>
                <div className="text-left hidden lg:block">
                  <div className="text-xs font-semibold text-white leading-tight">{currentUser.full_name}</div>
                  <div className="text-[10px] text-cyan-400 capitalize">{currentUser.role}</div>
                </div>
              </div>
              <button
                onClick={onLogout}
                title="Log Out"
                className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-white/5 transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 text-navy-950 font-bold text-xs hover:shadow-glow-cyan transition-all"
            >
              <User className="w-3.5 h-3.5" />
              Sign In / Role
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
