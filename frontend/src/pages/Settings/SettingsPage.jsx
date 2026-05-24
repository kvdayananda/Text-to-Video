import { useState, useEffect } from 'react';
import { me } from '../../api/authApi';
import { cancelSubscription } from '../../api/paymentApi';
import { useNavigate } from 'react-router-dom';
import './SettingsPage.css';

const tabs = [
  { id: 'profile',   label: 'Profile',       icon: '👤' },
  { id: 'accounts',  label: 'Accounts',      icon: '🔗' },
  { id: 'billing',   label: 'Billing',       icon: '💳' },
  { id: 'security',  label: 'Security',      icon: '🔒' },
  { id: 'notifications', label: 'Notifications', icon: '🔔' },
];

const connectedPlatforms = [
  { name: 'YouTube',   icon: '▶', connected: true,  handle: '@JohnCreates',   color: '#ff4444' },
  { name: 'Instagram', icon: '📷', connected: true,  handle: '@johncreates',   color: '#e1306c' },
  { name: 'TikTok',    icon: '🎵', connected: false, handle: 'Not connected',  color: '#00e5ff' },
  { name: 'Facebook',  icon: '𝑓', connected: false, handle: 'Not connected',  color: '#1877f2' },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  const [profile, setProfile] = useState({
    name: 'John Creator', email: 'john@example.com',
    bio: 'AI content creator & entrepreneur', website: 'https://johncreates.com',
  });
  
  const [notifications, setNotifications] = useState({
    publishing: true, copyright: true, aiUpdates: false, weeklyReport: true,
  });
  
  const [saved, setSaved] = useState(false);

  // Load user data on mount
  useEffect(() => {
    async function loadUserData() {
      setLoading(true);
      try {
        const res = await me();
        if (res && res.status === 'ok') {
          setUser(res.user);
          setProfile({
            name: res.user.name,
            email: res.user.email,
            bio: res.user.bio || 'AI content creator & entrepreneur',
            website: res.user.website || 'https://johncreates.com'
          });
        }
      } catch (err) {
        console.error('Failed to load settings profile:', err);
      } finally {
        setLoading(false);
      }
    }
    loadUserData();
  }, []);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleCancelSub = async () => {
    if (window.confirm('Are you sure you want to cancel your subscription renewal?')) {
      try {
        const res = await cancelSubscription();
        if (res.status === 'success') {
          setUser(prev => ({ ...prev, subscriptionStatus: 'canceled' }));
          alert(res.message);
        }
      } catch (err) {
        console.error('Failed to cancel renewal:', err);
      }
    }
  };

  if (loading) {
    return (
      <div className="settings-page-loading">
        <div className="loading-spinner"></div>
        <p>Loading creator parameters...</p>
      </div>
    );
  }

  return (
    <div className="settings-page">
      <div className="settings-header">
        <h1>Settings</h1>
        <p>Manage your account, connections, and preferences.</p>
      </div>

      <div className="settings-layout">
        {/* Sidebar tabs */}
        <nav className="settings-nav glass-panel">
          {tabs.map(t => (
            <button
              key={t.id}
              className={`settings-tab ${activeTab === t.id ? 'active' : ''}`}
              onClick={() => setActiveTab(t.id)}
              id={`settings-tab-${t.id}`}
            >
              <span>{t.icon}</span>
              <span>{t.label}</span>
            </button>
          ))}
        </nav>

        {/* Content */}
        <div className="settings-content">

          {/* ── PROFILE ── */}
          {activeTab === 'profile' && (
            <div className="settings-section glass-panel" id="profile-section">
              <h2>Profile Information</h2>
              <p className="section-desc">Update your display name, bio, and public profile details.</p>

              <div className="avatar-row">
                <div className="settings-avatar">{profile.name ? profile.name.slice(0, 2).toUpperCase() : 'ME'}</div>
                <div>
                  <button className="ghost-btn" id="change-avatar-btn">Change Photo</button>
                  <p className="avatar-hint">JPG or PNG. Max 2MB.</p>
                </div>
              </div>

              <div className="settings-form">
                <div className="sf-row">
                  <div className="sf-group">
                    <label htmlFor="s-name">Full Name</label>
                    <input id="s-name" type="text" value={profile.name}
                      onChange={e => setProfile({ ...profile, name: e.target.value })}
                      className="s-input" />
                  </div>
                  <div className="sf-group">
                    <label htmlFor="s-email">Email Address</label>
                    <input id="s-email" type="email" value={profile.email}
                      disabled
                      style={{ opacity: 0.6, cursor: 'not-allowed' }}
                      className="s-input" />
                  </div>
                </div>
                <div className="sf-group">
                  <label htmlFor="s-bio">Bio</label>
                  <textarea id="s-bio" rows={3} value={profile.bio}
                    onChange={e => setProfile({ ...profile, bio: e.target.value })}
                    className="s-input s-textarea" />
                </div>
                <div className="sf-group">
                  <label htmlFor="s-website">Website</label>
                  <input id="s-website" type="url" value={profile.website}
                    onChange={e => setProfile({ ...profile, website: e.target.value })}
                    className="s-input" />
                </div>
                <div className="save-row">
                  <button className="btn-primary save-btn" onClick={handleSave} id="save-profile-btn">
                    {saved ? '✓ Saved!' : 'Save Changes'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ── ACCOUNTS ── */}
          {activeTab === 'accounts' && (
            <div className="settings-section glass-panel" id="accounts-section">
              <h2>Connected Accounts</h2>
              <p className="section-desc">Connect your social media accounts to enable one-click publishing.</p>
              <div className="accounts-list">
                {connectedPlatforms.map((p, i) => (
                  <div className="account-row" key={i} id={`account-${p.name.toLowerCase()}`}>
                    <div className="acc-icon" style={{ background: `${p.color}22`, borderColor: `${p.color}44` }}>
                      {p.icon}
                    </div>
                    <div className="acc-info">
                      <div className="acc-name">{p.name}</div>
                      <div className="acc-handle" style={{ color: p.connected ? '#4ade80' : 'var(--text-muted)' }}>
                        {p.handle}
                      </div>
                    </div>
                    <button
                      className={p.connected ? 'disconnect-btn' : 'connect-btn-s'}
                      id={`${p.connected ? 'disconnect' : 'connect'}-${p.name.toLowerCase()}`}
                    >
                      {p.connected ? 'Disconnect' : 'Connect'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── BILLING ── */}
          {activeTab === 'billing' && user && (
            <div className="settings-section glass-panel" id="billing-section">
              <h2>Billing & Subscription</h2>
              <p className="section-desc">Manage your plan, payment method, and billing history.</p>

              {user.subscriptionPlan === 'Free' ? (
                <div className="current-plan free-tier-card">
                  <div className="plan-badge-free">⚡ Free Tier Active</div>
                  <div className="plan-details">
                    <p className="plan-upgrade-hint">Unlock 4K rendering, 500+ premium neural voices, and one-click multi-platform publishing.</p>
                  </div>
                  <button 
                    className="btn-primary upgrade-btn" 
                    onClick={() => navigate('/pricing')}
                    id="upgrade-plan-btn"
                  >
                    💎 Upgrade Subscription
                  </button>
                </div>
              ) : (
                <div className="current-plan">
                  <div className="plan-badge">⚡ {user.subscriptionPlan} Plan</div>
                  <div className="plan-details">
                    <div className="plan-price-display">
                      {user.subscriptionPlan === 'Pro' ? '$29' : '$99'}
                      <span>/{user.billingCycle === 'yearly' ? 'year' : 'month'}</span>
                    </div>
                    {user.subscriptionStatus === 'canceled' ? (
                      <div className="plan-renew plan-canceled-warning">
                        Renewal canceled. Subscription expires on {user.subscriptionRenewsAt}.
                      </div>
                    ) : (
                      <div className="plan-renew">
                        Renews on {user.subscriptionRenewsAt}
                      </div>
                    )}
                  </div>
                  
                  <div className="subscription-cta-row">
                    {user.subscriptionPlan === 'Pro' && (
                      <button 
                        className="btn-secondary upgrade-enterprise-btn"
                        onClick={() => navigate('/pricing')}
                      >
                        Upgrade to Enterprise
                      </button>
                    )}
                    {user.subscriptionStatus !== 'canceled' && (
                      <button 
                        className="ghost-btn cancel-sub-btn" 
                        onClick={handleCancelSub}
                        id="cancel-sub-btn"
                      >
                        Cancel Renewal
                      </button>
                    )}
                  </div>
                </div>
              )}

              {user.subscriptionPlan !== 'Free' && (
                <>
                  <div className="billing-divider" />
                  <h3>Active Payment Method</h3>
                  <div className="payment-card">
                    <div className="card-icon">💳</div>
                    <div>
                      <div className="card-num">
                        •••• •••• •••• {user.paymentMethod ? user.paymentMethod.last4 : '4242'}
                      </div>
                      <div className="card-exp">
                        Expires {user.paymentMethod ? `${user.paymentMethod.expMonth}/${user.paymentMethod.expYear}` : '12/2030'} · {user.paymentMethod ? user.paymentMethod.brand : 'Visa'}
                      </div>
                    </div>
                    <button className="ghost-btn" id="update-card-btn">Sandbox Mode</button>
                  </div>
                </>
              )}

              {user.paymentHistory && user.paymentHistory.length > 0 && (
                <>
                  <div className="billing-divider" />
                  <h3>Billing & Invoice History</h3>
                  <div className="billing-history">
                    {user.paymentHistory.map((invoice, i) => (
                      <div className="billing-row" key={i}>
                        <span className="bill-date">{invoice.date}</span>
                        <span className="bill-amount">{invoice.amount}</span>
                        <span className="bill-status">
                          <strong className="status-success-badge">{invoice.status}</strong>
                        </span>
                        <button 
                          className="ghost-btn-sm" 
                          onClick={() => alert(`Sandbox invoice ID: ${invoice.id} for amount ${invoice.amount} verified.`)}
                          id={`invoice-${i}`}
                        >
                          Invoice Log
                        </button>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          {/* ── SECURITY ── */}
          {activeTab === 'security' && (
            <div className="settings-section glass-panel" id="security-section">
              <h2>Security</h2>
              <p className="section-desc">Keep your account safe with a strong password and two-factor authentication.</p>
              <div className="settings-form">
                <div className="sf-group">
                  <label htmlFor="s-current-pw">Current Password</label>
                  <input id="s-current-pw" type="password" placeholder="••••••••" className="s-input" />
                </div>
                <div className="sf-row">
                  <div className="sf-group">
                    <label htmlFor="s-new-pw">New Password</label>
                    <input id="s-new-pw" type="password" placeholder="Min. 8 characters" className="s-input" />
                  </div>
                  <div className="sf-group">
                    <label htmlFor="s-confirm-pw">Confirm New Password</label>
                    <input id="s-confirm-pw" type="password" placeholder="Re-enter password" className="s-input" />
                  </div>
                </div>
                <div className="save-row">
                  <button className="btn-primary save-btn" id="change-password-btn">Update Password</button>
                </div>
              </div>

              <div className="billing-divider" />

              <div className="twofa-row">
                <div>
                  <h3>Two-Factor Authentication</h3>
                  <p className="section-desc" style={{ marginTop: 4 }}>Add an extra layer of security using an authenticator app.</p>
                </div>
                <button className="connect-btn-s" id="enable-2fa-btn">Enable 2FA</button>
              </div>
            </div>
          )}

          {/* ── NOTIFICATIONS ── */}
          {activeTab === 'notifications' && (
            <div className="settings-section glass-panel" id="notifications-section">
              <h2>Notification Preferences</h2>
              <p className="section-desc">Choose which alerts you'd like to receive.</p>
              <div className="notif-list">
                {[
                  { key: 'publishing',    label: 'Publishing Alerts',   desc: 'Get notified when your videos go live' },
                  { key: 'copyright',     label: 'Copyright Warnings',  desc: 'Alerts when copyright risks are detected' },
                  { key: 'aiUpdates',     label: 'AI Model Updates',    desc: 'Know when new AI features are available' },
                  { key: 'weeklyReport',  label: 'Weekly Report',       desc: 'Summary of your channel performance' },
                ].map(n => (
                  <div className="notif-row" key={n.key} id={`notif-${n.key}`}>
                    <div className="notif-info">
                      <div className="notif-label">{n.label}</div>
                      <div className="notif-desc">{n.desc}</div>
                    </div>
                    <button
                      className={`toggle-btn ${notifications[n.key] ? 'on' : ''}`}
                      onClick={() => setNotifications(prev => ({ ...prev, [n.key]: !prev[n.key] }))}
                      id={`toggle-${n.key}`}
                      aria-label={`Toggle ${n.label}`}
                    >
                      <div className="toggle-knob" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
