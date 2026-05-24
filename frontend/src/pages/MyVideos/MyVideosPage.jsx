import { useState } from 'react';
import { Link } from 'react-router-dom';
import './MyVideosPage.css';

const initialVideos = [
  { id: 1, title: 'Top 10 AI Tools That Will Replace Your Job in 2025', platform: 'YouTube', status: 'published', views: '142K', thumb: '🤖', duration: '3:24', time: '2h ago' },
  { id: 2, title: 'How to Make $10K/Month with Crypto in 2025', platform: 'Instagram', status: 'published', views: '89K', thumb: '💰', duration: '1:00', time: '1d ago' },
  { id: 3, title: 'The Future of Remote Work Explained', platform: 'TikTok', status: 'processing', views: '—', thumb: '🏠', duration: '4:15', time: 'Processing…' },
  { id: 4, title: '5 Morning Habits of Self-Made Millionaires', platform: 'YouTube', status: 'draft', views: '—', thumb: '☀️', duration: '2:58', time: 'Draft' },
  { id: 5, title: 'Explaining Quantum Computing to a Five Year Old', platform: 'YouTube', status: 'published', views: '12K', thumb: '⚛️', duration: '5:42', time: '3d ago' },
  { id: 6, title: 'ChatGPT Secret Features You Didn\'t Know Existed', platform: 'TikTok', status: 'draft', views: '—', thumb: '💬', duration: '0:45', time: 'Draft' }
];

const statusColors = { published: '#4ade80', processing: '#f59e0b', draft: '#6b7280' };
const statusLabels = { published: '● Published', processing: '⟳ Processing', draft: '✎ Draft' };

