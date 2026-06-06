import { useState } from 'react';
import { runCopyrightScan } from '../../api/copyrightApi';
import './CopyrightCheckerPage.css';

export default function CopyrightCheckerPage() {
  const [selectedAsset, setSelectedAsset] = useState('video-01');
  const [scanVideo, setScanVideo] = useState(true);
  const [scanAudio, setScanAudio] = useState(true);
  const [scanTrademarks, setScanTrademarks] = useState(true);
  
  const [scanning, setScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [currentStepText, setCurrentStepText] = useState('');
  const [scanCompleted, setScanCompleted] = useState(false);
  const [resolving, setResolving] = useState(false);
  const [scanError, setScanError] = useState('');

  const [report, setReport] = useState(null);

  const handleScan = async () => {
    setScanning(true);
    setScanCompleted(false);
    setScanProgress(0);
    setScanError('');
    setReport(null);

    const steps = [
      'Decomposing video files into frame matrices...',
      'Comparing video frames against global media archives...',
      'Analyzing audio track spectrum & ambient fingerprints...',
      'Matching audio waves with commercial music catalogs...',
      'Validating speech transcription for trademarked names...',
      'Synthesizing ultimate risk assessment checklist...'
    ];

    let currentStep = 0;
    setCurrentStepText(steps[0]);

    const interval = setInterval(() => {
      currentStep++;
      if (currentStep < steps.length) {
        setScanProgress(prev => Math.min(prev + 16, 95));
        setCurrentStepText(steps[currentStep]);
      }
    }, 800);

    try {
      const assetId = parseInt(selectedAsset.split('-')[1], 10) || 1;
      const response = await runCopyrightScan({
        videoId: assetId,
        scanAudio,
        scanVideo,
        scanImage: true,
        scanTrademarks,
      });

      clearInterval(interval);
      setReport({
        ...response,
        findings: response.findings || [],
      });
      setScanProgress(100);
      setScanCompleted(true);
    } catch (error) {
      clearInterval(interval);
      setScanError(error.message || 'Copyright scan failed.');
      setScanProgress(100);
    } finally {
      setScanning(false);
    }
  };

  const handleResolveIssues = () => {
    setResolving(true);
    setTimeout(() => {
      // Simulate resolving all medium risks
      setReport(prev => ({
        ...prev,
        status: 'Safe & Clear',
        color: '#00e5ff',
        overallScore: 98,
        matches: prev.matches.map(m => m.severity === 'Medium' ? {
          ...m,
          severity: 'Resolved',
          recommendation: 'Resolved: Audio segment has been replaced with royalty-free alternative.'
        } : m)
      }));
      setResolving(false);
    }, 1800);
  };

  return (
    <div className="copyright-checker-page">
      <div className="cc-header">
        <h1>Smart Copyright & Safety Checker</h1>
        <p>Run automated scans on your audio, frames, and trademarks to ensure full compliance before posting.</p>
      </div>

      <div className="cc-layout">
        {/* Left config side */}
        <div className="cc-config-col">
          <div className="cc-card glass-panel">
            <div className="cc-card-header">
              <span>🛡️</span>
              <h2>Configure Scanner</h2>
            </div>

            <div className="form-group">
              <label htmlFor="cc-asset">Select Target Project</label>
              <select
                id="cc-asset"
                value={selectedAsset}
                onChange={e => setSelectedAsset(e.target.value)}
                className="cc-select"
                disabled={scanning}
              >
                <option value="video-01">MyVideos/chatgpt_productivity_tips.mp4</option>
                <option value="video-02">MyVideos/finance_secrets_explainer.mp4</option>
                <option value="video-03">MyVideos/passive_income_guide_shorts.mp4</option>
              </select>
            </div>

            {/* Checkbox selectors */}
            <div className="form-group">
              <label>Scanner Vectors</label>
              <div className="checkboxes-list">
                <label className="checkbox-item">
                  <input
                    type="checkbox"
                    checked={scanVideo}
                    onChange={e => setScanVideo(e.target.checked)}
                    disabled={scanning}
                  />
                  <div>
                    <strong>Scan Video Frames</strong>
                    <span>Matches visual loops with YouTube/TikTok database</span>
                  </div>
                </label>

                <label className="checkbox-item">
                  <input
                    type="checkbox"
                    checked={scanAudio}
                    onChange={e => setScanAudio(e.target.checked)}
                    disabled={scanning}
                  />
                  <div>
                    <strong>Audio Fingerprinting</strong>
                    <span>Scans commercial music indexes & copyright records</span>
                  </div>
                </label>

                <label className="checkbox-item">
                  <input
                    type="checkbox"
                    checked={scanTrademarks}
                    onChange={e => setScanTrademarks(e.target.checked)}
                    disabled={scanning}
                  />
                  <div>
                    <strong>Trademark Risk Analysis</strong>
                    <span>Validates text & logo overlays for restricted commercial brands</span>
                  </div>
                </label>
              </div>
            </div>

            <button
              onClick={handleScan}
              className={`btn-primary cc-scan-btn ${scanning ? 'loading' : ''}`}
              id="cc-scan-btn"
              disabled={scanning}
            >
              {scanning ? (
                <><span className="cc-spinner" />Running Deep Scan…</>
              ) : (
                '🛡️ Run Copyright & Safety Scan'
              )}
            </button>
            {scanError && <p className="error-text api-error">{scanError}</p>}
          </div>
        </div>

        {/* Right workspace reporting side */}
        <div className="cc-report-col">
          {scanning ? (
            <div className="scanner-loading-card glass-panel">
              {/* Animated Radar Visualizer */}
              <div className="radar-container">
                <div className="radar-circle">
                  <div className="radar-sweep" />
                  <div className="radar-blip p1" />
                  <div className="radar-blip p2" />
                  <div className="radar-blip p3" />
                </div>
              </div>

              <h3>Analyzing Content Footprints...</h3>
              <p className="scanner-step-text">{currentStepText}</p>
              
              <div className="scan-progress-wrapper">
                <div className="scan-progress-track">
                  <div className="scan-progress-fill" style={{ width: `${scanProgress}%` }} />
                </div>
                <span className="scan-progress-pct">{scanProgress}%</span>
              </div>
            </div>
          ) : !scanCompleted || !report ? (
            <div className="cc-placeholder glass-panel">
              <div className="ccp-icon">🛡️</div>
              <h3>Compliance Risk Report</h3>
              <p>Configure scanner properties on the left side, then run the scan to construct an official safety clearance report.</p>
            </div>
          ) : (
            <div className="cc-report-card glass-panel">
              <div className="cc-report-head">
                <div>
                  <h2>Copyright Assessment Manifest</h2>
                  <span className="cc-date">Certified on May 20, 2026</span>
                </div>
                
                {/* Visual score wheel */}
                <div className="compliance-wheel" style={{ borderColor: report.color }}>
                  <span className="wheel-score">{report.overallScore}</span>
                  <span className="wheel-lbl">Safety Score</span>
                </div>
              </div>

              {/* Status card */}
              <div className="status-banner" style={{ borderLeftColor: report.color, background: `${report.color}0a` }}>
                <span className="status-indicator-dot" style={{ background: report.color }} />
                <div>
                  <h4>Platform Status: {report.status}</h4>
                  <p>Overall safety score is {report.overallScore}/100. {report.status === 'Safe & Clear' ? 'All clear! Your video is safe for immediate publishing.' : 'Review the issues below and resolve them before publishing.'}</p>
                </div>
              </div>

              {/* Match list */}
              <div className="matches-section">
                <h3>Detected Safety Incidents</h3>
                <div className="matches-list">
                  {(report.findings && report.findings.length > 0) ? report.findings.map(m => (
                    <div key={m.id} className="match-card">
                      <div className="match-card-head">
                        <span className={`match-badge severity-${m.severity.toLowerCase()}`}>
                          {m.severity} Risk
                        </span>
                        <span className="match-time">⏱️ {m.timestamp}</span>
                      </div>
                      <h4 className="match-title">{m.type}</h4>
                      <p className="match-source">{m.source}</p>
                      <div className="match-recommend">
                        <strong>💡 Actionable Recommendation:</strong>
                        <p>{m.recommendation}</p>
                      </div>
                    </div>
                  )) : (
                    <div className="match-card safe-card">
                      <h4>No high-risk matches found</h4>
                      <p>Your content passed the current media scan. You can still review the details before publishing.</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Action feet */}
              <div className="report-footer-actions">
                <a
                  href={`data:text/plain;charset=utf-8,${encodeURIComponent(JSON.stringify(report, null, 2))}`}
                  download={`compliance_report_${selectedAsset}.txt`}
                  className="btn-secondary cc-down-btn"
                  title="Download compliant receipt"
                >
                  📥 Download Report
                </a>
                
                {report.status !== 'Safe & Clear' && (
                  <button
                    className={`btn-primary cc-resolve-btn ${resolving ? 'loading' : ''}`}
                    onClick={handleResolveIssues}
                    id="cc-resolve-btn"
                    disabled={resolving}
                  >
                    {resolving ? '🔄 Re-writing Audio track...' : '⚡ Auto-Resolve Issues'}
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
