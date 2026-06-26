import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { login, getSetupStatus } from '../lib/api';
import { useAuth } from '../context/useAuth';
import BackButton from '../components/BackButton';

export default function Login() {
  const navigate = useNavigate();
  const auth = useAuth();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const resp = await getSetupStatus();
        if (resp?.setupEnabled) {
          navigate('/setup');
        }
      } catch (err) {
        // ignore
      }
    })();
  }, []);

  async function onSubmit(e) {
    e.preventDefault();
    setError('');
    if (!identifier || !password) return setError('Both identifier and password are required');
    setLoading(true);
    try {
      const res = await login(identifier, password);
      const data = res?.data || {};
      auth.loginWithSession(data);
      if (data?.mustChangePassword) {
        navigate('/change-password');
      } else {
        navigate('/');
      }
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen hero-shell shift-bg flex items-center justify-center px-4 py-10">
      <div className="container mx-auto max-w-7xl">
        <div className="grid gap-6 lg:grid-cols-[0.92fr_1.08fr] items-stretch">
          <aside className="hero-panel p-8 sm:p-10 lg:p-12 relative overflow-hidden">
            <div className="floating-orb w-32 h-32 -top-6 -left-6" />
            <div className="floating-orb w-24 h-24 bottom-4 right-8" style={{ animationDelay: '1.4s' }} />

            <BackButton onClick={() => navigate('/')} className="mb-8" />

            <div className="hero-badge mb-6">
              <span className="badge-dot" />
              Secure access
            </div>
            <h1 className="hero-title text-5xl sm:text-6xl lg:text-7xl">
              Login to your OKR workspace
            </h1>
            <p className="hero-copy mt-6">
              Enter your username (or email) and password to access the workspace.
            </p>
          </aside>

          <section className="hero-panel p-6 sm:p-8 lg:p-10 flex flex-col justify-center">
            <div className="max-w-xl mx-auto w-full">
              <div className="mb-6 flex items-center justify-between gap-4">
                <div>
                  <p className="metric-label">Authentication</p>
                  <h2 className="mt-2 text-3xl font-bold text-white">Welcome Back</h2>
                </div>
                <span className="info-pill">Sign in</span>
              </div>

              {error && <div className="mb-4 rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">{error}</div>}

              <form onSubmit={onSubmit} className="space-y-5 mt-6">
                <div>
                  <label className="block text-sm font-semibold text-(--text) mb-2">Username or Email</label>
                  <input
                    type="text"
                    className="w-full rounded-2xl px-4 py-3 border border-white/10 bg-white/3 outline-none focus:border-cyan-400/40"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="user id or email"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-(--text) mb-2">Password</label>
                  <input
                    type="password"
                    className="w-full rounded-2xl px-4 py-3 border border-white/10 bg-white/3 outline-none focus:border-cyan-400/40"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                  />
                </div>

                <div className="flex flex-col gap-3">
                  <button onMouseDown={(e) => e.preventDefault()} disabled={loading} type="submit" className="hero-primary w-full">
                    {loading ? 'Signing in...' : 'Enter password'}
                  </button>
                  <Link to="/forgot-password" className="text-center text-sm text-cyan-200 hover:underline">Forgot password?</Link>
                </div>
              </form>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
