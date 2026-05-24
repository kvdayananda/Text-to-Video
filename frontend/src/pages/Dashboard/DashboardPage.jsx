import { Link } from 'react-router-dom';
import './DashboardPage.css';

const stats = [
  { icon: '🎬', label: 'Videos Created', value: '24', change: '+3 this week', up: true },
  { icon: '👁️', label: 'Total Views', value: '1.2M', change: '+18% this month', up: true },
  { icon: '⚡', label: 'AI Credits Left', value: '47', change: '53 used', up: false },
  { icon: '🚀', label: 'Published Today', value: '3', change: 'Across 4 platforms', up: true },
];

const recentVideos = [
  { id: 1, title: 'Top 10 AI Tools That Will Replace Your Job in 2025', platform: 'YouTube', status: 'published', views: '142K', thumb: '🤖', time: '2h ago' },
  { id: 2, title: 'How to Make $10K/Month with Crypto in 2025', platform: 'Instagram', status: 'published', views: '89K', thumb: '💰', time: '1d ago' },
  { id: 3, title: 'The Future of Remote Work Explained', platform: 'TikTok', status: 'processing', views: '—', thumb: '🏠', time: 'Processing…' },
  { id: 4, title: '5 Morning Habits of Millionaires', platform: 'YouTube', status: 'draft', views: '—', thumb: '☀️', time: 'Draft' },
];

const quickActions = [
  { icon: '✍️', label: 'Generate Script', path: '/generator/script', color: '#8a2be2' },
  { icon: '🎬', label: 'Create Video', path: '/generator', color: '#00e5ff' },
  { icon: '🔍', label: 'SEO Generator', path: '/generator/seo', color: '#ff9f43' },
  { icon: '🚀', label: 'Publish Video', path: '/publish', color: '#4ade80' },
];

const statusColors = { published: '#4ade80', processing: '#f59e0b', draft: '#6b7280' };
const statusLabels = { published: '● Published', processing: '⟳ Processing', draft: '✎ Draft' };

export default function DashboardPage() {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="dashboard-page">
      {/* Header */}
      <div className="dash-header">
        <div>
          <h1 className="dash-greeting">{greeting}, John 👋</h1>
          <p className="dash-sub">Here's what's happening with your channels today.</p>
        </div>
        <Link to="/generator" className="btn-primary dash-create-btn" id="dash-create-video-btn">
          🎬 Create New Video
        </Link>
      </div>

      {/* Stats row */}
      <div className="stats-grid">
        {stats.map((s, i) => (
          <div className="stat-card glass-panel" key={i}>
            <div className="stat-card-icon">{s.icon}</div>
            <div className="stat-card-body">
              <div className="stat-card-value">{s.value}</div>
              <div className="stat-card-label">{s.label}</div>
            </div>
            <div className={`stat-card-change ${s.up ? 'up' : 'neutral'}`}>
              {s.up ? '↑' : '→'} {s.change}
            </div>
          </div>
        ))}
      </div>

      <div className="dash-content-grid">
        {/* Recent Videos */}
        <div className="dash-panel glass-panel">
          <div className="panel-header">
            <h2>Recent Videos</h2>
            <Link to="/dashboard/videos" className="panel-link" id="see-all-videos-link">See all →</Link>
          </div>
          <div className="videos-list">
            {recentVideos.map(v => (
              <div className="video-row" key={v.id} id={`video-row-${v.id}`}>
                <div className="video-thumb-sm">{v.thumb}</div>
                <div className="video-row-info">
                  <div className="video-row-title">{v.title}</div>
                  <div className="video-row-meta">
                    <span className="video-platform">{v.platform}</span>
                    <span className="video-time">{v.time}</span>
                  </div>
                </div>
                <div className="video-row-right">
                  {v.views !== '—' && <span className="video-views">{v.views} views</span>}
                  <span
                    className="video-status"
                    style={{ color: statusColors[v.status] }}
                  >
                    {statusLabels[v.status]}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right column */}
        <div className="dash-right-col">
          {/* Quick Actions */}
          <div className="dash-panel glass-panel">
            <div className="panel-header">
              <h2>Quick Actions</h2>
            </div>
            <div className="quick-actions-grid">
              {quickActions.map((a, i) => (
                <Link
                  to={a.path}
                  className="quick-action-btn"
                  key={i}
                  id={`quick-action-${i}`}
                  style={{ '--action-color': a.color }}
                >
                  <span className="qa-icon">{a.icon}</span>
                  <span className="qa-label">{a.label}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Storage */}
          <div className="dash-panel glass-panel">
            <div className="panel-header">
              <h2>Storage</h2>
              <span className="panel-link">12.4 GB / 50 GB</span>
            </div>
            <div className="storage-bar-wrap">
              <div className="storage-bar">
                <div className="storage-fill" style={{ width: '24.8%' }} />
              </div>
              <span className="storage-pct">24.8% used</span>
            </div>
            <div className="storage-breakdown">
              <div className="storage-item">
                <span className="storage-dot" style={{ background: '#8a2be2' }} />
                <span>Videos</span>
                <span className="storage-size">9.1 GB</span>
              </div>
              <div className="storage-item">
                <span className="storage-dot" style={{ background: '#00e5ff' }} />
                <span>Thumbnails</span>
                <span className="storage-size">1.8 GB</span>
              </div>
              <div className="storage-item">
                <span className="storage-dot" style={{ background: '#ff9f43' }} />
                <span>Audio</span>
                <span className="storage-size">1.5 GB</span>
              </div>
            </div>
          </div>

          {/* Connected Platforms */}
          <div className="dash-panel glass-panel">
            <div className="panel-header">
              <h2>Connected Platforms</h2>
              <Link to="/settings/accounts" className="panel-link" id="manage-platforms-link">Manage →</Link>
            </div>
            <div className="platforms-list">
              {[
                { name: 'YouTube', icon: '▶', connected: true, handle: '@JohnCreates' },
                { name: 'Instagram', icon: '📷', connected: true, handle: '@johncreates' },
                { name: 'TikTok', icon: '🎵', connected: false, handle: 'Not connected' },
                { name: 'Facebook', icon: '𝑓', connected: false, handle: 'Not connected' },
              ].map((p, i) => (
                <div className="platform-row" key={i}>
                  <div className="platform-icon">{p.icon}</div>
                  <div className="platform-info">
                    <div className="platform-name">{p.name}</div>
                    <div className="platform-handle">{p.handle}</div>
                  </div>
                  <div className={`platform-status ${p.connected ? 'connected' : 'disconnected'}`}>
                    {p.connected ? '✓ Connected' : '+ Connect'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
