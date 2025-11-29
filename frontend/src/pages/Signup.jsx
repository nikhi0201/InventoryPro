import React, { useState } from 'react';
import API from '../utils/api';
import { saveToken, saveUser } from '../utils/auth'; // saveUser optional

export default function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  function validateEmail(e) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(e).toLowerCase());
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!email || !password || !confirm) {
      setError('Please fill all fields.');
      return;
    }
    if (!validateEmail(email)) {
      setError('Please enter a valid e-mail address.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const res = await API.post('/api/auth/register', { name: '', email, password });
      const token = res?.data?.token;
      const user = res?.data?.user || null;

      if (token) {
        saveToken(token);
        if (user && typeof saveUser === 'function') saveUser(user);
        setSuccess('Account created — redirecting...');
        setTimeout(() => (window.location.href = '/'), 900);
      } else {
        setSuccess('Account created. Please login.');
        setTimeout(() => (window.location.href = '/login'), 900);
      }
    } catch (err) {
      // prefer explicit server messages
      const serverMsg =
        err?.response?.data?.msg ||
        (err?.response?.data?.errors && err.response.data.errors[0]?.msg) ||
        err?.response?.data ||
        err.message ||
        'Signup failed. Try again.';
      setError(serverMsg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-beast-900 text-slate-100 px-4 py-12">
      <main className="w-full max-w-md flex items-center justify-center">
        <div className="signup-card animate-fade-in-up">
          <div className="text-center signup-block">
            <div className="mx-auto w-16 h-16 flex items-center justify-center rounded-full bg-white/6 mb-3">
              
            </div>
            <h1 className="text-2xl font-semibold tracking-wide">Create account</h1>
            <p className="text-sm text-slate-400 mt-1">Use your Gmail</p>
          </div>

          <form className="flex flex-col" onSubmit={handleSubmit} noValidate>
            {/* Email */}
            <div className="signup-block">
              <label className="text-sm text-slate-300 mb-2 block">E-mail</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@gmail.com"
                className="w-full p-3 rounded-md bg-transparent border border-white/15 placeholder-slate-400 text-slate-100 focus:ring-2 focus:ring-indigo-500 outline-none"
                required
                aria-label="email"
              />
              {!validateEmail(email) && email.length > 0 && (
                <div className="text-xs text-rose-400 mt-1">Invalid e-mail format</div>
              )}
            </div>

            {/* Set Password */}
            <div className="signup-block">
              <label className="text-sm text-slate-300 mb-2 block">Set password</label>
              <div className="password-wrapper relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="password-input w-full p-3 rounded-md bg-transparent border border-white/15 placeholder-slate-400 text-slate-100 focus:ring-2 focus:ring-indigo-500 outline-none"
                  required
                  aria-label="password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="password-toggle text-sm text-slate-300 hover:text-white"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
              {password.length > 0 && password.length < 6 && (
                <div className="text-xs text-rose-400 mt-1">Password too short</div>
              )}
            </div>

            {/* Confirm Password */}
            <div className="signup-block">
              <label className="text-sm text-slate-300 mb-2 block">Verify password</label>
              <div className="password-wrapper relative">
                <input
                  type={showConfirm ? 'text' : 'password'}
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  placeholder="Repeat password"
                  className="password-input w-full p-3 rounded-md bg-transparent border border-white/15 placeholder-slate-400 text-slate-100 focus:ring-2 focus:ring-indigo-500 outline-none"
                  required
                  aria-label="confirm password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((s) => !s)}
                  className="password-toggle text-sm text-slate-300 hover:text-white"
                  aria-label={showConfirm ? 'Hide confirm password' : 'Show confirm password'}
                >
                  {showConfirm ? 'Hide' : 'Show'}
                </button>
              </div>
              {confirm.length > 0 && password !== confirm && (
                <div className="text-xs text-rose-400 mt-1">Passwords do not match</div>
              )}
            </div>

            {/* Error / Success */}
            <div className="signup-block">
              {error && <div className="text-sm text-rose-400">{error}</div>}
              {success && <div className="text-sm text-emerald-400">{success}</div>}
            </div>

            {/* Create button */}
            <div className="signup-block">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-md bg-gradient-to-r from-indigo-600 to-sky-500 text-white font-semibold shadow disabled:opacity-60"
                aria-label="create account"
              >
                {loading ? 'Creating...' : 'Create account'}
              </button>
            </div>

            {/* small footer */}
            <div className="text-center text-sm text-slate-400">
              Already have an account? <a href="/login" className="text-indigo-300">Sign in</a>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
