import { useState } from 'react';
import { generateAIVideo, generateAIImage } from '../../api/videoApi';
import './GeneratorPage.css';

const styles = ['Cinematic', 'Animated', 'Documentary', 'Motivational', 'Educational', 'News Style'];
const providers = ['openai', 'stability', 'runway'];
const platforms = ['YouTube', 'Instagram Reels', 'TikTok', 'YouTube Shorts', 'Facebook'];
const durations = ['30s', '60s', '3 min', '5 min', '10 min'];
const voices = ['Emma (Female, US)', 'James (Male, UK)', 'Priya (Female, IN)', 'Marco (Male, IT)', 'Aria (Female, Calm)'];
const ratios = ['16:9 (YouTube)', '9:16 (Shorts/Reels)', '1:1 (Square)', '4:5 (Instagram)'];

const genSteps = [
  { id: 'script', label: 'Script', icon: '✍️' },
  { id: 'scenes', label: 'Scenes', icon: '🎞️' },
  { id: 'voice', label: 'Voiceover', icon: '🎙️' },
  { id: 'subtitles', label: 'Subtitles', icon: '📝' },
  { id: 'render', label: 'Rendering', icon: '🎬' },
];

export default function GeneratorPage() {
  const [prompt, setPrompt] = useState('');
  const [style, setStyle] = useState('Cinematic');
  const [provider, setProvider] = useState('openai');
  const [platform, setPlatform] = useState('YouTube');
  const [duration, setDuration] = useState('3 min');
  const [voice, setVoice] = useState('Emma (Female, US)');
  const [ratio, setRatio] = useState('16:9 (YouTube)');
  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(-1);
  const [done, setDone] = useState(false);
  const [videoUrl, setVideoUrl] = useState('');
  const [script, setScript] = useState('');
  const [scenePreview, setScenePreview] = useState([]);
  const [imageData, setImageData] = useState('');
  const [imageError, setImageError] = useState('');
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setGenerating(true);
    setDone(false);
    setProgress(0);
    setCurrentStep(0);
    setError('');
    setScript('');
    setVideoUrl('');
    setScenePreview([]);

    let step = 0;
    const interval = setInterval(() => {
      step += 1;
      setCurrentStep(step);
      setProgress(Math.min((step / genSteps.length) * 100, 100));
    }, 1200);

    try {
      const response = await generateAIVideo({
        prompt,
        style,
        duration,
        ratio,
        voice,
        provider,
      });

      clearInterval(interval);
      setProgress(100);
      setCurrentStep(genSteps.length - 1);

      if (response?.status !== 'ok') {
        throw new Error(response?.detail || 'Video generation failed');
      }

      const video = response.video || {};
      const base = import.meta.env.VITE_API_BASE || 'http://localhost:8000';
      setVideoUrl(new URL(video.videoUrl || '/renders/preview.mp4', base).toString());
      setScript(video.script || '');
      setScenePreview(video.scenes || []);
      setDone(true);
    } catch (err) {
      clearInterval(interval);
      setError(err?.message || 'Unable to generate video.');
      setGenerating(false);
      setCurrentStep(-1);
      setProgress(0);
    }
  };

  const handleGenerateImage = async () => {
    if (!prompt.trim()) return;
    setImageError('');
    setImageData('');

    try {
      const response = await generateAIImage({
        prompt,
        provider,
        width: 512,
        height: 512,
        style,
      });

      if (response?.status !== 'ok') {
        throw new Error(response?.detail || 'Image generation failed');
      }

      setImageData(response.image.imageData || '');
    } catch (err) {
      setImageError(err?.message || 'Unable to generate image');
    }
  };

  const handleReset = () => {
    setDone(false);
    setGenerating(false);
    setProgress(0);
    setCurrentStep(-1);
    setPrompt('');
    setScript('');
    setVideoUrl('');
    setScenePreview([]);
    setImageData('');
    setError('');
    setImageError('');
  };

  return (
    <div className="generator-page">
      <div className="gen-header">
        <h1>Create AI Video</h1>
        <p>Describe your video idea and let our AI handle the rest — script, voiceover, subtitles, and render.</p>
      </div>

      <div className="gen-layout">
        <div className="gen-config">
          <div className="gen-card glass-panel">
            <div className="gen-card-header">
              <span className="gen-card-icon">💡</span>
              <h2>Your Video Idea</h2>
            </div>
            <textarea
              className="gen-prompt"
              id="video-prompt-input"
              placeholder="e.g. Create a 3-minute video about the Top 10 AI tools in 2025 that every content creator should use. Include viral hooks and a strong CTA to subscribe."
              rows={5}
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              disabled={generating}
            />
            <div className="prompt-hint">
              💡 Tip: Be specific about topic, tone, and target audience for best results.
            </div>
          </div>

          <div className="gen-card glass-panel">
            <div className="gen-card-header">
              <span className="gen-card-icon">⚙️</span>
              <h2>Generation Settings</h2>
            </div>
            <div className="settings-grid">
              <div className="setting-group">
                <label>Video Style</label>
                <div className="chip-group" id="style-chips">
                  {styles.map(s => (
                    <button
                      key={s}
                      className={`chip ${style === s ? 'active' : ''}`}
                      onClick={() => setStyle(s)}
                      disabled={generating}
                      id={`style-${s.toLowerCase().replace(' ', '-')}`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div className="setting-row">
                <div className="setting-group">
                  <label htmlFor="provider-select">AI Provider</label>
                  <select
                    id="provider-select"
                    value={provider}
                    onChange={e => setProvider(e.target.value)}
                    disabled={generating}
                    className="gen-select"
                  >
                    {providers.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                <div className="setting-group">
                  <label htmlFor="duration-select">Duration</label>
                  <select
                    id="duration-select"
                    value={duration}
                    onChange={e => setDuration(e.target.value)}
                    disabled={generating}
                    className="gen-select"
                  >
                    {durations.map(d => <option key={d}>{d}</option>)}
                  </select>
                </div>
              </div>

              <div className="setting-row">
                <div className="setting-group">
                  <label htmlFor="voice-select">AI Voice</label>
                  <select
                    id="voice-select"
                    value={voice}
                    onChange={e => setVoice(e.target.value)}
                    disabled={generating}
                    className="gen-select"
                  >
                    {voices.map(v => <option key={v}>{v}</option>)}
                  </select>
                </div>
                <div className="setting-group">
                  <label htmlFor="ratio-select">Aspect Ratio</label>
                  <select
                    id="ratio-select"
                    value={ratio}
                    onChange={e => setRatio(e.target.value)}
                    disabled={generating}
                    className="gen-select"
                  >
                    {ratios.map(r => <option key={r}>{r}</option>)}
                  </select>
                </div>
              </div>
            </div>
          </div>

          <button
            className="btn-primary gen-btn"
            id="generate-video-btn"
            onClick={handleGenerate}
            disabled={!prompt.trim() || generating}
          >
            🚀 Generate AI Video
          </button>

          <button
            className="btn-secondary gen-btn"
            id="generate-image-btn"
            onClick={handleGenerateImage}
            disabled={!prompt.trim() || generating}
          >
            🖼️ Generate AI Scene Image
          </button>

          {imageError && <p className="error-text">{imageError}</p>}
        </div>

        <div className="gen-output">
          {!generating && !done && !imageData && (
            <div className="gen-placeholder glass-panel">
              <div className="placeholder-icon">🎬</div>
              <h3>Your Video Will Appear Here</h3>
              <p>Fill in your idea and settings, then click Generate. Our AI will create your video in minutes.</p>
              <div className="placeholder-features">
                {['AI Script', 'Scene Images', 'Voiceover', 'Subtitles', 'Final Render'].map(f => (
                  <span key={f} className="placeholder-chip">✓ {f}</span>
                ))}
              </div>
            </div>
          )}

          {imageData && !done && (
            <div className="gen-image-preview glass-panel">
              <h3>AI Scene Image Preview</h3>
              <img src={imageData} alt="AI generated" className="ai-image-preview" />
            </div>
          )}

          {(generating || done) && (
            <div className="gen-progress-panel glass-panel">
              <div className="gpp-header">
                {generating ? (
                  <>
                    <div className="gpp-spinner" />
                    <div>
                      <h3>Generating Your Video…</h3>
                      <p className="gpp-sub">This usually takes 2–5 minutes</p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="gpp-done-icon">✅</div>
                    <div>
                      <h3>Video Ready!</h3>
                      <p className="gpp-sub">Your AI video has been generated successfully</p>
                    </div>
                  </>
                )}
              </div>

              <div className="progress-bar-wrap">
                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{ width: `${done ? 100 : progress}%` }}
                  />
                </div>
                <span className="progress-pct">{done ? '100' : Math.round(progress)}%</span>
              </div>

              <div className="gen-steps-list">
                {genSteps.map((step, i) => {
                  const isDone = i < currentStep || done;
                  const isActive = i === currentStep && generating;
                  return (
                    <div
                      className={`gen-step-row ${isDone ? 'done' : ''} ${isActive ? 'active' : ''}`}
                      key={step.id}
                    >
                      <div className="step-row-icon">
                        {isDone ? '✓' : isActive ? <span className="step-spin">⟳</span> : step.icon}
                      </div>
                      <span className="step-row-label">{step.label}</span>
                      <span className="step-row-status">
                        {isDone ? 'Complete' : isActive ? 'Processing…' : 'Waiting'}
                      </span>
                    </div>
                  );
                })}
              </div>

              {done && (
                <>
                  {error && <p className="error-text">{error}</p>}
                  <div className="video-preview-panel">
                    {videoUrl && (
                      <video controls className="video-player" src={videoUrl} />
                    )}
                    {script && (
                      <div className="script-output">
                        <h3>Generated Script</h3>
                        <pre>{script}</pre>
                      </div>
                    )}
                    {scenePreview.length > 0 && (
                      <div className="scene-preview-list">
                        <h3>Storyboard Scenes</h3>
                        {scenePreview.map((scene, index) => (
                          <div className="scene-card" key={index} style={{ borderColor: scene.background }}>
                            <strong>Scene {index + 1}</strong>
                            <p>{scene.text}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="gen-done-actions">
                    <a className="btn-primary" href={videoUrl} download id="download-video-btn">⬇ Download MP4</a>
                    <button className="btn-secondary" onClick={handleReset} id="gen-reset-btn">↺ New Video</button>
                  </div>
                </>
              )}
            </div>
          )}

          {!generating && error && <p className="error-text">{error}</p>}
        </div>
      </div>
    </div>
  );
}
