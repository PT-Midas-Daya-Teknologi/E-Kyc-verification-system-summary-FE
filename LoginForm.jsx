import React, { useState } from 'react';
import { ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import { applyAccessTokenToClient, authenticate, getApiErrorMessage } from './services/api.js';
import { clearSession, extractAccessToken, setSession } from './services/authStorage.js';
export default function LoginForm({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    clearSession();
    try {
      const response = await authenticate(username, password);
      const accessToken = extractAccessToken(response);
      if (!response?.success || !accessToken) {
        setError('Invalid username or password');
        return;
      }
      const user = { username, email: username };
      setSession({ accessToken, user });
      applyAccessTokenToClient();
      onLogin?.(user);
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-sky-50 to-blue-200 px-4 py-4 overflow-auto">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, type: 'spring', bounce: 0.25 }}
        className="w-full max-w-[480px] bg-white/70 backdrop-blur-lg rounded-3xl border border-sky-100 shadow-2xl p-6 flex flex-col items-center gap-6"
      >
        <div className="flex items-center gap-2 bg-white/80 border border-sky-200 text-sky-700 text-xs font-semibold px-3 py-1.5 rounded-full uppercase tracking-wide shadow-sm">
          <ShieldCheck size={15} className="animate-pulse" />
          Dashboard Login
        </div>

        <motion.div
          initial={{ rotate: -10 }}
          animate={{ rotate: 0 }}
          transition={{ duration: 0.7, type: 'spring', bounce: 0.4 }}
          className="w-16 h-16 rounded-full bg-gradient-to-br from-sky-500 to-blue-700 flex items-center justify-center shadow-lg border-4 border-white/60"
        >
          <ShieldCheck size={34} className="text-white drop-shadow-lg" />
        </motion.div>

        <div className="text-center space-y-2">
          <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">Sign in to Dashboard</h1>
          <p className="text-slate-500 text-base leading-relaxed font-medium">
            Enter your credentials to access the dashboard.
          </p>
        </div>

        <form className="w-full space-y-5" onSubmit={handleSubmit} autoComplete="off">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1" htmlFor="username">
              Email
            </label>
            <input
              id="username"
              name="username"
              type="text"
              autoComplete="username"
              required
              className="w-full px-4 py-2.5 border border-sky-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-400 bg-white/80 text-slate-800 font-medium shadow-sm placeholder:text-slate-400"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="admin@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              className="w-full px-4 py-2.5 border border-sky-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-400 bg-white/80 text-slate-800 font-medium shadow-sm placeholder:text-slate-400"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
            />
          </div>
          {error && <div className="text-red-500 text-sm text-center font-semibold">{error}</div>}
          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 text-white font-bold text-base shadow-lg hover:from-sky-600 hover:to-blue-700 focus:ring-2 focus:ring-offset-2 focus:ring-sky-400 active:scale-95 transition-all duration-200"
            disabled={loading}
          >
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        <p className="text-xs text-slate-400 text-center mt-2">
          Secured by Dashboard · Internal Use Only
        </p>
      </motion.div>
    </div>
  );
}
