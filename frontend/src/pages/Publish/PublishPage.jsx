import { useEffect, useState } from 'react';
import { getPlatforms, getPublishStatus, getVideos, publishVideo, uploadVideo, getScheduledPublishes } from '../../api/publishApi';
import { getConnectedProviders, getProviderConnectUrl } from '../../api/authApi';
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
  const [connectedProviders, setConnectedProviders] = useState({});
  const [uploadedFile, setUploadedFile] = useState(null);
  const [newVideoTitle, setNewVideoTitle] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [scheduledPublishes, setScheduledPublishes] = useState([]);
  const [responseMessage, setResponseMessage] = useState('');
  const [prePublishScanning, setPrePublishScanning] = useState(false);
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

      try {
        const providerRes = await getConnectedProviders();
        if (providerRes?.providers?.length) {
          setConnectedProviders(
            providerRes.providers.reduce((acc, item) => {
              acc[item.provider] = item.connected;
              return acc;
            }, {})
          );
        }
      } catch (providerError) {
        // Ignore provider fetch when not authenticated or not connected.
      }

      try {
        const scheduleRes = await getScheduledPublishes();
        if (scheduleRes?.scheduled?.length) {
          setScheduledPublishes(scheduleRes.scheduled);
        }
      } catch (scheduleError) {
        // Ignore schedule fetch when not authenticated or scheduler unavailable.
      }
    }

    loadData();

    const searchParams = new URLSearchParams(window.location.search);
    const connectedProvider = searchParams.get('connected');
    if (connectedProvider) {
      setResponseMessage(`${connectedProvider.charAt(0).toUpperCase() + connectedProvider.slice(1)} account connected successfully.`);
      window.history.replaceState({}, document.title, window.location.pathname);
      setConnectedProviders(prev => ({ ...prev, [connectedProvider]: true }));
    }
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

  const handleProviderConnect = provider => {
    window.location.href = getProviderConnectUrl(provider, '/publish');
  };

  const handleAddAccount = () => {
    const nextProvider = ['youtube', 'instagram'].find(provider => !connectedProviders[provider]) || 'youtube';
    handleProviderConnect(nextProvider);
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

  const formatBytes = bytes => {
    if (!bytes) return '0 MB';
    const units = ['bytes', 'KB', 'MB', 'GB'];
    let index = 0;
    let value = bytes;
    while (value >= 1024 && index < units.length - 1) {
      value /= 1024;
      index += 1;
    }
    return `${value.toFixed(1)} ${units[index]}`;
  };

  const handleFileChange = event => {
    const file = event.target.files?.[0] || null;
    setUploadedFile(file);
    setNewVideoTitle(file?.name || '');
    setUploadError('');
  };

  const handleUpload = async () => {
    if (!uploadedFile) {
      setUploadError('Please choose a video file first.');
      return;
    }

    setUploading(true);
    setUploadError('');
    setResponseMessage('');

    try {
      const response = await uploadVideo(uploadedFile, newVideoTitle || uploadedFile.name);
      if (response?.status === 'success' && response.video) {
        setVideos(prev => [...prev, response.video]);
        setSelectedVideoId(response.video.id);
        setUploadedFile(null);
        setNewVideoTitle('');
        setResponseMessage('Video uploaded successfully and ready to publish.');
      } else {
        setUploadError(response?.detail || response?.message || 'Upload failed.');
      }
    } catch (err) {
      setUploadError('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
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

    // Run pre-publish copyright scan and block publish on high risk
    setPrePublishScanning(true);
    try {
      const scan = await runCopyrightScan({
        videoId: selectedVideo.id,
        scanAudio: true,
        scanVideo: true,
        scanImage: true,
        scanTrademarks: true,
      });

      setCopyrightReport(scan);
      const hasHigh = (scan.findings || []).some(f => f.severity === 'High');
      const score = typeof scan.overallScore === 'number' ? scan.overallScore : 100;
      if (hasHigh || score < 85) {
        setResponseMessage('Publish blocked: copyright risk detected. Resolve issues before publishing.');
        setPublishing(false);
        setPrePublishScanning(false);
        return;
      }
    } catch (err) {
      setCopyrightReport(null);
      setCopyrightError(err.message || 'Pre-publish scan failed.');
      setResponseMessage('Pre-publish scan failed — cannot publish now.');
      setPublishing(false);
      setPrePublishScanning(false);
      return;
    } finally {
      setPrePublishScanning(false);
    }
    // proceed to publish if scan passed

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

      {copyrightReport && (
        <div className="publish-scan-report glass-panel">
          <div className="report-summary-row">
            <div>
              <h3>Latest Copyright Scan</h3>
              <p>{copyrightReport.summary}</p>
            </div>
            <div className="scan-score-block" style={{ borderColor: copyrightReport.color }}>
              <span>{copyrightReport.overallScore}</span>
              <small>{copyrightReport.status}</small>
            </div>
          </div>
          {copyrightReport.findings && copyrightReport.findings.length > 0 ? (
            <div className="report-findings-list">
              {copyrightReport.findings.map(item => (
                <div key={item.id} className="report-finding-item">
                  <strong>{item.type}</strong>
                  <span>{item.severity} Risk</span>
                  <p>{item.recommendation}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="report-safe-text">No major risks were detected; this asset is ready for publish review.</p>
          )}
        </div>
      )}

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
            <div className="upload-panel">
              <div className="upload-panel-copy">
                <h4>Upload Your Own Video</h4>
                <p>Send your recorded or rendered video to VisionForge and publish it to social media.</p>
              </div>
              <div className="upload-controls">
                <input
                  type="file"
                  accept="video/*"
                  onChange={handleFileChange}
                  className="pub-input"
                />
                <input
                  type="text"
                  value={newVideoTitle}
                  onChange={e => setNewVideoTitle(e.target.value)}
                  placeholder="Optional upload title"
                  className="pub-input"
                />
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={handleUpload}
                  disabled={uploading || !uploadedFile}
                >
                  {uploading ? 'Uploading…' : 'Upload Video'}
                </button>
                {uploadError && <p className="error-text">{uploadError}</p>}
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
              {platformsData.map(account => {
                const isConnected = connectedProviders[account.id] ?? account.connected;
                return (
                  <div
                    key={account.id}
                    className={`account-row ${selectedPlatforms.includes(account.id) ? 'selected' : ''} ${isConnected ? 'clickable' : ''}`}
                    onClick={() => isConnected && handlePlatformToggle(account.id)}
                  >
                    <div className="account-avatar" style={{ background: `${account.color}22`, color: account.color }}>
                      {account.icon}
                    </div>
                    <div className="account-copy">
                      <span>{account.name}</span>
                      <small>{account.account}</small>
                    </div>
                    {isConnected ? (
                      <span className={`account-status ${selectedPlatforms.includes(account.id) ? 'selected' : 'connected'}`}>
                        {selectedPlatforms.includes(account.id) ? 'Selected' : 'Connected'}
                      </span>
                    ) : account.id === 'youtube' || account.id === 'instagram' ? (
                      <button
                        type="button"
                        className="connect-btn"
                        onClick={() => handleProviderConnect(account.id)}
                      >
                        Connect
                      </button>
                    ) : (
                      <span className="account-status disconnected">Connect</span>
                    )}
                  </div>
                );
              })}
            </div>
            <button type="button" className="btn-secondary connect-new" onClick={handleAddAccount}>
              + Connect New Account
            </button>
          </div>

          {scheduledPublishes.length > 0 && (
            <div className="glass-panel schedule-panel">
              <div className="section-title">
                <div>
                  <h3>Scheduled Publishes</h3>
                  <p>Review upcoming auto publish jobs for your account.</p>
                </div>
              </div>
              <div className="schedule-list">
                {scheduledPublishes.map(task => (
                  <div key={task.id} className="schedule-row">
                    <div>
                      <strong>{task.platforms.join(', ')}</strong>
                      <p>{new Date(task.scheduledFor).toLocaleString()}</p>
                    </div>
                    <span className={`status-pill ${task.status}`}>{task.status}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

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

      {prePublishScanning && (
        <div className="publish-message glass-panel">
          <p>Running copyright scan before publishing...</p>
        </div>
      )}

      {responseMessage && (
        <div className="publish-message glass-panel">
          <p>{responseMessage}</p>
        </div>
      )}

      {/* errors are shown in responseMessage */}

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
        className={`pub-submit-btn btn-primary ${(publishing || prePublishScanning) ? 'loading' : ''}`}
        onClick={handlePublish}
        disabled={selectedPlatforms.length === 0 || publishing || prePublishScanning}
      >
        {publishing || prePublishScanning ? 'Checking copyright…' : publishText}
      </button>
    </div>
  );
}
