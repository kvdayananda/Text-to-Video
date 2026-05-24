import { useState } from 'react';
import { Link } from 'react-router-dom';
import './ForgotPasswordPage.css';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = e => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
    }, 2000);
  };

  return (
    <div className="auth-container">
      <div className="auth-card glass-panel">
        {/* Brand */}
        <div className="auth-brand">
          <span className="ab-logo-icon">⚡</span>
          <h2>VisionForge<span className="logo-ai-small"> AI</span></h2>
        </div>

        {!success ? (
          <form onSubmit={handleSubmit} className="auth-form" id="forgot-password-form">
            <h1>Reset Password</h1>
            <p className="auth-subtitle">Enter your email and we'll send you instructions to reset your password.</p>

            <div className="form-group">
              <label htmlFor="fp-email">Email Address</label>
              <input
                id="fp-email"
                type="email"
                required
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="auth-input"
              />
            </div>

            <button
              type="submit"
              className={`btn-primary auth-submit-btn ${loading ? 'loading' : ''}`}
              id="fp-submit-btn"
              disabled={loading}
            >
              {loading ? (
                <><span className="auth-spinner" />Sending Link…</>
              ) : (
                'Send Recovery Link'
              )}
            </button>

            <div className="auth-footer">
              Remember your password? <Link to="/login" id="back-to-login">Sign In</Link>
            </div>
          </form>
        ) : (
          <div className="auth-success" id="fp-success-panel">
            <div className="as-icon">✉️</div>
            <h1>Check Your Email</h1>
            <p>We've sent a password recovery link to:</p>
            <div className="recovery-email-box">{email}</div>
            <p className="as-hint">Please check your inbox and spam folders. The recovery link will expire in 1 hour.</p>
            <Link to="/login" className="btn-secondary as-btn" id="fp-login-btn">
              Back to Sign In
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
