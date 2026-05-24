import { useState, useEffect, useRef } from 'react';
import './SubtitlesPage.css';

const defaultSubtitles = [
  { id: 1, start: '00:01', end: '00:03', text: 'Hey everyone! Today I want to show you something wild.' },
  { id: 2, start: '00:03', end: '00:06', text: 'We are creating full videos using nothing but AI.' },
  { id: 3, start: '00:06', end: '00:09', text: 'With custom voiceovers, automated transitions, and styles.' },
  { id: 4, start: '00:09', end: '00:12', text: 'Let\'s dive in and see how VisionForge makes it happen!' }
];

export default function SubtitlesPage() {
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [subtitles, setSubtitles] = useState(defaultSubtitles);
  const [stylePreset, setStylePreset] = useState('karaoke'); // karaoke, netflix, bold-pop, cyber-glow
  const [fontFamily, setFontFamily] = useState('Outfit');
  const [fontSize, setFontSize] = useState(24);
  const [fontColor, setFontColor] = useState('#00e5ff');
  
  // Player state
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0); // in seconds
  const [activeSubtitle, setActiveSubtitle] = useState('');
  
  const timerRef = useRef(null);

  // Synchronize subtitle display with current player time
  useEffect(() => {
    if (!videoLoaded) return;
    
    // Find active subtitle matching current time
    const active = subtitles.find(sub => {
      const startSec = timeToSeconds(sub.start);
      const endSec = timeToSeconds(sub.end);
      return currentTime >= startSec && currentTime < endSec;
    });
    
    setActiveSubtitle(active ? active.text : '');
  }, [currentTime, subtitles, videoLoaded]);

  // Handle play/pause timer loop
  useEffect(() => {
    if (playing) {
      timerRef.current = setInterval(() => {
        setCurrentTime(prev => {
          if (prev >= 12) {
            setPlaying(false);
            return 0;
          }
          return prev + 0.1;
        });
      }, 100);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [playing]);

  const timeToSeconds = (timeStr) => {
    const parts = timeStr.split(':').map(Number);
    if (parts.length === 2) return parts[0] * 60 + parts[1];
    return 0;
  };

  const handleUploadSimulate = (e) => {
    e.preventDefault();
    setUploading(true);
    setTimeout(() => {
      setUploading(false);
      setVideoLoaded(true);
    }, 1800);
  };

  const handleTextChange = (id, newText) => {
    setSubtitles(prev => prev.map(sub => sub.id === id ? { ...sub, text: newText } : sub));
  };

  const handleTimeChange = (id, field, newTime) => {
    setSubtitles(prev => prev.map(sub => sub.id === id ? { ...sub, [field]: newTime } : sub));
  };

  const handleAddSubtitle = () => {
    const lastSub = subtitles[subtitles.length - 1];
    const newId = Date.now();
    const newSub = {
      id: newId,
      start: lastSub ? lastSub.end : '00:00',
      end: '00:15',
      text: 'New subtitle text line...'
    };
    setSubtitles(prev => [...prev, newSub]);
  };

  const handleDeleteSubtitle = (id) => {
    setSubtitles(prev => prev.filter(sub => sub.id !== id));
  };

  return (
    <div className="subtitles-page">
      <div className="sub-header">
        <h1>Auto Subtitle Generator</h1>
        <p>Transcribe video dialogs instantly and overlay beautiful, responsive, animated caption styles.</p>
      </div>

      {!videoLoaded && !uploading ? (
        <div className="upload-container glass-panel" onDragOver={e => e.preventDefault()} onDrop={handleUploadSimulate}>
          <div className="upload-box">
            <span className="upload-icon">🎬</span>
            <h2>Drag & Drop your Video file</h2>
            <p>Supports MP4, MOV, WebM (Max 200MB)</p>
            <span className="upload-or">or</span>
            <button className="btn-primary" onClick={handleUploadSimulate} id="sub-mock-upload-btn">
              Browse Local Files
            </button>
          </div>
        </div>
      ) : uploading ? (
        <div className="upload-loading glass-panel">
          <span className="sub-spinner big" />
          <h3>Analyzing audio signals...</h3>
          <p>Extracting dynamic vocal frequencies and preparing transcription grids.</p>
          <div className="sub-progress-bar">
            <div className="sub-progress-fill" />
          </div>
        </div>
      ) : (
        <div className="sub-layout">
          {/* Style and Timeline editor */}
          <div className="sub-editor-col">
            {/* Style customization */}
            <div className="sub-card glass-panel">
              <div className="sub-card-header">
                <span>🎨</span>
                <h2>Caption Presets</h2>
              </div>
              
              <div className="preset-grid">
                <button
                  className={`preset-btn ${stylePreset === 'karaoke' ? 'active' : ''}`}
                  onClick={() => setStylePreset('karaoke')}
                >
                  🌟 Karaoke Bounce
                </button>
                <button
                  className={`preset-btn ${stylePreset === 'netflix' ? 'active' : ''}`}
                  onClick={() => setStylePreset('netflix')}
                >
                  🍿 Netflix Classic
                </button>
                <button
                  className={`preset-btn ${stylePreset === 'bold-pop' ? 'active' : ''}`}
                  onClick={() => setStylePreset('bold-pop')}
                >
                  💥 Bold Pop
                </button>
                <button
                  className={`preset-btn ${stylePreset === 'cyber-glow' ? 'active' : ''}`}
                  onClick={() => setStylePreset('cyber-glow')}
                >
                  ⚡ Cyber Glow
                </button>
              </div>

              <div className="font-controls-row">
                <div className="form-group">
                  <label htmlFor="sub-font">Font Family</label>
                  <select
                    id="sub-font"
                    value={fontFamily}
                    onChange={e => setFontFamily(e.target.value)}
                    className="sub-select"
                  >
                    <option>Outfit</option>
                    <option>Inter</option>
                    <option>Impact</option>
                    <option>Arial</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="sub-size">Size (px)</label>
                  <input
                    id="sub-size"
                    type="number"
                    min="14"
                    max="60"
                    value={fontSize}
                    onChange={e => setFontSize(parseInt(e.target.value))}
                    className="sub-num-input"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="sub-color">Text Glow</label>
                  <input
                    id="sub-color"
                    type="color"
                    value={fontColor}
                    onChange={e => setFontColor(e.target.value)}
                    className="sub-color-input"
                  />
                </div>
              </div>
            </div>

            {/* Editable timestamp timeline list */}
            <div className="sub-card glass-panel mt-24">
              <div className="sub-card-header flex-between">
                <div className="flex-align">
                  <span>📝</span>
                  <h2>Transcription Segments</h2>
                </div>
                <button className="sub-add-btn" onClick={handleAddSubtitle}>+ Add Line</button>
              </div>

              <div className="segments-list">
                {subtitles.map(sub => (
                  <div key={sub.id} className="segment-row">
                    <div className="segment-times">
                      <input
                        type="text"
                        value={sub.start}
                        onChange={e => handleTimeChange(sub.id, 'start', e.target.value)}
                        className="sub-time-input"
                        title="Start Timestamp"
                      />
                      <span>→</span>
                      <input
                        type="text"
                        value={sub.end}
                        onChange={e => handleTimeChange(sub.id, 'end', e.target.value)}
                        className="sub-time-input"
                        title="End Timestamp"
                      />
                    </div>
                    <textarea
                      value={sub.text}
                      onChange={e => handleTextChange(sub.id, e.target.value)}
                      className="sub-segment-textarea"
                      rows={2}
                    />
                    <button
                      className="sub-del-btn"
                      onClick={() => handleDeleteSubtitle(sub.id)}
                      title="Delete Caption Block"
                    >
                      🗑️
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Interactive video preview card */}
          <div className="sub-preview-col">
            <div className="video-preview-card glass-panel">
              <h2>Video Output Preview</h2>
              
              {/* Responsive player mockup */}
              <div className="mock-player-container">
                <div className="mock-player-canvas">
                  <div className="glow-backdrop" />
                  {/* Decorative background grid and waveform to mimic video elements */}
                  <div className="visual-grid">
                    <div className="grid-lens" />
                    <div className={`video-visualizer-bars ${playing ? 'active' : ''}`}>
                      <span className="v-bar"></span>
                      <span className="v-bar"></span>
                      <span className="v-bar"></span>
                      <span className="v-bar"></span>
                    </div>
                  </div>

                  {/* Active Subtitle overlay */}
                  {activeSubtitle && (
                    <div className={`subtitle-overlay preset-${stylePreset}`} style={{
                      fontFamily: fontFamily,
                      fontSize: `${fontSize}px`,
                      color: fontColor,
                      textShadow: stylePreset === 'cyber-glow' ? `0 0 12px ${fontColor}` : 'none'
                    }}>
                      {activeSubtitle}
                    </div>
                  )}
                </div>

                {/* Player actions */}
                <div className="player-controls">
                  <button className="play-trigger-btn" onClick={() => setPlaying(!playing)}>
                    {playing ? '⏸ Pause Preview' : '▶ Play Preview'}
                  </button>

                  <div className="timeline-tracker">
                    <span className="time-lbl">0:{(Math.floor(currentTime) < 10 ? '0' : '') + Math.floor(currentTime)}</span>
                    <div className="timeline-rail">
                      <div className="timeline-fill" style={{ width: `${(currentTime / 12) * 100}%` }} />
                    </div>
                    <span className="time-lbl">0:12</span>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="sub-export-footer">
                <button
                  className="btn-secondary"
                  onClick={() => {
                    setVideoLoaded(false);
                    setPlaying(false);
                    setCurrentTime(0);
                  }}
                >
                  ← Upload Different Video
                </button>
                <button className="btn-primary" id="sub-export-btn">
                  🎬 Export Hardcoded Subtitles →
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
