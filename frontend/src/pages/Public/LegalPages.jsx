import { useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import './LegalPages.css';

const sections = [
  { id: '/terms', label: 'Terms of Service' },
  { id: '/privacy', label: 'Privacy Policy' },
  { id: '/dmca', label: 'DMCA Policy' },
  { id: '/cookies', label: 'Cookie Policy' }
];

export default function LegalPages() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  const activeSection = pathname;

  return (
    <div className="legal-page container">
      <div className="legal-layout">
        {/* Navigation Sidebar */}
        <aside className="legal-sidebar glass-panel">
          <div className="legal-nav-title">Documents</div>
          <nav className="legal-nav">
            {sections.map(s => (
              <Link
                key={s.id}
                to={s.id}
                className={`legal-nav-item ${activeSection === s.id ? 'active' : ''}`}
                id={`legal-nav-${s.id.slice(1)}`}
              >
                {s.label}
              </Link>
            ))}
          </nav>
        </aside>

        {/* Content Panel */}
        <main className="legal-content glass-panel">
          {activeSection === '/terms' && (
            <article className="legal-article" id="terms-article">
              <h1>Terms of Service</h1>
              <p className="last-updated">Last Updated: May 20, 2026</p>
              <p>Welcome to VisionForge AI. These Terms of Service ("Terms") govern your access to and use of our website, services, APIs, and applications (collectively, the "Service"). Please read them carefully before using our platform.</p>

              <h2>1. Agreement to Terms</h2>
              <p>By registering for an account or using the Service, you agree to be bound by these Terms and our Privacy Policy. If you do not agree, you must not access or use the Service.</p>

              <h2>2. Account Registration & Credits</h2>
              <p>You must provide accurate and complete registration information. You are solely responsible for maintaining the confidentiality of your account credentials. The Service utilizes "AI Credits" for video renders. Credits are allocated based on your subscription plan and do not roll over to subsequent months unless specifically outlined in your plan tier.</p>

              <h2>3. Content Ownership & Licenses</h2>
              <p>You retain all intellectual property rights in the prompts, scripts, and original content you submit to the platform. By utilizing the platform, you grant VisionForge AI a limited, global license to process your assets solely for rendering, hosting, and optimizing your video files.</p>
              <p>All videos generated on Pro and Enterprise tiers are fully licensed for global commercial distribution. Videos exported on the Free tier remain subject to watermarking and are strictly for non-commercial, personal testing.</p>

              <h2>4. Acceptable Use Policy</h2>
              <p>You agree not to use the Service to generate, render, or distribute content that is illegal, defamatory, harmful, infringes on trademarks, or contains unauthorized explicit materials. Violation of this policy results in immediate account suspension without refund.</p>
            </article>
          )}

          {activeSection === '/privacy' && (
            <article className="legal-article" id="privacy-article">
              <h1>Privacy Policy</h1>
              <p className="last-updated">Last Updated: May 20, 2026</p>
              <p>VisionForge AI ("we", "us", or "our") values your privacy. This Privacy Policy details how we collect, store, share, and protect your information when using our platform.</p>

              <h2>1. Information We Collect</h2>
              <p><strong>Account Information:</strong> Display name, email address, profile photo, and password when creating an account.</p>
              <p><strong>Prompt Data & Media assets:</strong> The prompts, text configurations, and uploaded voice/image clips you submit to synthesize videos.</p>
              <p><strong>Payment Data:</strong> Secure billing tokens, card types, and transaction histories processed through Stripe or Razorpay. We do not store raw card numbers.</p>

              <h2>2. How We Use Information</h2>
              <p>We process your data to synthesize scripts, voices, subtitles, and render media files. We also utilize aggregated analytics to enhance compilation efficiency, troubleshoot GPU rendering errors, and send critical billing alerts.</p>

              <h2>3. Data Deletion & Retention</h2>
              <p>You can delete your account and all associated video files, subtitles, and audio assets at any time through the Settings page. Once requested, your personal data is permanently deleted from our active databases and CDN within 7 days.</p>
            </article>
          )}

          {activeSection === '/dmca' && (
            <article className="legal-article" id="dmca-article">
              <h1>DMCA Policy</h1>
              <p className="last-updated">Last Updated: May 20, 2026</p>
              <p>VisionForge AI respects copyright laws and intellectual property rights. If you believe your copyrighted material is being utilized on our site without authorization, please submit a formal DMCA claim.</p>

              <h2>1. Filing a Takedown Notice</h2>
              <p>Your notification must include: a physical signature of the copyright holder, clear description of the copyrighted work, exact URL/video link hosted on our platform, your address and contact details, and a statement made under penalty of perjury that the info is accurate.</p>

              <h2>2. Counter-Notifications</h2>
              <p>If you believe your generated video was mistakenly disabled or flagged by our scanner, you may file a Counter-Notification. We will forward this to the original claimant. If no legal action is filed within 10 business days, the video will be restored.</p>

              <h2>3. Contact Contact</h2>
              <p>All copyright notices should be emailed to: <strong>dmca@visionforge.ai</strong>.</p>
            </article>
          )}

          {activeSection === '/cookies' && (
            <article className="legal-article" id="cookies-article">
              <h1>Cookie Policy</h1>
              <p className="last-updated">Last Updated: May 20, 2026</p>
              <p>VisionForge AI uses cookies and tracking pixels to analyze traffic, manage user authentication sessions, and customize user dashboard preferences.</p>

              <h2>1. What are Cookies?</h2>
              <p>Cookies are small text files stored by your browser when visiting websites. They help the platform remember your login session and language selections.</p>

              <h2>2. Types of Cookies We Use</h2>
              <p><strong>Essential:</strong> Required for dashboard login, secure checkout, and CSRF protection.</p>
              <p><strong>Preference:</strong> Remembers your sidebar collapse status, active settings tab, and dark theme variables.</p>
              <p><strong>Analytics:</strong> Tracks feature clicks and render queues to balance our server loads.</p>

              <h2>3. Managing Preferences</h2>
              <p>You can toggle non-essential cookies via your browser settings or disable them, though some dashboard components may not load fully.</p>
            </article>
          )}
        </main>
      </div>
    </div>
  );
}