export default function MyVideosPage() {
  const [videos, setVideos] = useState(initialVideos);
  const [activeTab, setActiveTab] = useState('all');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [previewVideo, setPreviewVideo] = useState(null);

  const handleDelete = id => {
    setVideos(prev => prev.filter(v => v.id !== id));
  };

  const filtered = videos.filter(v => {
    const matchTab = activeTab === 'all' || v.status === activeTab;
    const matchSearch = v.title.toLowerCase().includes(search.toLowerCase());
    return matchTab && matchSearch;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'newest') return b.id - a.id;
    if (sortBy === 'oldest') return a.id - b.id;
    if (sortBy === 'views') {
      const getViews = v => {
        if (v.views === '—') return -1;
        if (v.views.includes('K')) return parseFloat(v.views) * 1000;
        return parseFloat(v.views);
      };
      return getViews(b) - getViews(a);
    }
    return 0;
  });

  return (
    <div className="myvideos-page">
      {/* Header */}
      <div className="mv-header">
        <div>
          <h1>My Videos</h1>
          <p>Manage, preview, and publish your generated video catalog.</p>
        </div>
        <Link to="/generator" className="btn-primary" id="mv-new-btn">
          🎬 Create New Video
        </Link>
      </div>

      {/* Filter controls row */}
      <div className="mv-controls glass-panel">
        {/* Tabs */}
        <div className="mv-tabs" id="mv-filter-tabs">
          {['all', 'published', 'processing', 'draft'].map(tab => (
            <button
              key={tab}
              className={`mv-tab-btn ${activeTab === tab ? 'active' : ''}`}
              onClick={() => setActiveTab(tab)}
              id={`mv-tab-${tab}`}
            >
              {tab.toUpperCase()}
            </button>
          ))}
        </div>

        {/* Search & Sort */}
        <div className="mv-actions-group">
          <input
            type="search"
            placeholder="🔍  Search videos…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="mv-search-input"
            id="mv-search-input"
          />
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
            className="mv-sort-select"
            id="mv-sort-select"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="views">Most Views</option>
          </select>
        </div>
      </div>

      {/* Grid */}
      <div className="mv-grid">
        {sorted.map(v => (
          <div className="mv-card glass-panel" key={v.id} id={`mv-card-${v.id}`}>
            {/* Visual Cover Thumbnail */}
            <div className="mv-thumb-wrap">
              <span className="mv-thumb-emoji">{v.thumb}</span>
              <div className="mv-duration-badge">{v.duration}</div>
              {/* Overlays */}
              <div className="mv-hover-actions">
                {v.status !== 'processing' ? (
                  <button 
                    className="btn-primary mv-hover-btn" 
                    onClick={() => setPreviewVideo(v)}
                    id={`preview-btn-${v.id}`}
                  >
                    ▶ Preview
                  </button>
                ) : (
                  <span className="mv-processing-overlay">Rendering...</span>
                )}
              </div>
            </div>

            {/* Info details */}
            <div className="mv-info">
              <div className="mv-card-top">
                <span className="mv-platform-lbl">{v.platform}</span>
                <span className="mv-time-lbl">{v.time}</span>
              </div>
              <h3 className="mv-card-title">{v.title}</h3>
              <div className="mv-card-footer">
                <div className="mv-footer-left">
                  {v.views !== '—' && <span className="mv-views-stat">👁️ {v.views} views</span>}
                </div>
                <span className="mv-status-lbl" style={{ color: statusColors[v.status] }}>
                  {statusLabels[v.status]}
                </span>
              </div>

              {/* Actions bottom row */}
              <div className="mv-actions-row">
                {v.status === 'draft' && (
                  <Link to="/publish" className="mv-action-btn publish" id={`publish-action-${v.id}`}>
                    🚀 Publish
                  </Link>
                )}
                {v.status === 'published' && (
                  <button className="mv-action-btn analytics-view" id={`analytics-action-${v.id}`}>
                    📊 Stats
                  </button>
                )}
                <button 
                  className="mv-action-btn delete" 
                  onClick={() => handleDelete(v.id)}
                  id={`delete-action-${v.id}`}
                >
                  🗑️ Delete
                </button>
              </div>
            </div>
          </div>
        ))}

        {sorted.length === 0 && (
          <div className="mv-empty glass-panel">
            <div className="mv-empty-icon">📁</div>
            <h3>No Videos Found</h3>
            <p>Could not find any videos matching your filter or search criteria.</p>
            <Link to="/generator" className="btn-secondary" style={{ marginTop: 16 }}>
              Generate One Now
            </Link>
          </div>
        )}
      </div>

      {/* Preview Modal Popup */}
      {previewVideo && (
        <div className="mv-modal-overlay" onClick={() => setPreviewVideo(null)} id="preview-video-modal">
          <div className="mv-modal-body glass-panel" onClick={e => e.stopPropagation()}>
            <button className="mv-modal-close" onClick={() => setPreviewVideo(null)}>×</button>
            <div className="mv-modal-player-mock">
              <span className="player-pulse" />
              <div className="mock-player-logo">⚡ VisionForge Player</div>
              <div className="mock-player-visual">{previewVideo.thumb}</div>
              <div className="mock-player-subtitles">
                "Welcome back, and in this video, we're talking about {previewVideo.title}..."
              </div>
              {/* Controls */}
              <div className="mock-player-controls">
                <span className="control-btn">⏮</span>
                <span className="control-btn play-pause">⏸</span>
                <span className="control-btn">⏭</span>
                <div className="mock-seek-bar"><div className="seek-fill" style={{ width: '45%' }} /></div>
                <span className="time-display">01:42 / {previewVideo.duration}</span>
              </div>
            </div>
            <div className="mv-modal-details">
              <h2>{previewVideo.title}</h2>
              <div className="mv-modal-meta">
                <span>Platform: <strong>{previewVideo.platform}</strong></span>
                <span>Views: <strong>{previewVideo.views}</strong></span>
                <span>Length: <strong>{previewVideo.duration}</strong></span>
              </div>
              <div className="mv-modal-actions">
                <button className="btn-primary" id="modal-download-btn">⬇ Download High-Res MP4</button>
                <Link to="/publish" className="btn-secondary" id="modal-publish-btn">🚀 Publish to Channels</Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
