import { useState } from 'react';
import { generateSEO } from '../../api/seoApi';
import './SEOGeneratorPage.css';

const platformKeywords = {
  youtube: ['#shorts', 'viral video', 'trending', 'how to', 'tutorial', '2026 secrets'],
  tiktok: ['#fyp', '#foryou', 'trending sounds', 'xyzbca', 'viral hacks', 'life hacks'],
  instagram: ['#reels', '#trendingreels', 'explore page', 'creator tips', 'daily motivation', 'aesthetic']
};

export default function SEOGeneratorPage() {
  const [topic, setTopic] = useState('');
  const [platform, setPlatform] = useState('youtube');
  const [extraKeywords, setExtraKeywords] = useState('');
  const [optimizing, setOptimizing] = useState(false);
  const [seoResult, setSeoResult] = useState(null);
  const [apiError, setApiError] = useState('');
  const [copiedField, setCopiedField] = useState(null);

  const handleOptimize = async () => {
    if (!topic.trim()) return;
    setOptimizing(true);
    setApiError('');

    try {
      const response = await generateSEO({
        topic,
        platform,
        extraKeywords,
      });

      if (response?.status === 'ok') {
        setSeoResult(response);
      } else {
        throw new Error(response?.detail || 'SEO generation failed');
      }
    } catch (error) {
      const generatedTitles = [
        {
          title: `🤯 Stop Doing THIS: 3 AI Secrets That Will Save You 100 Hours!`,
          score: 98,
          rationale: 'High curiosity hook + urgency + specific quantifiable result.',
        },
        {
          title: `How I Generate 10+ Viral Videos A Day Using VisionForge AI (Step-by-Step)`,
          score: 93,
          rationale: 'Authority based + high value keyword + tools mentioned.',
        },
        {
          title: `The Ultimate 2026 Hack No One Is Telling You About 🤫`,
          score: 87,
          rationale: 'FOMO factor + trending year tag + exclusivity.',
        },
      ];

      const tags = [
        'ai tools',
        'video automation',
        'content creator tips',
        'visionforge ai',
        'text to video',
        'grow on social media',
        ...extraKeywords
          .split(',')
          .map(k => k.trim().toLowerCase())
          .filter(Boolean),
      ];
      const platformHashtags = platformKeywords[platform] || [];
      const description = `This is the ONE video automation secret they don't want you to know! 🤫 In this quick guide, we reveal how to unlock elite production speeds and scale your channel to 10k+ followers in under 30 days.\n\n🔥 Get started with VisionForge AI today: https://visionforge.ai/free\n\n📌 TIMESTAMPS:\n0:00 The BIG Mistake\n0:45 Step 1: Automated Scripting\n1:30 Step 2: Voice Cloning\n2:15 Final Visual Export\n\n${platformHashtags.join(' ')} ${tags
        .slice(0, 3)
        .map(t => `#${t.replace(/\s+/g, '')}`)
        .join(' ')}`;
      const hashtags = [...platformHashtags, ...tags.slice(0, 4).map(t => `#${t.replace(/\s+/g, '')}`)].slice(0, 10);

      setSeoResult({
        titles: generatedTitles,
        description,
        tags,
        hashtags,
      });
      setApiError('Unable to use the backend service; using local fallback results.');
    } finally {
      setOptimizing(false);
    }
  };

  const handleCopy = (content, label) => {
    navigator.clipboard.writeText(content);
    setCopiedField(label);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleCopyAll = () => {
    if (!seoResult) return;
    const allContent = `=== TITLES ===\n${seoResult.titles.map((t, i) => `${i+1}. [CTR Score: ${t.score}%] ${t.title}`).join('\n')}\n\n=== DESCRIPTION ===\n${seoResult.description}\n\n=== TAGS ===\n${seoResult.tags.join(', ')}\n\n=== HASHTAGS ===\n${seoResult.hashtags?.join(' ')}`;
    handleCopy(allContent, 'all');
  };

  return (
    <div className="seo-generator-page">
      <div className="seo-header">
        <h1>AI Video SEO Generator</h1>
        <p>Analyze your topic, generate ultra-high CTR titles, optimize metadata description, and extract tags.</p>
      </div>

      <div className="seo-layout">
        {/* Input Panel */}
        <div className="seo-config-col">
          <div className="seo-card glass-panel">
            <div className="seo-card-header">
              <span>🚀</span>
              <h2>Optimize Metadata</h2>
            </div>

            <div className="form-group">
              <label htmlFor="seo-topic">Video Topic / Main Goal</label>
              <textarea
                id="seo-topic"
                rows={3}
                placeholder="e.g. How to use AI to automatically generate short form faceless videos and scale on YouTube Shorts..."
                value={topic}
                onChange={e => setTopic(e.target.value)}
                className="seo-textarea"
                disabled={optimizing}
              />
            </div>

            <div className="form-group">
              <label>Target Social Platform</label>
              <div className="platform-radio-group">
                <button
                  type="button"
                  className={`plat-btn ${platform === 'youtube' ? 'active' : ''}`}
                  onClick={() => setPlatform('youtube')}
                  disabled={optimizing}
                >
                  🔴 YouTube Shorts
                </button>
                <button
                  type="button"
                  className={`plat-btn ${platform === 'tiktok' ? 'active' : ''}`}
                  onClick={() => setPlatform('tiktok')}
                  disabled={optimizing}
                >
                  🎵 TikTok Trend
                </button>
                <button
                  type="button"
                  className={`plat-btn ${platform === 'instagram' ? 'active' : ''}`}
                  onClick={() => setPlatform('instagram')}
                  disabled={optimizing}
                >
                  📸 IG Reels
                </button>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="seo-keywords">Custom Keywords (comma separated)</label>
              <input
                id="seo-keywords"
                type="text"
                placeholder="faceless, automated, rich assets, passive income"
                value={extraKeywords}
                onChange={e => setExtraKeywords(e.target.value)}
                className="seo-input-text"
                disabled={optimizing}
              />
            </div>

            <button
              onClick={handleOptimize}
              className={`btn-primary seo-gen-btn ${optimizing ? 'loading' : ''}`}
              id="seo-generate-btn"
              disabled={!topic.trim() || optimizing}
            >
              {optimizing ? (
                <><span className="seo-spinner" />Analyzing Engagement Vectors…</>
              ) : (
                '🚀 Generate Viral SEO Pack'
              )}
            </button>
            {apiError && <p className="error-text api-error">{apiError}</p>}
          </div>
        </div>

        {/* Results Workbench */}
        <div className="seo-output-col">
          {!seoResult && !optimizing ? (
            <div className="seo-placeholder glass-panel">
              <div className="seop-icon">📊</div>
              <h3>SEO Assets Workbench</h3>
              <p>Type your primary video topic on the left and choose a channel platform. VisionForge AI will compile title scores, tags, and descriptive copy.</p>
            </div>
          ) : optimizing ? (
            <div className="seo-loading-card glass-panel">
              <span className="seo-spinner big" />
              <h3>Calculating Virality & CTR Coefficients...</h3>
              <p>Evaluating keywords against 100,000+ top-performing hook variations in our 2026 viral database.</p>
            </div>
          ) : (
            <div className="seo-workspace-card glass-panel">
              <div className="seo-work-header">
                <h2>AI Engagement Analytics</h2>
                <button className="copy-all-btn btn-secondary" onClick={handleCopyAll} id="seo-copy-all-btn">
                  {copiedField === 'all' ? '✓ Copied All!' : '📋 Copy Entire SEO Pack'}
                </button>
              </div>

              {/* Title list with CTR gauges */}
              <div className="seo-asset-section">
                <h3>Viral Titles & CTR Scores</h3>
                <div className="titles-container">
                  {seoResult.titles.map((t, idx) => (
                    <div key={idx} className="title-row">
                      <div className="ctr-dial" style={{ borderColor: t.score > 90 ? 'var(--secondary)' : 'var(--primary)' }}>
                        <span className="ctr-value">{t.score}%</span>
                        <span className="ctr-lbl">CTR</span>
                      </div>
                      <div className="title-content">
                        <h4>{t.title}</h4>
                        <p>{t.rationale}</p>
                      </div>
                      <button
                        className="copy-btn-sm"
                        onClick={() => handleCopy(t.title, `title-${idx}`)}
                      >
                        {copiedField === `title-${idx}` ? '✓' : '📋'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Description box */}
              <div className="seo-asset-section mt-24">
                <div className="section-header-row">
                  <h3>Optimized Description Box</h3>
                  <button
                    className="ghost-btn-sm"
                    onClick={() => handleCopy(seoResult.description, 'desc')}
                  >
                    {copiedField === 'desc' ? '✓ Copied' : '📋 Copy Description'}
                  </button>
                </div>
                <textarea
                  className="seo-desc-textarea"
                  value={seoResult.description}
                  onChange={e => setSeoResult(prev => ({ ...prev, description: e.target.value }))}
                  rows={6}
                />
              </div>

              {/* Tags panel */}
              <div className="seo-asset-section mt-24">
                <div className="section-header-row">
                  <h3>Extracted Search Tags</h3>
                  <button
                    className="ghost-btn-sm"
                    onClick={() => handleCopy(seoResult.tags.join(', '), 'tags')}
                  >
                    {copiedField === 'tags' ? '✓ Copied' : '📋 Copy Tags'}
                  </button>
                </div>
                <div className="tags-grid">
                  {seoResult.tags.map((tag, idx) => (
                    <span key={idx} className="tag-chip">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>

              {seoResult.hashtags?.length ? (
                <div className="seo-asset-section mt-24">
                  <div className="section-header-row">
                    <h3>Platform Hashtags</h3>
                    <button
                      className="ghost-btn-sm"
                      onClick={() => handleCopy(seoResult.hashtags.join(' '), 'hashtags')}
                    >
                      {copiedField === 'hashtags' ? '✓ Copied' : '📋 Copy Hashtags'}
                    </button>
                  </div>
                  <div className="tags-grid">
                    {seoResult.hashtags.map((tag, idx) => (
                      <span key={idx} className="tag-chip hashtag-chip">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
