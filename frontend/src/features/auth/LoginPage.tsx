import React, { useState } from 'react';
import {
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { ApiClient } from '../../lib/api';
import { User as UserType } from '../../types';
import logoImg from '../../assets/lablens_logo.png';
import loginBg from '../../assets/login_bg.jpg';

interface LoginPageProps {
  onSuccess: (user: UserType) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onSuccess }) => {
  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Forgot / Reset state
  const [forgotStep, setForgotStep] = useState<1 | 2>(1);
  const [recoveryToken, setRecoveryToken] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Quick Demo Login
  const handleDemoLogin = async () => {
    setLoading(true);
    setError(null);
    setSuccessMessage(null);
    try {
      const res = await ApiClient.login('patient@lablens.com', 'patient123');
      onSuccess(res.user);
    } catch (err: any) {
      setError(err.message || 'Demo authentication failed');
    } finally {
      setLoading(false);
    }
  };

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      if (mode === 'login') {
        const res = await ApiClient.login(email.trim(), password);
        onSuccess(res.user);
      } else if (mode === 'register') {
        if (!fullName.trim()) {
          throw new Error('Please enter your full name');
        }
        await ApiClient.register({
          email: email.trim(),
          password,
          full_name: fullName.trim(),
          role: 'patient',
        });
        const res = await ApiClient.login(email.trim(), password);
        onSuccess(res.user);
      } else if (mode === 'forgot') {
        if (forgotStep === 1) {
          const res = await ApiClient.forgotPassword(email.trim());
          setSuccessMessage(res.message);
          if (res.recovery_token) {
            setRecoveryToken(res.recovery_token);
            setForgotStep(2);
          }
        } else {
          const res = await ApiClient.resetPassword(email.trim(), newPassword, recoveryToken);
          setSuccessMessage(res.message);
          setTimeout(() => {
            setMode('login');
            setPassword(newPassword);
            setForgotStep(1);
          }, 1500);
        }
      }
    } catch (err: any) {
      setError(err.message || 'Authentication request failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col justify-center items-center overflow-hidden">
      {/* ===== FULLSCREEN WALLPAPER BACKGROUND ===== */}
      <div
        className="absolute inset-0 w-full h-full"
        style={{
          backgroundImage: `url(${loginBg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      />
      {/* Dark overlay for better text readability */}
      <div className="absolute inset-0 bg-[#040d1a]/40" />
      {/* Subtle vignette */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 50%, rgba(4,13,26,0.7) 100%)',
        }}
      />

      {/* ===== CENTERED CONTENT ===== */}
      <div className="relative z-10 w-full max-w-md px-4 py-8 flex flex-col items-center">
        {/* Logo Circle */}
        <div className="mb-4">
          <div
            className="w-28 h-28 rounded-full overflow-hidden flex items-center justify-center mx-auto"
            style={{
              border: '3px solid rgba(0,229,195,0.7)',
              boxShadow: '0 0 40px rgba(0,229,195,0.35), 0 0 80px rgba(0,229,195,0.15)',
              background: 'rgba(10,22,40,0.6)',
            }}
          >
            <img src={logoImg} alt="LabLens" className="w-full h-full object-cover" />
          </div>
        </div>

        {/* Title */}
        <h1
          className="text-center mb-1"
          style={{
            fontSize: '2.5rem',
            fontWeight: 800,
            letterSpacing: '-0.02em',
            color: '#ffffff',
            fontFamily: "'Inter', 'Segoe UI', sans-serif",
            textShadow: '0 2px 20px rgba(0,0,0,0.5)',
          }}
        >
          LabLens <span style={{ color: '#00e5c3' }}>X</span>
        </h1>

        {/* Subtitle */}
        <p
          className="text-center mb-8"
          style={{
            fontSize: '0.68rem',
            fontWeight: 700,
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            color: '#38bdf8',
            fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
            textShadow: '0 1px 8px rgba(0,0,0,0.4)',
          }}
        >
          EVIDENCE-BASED LABORATORY REPORT UNDERSTANDING
        </p>

        {/* ===== CARD ===== */}
        <div
          className="w-full rounded-2xl p-7 sm:p-8"
          style={{
            background: 'rgba(8,20,38,0.82)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(0,229,195,0.15)',
            boxShadow: '0 25px 60px rgba(0,0,0,0.6), 0 0 20px rgba(0,229,195,0.05)',
          }}
        >
          {/* Error Banner */}
          {error && (
            <div
              className="mb-5 p-3 rounded-xl flex items-start gap-2.5"
              style={{
                background: 'rgba(244,63,94,0.12)',
                border: '1px solid rgba(244,63,94,0.3)',
              }}
            >
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" style={{ color: '#fb7185' }} />
              <span style={{ color: '#fda4af', fontSize: '0.75rem' }}>{error}</span>
            </div>
          )}

          {/* Success Banner */}
          {successMessage && (
            <div
              className="mb-5 p-3 rounded-xl flex items-start gap-2.5"
              style={{
                background: 'rgba(0,229,195,0.12)',
                border: '1px solid rgba(0,229,195,0.3)',
              }}
            >
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" style={{ color: '#00e5c3' }} />
              <span style={{ color: '#a7f3d0', fontSize: '0.75rem' }}>{successMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Full Name (Register mode) */}
            {mode === 'register' && (
              <div>
                <label
                  htmlFor="full-name"
                  style={{
                    display: 'block',
                    fontSize: '0.68rem',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    letterSpacing: '0.12em',
                    color: '#38bdf8',
                    marginBottom: '0.4rem',
                  }}
                >
                  FULL NAME
                </label>
                <input
                  id="full-name"
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Aarav Sharma"
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    borderRadius: '0.5rem',
                    background: 'rgba(4,13,26,0.9)',
                    border: '1px solid rgba(14,42,71,0.8)',
                    color: '#ffffff',
                    fontSize: '0.875rem',
                    outline: 'none',
                    transition: 'border-color 0.2s',
                  }}
                  onFocus={(e) => (e.target.style.borderColor = '#00e5c3')}
                  onBlur={(e) => (e.target.style.borderColor = 'rgba(14,42,71,0.8)')}
                />
              </div>
            )}

            {/* Email */}
            {!(mode === 'forgot' && forgotStep === 2) && (
              <div>
                <label
                  htmlFor="auth-email"
                  style={{
                    display: 'block',
                    fontSize: '0.68rem',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    letterSpacing: '0.12em',
                    color: '#38bdf8',
                    marginBottom: '0.4rem',
                  }}
                >
                  EMAIL ADDRESS
                </label>
                <input
                  id="auth-email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="patient@lablens.com"
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    borderRadius: '0.5rem',
                    background: 'rgba(4,13,26,0.9)',
                    border: '1px solid rgba(14,42,71,0.8)',
                    color: '#ffffff',
                    fontSize: '0.875rem',
                    outline: 'none',
                    transition: 'border-color 0.2s',
                  }}
                  onFocus={(e) => (e.target.style.borderColor = '#00e5c3')}
                  onBlur={(e) => (e.target.style.borderColor = 'rgba(14,42,71,0.8)')}
                />
              </div>
            )}

            {/* Password */}
            {mode !== 'forgot' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                  <label
                    htmlFor="auth-password"
                    style={{
                      fontSize: '0.68rem',
                      fontWeight: 800,
                      textTransform: 'uppercase',
                      letterSpacing: '0.12em',
                      color: '#38bdf8',
                    }}
                  >
                    PASSWORD
                  </label>
                  {mode === 'login' && (
                    <button
                      type="button"
                      onClick={() => {
                        setMode('forgot');
                        setError(null);
                        setSuccessMessage(null);
                      }}
                      style={{
                        fontSize: '0.68rem',
                        color: 'rgba(56,189,248,0.7)',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        transition: 'color 0.2s',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = '#00e5c3')}
                      onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(56,189,248,0.7)')}
                    >
                      Forgot?
                    </button>
                  )}
                </div>
                <div style={{ position: 'relative' }}>
                  <input
                    id="auth-password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    style={{
                      width: '100%',
                      padding: '0.75rem 2.5rem 0.75rem 1rem',
                      borderRadius: '0.5rem',
                      background: 'rgba(4,13,26,0.9)',
                      border: '1px solid rgba(14,42,71,0.8)',
                      color: '#ffffff',
                      fontSize: '0.875rem',
                      outline: 'none',
                      transition: 'border-color 0.2s',
                    }}
                    onFocus={(e) => (e.target.style.borderColor = '#00e5c3')}
                    onBlur={(e) => (e.target.style.borderColor = 'rgba(14,42,71,0.8)')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute',
                      right: '0.75rem',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      color: '#64748b',
                      cursor: 'pointer',
                      padding: '4px',
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}

            {/* Forgot Password Step 2 */}
            {mode === 'forgot' && forgotStep === 2 && (
              <>
                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '0.68rem',
                      fontWeight: 800,
                      textTransform: 'uppercase',
                      letterSpacing: '0.12em',
                      color: '#38bdf8',
                      marginBottom: '0.4rem',
                    }}
                  >
                    RECOVERY TOKEN
                  </label>
                  <input
                    type="text"
                    required
                    value={recoveryToken}
                    onChange={(e) => setRecoveryToken(e.target.value)}
                    placeholder="Enter recovery token"
                    style={{
                      width: '100%',
                      padding: '0.75rem 1rem',
                      borderRadius: '0.5rem',
                      background: 'rgba(4,13,26,0.9)',
                      border: '1px solid rgba(14,42,71,0.8)',
                      color: '#ffffff',
                      fontSize: '0.875rem',
                      outline: 'none',
                    }}
                  />
                </div>
                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '0.68rem',
                      fontWeight: 800,
                      textTransform: 'uppercase',
                      letterSpacing: '0.12em',
                      color: '#38bdf8',
                      marginBottom: '0.4rem',
                    }}
                  >
                    NEW PASSWORD
                  </label>
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="New password"
                    style={{
                      width: '100%',
                      padding: '0.75rem 1rem',
                      borderRadius: '0.5rem',
                      background: 'rgba(4,13,26,0.9)',
                      border: '1px solid rgba(14,42,71,0.8)',
                      color: '#ffffff',
                      fontSize: '0.875rem',
                      outline: 'none',
                    }}
                  />
                </div>
              </>
            )}

            {/* ===== SIGN IN BUTTON ===== */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '0.8rem 1.5rem',
                borderRadius: '0.75rem',
                background: 'linear-gradient(135deg, #00b89c 0%, #00e5c3 40%, #22d3ee 100%)',
                color: '#040d1a',
                fontWeight: 800,
                fontSize: '0.875rem',
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                border: 'none',
                cursor: loading ? 'wait' : 'pointer',
                opacity: loading ? 0.6 : 1,
                transition: 'all 0.2s',
                boxShadow: '0 4px 25px rgba(0,229,195,0.35)',
                marginTop: '0.5rem',
              }}
              onMouseEnter={(e) => {
                if (!loading) e.currentTarget.style.boxShadow = '0 6px 35px rgba(0,229,195,0.5)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = '0 4px 25px rgba(0,229,195,0.35)';
              }}
            >
              {loading ? (
                <span
                  style={{
                    display: 'inline-block',
                    width: '1rem',
                    height: '1rem',
                    border: '2px solid #040d1a',
                    borderTop: '2px solid transparent',
                    borderRadius: '50%',
                    animation: 'spin 0.6s linear infinite',
                  }}
                />
              ) : (
                <span>
                  {mode === 'login'
                    ? 'SIGN IN'
                    : mode === 'register'
                    ? 'REGISTER'
                    : forgotStep === 1
                    ? 'RECOVER ACCOUNT'
                    : 'UPDATE PASSWORD'}
                </span>
              )}
            </button>
          </form>

          {/* Mode Switcher */}
          <div
            style={{
              marginTop: '1.5rem',
              paddingTop: '1rem',
              textAlign: 'center',
              fontSize: '0.8rem',
              color: '#94a3b8',
            }}
          >
            {mode === 'login' ? (
              <p>
                Need an account?{' '}
                <button
                  onClick={() => {
                    setMode('register');
                    setError(null);
                    setSuccessMessage(null);
                  }}
                  style={{
                    fontWeight: 700,
                    color: '#00e5c3',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    textDecoration: 'underline',
                    textUnderlineOffset: '3px',
                  }}
                >
                  Register here
                </button>
              </p>
            ) : (
              <p>
                Already have an account?{' '}
                <button
                  onClick={() => {
                    setMode('login');
                    setError(null);
                    setSuccessMessage(null);
                  }}
                  style={{
                    fontWeight: 700,
                    color: '#00e5c3',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    textDecoration: 'underline',
                    textUnderlineOffset: '3px',
                  }}
                >
                  Sign in here
                </button>
              </p>
            )}
          </div>
        </div>

        {/* Demo Quick Login */}
        <button
          onClick={handleDemoLogin}
          disabled={loading}
          style={{
            marginTop: '1.25rem',
            padding: '0.5rem 1.25rem',
            borderRadius: '2rem',
            background: 'rgba(0,229,195,0.08)',
            border: '1px solid rgba(0,229,195,0.25)',
            color: '#00e5c3',
            fontSize: '0.75rem',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.2s',
            letterSpacing: '0.05em',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(0,229,195,0.15)';
            e.currentTarget.style.borderColor = 'rgba(0,229,195,0.5)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(0,229,195,0.08)';
            e.currentTarget.style.borderColor = 'rgba(0,229,195,0.25)';
          }}
        >
          ⚡ Instant Demo Patient Access
        </button>
      </div>

      {/* Spin keyframe for loading spinner */}
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};
