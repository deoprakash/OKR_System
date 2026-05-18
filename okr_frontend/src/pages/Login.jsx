import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { requestOtp, verifyOtp } from '../lib/api';
import { useAuth } from '../context/useAuth';
import BackButton from '../components/BackButton';

const OTP_RESEND_SECONDS = 60;

export default function Login() {
  const navigate = useNavigate();
  const auth = useAuth();
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState('request');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [requestLoading, setRequestLoading] = useState(false);
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [otpExpiresAt, setOtpExpiresAt] = useState(0);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    if (step !== 'verify' || !otpExpiresAt) return undefined;

    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, [step, otpExpiresAt]);

  const otpExpired = step === 'verify' && otpExpiresAt > 0 && now >= otpExpiresAt;
  const secondsLeft = useMemo(() => {
    if (!otpExpiresAt) return 0;
    return Math.max(0, Math.ceil((otpExpiresAt - now) / 1000));
  }, [otpExpiresAt, now]);

  const requestOtpFlow = async (targetEmail) => {
    const res = await requestOtp(targetEmail);
    const data = res?.data || {};
    const expiresInSeconds = Math.min(
      OTP_RESEND_SECONDS,
      Math.max(1, Number(data.expiresInSeconds || OTP_RESEND_SECONDS))
    );
    setOtp('');
    setOtpExpiresAt(Date.now() + expiresInSeconds * 1000);
    setNow(Date.now());
    setStep('verify');
    return data;
  };

  const resendOtp = async () => {
    setResendLoading(true);
    setError('');
    setMessage('');
    try {
      const data = await requestOtpFlow(email);
      setMessage(`OTP resent to ${data?.email || email || '-'}.`);
    } catch (err) {
      setError(err.message || 'Failed to resend OTP');
    } finally {
      setResendLoading(false);
    }
  };

  async function onRequestOtp(e) {
    e.preventDefault();
    setRequestLoading(true);
    setError('');
    setMessage('');
    try {
      const data = await requestOtpFlow(email);
      setMessage(`OTP sent to ${data?.email || email || '-'}.`);
    } catch (err) {
      setError(err.message || 'Failed to request OTP');
    } finally {
      setRequestLoading(false);
    }
  }

  async function onVerifyOtp(e) {
    e.preventDefault();
    if (otpExpired) {
      setError('OTP expired.');
      return;
    }

    setVerifyLoading(true);
    setError('');
    try {
      const res = await verifyOtp(email, otp);
      auth.loginWithSession(res?.data || {});
      navigate('/');
    } catch (err) {
      setError(err.message || 'OTP verification failed');
    } finally {
      setVerifyLoading(false);
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
              Enter your registered email, receive a one-time password, and continue into a focused workspace for planning,
              tracking, and reviewing objectives.
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {[
                ['OTP verification', 'Fast, secure access with expiring codes.'],
                ['Role-based access', 'Jump into the right OKR level instantly.'],
                ['Performance insights', 'Review progress and alignment after login.'],
                ['Modern UI', 'A clean, professional command surface.'],
              ].map(([title, text]) => (
                <div key={title} className="glass-card p-4">
                  <div className="text-white font-semibold">{title}</div>
                  <p className="mt-2 text-sm leading-7">{text}</p>
                </div>
              ))}
            </div>
          </aside>

          <section className="hero-panel p-6 sm:p-8 lg:p-10 flex flex-col justify-center">
            <div className="max-w-xl mx-auto w-full">
              <div className="mb-6 flex items-center justify-between gap-4">
                <div>
                  <p className="metric-label">Authentication</p>
                  <h2 className="mt-2 text-3xl font-bold text-white">{step === 'request' ? 'Request OTP' : 'Verify OTP'}</h2>
                </div>
                <span className="info-pill">{step === 'request' ? 'Step 1 of 2' : 'Step 2 of 2'}</span>
              </div>

              {message && <div className="mb-4 rounded-2xl border border-cyan-400/20 bg-cyan-400/10 px-4 py-3 text-sm text-cyan-100">{message}</div>}
              {error && <div className="mb-4 rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">{error}</div>}

              {step === 'request' ? (
                <form onSubmit={onRequestOtp} className="space-y-5 mt-6">
                  <div>
                    <label className="block text-sm font-semibold text-(--text) mb-2">Employee Email</label>
                    <input
                      type="email"
                      className="w-full rounded-2xl px-4 py-3 border border-white/10 bg-white/3 outline-none focus:border-cyan-400/40"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      autoComplete="email"
                      placeholder="name@company.com"
                      required
                    />
                  </div>

                  <button disabled={requestLoading} type="submit" className="hero-primary w-full">
                    {requestLoading ? 'Sending OTP...' : 'Send OTP'}
                  </button>
                </form>
              ) : (
                <form onSubmit={onVerifyOtp} className="space-y-5 mt-6">
                  <div>
                    <label className="block text-sm font-semibold text-(--text) mb-2">Enter OTP</label>
                    <input
                      type="text"
                      maxLength={6}
                      className="w-full rounded-2xl px-4 py-3 border border-white/10 bg-white/3 outline-none focus:border-cyan-400/40 tracking-[0.4em] text-center text-lg"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      placeholder="••••••"
                      required
                    />
                    {otpExpiresAt > 0 && !otpExpired && (
                      <p className="mt-2 text-xs text-(--muted)">Resend available in {secondsLeft}s</p>
                    )}
                    {otpExpired && <p className="mt-2 text-xs text-red-300 font-medium">OTP expired. Request a new code.</p>}
                  </div>

                  <div className="grid gap-3">
                    <button disabled={verifyLoading || otpExpired} className="hero-primary w-full">
                      {verifyLoading ? 'Verifying...' : 'Verify OTP'}
                    </button>
                    {otpExpired && (
                      <button type="button" disabled={resendLoading} onClick={resendOtp} className="hero-secondary w-full">
                        {resendLoading ? 'Resending...' : 'Resend OTP'}
                      </button>
                    )}
                    <button
                      type="button"
                      className="btn btn-ghost w-full"
                      onClick={() => {
                        setStep('request');
                        setOtp('');
                        setError('');
                        setOtpExpiresAt(0);
                        setNow(Date.now());
                      }}
                    >
                      Back
                    </button>
                  </div>
                </form>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
