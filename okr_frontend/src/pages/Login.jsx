import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login, getSetupStatus } from '../lib/api';
import { useAuth } from '../context/useAuth';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

export default function Login() {
  const navigate = useNavigate();
  const auth = useAuth();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const resp = await getSetupStatus();
        if (resp?.setupEnabled) navigate('/setup');
      } catch { }
    })();
  }, []);

  async function onSubmit(e) {
    e.preventDefault();
    setError('');
    if (!identifier || !password) return setError('Please enter your username and password.');
    setLoading(true);
    try {
      const res = await login(identifier, password);
      const data = res?.data || {};
      auth.loginWithSession(data);
      if (data?.mustChangePassword) navigate('/change-password');
      else navigate('/');
    } catch (err) {
      setError(err.message || 'Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex bg-surface-base">
      {/* Left panel — branding */}
      <div className="hidden lg:flex lg:w-[45%] xl:w-1/2 relative bg-gradient-to-br from-neutral-900 via-neutral-800 to-brand-primary overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-16 left-16 w-64 h-64 rounded-full bg-white blur-3xl" />
          <div className="absolute bottom-16 right-16 w-48 h-48 rounded-full bg-brand-accent blur-3xl opacity-60" />
        </div>

        <div className="relative flex flex-col justify-between p-12 w-full">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-white/10 backdrop-blur border border-white/20 text-white font-bold text-base">
              O
            </div>
            <span className="font-bold text-white text-lg tracking-tight">Objecto™</span>
          </div>

          {/* Headline */}
          <div>
            <h1 className="text-4xl font-bold text-white leading-tight mb-4">
              Align your team.<br />
              Hit every goal.
            </h1>
            <p className="text-white/60 text-base leading-relaxed mb-8 max-w-sm">
              The enterprise OKR platform trusted by leading organizations to connect strategy to execution.
            </p>

            {/* Testimonial */}
            <div className="bg-white/8 backdrop-blur border border-white/10 rounded-2xl p-5">
              <p className="text-white/80 text-sm leading-relaxed italic mb-4">
                "Objecto transformed how we track strategic goals across all 7 levels of our organization."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-primary to-brand-accent flex items-center justify-center text-white font-bold text-xs">
                  S
                </div>
                <div>
                  <p className="text-white text-sm font-semibold">Sarah Chen</p>
                  <p className="text-white/50 text-xs">VP Strategy, TechCorp</p>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom stats */}
          <div className="grid grid-cols-3 gap-4">
            {[{ v: '10K+', l: 'Users' }, { v: '99.9%', l: 'Uptime' }, { v: '7', l: 'Org levels' }].map(s => (
              <div key={s.l} className="text-center">
                <div className="text-2xl font-bold text-white">{s.v}</div>
                <div className="text-xs text-white/50 mt-0.5">{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-sm"
        >
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-brand-primary to-brand-accent text-white font-bold text-sm">
              O
            </div>
            <span className="font-bold text-neutral-900 text-base">Objecto™</span>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-neutral-900 mb-2">Welcome back</h2>
            <p className="text-neutral-500 text-sm">Sign in to access your OKR workspace.</p>
          </div>

          {error && (
            <div className="flex items-start gap-3 p-4 mb-6 bg-danger-light border border-danger-border rounded-xl text-sm text-danger-text">
              <svg className="w-4 h-4 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {error}
            </div>
          )}

          <form onSubmit={onSubmit} className="space-y-4">
            <Input
              label="Username or Email"
              type="text"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="Enter your username or email"
              required
            />

            <div className="relative">
              <Input
                label="Password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
              />
              <button
                type="button"
                className="absolute right-3 bottom-2.5 text-neutral-400 hover:text-neutral-600 transition-colors"
                onClick={() => setShowPassword(v => !v)}
                tabIndex={-1}
              >
                {showPassword ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>

            <div className="flex justify-end">
              <Link to="/forgot-password" className="text-xs text-brand-primary font-medium hover:underline">
                Forgot password?
              </Link>
            </div>

            <Button type="submit" variant="primary" size="lg" className="w-full mt-2" loading={loading}>
              {loading ? 'Signing in...' : 'Sign in'}
            </Button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
