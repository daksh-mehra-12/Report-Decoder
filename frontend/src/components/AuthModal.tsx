import React, { useState } from 'react';
import { X, Shield, User, Stethoscope, Lock, Mail } from 'lucide-react';
import { ApiClient } from '../lib/api';
import { User as UserType } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: UserType) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<'patient' | 'doctor' | 'admin'>('patient');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleQuickDemoLogin = async (demoRole: 'patient' | 'doctor' | 'admin') => {
    setLoading(true);
    setError(null);
    try {
      const creds = {
        patient: { email: 'patient@lablens.com', pass: 'patient123' },
        doctor: { email: 'doctor@lablens.com', pass: 'doctor123' },
        admin: { email: 'admin@lablens.com', pass: 'admin123' },
      }[demoRole];

      const res = await ApiClient.login(creds.email, creds.pass);
      onSuccess(res.user);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Demo login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isRegister) {
        await ApiClient.register({
          email,
          password,
          full_name: fullName,
          role,
        });
      }
      const res = await ApiClient.login(email, password);
      onSuccess(res.user);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md bg-navy-900 border border-white/10 rounded-2xl shadow-2xl p-6 overflow-hidden">
        {/* Glow backdrop */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div>
            <h3 className="text-lg font-bold text-white">
              {isRegister ? 'Create Account' : 'Authenticate Identity'}
            </h3>
            <p className="text-xs text-slate-400">LabLens Role-Based Access Control</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Demo Switcher */}
        <div className="mt-4 p-3 bg-navy-950/60 rounded-xl border border-white/5">
          <div className="text-[11px] font-semibold text-cyan-400 uppercase tracking-wider mb-2">
            ⚡ Quick Demo Accounts
          </div>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => handleQuickDemoLogin('patient')}
              disabled={loading}
              className="flex flex-col items-center p-2 rounded-lg bg-navy-800 hover:bg-navy-700 border border-white/5 text-center transition-all group"
            >
              <User className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform mb-1" />
              <span className="text-xs font-semibold text-white">Patient</span>
              <span className="text-[9px] text-slate-400">Aarav S.</span>
            </button>
            <button
              onClick={() => handleQuickDemoLogin('doctor')}
              disabled={loading}
              className="flex flex-col items-center p-2 rounded-lg bg-navy-800 hover:bg-navy-700 border border-white/5 text-center transition-all group"
            >
              <Stethoscope className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform mb-1" />
              <span className="text-xs font-semibold text-white">Doctor</span>
              <span className="text-[9px] text-slate-400">Dr. Priya</span>
            </button>
            <button
              onClick={() => handleQuickDemoLogin('admin')}
              disabled={loading}
              className="flex flex-col items-center p-2 rounded-lg bg-navy-800 hover:bg-navy-700 border border-white/5 text-center transition-all group"
            >
              <Shield className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform mb-1" />
              <span className="text-xs font-semibold text-white">Admin</span>
              <span className="text-[9px] text-slate-400">Ops Only</span>
            </button>
          </div>
        </div>

        <div className="relative my-4 flex items-center justify-center">
          <div className="border-t border-white/10 w-full" />
          <span className="absolute bg-navy-900 px-3 text-[11px] text-slate-500 uppercase tracking-wider">
            or sign in manually
          </span>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {isRegister && (
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Full Name</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. John Doe"
                className="w-full bg-navy-950 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@domain.com"
                className="w-full bg-navy-950 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-navy-950 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          {isRegister && (
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Select Role</label>
              <select
                value={role}
                onChange={(e: any) => setRole(e.target.value)}
                className="w-full bg-navy-950 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
              >
                <option value="patient">Patient (Manage & Verify Reports)</option>
                <option value="doctor">Doctor (View Explicitly Shared Reports)</option>
                <option value="admin">Admin (System Operations Only)</option>
              </select>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 text-navy-950 font-bold text-sm hover:shadow-glow-cyan transition-all disabled:opacity-50 mt-2"
          >
            {loading ? 'Authenticating...' : isRegister ? 'Register' : 'Sign In'}
          </button>
        </form>

        <div className="mt-4 text-center">
          <button
            onClick={() => setIsRegister(!isRegister)}
            className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors"
          >
            {isRegister ? 'Already have an account? Sign In' : "Don't have an account? Register"}
          </button>
        </div>
      </div>
    </div>
  );
};
