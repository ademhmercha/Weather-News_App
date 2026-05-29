import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export default function Auth() {
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError(''); setMessage(''); setLoading(true);
    try {
      if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate('/');
      } else {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setMessage('Check your email for the confirmation link.');
      }
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }

  return (
    <div className="min-h-screen bg-slate-950 flex">
      {/* Left panel */}
      <div className="hidden lg:flex flex-col justify-between w-[420px] flex-shrink-0 p-12 bg-gradient-to-b from-slate-900 to-slate-950 border-r border-white/[0.06]">
        <div>
          <div className="flex items-center gap-3 mb-16">
            <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 14 14" fill="none">
                <path d="M7 1C7 1 2 5.5 2 8.5a5 5 0 0 0 10 0C12 5.5 7 1 7 1Z" fill="white" />
              </svg>
            </div>
            <span className="text-slate-100 font-semibold text-base tracking-tight">WeatherNews</span>
          </div>
          <h2 className="text-3xl font-light text-slate-100 leading-snug mb-4">
            Live weather.<br />Local news.
          </h2>
          <p className="text-slate-500 text-sm leading-relaxed">
            Real-time forecasts and local news for any city in the world, all in one place.
          </p>
        </div>
        <div className="space-y-4">
          {['Open-Meteo weather data · Free', 'NewsAPI local headlines', 'Leaflet interactive maps', 'Supabase saved places'].map(f => (
            <div key={f} className="flex items-center gap-2.5">
              <div className="w-1 h-1 rounded-full bg-blue-500" />
              <span className="text-slate-500 text-xs">{f}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right: form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="flex items-center gap-2.5 mb-10 lg:hidden">
            <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 14 14" fill="none">
                <path d="M7 1C7 1 2 5.5 2 8.5a5 5 0 0 0 10 0C12 5.5 7 1 7 1Z" fill="white" />
              </svg>
            </div>
            <span className="text-slate-100 font-semibold text-base">WeatherNews</span>
          </div>

          <h1 className="text-xl font-semibold text-slate-100 mb-1">
            {mode === 'login' ? 'Welcome back' : 'Create account'}
          </h1>
          <p className="text-slate-500 text-sm mb-8">
            {mode === 'login' ? 'Sign in to your account to continue.' : 'Get started — it\'s free.'}
          </p>

          {error && (
            <div className="mb-5 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {error}
            </div>
          )}
          {message && (
            <div className="mb-5 px-4 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm">
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-2">Email</label>
              <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com" className="input-field" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-2">Password</label>
              <input type="password" required minLength={6} value={password} onChange={e => setPassword(e.target.value)}
                placeholder="••••••••" className="input-field" />
            </div>
            <button type="submit" disabled={loading} className="btn-primary mt-2">
              {loading
                ? <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-[2px] border-white/20 border-t-white rounded-full animate-spin" />
                    {mode === 'login' ? 'Signing in...' : 'Creating account...'}
                  </span>
                : mode === 'login' ? 'Sign in' : 'Create account'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
            <button onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(''); setMessage(''); }}
              className="text-blue-400 hover:text-blue-300 font-medium transition-colors">
              {mode === 'login' ? 'Sign up' : 'Sign in'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
