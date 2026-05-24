import { useState } from 'react';
import { Link } from 'react-router-dom';
import './HomePage.css';

const features = [
  { icon: '🎬', title: 'AI Video Generation', desc: 'Transform any text prompt into a stunning, full-length video in minutes using cutting-edge generative AI.' },
  { icon: '🎙️', title: 'Neural Voiceover', desc: 'Choose from 500+ ultra-realistic AI voices across 50+ languages with custom emotion and tone control.' },
  { icon: '📝', title: 'AI Script Writer', desc: 'Generate viral hooks, compelling scripts, and CTA sequences optimized for YouTube, Reels, and TikTok.' },
  { icon: '🔍', title: 'SEO Automation', desc: 'Auto-generate titles, descriptions, tags, and hashtags that rank on YouTube and Instagram.' },
  { icon: '🛡️', title: 'Copyright Detection', desc: 'Scan your video for audio fingerprints and visual similarities before publishing — stay safe and claim-free.' },
  { icon: '🚀', title: 'Auto Publishing', desc: 'Schedule and publish directly to YouTube, Instagram, TikTok, and Facebook from one dashboard.' },
  { icon: '🖼️', title: 'Thumbnail Generator', desc: 'AI-designed thumbnails with viral templates, text overlays, and click-bait optimized layouts.' },
  { icon: '📊', title: 'Analytics Dashboard', desc: 'Track views, engagement, CTR, and watch time across all platforms in one unified analytics hub.' },
];

const steps = [
  { num: '01', title: 'Enter Your Prompt', desc: 'Type your idea, topic, or paste a script. Our AI understands context and intent.' },
  { num: '02', title: 'AI Generates Script', desc: 'GPT-powered engine writes a complete video script with hooks, body, and CTA.' },
  { num: '03', title: 'Video Renders', desc: 'Scenes are generated, voiceover added, subtitles synced — all fully automated.' },
  { num: '04', title: 'Publish Everywhere', desc: 'Push your video to all platforms simultaneously with SEO-optimized metadata.' },
];

const plans = [
  {
    name: 'Free', price: '$0', period: '/mo', highlight: false,
    features: ['5 AI videos/month', '720p resolution', 'Basic voiceovers', '3 platforms', 'Community support'],
    cta: 'Start Free',
  },
  {
    name: 'Pro', price: '$29', period: '/mo', highlight: true,
    features: ['100 AI videos/month', '4K resolution', '500+ AI voices', 'All platforms', 'SEO automation', 'Copyright scanner', 'Priority support'],
    cta: 'Get Pro',
  },
  {
    name: 'Enterprise', price: '$99', period: '/mo', highlight: false,
    features: ['Unlimited videos', '8K resolution', 'Custom avatars', 'White-label', 'API access', 'Team workspaces', 'Dedicated support'],
    cta: 'Contact Sales',
  },
];

const testimonials = [
  { name: 'Marcus R.', role: 'YouTube Creator · 2.1M subs', quote: 'VisionForge cut my video production time from 8 hours to 12 minutes. My channel grew 340% in 3 months.', avatar: '🎯' },
  { name: 'Priya S.', role: 'Digital Marketer', quote: 'The SEO automation alone is worth 10x the price. My videos now rank on page 1 within hours of publishing.', avatar: '📈' },
  { name: 'James L.', role: 'Agency Owner', quote: 'We produce 200+ videos per month for clients using VisionForge. The white-label feature is a game changer.', avatar: '🏆' },
];

const faqs = [
  { q: 'How long does video generation take?', a: 'Most videos are ready in 2–5 minutes depending on length. Our render queue is powered by distributed GPU clusters.' },
  { q: 'Can I use the videos commercially?', a: 'Yes! All generated content on Pro and Enterprise plans is fully licensed for commercial use.' },
  { q: 'Do you support non-English languages?', a: 'We support 50+ languages for voiceovers and subtitles, including Hindi, Spanish, French, Arabic, and more.' },
  { q: 'Is there a free trial?', a: 'Our Free plan gives you 5 videos per month forever — no credit card required.' },
  { q: 'How does the copyright scanner work?', a: 'We use audio fingerprinting and frame-level similarity analysis to detect potential copyright matches before you publish.' },
];

