import { useState } from 'react';
import './ContactPage.css';

export default function ContactPage() {
  const [formData, setFormData] = useState({ name: '', email: '', subject: 'General Support', message: '' });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = e => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 2000);
  };

  const handleReset = () => {
    setFormData({ name: '', email: '', subject: 'General Support', message: '' });
    setSubmitted(false);
  };

  return (
    <div className="contact-page container">
      {/* Header */}
      <div className="contact-header">
        <span className="contact-badge">📞 GET IN TOUCH</span>
        <h1>How Can We <span className="text-gradient">Help You?</span></h1>
        <p>Whether you need support, enterprise licensing, or have press inquiries — our team is here.</p>
      </div>

      <div className="contact-layout">
        {/* Left Info Column */}
        <div className="contact-info">
          <div className="info-card glass-panel">
            <h3>Support & Operations</h3>
            <p>Our global representative team is active 24/7 to solve your rendering questions.</p>
            <div className="info-list">
              <div className="info-item">
                <span className="info-icon">✉️</span>
                <div>
                  <div className="info-label">General Support</div>
                  <div className="info-value">support@visionforge.ai</div>
                </div>
              </div>
              <div className="info-item">
                <span className="info-icon">💼</span>
                <div>
                  <div className="info-label">Sales & Enterprise</div>
                  <div className="info-value">enterprise@visionforge.ai</div>
                </div>
              </div>
              <div className="info-item">
                <span className="info-icon">📣</span>
                <div>
                  <div className="info-label">Press & Media</div>
                  <div className="info-value">media@visionforge.ai</div>
                </div>
              </div>
            </div>
          </div>

          {/* Office hours & HQ */}
          <div className="info-card glass-panel">
            <h3>Headquarters Location</h3>
            <p>San Francisco Office Hub</p>
            <div className="office-details">
              📍 548 Market St, Suite 40221, San Francisco, CA 94104<br />
              ⏰ Hours: Monday - Friday, 9:00 AM - 6:00 PM PST
            </div>
            {/* Custom styled vector map mockup */}
            <div className="hq-map-mockup">
              <div className="map-grid-pattern" />
              <div className="map-glowing-pin">
                <span className="pin-pulse" />
                📍
              </div>
              <div className="map-label">SF Hub</div>
            </div>
          </div>
        </div>

        {/* Right Form Column */}
        <div className="contact-form-panel">
          {!submitted ? (
            <form onSubmit={handleSubmit} className="contact-form glass-panel">
              <h2>Send a Message</h2>
              <p className="form-subtext">Fill in the details below and we will get back to you within 4 hours.</p>

              <div className="form-group">
                <label htmlFor="contact-name">Your Name</label>
                <input
                  id="contact-name"
                  type="text"
                  required
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="contact-input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="contact-email">Email Address</label>
                <input
                  id="contact-email"
                  type="email"
                  required
                  placeholder="john@example.com"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  className="contact-input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="contact-subject">Inquiry Department</label>
                <select
                  id="contact-subject"
                  value={formData.subject}
                  onChange={e => setFormData({ ...formData, subject: e.target.value })}
                  className="contact-input contact-select"
                >
                  <option>General Support</option>
                  <option>Sales & Partnerships</option>
                  <option>Billing & Invoices</option>
                  <option>API & Enterprise Licensing</option>
                  <option>Report a Bug</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="contact-msg">Message</label>
                <textarea
                  id="contact-msg"
                  required
                  rows={5}
                  placeholder="Describe your inquiry in detail…"
                  value={formData.message}
                  onChange={e => setFormData({ ...formData, message: e.target.value })}
                  className="contact-input contact-textarea"
                />
              </div>

              <button
                type="submit"
                className={`btn-primary contact-submit-btn ${loading ? 'loading' : ''}`}
                id="contact-form-submit"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="contact-spinner" />
                    Sending Message…
                  </>
                ) : (
                  '🚀 Send Message'
                )}
              </button>
            </form>
          ) : (
            <div className="contact-success-card glass-panel" id="contact-success-panel">
              <div className="c-success-icon">✉️</div>
              <h2>Message Sent!</h2>
              <p>Thank you for reaching out, <strong>{formData.name}</strong>.</p>
              <p className="success-hint">We have received your ticket regarding <strong>{formData.subject}</strong>. A support representative will email you at <strong>{formData.email}</strong> shortly.</p>
              <button className="btn-secondary" onClick={handleReset} id="contact-another-btn">
                Send Another Message
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
