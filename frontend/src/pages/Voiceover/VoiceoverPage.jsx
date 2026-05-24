import { useState, useRef } from 'react';
import { generateVoiceover } from '../../api/voiceApi';
import './VoiceoverPage.css';

const voices = [
  { id: 'emma', name: 'Emma', gender: 'Female', region: 'US English', tone: 'Warm & Professional', previewText: "Hello there! I'm Emma, your go-to voice for engaging explainer videos." },
  { id: 'james', name: 'James', gender: 'Male', region: 'UK English', tone: 'Confident & Authority', previewText: "Welcome. I'm James, delivering polished narration with an elite British tone." },
  { id: 'priya', name: 'Priya', gender: 'Female', region: 'IN English', tone: 'Clear & Welcoming', previewText: "Hi, I'm Priya. Ready to craft expressive, friendly narration for your audience." },
  { id: 'aria', name: 'Aria', gender: 'Female', region: 'AU English', tone: 'Bright & Energetic', previewText: "G'day! I'm Aria, perfect for high-energy social edits and promos." }
];

export default function VoiceoverPage() {
  const [text, setText] = useState('');
  const [selectedVoice, setSelectedVoice] = useState('emma');
  const [language, setLanguage] = useState('en-US');
  const [speed, setSpeed] = useState(1.0);
  const [pitch, setPitch] = useState(1.0);
  const [generating, setGenerating] = useState(false);
  const [apiError, setApiError] = useState('');
  const [generatedVoiceovers, setGeneratedVoiceovers] = useState([
    {
      id: 1,
      voice: 'Emma',
      text: 'Stop wasting hours on manual editing. Let VisionForge build your next viral video in seconds!',
      speed: 1.0,
      pitch: 1.0,
      duration: '0:12',
      date: '2 minutes ago'
    },
    {
      id: 2,
      voice: 'James',
      text: 'In the world of finance, patience isn\'t just a virtue; it\'s your primary leverage.',
      speed: 0.95,
      pitch: 1.0,
      duration: '0:08',
      date: '1 hour ago'
    }
  ]);

  const [activePlayId, setActivePlayId] = useState(null);
  const speechRef = useRef(null);

  const handleSpeakSample = (voiceObj) => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(voiceObj.previewText);
      utterance.rate = speed;
      utterance.pitch = pitch;
      
      // Attempt to find a matching system voice
      const sysVoices = window.speechSynthesis.getVoices();
      const candidate = sysVoices.find(v => {
        const name = v.name.toLowerCase();
        const lang = v.lang.toLowerCase();
        if (voiceObj.id === 'emma' && (name.includes('zira') || lang.includes('en-us'))) return true;
        if (voiceObj.id === 'james' && (name.includes('david') || lang.includes('en-gb'))) return true;
        if (voiceObj.id === 'priya' && (name.includes('heera') || lang.includes('en-in'))) return true;
        if (voiceObj.id === 'aria' && (name.includes('hazel') || lang.includes('en-au'))) return true;
        return false;
      });
      if (candidate) utterance.voice = candidate;
      
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleGenerate = async () => {
    if (!text.trim()) return;
    setGenerating(true);
    setApiError(null);

    try {
      setApiError('');
      const response = await generateVoiceover({
        text,
        voice: selectedVoice,
        language,
        speed,
        pitch,
        format: 'mp3',
      });

      if (response?.status !== 'ok') {
        throw new Error(response?.detail || 'Voice generation failed');
      }

      const voiceInfo = voices.find(v => v.id === selectedVoice);
      const newVo = {
        id: Date.now(),
        voice: voiceInfo ? voiceInfo.name : 'Emma',
        text,
        speed,
        pitch,
        duration: `${Math.floor(response.duration / 60)}:${String(Math.round(response.duration % 60)).padStart(2, '0')}`,
        date: 'Just now',
        audioUrl: response.audioUrl,
        sync: response.sync || [],
      };

      setGeneratedVoiceovers(prev => [newVo, ...prev]);
      setText('');
    } catch (err) {
      setApiError(err?.message || 'Unable to synthesize voice.');
    } finally {
      setGenerating(false);
    }
  };

  const handlePlayVoiceover = (vo) => {
    if (speechRef.current) {
      speechRef.current.pause?.();
      speechRef.current = null;
    }

    if (activePlayId === vo.id) {
      setActivePlayId(null);
      return;
    }

    if (vo.audioUrl) {
      const base = import.meta.env.VITE_API_BASE || 'http://localhost:8000';
      const audio = new Audio(vo.audioUrl.startsWith('http') ? vo.audioUrl : `${base}${vo.audioUrl}`);
      audio.onended = () => setActivePlayId(null);
      audio.onerror = () => {
        setActivePlayId(null);
        setApiError('Audio playback failed.');
      };
      speechRef.current = audio;
      setActivePlayId(vo.id);
      audio.play();
      return;
    }

    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(vo.text);
      utterance.rate = vo.speed;
      utterance.pitch = vo.pitch;

      const voiceObj = voices.find(v => v.name === vo.voice);
      if (voiceObj) {
        const sysVoices = window.speechSynthesis.getVoices();
        const candidate = sysVoices.find(v => {
          const name = v.name.toLowerCase();
          const lang = v.lang.toLowerCase();
          if (voiceObj.id === 'emma' && (name.includes('zira') || lang.includes('en-us'))) return true;
          if (voiceObj.id === 'james' && (name.includes('david') || lang.includes('en-gb'))) return true;
          if (voiceObj.id === 'priya' && (name.includes('heera') || lang.includes('en-in'))) return true;
          if (voiceObj.id === 'aria' && (name.includes('hazel') || lang.includes('en-au'))) return true;
          return false;
        });
        if (candidate) utterance.voice = candidate;
      }

      utterance.onend = () => setActivePlayId(null);
      utterance.onerror = () => setActivePlayId(null);

      setActivePlayId(vo.id);
      window.speechSynthesis.speak(utterance);
    } else {
      setActivePlayId(vo.id);
      setTimeout(() => setActivePlayId(null), 3000);
    }
  };

  const handleDelete = (id) => {
    setGeneratedVoiceovers(prev => prev.filter(vo => vo.id !== id));
    if (activePlayId === id) {
      if (window.speechSynthesis) window.speechSynthesis.cancel();
      setActivePlayId(null);
    }
  };

  return (
    <div className="voiceover-page">
      <div className="vo-header">
        <h1>AI Voiceover Generator</h1>
        <p>Synthesize professional-grade voice narration using state-of-the-art neural voice models.</p>
      </div>

      <div className="vo-layout">
        {/* Configuration Panel */}
        <div className="vo-config-col">
          <div className="vo-card glass-panel">
            <div className="vo-card-header">
              <span>🎙️</span>
              <h2>Voice Parameters</h2>
            </div>

            {/* Neural Voice Grid */}
            <div className="form-group">
              <label>Select Neural Voice Model</label>
              <div className="voices-grid">
                {voices.map(v => (
                  <div
                    key={v.id}
                    className={`voice-card ${selectedVoice === v.id ? 'active' : ''}`}
                    onClick={() => setSelectedVoice(v.id)}
                  >
                    <div className="voice-meta">
                      <span className="voice-emoji">{v.gender === 'Female' ? '👩' : '👨'}</span>
                      <div>
                        <h3>{v.name}</h3>
                        <span>{v.region} • {v.gender}</span>
                      </div>
                    </div>
                    <div className="voice-tag">{v.tone}</div>
                    <button
                      className="preview-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSpeakSample(v);
                      }}
                      title="Listen to sample preview"
                    >
                      ▶ Listen
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Input Script */}
            <div className="form-group">
              <label htmlFor="voiceover-text">Voiceover Text Script</label>
              <textarea
                id="voiceover-text"
                rows={5}
                placeholder="Type or paste your video script here to convert it into incredibly realistic speech..."
                value={text}
                onChange={e => setText(e.target.value)}
                className="vo-textarea"
                disabled={generating}
              />
            </div>

            <div className="form-group">
              <label htmlFor="language-select">Language</label>
              <select
                id="language-select"
                value={language}
                onChange={e => setLanguage(e.target.value)}
                className="gen-select"
                disabled={generating}
              >
                <option value="en-US">English (US)</option>
                <option value="en-GB">English (UK)</option>
                <option value="en-IN">English (India)</option>
                <option value="en-AU">English (Australia)</option>
                <option value="es-ES">Spanish</option>
                <option value="fr-FR">French</option>
                <option value="de-DE">German</option>
              </select>
            </div>

            {/* Settings sliders */
            <div className="sliders-row">
              <div className="form-group slider-item">
                <div className="slider-label">
                  <span>Speed Dial</span>
                  <span className="slider-value">{speed}x</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="2.0"
                  step="0.05"
                  value={speed}
                  onChange={e => setSpeed(parseFloat(e.target.value))}
                  disabled={generating}
                />
              </div>

              <div className="form-group slider-item">
                <div className="slider-label">
                  <span>Pitch Accent</span>
                  <span className="slider-value">{pitch}x</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="1.5"
                  step="0.05"
                  value={pitch}
                  onChange={e => setPitch(parseFloat(e.target.value))}
                  disabled={generating}
                />
              </div>
            </div>

            <button
              onClick={handleGenerate}
              className={`btn-primary vo-gen-btn ${generating ? 'loading' : ''}`}
              id="vo-generate-btn"
              disabled={!text.trim() || generating}
            >
              {generating ? (
                <><span className="vo-spinner" />Synthesizing Audio…</>
              ) : (
                '🎙️ Generate Neural Voiceover'
              )}
            </button>

            {apiError && <p className="error-text">{apiError}</p>}
          </div>
        </div>

        {/* Generated Library Workspace */}
        <div className="vo-library-col">
          <div className="vo-library-card glass-panel">
            <div className="vo-lib-header">
              <h2>Generated Library</h2>
              <span className="badge-count">{generatedVoiceovers.length} tracks</span>
            </div>

            {generatedVoiceovers.length === 0 ? (
              <div className="vo-library-empty">
                <div className="empty-icon">🎧</div>
                <h3>No Tracks Yet</h3>
                <p>Generated narrations will appear here. Customize parameters and synthesize your first track!</p>
              </div>
            ) : (
              <div className="vo-tracks-list">
                {generatedVoiceovers.map(vo => {
                  const isPlaying = activePlayId === vo.id;
                  return (
                    <div key={vo.id} className={`track-row ${isPlaying ? 'playing' : ''}`}>
                      <div className="track-details">
                        <div className="track-head">
                          <span className="track-voice-tag">🎙️ {vo.voice}</span>
                          <span className="track-meta">{vo.duration} • {vo.date}</span>
                        </div>
                        <p className="track-text">"{vo.text}"</p>
                        
                        {/* Audio Waveform Animation Mock */}
                        <div className="waveform-container">
                          <div className={`waveform ${isPlaying ? 'animating' : ''}`}>
                            <span className="wave-bar"></span>
                            <span className="wave-bar"></span>
                            <span className="wave-bar"></span>
                            <span className="wave-bar"></span>
                            <span className="wave-bar"></span>
                            <span className="wave-bar"></span>
                            <span className="wave-bar"></span>
                            <span className="wave-bar"></span>
                            <span className="wave-bar"></span>
                            <span className="wave-bar"></span>
                            <span className="wave-bar"></span>
                            <span className="wave-bar"></span>
                            <span className="wave-bar"></span>
                            <span className="wave-bar"></span>
                            <span className="wave-bar"></span>
                            <span className="wave-bar"></span>
                            <span className="wave-bar"></span>
                            <span className="wave-bar"></span>
                            <span className="wave-bar"></span>
                            <span className="wave-bar"></span>
                          </div>
                        </div>
                      </div>

                      <div className="track-controls">
                        <button
                          className={`track-play-btn ${isPlaying ? 'active' : ''}`}
                          onClick={() => handlePlayVoiceover(vo)}
                        >
                          {isPlaying ? '⏸ Stop' : '▶ Play'}
                        </button>
                        {vo.audioUrl ? (
                          <a
                            href={vo.audioUrl.startsWith('http') ? vo.audioUrl : `${import.meta.env.VITE_API_BASE || 'http://localhost:8000'}${vo.audioUrl}`}
                            download={`voiceover_${vo.voice.toLowerCase()}_${vo.id}.mp3`}
                            className="track-action-btn"
                            title="Download Audio File"
                          >
                            📥 Download
                          </a>
                        ) : (
                          <a
                            href={`data:text/plain;charset=utf-8,${encodeURIComponent(vo.text)}`}
                            download={`voiceover_${vo.voice.toLowerCase()}_${vo.id}.txt`}
                            className="track-action-btn"
                            title="Download Text Script"
                          >
                            📥 Download
                          </a>
                        )}
                        <button
                          className="track-action-btn delete"
                          onClick={() => handleDelete(vo.id)}
                          title="Delete Track"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