export default function HomePage() {
  const [openFaq, setOpenFaq] = useState(null);
  const [prompt, setPrompt] = useState('');

  return (
    <div className="home-page">
      {/* ── HERO ── */}
      <section className="hero-section" id="hero">
        <div className="hero-bg-orbs">
          <div className="orb orb-1" />
          <div className="orb orb-2" />
          <div className="orb orb-3" />
        </div>
        <div className="container hero-inner">
          <div className="hero-badge">✨ Powered by GPT-4 · Stable Diffusion · ElevenLabs</div>
          <h1 className="hero-headline">
            Turn Any Idea Into a<br />
            <span className="text-gradient">Viral AI Video</span><br />
            in Minutes
          </h1>
          <p className="hero-sub">
            The world's most powerful AI video platform. Generate scripts, voiceovers, subtitles, thumbnails, and publish to all social platforms — fully automated.
          </p>

          <div className="prompt-demo-bar">
            <span className="prompt-icon">🎬</span>
            <input
              className="prompt-demo-input"
              type="text"
              placeholder="e.g. &quot;Top 5 AI tools that will replace your job in 2025&quot;"
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              id="hero-prompt-input"
            />
            <Link to="/register" className="btn-primary prompt-btn" id="hero-generate-btn">
              Generate Free →
            </Link>
          </div>

          <div className="hero-stats">
            <div className="stat"><span className="stat-num">2.4M+</span><span className="stat-label">Videos Created</span></div>
            <div className="stat-divider" />
            <div className="stat"><span className="stat-num">180K+</span><span className="stat-label">Active Creators</span></div>
            <div className="stat-divider" />
            <div className="stat"><span className="stat-num">50+</span><span className="stat-label">Languages</span></div>
            <div className="stat-divider" />
            <div className="stat"><span className="stat-num">4.9★</span><span className="stat-label">Average Rating</span></div>
          </div>
        </div>

        <div className="hero-preview container">
          <div className="preview-window glass-panel">
            <div className="preview-topbar">
              <span className="dot red" /><span className="dot yellow" /><span className="dot green" />
              <span className="preview-url">visionforge.ai/dashboard</span>
            </div>
            <div className="preview-body">
              <div className="preview-sidebar">
                <div className="ps-item active">🏠 Dashboard</div>
                <div className="ps-item">🎬 Create Video</div>
                <div className="ps-item">📊 Analytics</div>
                <div className="ps-item">🚀 Publish</div>
                <div className="ps-item">⚙️ Settings</div>
              </div>
              <div className="preview-content">
                <div className="preview-card generating">
                  <div className="gen-progress">
                    <div className="gen-label">🤖 Generating: "Top AI Tools 2025"</div>
                    <div className="gen-bar"><div className="gen-fill" /></div>
                    <div className="gen-steps">
                      <span className="step done">✓ Script</span>
                      <span className="step done">✓ Scenes</span>
                      <span className="step active">⟳ Voiceover</span>
                      <span className="step">Subtitles</span>
                      <span className="step">Render</span>
                    </div>
                  </div>
                </div>
                <div className="preview-cards-row">
                  <div className="mini-card">
                    <div className="mini-thumb">🎥</div>
                    <div className="mini-info">
                      <div className="mini-title">10 Crypto Coins...</div>
                      <div className="mini-meta">142K views · 3 days ago</div>
                    </div>
                  </div>
                  <div className="mini-card">
                    <div className="mini-thumb">🌟</div>
                    <div className="mini-info">
                      <div className="mini-title">Future of Remote...</div>
                      <div className="mini-meta">89K views · 1 week ago</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── TRUSTED BY ── */}
      <section className="trusted-section">
        <div className="container">
          <p className="trusted-label">Trusted by creators at</p>
          <div className="trusted-logos">
            {['YouTube', 'Instagram', 'TikTok', 'Facebook', 'LinkedIn', 'Twitter/X'].map(p => (
              <div key={p} className="trusted-logo">{p}</div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="features-section" id="features">
        <div className="container">
          <div className="section-header">
            <div className="section-badge">🚀 Everything You Need</div>
            <h2>The Complete AI Video<br /><span className="text-gradient">Creation Suite</span></h2>
            <p>From idea to viral video — every tool you need in one powerful platform.</p>
          </div>
          <div className="features-grid">
            {features.map((f, i) => (
              <div className="feature-card glass-panel" key={i}>
                <div className="feature-icon-wrap">{f.icon}</div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="how-section" id="how-it-works">
        <div className="container">
          <div className="section-header">
            <div className="section-badge">⚡ Workflow</div>
            <h2>From Prompt to Published<br /><span className="text-gradient">in 4 Simple Steps</span></h2>
          </div>
          <div className="steps-grid">
            {steps.map((s, i) => (
              <div className="step-card" key={i}>
                <div className="step-number">{s.num}</div>
                <h3>{s.title}</h3>
                <p>{s.desc}</p>
                {i < steps.length - 1 && <div className="step-arrow">→</div>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section className="pricing-section" id="pricing">
        <div className="container">
          <div className="section-header">
            <div className="section-badge">💎 Simple Pricing</div>
            <h2>Start Free. Scale When<br /><span className="text-gradient">You're Ready</span></h2>
            <p>No hidden fees. Cancel anytime.</p>
          </div>
          <div className="pricing-grid">
            {plans.map((p, i) => (
              <div className={`pricing-card glass-panel ${p.highlight ? 'highlight' : ''}`} key={i}>
                {p.highlight && <div className="popular-badge">Most Popular</div>}
                <div className="plan-name">{p.name}</div>
                <div className="plan-price">
                  <span className="price-num">{p.price}</span>
                  <span className="price-per">{p.period}</span>
                </div>
                <ul className="plan-features">
                  {p.features.map((f, j) => (
                    <li key={j}><span className="check">✓</span>{f}</li>
                  ))}
                </ul>
                <Link
                  to={p.name === 'Enterprise' ? '/contact' : '/register'}
                  className={`plan-cta ${p.highlight ? 'btn-primary' : 'btn-secondary'}`}
                  id={`pricing-cta-${p.name.toLowerCase()}`}
                >
                  {p.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="testimonials-section">
        <div className="container">
          <div className="section-header">
            <div className="section-badge">💬 Testimonials</div>
            <h2>Loved by <span className="text-gradient">180,000+ Creators</span></h2>
          </div>
          <div className="testimonials-grid">
            {testimonials.map((t, i) => (
              <div className="testimonial-card glass-panel" key={i}>
                <div className="quote-icon">"</div>
                <p className="quote-text">{t.quote}</p>
                <div className="testimonial-author">
                  <div className="author-avatar">{t.avatar}</div>
                  <div>
                    <div className="author-name">{t.name}</div>
                    <div className="author-role">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="faq-section" id="faq">
        <div className="container">
          <div className="section-header">
            <div className="section-badge">❓ FAQ</div>
            <h2>Got Questions? <span className="text-gradient">We've Got Answers</span></h2>
          </div>
          <div className="faq-list">
            {faqs.map((f, i) => (
              <div
                className={`faq-item glass-panel ${openFaq === i ? 'open' : ''}`}
                key={i}
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                id={`faq-${i}`}
              >
                <div className="faq-q">
                  <span>{f.q}</span>
                  <span className="faq-arrow">{openFaq === i ? '▲' : '▼'}</span>
                </div>
                {openFaq === i && <div className="faq-a">{f.a}</div>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ── */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-card glass-panel">
            <div className="cta-orb" />
            <h2>Start Creating Viral Videos Today</h2>
            <p>Join 180,000+ creators already using VisionForge AI. Free plan available — no credit card required.</p>
            <div className="cta-actions">
              <Link to="/register" className="btn-primary" id="cta-start-btn">Start for Free →</Link>
              <Link to="/login" className="btn-secondary" id="cta-login-btn">Sign In</Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="footer">
        <div className="container">
          <div className="footer-top">
            <div className="footer-brand">
              <div className="nav-logo" style={{marginBottom:'12px'}}>
                <div className="logo-icon-wrap" style={{width:'32px',height:'32px',borderRadius:'8px',background:'linear-gradient(135deg,#00e5ff,#8a2be2)',display:'flex',alignItems:'center',justifyContent:'center'}}>⚡</div>
                <span style={{fontFamily:'Outfit',fontWeight:800,fontSize:'1.3rem'}}>VisionForge<span className="logo-ai"> AI</span></span>
              </div>
              <p>The world's most powerful AI video creation platform for content creators and businesses.</p>
            </div>
            <div className="footer-links-group">
              <h4>Product</h4>
              <ul>
                <li><Link to="/#features">Features</Link></li>
                <li><Link to="/pricing">Pricing</Link></li>
                <li><Link to="/templates">Templates</Link></li>
                <li><Link to="/changelog">Changelog</Link></li>
              </ul>
            </div>
            <div className="footer-links-group">
              <h4>Company</h4>
              <ul>
                <li><Link to="/about">About Us</Link></li>
                <li><Link to="/blog">Blog</Link></li>
                <li><Link to="/careers">Careers</Link></li>
                <li><Link to="/contact">Contact</Link></li>
              </ul>
            </div>
            <div className="footer-links-group">
              <h4>Legal</h4>
              <ul>
                <li><Link to="/privacy">Privacy Policy</Link></li>
                <li><Link to="/terms">Terms of Service</Link></li>
                <li><Link to="/dmca">DMCA Policy</Link></li>
                <li><Link to="/cookies">Cookie Policy</Link></li>
              </ul>
            </div>
          </div>
          <div className="footer-bottom">
            <span>© 2025 VisionForge AI. All rights reserved.</span>
            <div className="footer-socials">
              <a href="#" id="footer-twitter">𝕏</a>
              <a href="#" id="footer-instagram">📷</a>
              <a href="#" id="footer-youtube">▶</a>
              <a href="#" id="footer-linkedin">in</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
