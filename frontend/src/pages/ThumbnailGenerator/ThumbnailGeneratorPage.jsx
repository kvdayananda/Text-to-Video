import { useState } from 'react';
import { generateThumbnail } from '../../api/thumbnailApi';
import './ThumbnailGeneratorPage.css';

const templates = [
  { id: 'viral-listicle', name: '🔥 Viral Listicle', desc: 'Huge bold numbers with severe contrast for top listing videos.', previewEmoji: '🔥' },
  { id: 'bold-reaction', name: '😱 Shock Reaction', desc: 'Screaming face outline, red action arrows, and high intensity borders.', previewEmoji: '😱' },
  { id: 'crypto-glow', name: '📈 Crypto & Finance Glow', desc: 'Dark ambient background with neon cyan charts and money signals.', previewEmoji: '📈' }
];

const gradientBackdrops = {
  purple: 'linear-gradient(135deg, #1e1b4b 0%, #4c1d95 50%, #831843 100%)',
  cyan: 'linear-gradient(135deg, #022c22 0%, #065f46 50%, #115e59 100%)',
  red: 'linear-gradient(135deg, #450a0a 0%, #7f1d1d 50%, #701a75 100%)',
  gold: 'linear-gradient(135deg, #1e1b4b 0%, #78350f 50%, #b45309 100%)'
};

