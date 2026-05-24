import { useState } from 'react';
import './TemplatesPage.css';

const categories = ['All', 'YouTube', 'Shorts', 'Reels', 'TikTok', 'Business', 'Educational', 'Motivational'];

const templates = [
  { id: 1, title: 'Viral Listicle',    category: 'YouTube',     icon: '📋', uses: '12.4K', rating: 4.9, style: 'Cinematic',    duration: '5 min' },
  { id: 2, title: 'Quick Tips Reel',   category: 'Reels',       icon: '⚡', uses: '9.8K',  rating: 4.8, style: 'Animated',     duration: '60s'   },
  { id: 3, title: 'Product Review',    category: 'YouTube',     icon: '🛍️', uses: '7.2K',  rating: 4.7, style: 'Documentary',  duration: '8 min' },
  { id: 4, title: 'Motivational Cuts', category: 'Shorts',      icon: '💪', uses: '15.1K', rating: 5.0, style: 'Motivational', duration: '60s'   },
  { id: 5, title: 'Explainer Video',   category: 'Educational', icon: '📚', uses: '6.3K',  rating: 4.6, style: 'Educational',  duration: '3 min' },
  { id: 6, title: 'News Flash',        category: 'TikTok',      icon: '📰', uses: '5.9K',  rating: 4.5, style: 'News Style',   duration: '30s'   },
  { id: 7, title: 'Corporate Promo',   category: 'Business',    icon: '🏢', uses: '4.7K',  rating: 4.7, style: 'Cinematic',    duration: '2 min' },
  { id: 8, title: 'Tutorial Step-by-Step', category: 'Educational', icon: '🎓', uses: '8.1K', rating: 4.8, style: 'Educational', duration: '6 min' },
  { id: 9, title: 'Trending Reaction', category: 'Shorts',      icon: '😲', uses: '11.2K', rating: 4.9, style: 'Animated',     duration: '45s'   },
];

export default function TemplatesPage() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [search, setSearch] = useState('');

  const filtered = templates.filter(t => {
    const matchCat = activeCategory === 'All' || t.category === activeCategory;
    const matchSearch = t.title.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="templates-page">
      <div className="templates-header">
        <div>
          <h1>Template Library</h1>
          <p>Start faster with AI-optimized templates for every platform and niche.</p>
        </div>
        <input
          className="template-search"
          type="search"
          placeholder="🔍  Search templates…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          id="template-search-input"
        />
      </div>

      {/* Categories */}
      <div className="template-categories" id="template-categories">
        {categories.map(c => (
          <button
            key={c}
            className={`cat-chip ${activeCategory === c ? 'active' : ''}`}
            onClick={() => setActiveCategory(c)}
            id={`cat-${c.toLowerCase()}`}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="templates-grid">
        {filtered.map(t => (
          <div className="template-card glass-panel" key={t.id} id={`template-${t.id}`}>
            <div className="template-thumb">
              <span className="template-icon">{t.icon}</span>
              <div className="template-overlay">
                <button className="use-template-btn" id={`use-template-${t.id}`}>
                  Use Template →
                </button>
              </div>
              <div className="template-badge">{t.category}</div>
            </div>
            <div className="template-info">
              <h3>{t.title}</h3>
              <div className="template-meta">
                <span className="t-style">{t.style}</span>
                <span className="t-duration">{t.duration}</span>
              </div>
              <div className="template-footer">
                <span className="t-uses">👥 {t.uses} uses</span>
                <span className="t-rating">⭐ {t.rating}</span>
              </div>
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="no-templates">
            <div style={{ fontSize: '3rem' }}>🔎</div>
            <p>No templates found for "<strong>{search}</strong>"</p>
          </div>
        )}
      </div>
    </div>
  );
}
