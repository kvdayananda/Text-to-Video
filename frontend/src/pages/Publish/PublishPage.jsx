import { useEffect, useState } from 'react';
import { getPlatforms, getPublishStatus, getVideos, publishVideo } from '../../api/publishApi';
import { runCopyrightScan } from '../../api/copyrightApi';
import './PublishPage.css';

const defaultPlatforms = [
  { id: 'youtube', name: 'YouTube', icon: '▶', connected: true, color: '#ff4444', account: 'Tech World Official' },
  { id: 'instagram', name: 'Instagram', icon: '📷', connected: true, color: '#e1306c', account: '@techworld_official' },
  { id: 'tiktok', name: 'TikTok', icon: '🎵', connected: true, color: '#00e5ff', account: '@techworld_ai' },
  { id: 'facebook', name: 'Facebook Page', icon: '𝑓', connected: true, color: '#1877f2', account: 'Tech World' },
];

const defaultVideos = [
  {
    id: 1,
    title: 'The Future of AI — How AI is Changing the World',
    thumb: '🤖',
    duration: '02:45',
    resolution: '1920 x 1080',
    size: '52.4 MB',
    status: 'Shorts',
    description: 'Exploring how artificial intelligence is changing the world and shaping our future.',
  },
  {
    id: 2,
    title: 'AI-Powered Content Strategy for 2026',
    thumb: '🧠',
    duration: '04:08',
    resolution: '1080 x 1080',
    size: '34.1 MB',
    status: 'Ready',
    description: 'A quick walkthrough of the best AI content strategies for social media growth.',
  },
  {
    id: 3,
    title: 'How to Turn Short Clips into Viral Videos',
    thumb: '🔥',
    duration: '01:52',
    resolution: '1080 x 1920',
    size: '18.7 MB',
    status: 'Ready',
    description: 'Best practices for fast, scroll-stopping short-form clips across platforms.',
  },
];

const initialPlatformConfigs = defaultPlatforms.reduce((acc, platform) => {
  acc[platform.id] = {
    title: '',
    description: '',
    tags: 'AI, Artificial Intelligence, Future Technology',
    visibility: 'Public',
    playlist: 'AI Technology',
  };
  return acc;
}, {});