export default function ThumbnailGeneratorPage() {
  const [activeTemplate, setActiveTemplate] = useState('viral-listicle');
  const [primaryText, setPrimaryText] = useState('3 ChatGPT MISTAKES!');
  const [subText, setSubText] = useState('Losing You Hours 😱');
  const [fontSize, setFontSize] = useState(36);
  const [textColor, setTextColor] = useState('#ffea00');
  const [backdrop, setBackdrop] = useState('purple');
  const [stickerType, setStickerType] = useState('arrow'); // arrow, warning, fire, none
  const [textYPos, setTextYPos] = useState(40); // vertical position percentage
  
  const [generating, setGenerating] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [apiError, setApiError] = useState('');

  const handleDownload = async () => {
    setGenerating(true);
    setApiError('');

    try {
      const response = await generateThumbnail({
        template: activeTemplate,
        primaryText,
        subText,
        fontSize,
        textColor,
        backdrop,
        stickerType,
        textYPos,
      });

      if (response?.status !== 'ok') {
        throw new Error(response?.detail || 'Thumbnail generation failed');
      }

      const anchor = document.createElement('a');
      anchor.href = response.downloadUrl;
      anchor.download = `visionforge_thumbnail_${activeTemplate}.png`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
    } catch (error) {
      setApiError(error?.message || 'Could not generate thumbnail.');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="thumbnail-generator-page">
      <div className="tg-header">
        <h1>AI Thumbnail Designer</h1>
        <p>Forge high-CTR visual thumbnails with custom text overlays, gradient glows, and viral overlays.</p>
      </div>

      <div className="tg-layout">
        {/* Settings Panel */}
        <div className="tg-config-col">
          <div className="tg-card glass-panel">
            <div className="tg-card-header">
              <span>🖼️</span>
              <h2>Canvas Settings</h2>
            </div>

            {/* Template Selector */}
            <div className="form-group">
              <label>Select Viral Layout Template</label>
              <div className="templates-list">
                {templates.map(t => (
                  <div
                    key={t.id}
                    className={`template-item ${activeTemplate === t.id ? 'active' : ''}`}
                    onClick={() => {
                      setActiveTemplate(t.id);
                      if (t.id === 'viral-listicle') {
                        setPrimaryText('3 ChatGPT MISTAKES!');
                        setSubText('Losing You Hours 😱');
                        setTextColor('#ffea00');
                        setStickerType('arrow');
                      } else if (t.id === 'bold-reaction') {
                        setPrimaryText('HOW I SCALED TO 10K');
                        setSubText('In 7 Days flat! 🚀');
                        setTextColor('#00e5ff');
                        setStickerType('warning');
                      } else {
                        setPrimaryText('NEXT CRYPTO BOOM?');
                        setSubText('Do NOT miss this 📈');
                        setTextColor('#10b981');
                        setStickerType('fire');
                      }
                    }}
                  >
                    <span className="template-emoji">{t.previewEmoji}</span>
                    <div className="template-meta">
                      <h3>{t.name}</h3>
                      <p>{t.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Text Inputs */}
            <div className="form-group">
              <label htmlFor="primary-heading">Primary Heading Text</label>
              <input
                id="primary-heading"
                type="text"
                value={primaryText}
                onChange={e => setPrimaryText(e.target.value)}
                className="tg-input"
                maxLength={40}
              />
            </div>

            <div className="form-group">
              <label htmlFor="sub-heading">Sub-Heading Text</label>
              <input
                id="sub-heading"
                type="text"
                value={subText}
                onChange={e => setSubText(e.target.value)}
                className="tg-input"
                maxLength={40}
              />
            </div>

            {/* Font settings row */}
            <div className="tg-sliders-row">
              <div className="form-group">
                <label htmlFor="heading-font-size">Font Size (px)</label>
                <input
                  id="heading-font-size"
                  type="number"
                  min="24"
                  max="64"
                  value={fontSize}
                  onChange={e => setFontSize(parseInt(e.target.value))}
                  className="tg-input num"
                />
              </div>

              <div className="form-group">
                <label htmlFor="text-pos-y">Vertical Offset (%)</label>
                <input
                  id="text-pos-y"
                  type="range"
                  min="10"
                  max="80"
                  value={textYPos}
                  onChange={e => setTextYPos(parseInt(e.target.value))}
                  className="tg-range"
                />
              </div>
            </div>

            {/* Color & background parameters */}
            <div className="color-selectors-grid">
              <div className="form-group">
                <label htmlFor="tg-color">Heading Hue</label>
                <input
                  id="tg-color"
                  type="color"
                  value={textColor}
                  onChange={e => setTextColor(e.target.value)}
                  className="tg-color-input"
                />
              </div>

              <div className="form-group">
                <label>Backdrop Glow</label>
                <div className="glow-btns">
                  {Object.keys(gradientBackdrops).map(k => (
                    <button
                      key={k}
                      className={`glow-btn-c ${backdrop === k ? 'active' : ''}`}
                      onClick={() => setBackdrop(k)}
                      style={{ background: gradientBackdrops[k] }}
                      title={`Backdrop ${k}`}
                    />
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="tg-sticker">Overlays</label>
                <select
                  id="tg-sticker"
                  value={stickerType}
                  onChange={e => setStickerType(e.target.value)}
                  className="tg-select"
                >
                  <option value="arrow">🔴 Big Red Arrow</option>
                  <option value="warning">⚠️ Warning Badge</option>
                  <option value="fire">🔥 Hot Fire Icon</option>
                  <option value="none">❌ No Overlay Stickers</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Live Preview Canvas column */}
        <div className="tg-preview-col">
          <div className="preview-canvas-card glass-panel">
            <h2>Live Production Canvas</h2>

            {/* Real responsive absolute-positioned canvas */}
            <div className="thumbnail-canvas-container">
              <div
                className="thumbnail-canvas"
                style={{ background: gradientBackdrops[backdrop] }}
              >
                {/* Visual mesh overlays */}
                <div className="canvas-grid-mesh" />
                <div className="canvas-light-flare" />
                <div className="canvas-border-highlight" />

                {/* Left reaction elements based on templates */}
                {activeTemplate === 'viral-listicle' && (
                  <div className="template-overlay viral-element animate-bounce">
                    <span className="viral-num">#1</span>
                  </div>
                )}
                {activeTemplate === 'bold-reaction' && (
                  <div className="template-overlay face-circle animate-pulse">
                    😱
                  </div>
                )}
                {activeTemplate === 'crypto-glow' && (
                  <div className="template-overlay chart-bars">
                    📈
                  </div>
                )}

                {/* Interactive Customizable Text Overlay */}
                <div
                  className="canvas-text-group"
                  style={{ top: `${textYPos}%` }}
                >
                  <h2
                    className="canvas-primary-text"
                    style={{ fontSize: `${fontSize}px`, color: textColor }}
                  >
                    {primaryText}
                  </h2>
                  <h3
                    className="canvas-sub-text"
                  >
                    {subText}
                  </h3>
                </div>

                {/* Stickers positioning */}
                {stickerType === 'arrow' && (
                  <div className="sticker arrow-sticker floating-arrow">
                    🏹
                  </div>
                )}
                {stickerType === 'warning' && (
                  <div className="sticker warning-sticker animate-pulse">
                    ⚠️
                  </div>
                )}
                {stickerType === 'fire' && (
                  <div className="sticker fire-sticker floating">
                    🔥
                  </div>
                )}

                {/* YouTube Timeline branding badge decoration */}
                <div className="canvas-badge">
                  <span>10:45</span>
                </div>
              </div>
            </div>

            {/* Canvas Actions footer */}
            <div className="canvas-actions">
              <button
                className={`btn-primary tg-down-btn ${generating ? 'loading' : ''}`}
                onClick={handleDownload}
                id="tg-download-btn"
                disabled={generating}
              >
                {generating ? (
                  <><span className="tg-spinner" />Exporting High-Res PNG…</>
                ) : (
                  '🖼️ Download High-Res PNG'
                )}
              </button>
              {apiError && <p className="error-text api-error">{apiError}</p>}

              <button
                className="btn-secondary"
                onClick={() => {
                  setCopiedLink(true);
                  setTimeout(() => setCopiedLink(false), 2000);
                }}
                id="tg-split-btn"
              >
                {copiedLink ? '✓ Splits Scheduled!' : '⚡ Schedule A/B Variant Test'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
