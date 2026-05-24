import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { register } from '../../api/authApi';
import './AuthPages.css';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', terms: false });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = e => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm({ ...form, [e.target.name]: value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.terms) {
      setError('Please accept the Terms of Service to continue.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await register({ name: form.name, email: form.email, password: form.password });
      if (res?.access_token) {
        localStorage.setItem('vf_token', res.access_token);
        navigate('/dashboard');
      } else {
        setError(res?.detail || res?.message || 'Registration failed.');
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
        <Link to="/" className="auth-logo" id="auth-logo-register">
          <div className="auth-logo-icon">⚡</div>
          VisionForge<span className="logo-ai"> AI</span>
        </Link>

        <h1 className="auth-title">Create your account</h1>
        <p className="auth-sub">Start with 5 free AI videos — no credit card required.</p>

        {error && <div className="auth-error" id="register-error">{error}</div>}

        <form className="auth-form" onSubmit={handleSubmit} id="register-form">
          <div className="form-group">
            <label htmlFor="register-name">Full Name</label>
            <input
              id="register-name"
              type="text"
              name="name"
              placeholder="John Creator"
              value={form.name}
              onChange={handleChange}
              autoComplete="name"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="register-email">Email address</label>
            <input
              id="register-email"
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
            <label htmlFor="register-password">Password</label>
            <input
              id="register-password"
              type="password"
              name="password"
              placeholder="Min. 8 characters"
              value={form.password}
              onChange={handleChange}
              autoComplete="new-password"
              minLength={8}
              required
            />
          </div>

          <label className="terms-label" htmlFor="register-terms">
            <input
              id="register-terms"
              type="checkbox"
              name="terms"
              checked={form.terms}
              onChange={handleChange}
            />
            <span>
              I agree to the{' '}
              <Link to="/terms" id="terms-link">Terms of Service</Link>
              {' '}and{' '}
              <Link to="/privacy" id="privacy-link">Privacy Policy</Link>
            </span>
          </label>

          <button type="submit" className="btn-primary auth-submit" id="register-submit-btn" disabled={loading}>
            {loading ? <span className="auth-spinner" /> : null}
            {loading ? 'Creating account...' : 'Create Free Account →'}
          </button>
        </form>

        <div className="auth-divider"><span>or sign up with</span></div>

        <div className="oauth-buttons">
          <button className="oauth-btn" id="google-register-btn" type="button" onClick={() => handleOAuth('google')}>
            <span>🔵</span> Google
          </button>
          <button className="oauth-btn" id="github-register-btn" type="button" onClick={() => handleOAuth('github')}>
            <span>⬛</span> GitHub
          </button>
        </div>

        <p className="auth-switch">
          Already have an account?{' '}
          <Link to="/login" id="go-login-link">Sign in →</Link>
        </p>
      </div>
    </div>
  );
}