export default function PublishPage() {
  const [videos, setVideos] = useState(defaultVideos);
  const [platformsData, setPlatformsData] = useState(defaultPlatforms);
  const [selectedVideoId, setSelectedVideoId] = useState(defaultVideos[0].id);
  const [activePlatform, setActivePlatform] = useState('youtube');
  const [selectedPlatforms, setSelectedPlatforms] = useState(['youtube', 'instagram']);
  const [platformConfigs, setPlatformConfigs] = useState(initialPlatformConfigs);
  const [publishMode, setPublishMode] = useState('now');
  const [scheduleTime, setScheduleTime] = useState('2026-05-25T15:00');
  const [publishing, setPublishing] = useState(false);
  const [published, setPublished] = useState(false);
  const [backendStatus, setBackendStatus] = useState('Connecting...');
  const [responseMessage, setResponseMessage] = useState('');
  const [copyrightScanning, setCopyrightScanning] = useState(false);
  const [copyrightReport, setCopyrightReport] = useState(null);
  const [copyrightError, setCopyrightError] = useState('');

  const selectedVideo = videos.find(video => video.id === selectedVideoId) || defaultVideos[0];
  const activeConfig = platformConfigs[activePlatform] || initialPlatformConfigs[activePlatform];

  useEffect(() => {
    async function loadData() {
      try {
        const [videoRes, platformRes, statusRes] = await Promise.all([
          getVideos(),
          getPlatforms(),
          getPublishStatus(),
        ]);

        if (videoRes?.videos?.length) {
          setVideos(videoRes.videos);
          setSelectedVideoId(videoRes.videos[0].id);
        }

        if (platformRes?.platforms?.length) {
          setPlatformsData(platformRes.platforms);
        }

        setBackendStatus(statusRes?.message ?? 'Backend connected');
      } catch (error) {
        setBackendStatus('Offline - backend unavailable');
      }
    }

    loadData();
  }, []);

  const handleVideoSelect = id => {
    setSelectedVideoId(id);
    setPublished(false);
    setResponseMessage('');
  };

  const handlePlatformToggle = id => {
    setSelectedPlatforms(prev =>
      prev.includes(id) ? prev.filter(platform => platform !== id) : [...prev, id]
    );
  };

  const handleConfigChange = (platform, field, value) => {
    setPlatformConfigs(prev => ({
      ...prev,
      [platform]: {
        ...prev[platform],
        [field]: value,
      },
    }));
  };

  const publishText = publishMode === 'draft'
    ? 'Save as Draft'
    : publishMode === 'later'
      ? 'Schedule Publishing'
      : 'Publish Now';

  const handlePublish = async () => {
    if (!selectedVideo || selectedPlatforms.length === 0) return;

    setPublishing(true);
    setPublished(false);
    setResponseMessage('');
    setCopyrightError('');
    setCopyrightReport(null);
    setCopyrightScanning(true);

    try {
      const scanResponse = await runCopyrightScan({
        videoId: selectedVideo.id,
        scanAudio: true,
        scanVideo: true,
        scanImage: true,
        scanTrademarks: true,
      });

      setCopyrightReport(scanResponse);

      if (scanResponse?.status !== 'Safe & Clear') {
        setResponseMessage('Publish blocked: copyright scan found potential issues. Resolve the issues before publishing.');
        setPublishing(false);
        return;
      }
    } catch (error) {
      setCopyrightError(error.message || 'Copyright scan failed.');
      setResponseMessage('Unable to verify copyright status before publishing.');
      setPublishing(false);
      return;
    } finally {
      setCopyrightScanning(false);
    }

    const payload = {
      videoId: selectedVideo.id,
      platforms: selectedPlatforms,
      publishMode,
      scheduleTime: publishMode === 'later' ? scheduleTime : undefined,
      metadata: selectedPlatforms.reduce((data, platformId) => {
        data[platformId] = platformConfigs[platformId] || {};
        return data;
      }, {}),
    };

    try {
      const response = await publishVideo(payload);
      if (response?.status === 'success') {
        setPublished(true);
        setResponseMessage(response.message || 'Publish request sent successfully.');
      } else {
        setResponseMessage(response?.message || 'Publish request failed.');
      }
    } catch (error) {
      setResponseMessage('Network error: unable to send publish request.');
    } finally {
      setPublishing(false);
    }
  };

  return (
    <div className="publish-page">
      <div className="publish-header">
        <div className="header-copy">
          <p className="eyebrow">Publish</p>
          <h1>Publish to Social Media</h1>
          <p>Publish your video to multiple platforms and grow your audience with one workflow.</p>
        </div>
        <div className="publish-steps">
          {['Select Video', 'Customize', 'Platforms', 'Review & Publish'].map((step, index) => (
            <div key={step} className={`step-pill ${index === 2 ? 'active' : ''}`}>
              <span>{index + 1}</span>
              <p>{step}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="publish-status-bar">
        <span>Backend:</span>
        <strong>{backendStatus}</strong>
      </div>

      <div className="publish-layout">
        <div className="publish-main">
          <div className="selected-video-card glass-panel">
            <div className="video-card-header">
              <div>
                <span className="video-label">Selected Video</span>
                <h2>{selectedVideo.title}</h2>
              </div>
              <button type="button" className="btn-secondary">Change Video</button>
            </div>

            <div className="video-preview">
              <div className="thumbnail-card">
                <div className="video-thumb-preview">{selectedVideo.thumb}</div>
                <div className="shorts-badge">{selectedVideo.status}</div>
              </div>
              <div className="video-meta">
                <p>{selectedVideo.description}</p>
                <div className="video-stats-row">
                  <span>{selectedVideo.resolution}</span>
                  <span>{selectedVideo.size}</span>
                  <span>{selectedVideo.duration}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="video-selection glass-panel">
            <div className="section-title">
              <div>
                <h3>Choose a video</h3>
                <p>Select the best video you want to publish.</p>
              </div>
            </div>
            <div className="video-select-grid">
              {videos.map(video => (
                <button
                  type="button"
                  key={video.id}
                  className={`video-card ${selectedVideoId === video.id ? 'selected' : ''}`}
                  onClick={() => handleVideoSelect(video.id)}
                >
                  <div className="video-card-thumb">{video.thumb}</div>
                  <div className="video-card-copy">
                    <p className="video-card-title">{video.title}</p>
                    <span>{video.duration}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="platform-customize glass-panel">
            <div className="section-title">
              <div>
                <h3>Customize for Each Platform</h3>
                <p>Tailor metadata and thumbnails for every channel.</p>
              </div>
            </div>

            <div className="platform-tabs">
              {platformsData.map(platform => (
                <button
                  type="button"
                  key={platform.id}
                  className={`platform-tab ${activePlatform === platform.id ? 'active' : ''}`}
                  onClick={() => setActivePlatform(platform.id)}
                >
                  <span className="platform-chip" style={{ background: `${platform.color}22`, color: platform.color }}>
                    {platform.icon}
                  </span>
                  <span>{platform.name}</span>
                </button>
              ))}
            </div>

            <div className="customize-form">
              <div className="form-group">
                <label htmlFor="platform-title">Title</label>
                <input
                  id="platform-title"
                  type="text"
                  value={activeConfig.title || selectedVideo.title}
                  onChange={e => handleConfigChange(activePlatform, 'title', e.target.value)}
                  placeholder="Write a platform-specific title"
                  className="pub-input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="platform-description">Description</label>
                <textarea
                  id="platform-description"
                  rows={4}
                  value={activeConfig.description || selectedVideo.description}
                  onChange={e => handleConfigChange(activePlatform, 'description', e.target.value)}
                  className="pub-input pub-textarea"
                />
              </div>

              <div className="form-row">
                <div className="form-group half-width">
                  <label htmlFor="platform-tags">Tags</label>
                  <input
                    id="platform-tags"
                    type="text"
                    value={activeConfig.tags}
                    onChange={e => handleConfigChange(activePlatform, 'tags', e.target.value)}
                    placeholder="AI, Automation, Growth"
                    className="pub-input"
                  />
                </div>
                <div className="form-group half-width">
                  <label htmlFor="platform-visibility">Visibility</label>
                  <select
                    id="platform-visibility"
                    value={activeConfig.visibility}
                    onChange={e => handleConfigChange(activePlatform, 'visibility', e.target.value)}
                    className="pub-input"
                  >
                    <option>Public</option>
                    <option>Unlisted</option>
                    <option>Private</option>
                  </select>
                </div>
              </div>

              <div className="form-row gap-large">
                <div className="thumbnail-panel">
                  <span className="thumb-label">Thumbnail</span>
                  <div className="thumbnail-preview">{selectedVideo.thumb}</div>
                  <button type="button" className="btn-secondary">Change Thumbnail</button>
                </div>
                <div className="playlist-panel">
                  <label htmlFor="platform-playlist">Playlist</label>
                  <select
                    id="platform-playlist"
                    value={activeConfig.playlist}
                    onChange={e => handleConfigChange(activePlatform, 'playlist', e.target.value)}
                    className="pub-input"
                  >
                    <option>AI Technology</option>
                    <option>Tech Trends</option>
                    <option>Shorts</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

        <aside className="publish-side">
          <div className="glass-panel accounts-panel">
            <div className="section-title">
              <div>
                <h3>Connected Accounts</h3>
                <p>Publish directly to your linked channels.</p>
              </div>
            </div>
            <div className="accounts-list">
              {platformsData.map(account => (
                <div
                  key={account.id}
                  className={`account-row ${selectedPlatforms.includes(account.id) ? 'selected' : ''} ${account.connected ? 'clickable' : ''}`}
                  onClick={() => account.connected && handlePlatformToggle(account.id)}
                >
                  <div className="account-avatar" style={{ background: `${account.color}22`, color: account.color }}>
                    {account.icon}
                  </div>
                  <div className="account-copy">
                    <span>{account.name}</span>
                    <small>{account.account}</small>
                  </div>
                  <span className={`account-status ${selectedPlatforms.includes(account.id) ? 'selected' : account.connected ? 'connected' : 'disconnected'}`}>
                    {selectedPlatforms.includes(account.id) ? 'Selected' : account.connected ? 'Connected' : 'Connect'}
                  </span>
                </div>
              ))}
            </div>
            <button type="button" className="btn-secondary connect-new">+ Connect New Account</button>
          </div>

          <div className="glass-panel publish-options-panel">
            <div className="section-title">
              <div>
                <h3>Publishing Options</h3>
                <p>Control when and how your content goes live.</p>
              </div>
            </div>
            <div className="publish-option-row">
              <input
                id="option-now"
                type="radio"
                name="publishOption"
                checked={publishMode === 'now'}
                onChange={() => setPublishMode('now')}
              />
              <label htmlFor="option-now">Publish Now</label>
            </div>
            <div className="publish-option-row">
              <input
                id="option-later"
                type="radio"
                name="publishOption"
                checked={publishMode === 'later'}
                onChange={() => setPublishMode('later')}
              />
              <label htmlFor="option-later">Schedule for Later</label>
            </div>
            {publishMode === 'later' && (
              <input
                type="datetime-local"
                value={scheduleTime}
                onChange={e => setScheduleTime(e.target.value)}
                className="pub-input schedule-input"
              />
            )}
            <div className="publish-option-row">
              <input
                id="option-draft"
                type="radio"
                name="publishOption"
                checked={publishMode === 'draft'}
                onChange={() => setPublishMode('draft')}
              />
              <label htmlFor="option-draft">Save as Draft</label>
            </div>
          </div>

          <div className="glass-panel tips-panel">
            <div className="tips-top">
              <span>💡</span>
              <div>
                <h3>Smart Tips</h3>
                <p>AI has optimized your title, description and tags for better reach and engagement.</p>
              </div>
            </div>
            <ul>
              <li>Keep headings concise for mobile viewers.</li>
              <li>Use 3-5 strong tags for discoverability.</li>
              <li>Pick a thumbnail with bold contrast.</li>
            </ul>
          </div>
        </aside>
      </div>

      {copyrightScanning && (
        <div className="publish-message glass-panel">
          <p>Running copyright scan before publishing...</p>
        </div>
      )}

      {responseMessage && (
        <div className="publish-message glass-panel">
          <p>{responseMessage}</p>
        </div>
      )}

      {copyrightError && (
        <div className="publish-message glass-panel error-text">
          <p>{copyrightError}</p>
        </div>
      )}

      {published && (
        <div className="publish-banner glass-panel">
          <div>
            <h3>Success! Your campaign is ready.</h3>
            <p>{selectedPlatforms.length} platform{selectedPlatforms.length !== 1 ? 's' : ''} will receive this video.</p>
          </div>
          <button className="btn-secondary" type="button" onClick={() => setPublished(false)}>Publish Another</button>
        </div>
      )}

      <button
        className={`pub-submit-btn btn-primary ${(publishing || copyrightScanning) ? 'loading' : ''}`}
        onClick={handlePublish}
        disabled={selectedPlatforms.length === 0 || publishing || copyrightScanning}
      >
        {publishing || copyrightScanning ? 'Checking copyright…' : publishText}
      </button>
    </div>
  );
}
