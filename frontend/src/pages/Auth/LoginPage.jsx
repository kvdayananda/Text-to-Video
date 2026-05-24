import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { login } from '../../api/authApi';
import './AuthPages.css';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000';

export default function LoginPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await login({ email: form.email, password: form.password });
      if (res?.access_token) {
        localStorage.setItem('vf_token', res.access_token);
        navigate('/dashboard');
      } else {
        setError(res?.detail || res?.message || 'Login failed.');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleOAuth = provider => {
    window.location.href = `${API_BASE}/api/auth/oauth/${provider}`;
  };

  return (
    <div className="auth-page">
      <div className="auth-bg-orb auth-orb-1" />
      <div className="auth-bg-orb auth-orb-2" />

      <div className="auth-card glass-panel">
        <Link to="/" className="auth-logo" id="auth-logo">
          <div className="auth-logo-icon">⚡</div>
          VisionForge<span className="logo-ai"> AI</span>
        </Link>

        <h1 className="auth-title">Welcome back</h1>
        <p className="auth-sub">Sign in to your account to continue creating.</p>

        {error && <div className="auth-error" id="login-error">{error}</div>}

        <form className="auth-form" onSubmit={handleSubmit} id="login-form">
          <div className="form-group">
            <label htmlFor="login-email">Email address</label>
            <input
              id="login-email"
              type="email"
              name="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange}
              autoComplete="email"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="login-password">
              Password
              <Link to="/forgot-password" className="forgot-link" id="forgot-password-link">Forgot password?</Link>
            </label>
            <input
              id="login-password"
              type="password"
              name="password"
              placeholder="••••••••"
              value={form.password}
              onChange={handleChange}
              autoComplete="current-password"
              required
            />
          </div>

          <button type="submit" className="btn-primary auth-submit" id="login-submit-btn" disabled={loading}>
            {loading ? <span className="auth-spinner" /> : null}
            {loading ? 'Signing in...' : 'Sign In →'}
          </button>
        </form>

        <div className="auth-divider"><span>or continue with</span></div>

        <div className="oauth-buttons">
          <button className="oauth-btn" id="google-login-btn" type="button" onClick={() => handleOAuth('google')}>
            <span>🔵</span> Google
          </button>
          <button className="oauth-btn" id="github-login-btn" type="button" onClick={() => handleOAuth('github')}>
            <span>⬛</span> GitHub
          </button>
        </div>

        <p className="auth-switch">
          Don't have an account?{' '}
          <Link to="/register" id="go-register-link">Create one free →</Link>
        </p>
      </div>
    </div>
  );
}
