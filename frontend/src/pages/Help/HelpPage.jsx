import { useState } from 'react';
import './HelpPage.css';

const categories = [
  { icon: '🚀', title: 'Getting Started', desc: 'Learn how to create your first video prompt and link platforms.' },
  { icon: '🎬', title: 'Rendering Engine', desc: 'Understanding video duration, quality tiers, and render queues.' },
  { icon: '💳', title: 'Billing & Account', desc: 'Manage your credits, upgrades, invoice histories, and payment types.' },
  { icon: '🔗', title: 'OAuth Connections', desc: 'Linking your YouTube and Instagram accounts securely.' }
];

const faqs = [
  { q: 'How long does a video render take?', a: 'Under normal server loads, short form videos (30s-60s) render in 90 seconds. Longer videos (3-5 mins) take about 3 minutes. Render speed is powered by distributed GPU clusters.' },
  { q: 'What is the refund policy on Pro subscriptions?', a: 'We offer a 7-day money-back guarantee for monthly tiers if your account has used fewer than 10 credits. For annual subscriptions, refund requests are reviewed within 48 hours.' },
  { q: 'Why is my connected channel disconnected?', a: 'Social networks require security refresh tokens to be re-authenticated every 60 days. Simply go to Settings > Connected Accounts and click "Re-connect" to fix this.' }
];

export default function HelpPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [openFaq, setOpenFaq] = useState(null);
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketMsg, setTicketMsg] = useState('');
  const [ticketLoading, setTicketLoading] = useState(false);
  const [ticketSuccess, setTicketSuccess] = useState(false);

  const handleTicketSubmit = e => {
    e.preventDefault();
    if (!ticketSubject || !ticketMsg) return;
    setTicketLoading(true);
    setTimeout(() => {
      setTicketLoading(false);
      setTicketSuccess(true);
    }, 2000);
  };

  const handleResetTicket = () => {
    setTicketSubject('');
    setTicketMsg('');
    setTicketSuccess(false);
  };

  return (
    <div className="help-page">
      {/* Search Header */}
      <div className="help-hero glass-panel">
        <h1>Help Center</h1>
        <p>Search articles or submit a technical ticket directly to our engineers.</p>
        <input
          type="search"
          placeholder="🔍  Type keywords: e.g. 'rendering', 'Stripe', 'Instagram'..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="help-search-bar"
          id="help-search-input"
        />
      </div>

      {/* Categories Cards */}
      <div className="help-categories-grid">
        {categories.map((c, i) => (
          <div className="help-cat-card glass-panel" key={i} id={`help-cat-${i}`}>
            <span className="hcat-icon">{c.icon}</span>
            <h3>{c.title}</h3>
            <p>{c.desc}</p>
            <span className="hcat-link">Browse articles →</span>
          </div>
        ))}
      </div>

      {/* FAQs & Ticket splits */}
      <div className="help-split">
        {/* FAQs Accordion */}
        <div className="help-faq-panel glass-panel">
          <h2>Top FAQs</h2>
          <div className="hfaq-list">
            {faqs.map((f, i) => (
              <div
                key={i}
                className={`hfaq-card ${openFaq === i ? 'open' : ''}`}
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                id={`help-faq-${i}`}
              >
                <div className="hfaq-q-row">
                  <h4>{f.q}</h4>
                  <span>{openFaq === i ? '▲' : '▼'}</span>
                </div>
                {openFaq === i && (
                  <p className="hfaq-a-block">{f.a}</p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Support Ticket form */}
        <div className="help-ticket-panel glass-panel">
          <h2>Submit a Ticket</h2>
          {!ticketSuccess ? (
            <form onSubmit={handleTicketSubmit} className="ticket-form" id="help-ticket-form">
              <p className="ticket-sub">Our developer team usually resolves tickets within 2 hours.</p>

              <div className="form-group">
                <label htmlFor="ticket-sub-input">Subject Topic</label>
                <input
                  id="ticket-sub-input"
                  type="text"
                  required
                  placeholder="e.g. Video render failing on step 4"
                  value={ticketSubject}
                  onChange={e => setTicketSubject(e.target.value)}
                  className="ticket-input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="ticket-msg-input">Detailed Description</label>
                <textarea
                  id="ticket-msg-input"
                  required
                  rows={4}
                  placeholder="Include error codes, prompt, or video titles if applicable…"
                  value={ticketMsg}
                  onChange={e => setTicketMsg(e.target.value)}
                  className="ticket-input ticket-textarea"
                />
              </div>

              <button
                type="submit"
                className={`btn-primary ticket-submit-btn ${ticketLoading ? 'loading' : ''}`}
                id="ticket-submit-btn"
                disabled={ticketLoading}
              >
                {ticketLoading ? (
                  <><span className="ticket-spinner" />Creating Ticket…</>
                ) : (
                  '🚀 Create Ticket'
                )}
              </button>
            </form>
          ) : (
            <div className="ticket-success" id="ticket-success-panel">
              <div className="ts-icon">🎉</div>
              <h3>Ticket Created Successfully!</h3>
              <p className="ts-meta">Ticket ID: <strong>#VF-{(Math.random() * 100000).toFixed(0)}</strong></p>
              <p>A representative has been assigned and is reviewing your issue. Updates will be emailed to you.</p>
              <button className="btn-secondary ts-btn" onClick={handleResetTicket} id="ticket-reset-btn">
                Create Another Ticket
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
