import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Navbar.css';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isDashboard = location.pathname.startsWith('/dashboard') ||
    location.pathname.startsWith('/generator') ||
    location.pathname.startsWith('/settings') ||
    location.pathname.startsWith('/analytics') ||
    location.pathname.startsWith('/publish') ||
    location.pathname.startsWith('/templates');

  if (isDashboard) return null;

  return (
    <header className={`navbar-wrapper ${scrolled ? 'scrolled' : ''}`}>
      <nav className="navbar-inner container">
        <Link to="/" className="nav-logo" id="nav-logo">
          <div className="logo-icon-wrap">⚡</div>
          <span>VisionForge<span className="logo-ai"> AI</span></span>
        </Link>

        <ul className={`nav-links-list ${menuOpen ? 'open' : ''}`}>
          <li><Link to="/#features" onClick={() => setMenuOpen(false)}>Features</Link></li>
          <li><Link to="/pricing" onClick={() => setMenuOpen(false)}>Pricing</Link></li>
          <li><Link to="/about" onClick={() => setMenuOpen(false)}>About</Link></li>
          <li><Link to="/contact" onClick={() => setMenuOpen(false)}>Contact</Link></li>
        </ul>

        <div className="nav-actions">
          <Link to="/login" className="btn-ghost" id="nav-login-btn">Log In</Link>
          <Link to="/register" className="btn-primary btn-sm" id="nav-signup-btn">
            Get Started Free
          </Link>
        </div>

        <button
          className={`hamburger ${menuOpen ? 'active' : ''}`}
          onClick={() => setMenuOpen(!menuOpen)}
          id="hamburger-btn"
          aria-label="Toggle menu"
        >
          <span /><span /><span />
        </button>
      </nav>
    </header>
  );
}
