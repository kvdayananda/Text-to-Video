import { useState, useEffect } from 'react';
import {
  getOverview,
  getViewsTimeseries,
  getPlatformBreakdown,
  getTopVideos,
  getCTRBreakdown,
  getEngagementBreakdown,
  getWatchTimeBreakdown,
  getAudienceDemographics,
  getEngagementTimeseries,
  getPeakHours,
  getExportCSVURL
} from '../../api/analyticsApi';
import './AnalyticsPage.css';

const platformsList = [
  { id: 'all', name: 'All Platforms' },
  { id: 'YouTube', name: 'YouTube' },
  { id: 'Instagram', name: 'Instagram' },
  { id: 'TikTok', name: 'TikTok' },
  { id: 'Facebook', name: 'Facebook' }
];

const rangesList = [
  { id: '7d', name: 'Last 7 days' },
  { id: '30d', name: 'Last 30 days' },
  { id: '90d', name: 'Last 90 days' },
  { id: 'all', name: 'All time' }
];

export default function AnalyticsPage() {
  const [activeTab, setActiveTab] = useState('overview'); // overview, engagement, audience, funnel
  const [selectedPlatform, setSelectedPlatform] = useState('all');
  const [selectedRange, setSelectedRange] = useState('30d');
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // States for backend data
  const [overview, setOverview] = useState(null);
  const [viewsTimeseries, setViewsTimeseries] = useState(null);
  const [platformBreakdown, setPlatformBreakdown] = useState([]);
  const [topVideosList, setTopVideosList] = useState([]);
  const [ctrFunnel, setCtrFunnel] = useState(null);
  const [engagementBreak, setEngagementBreak] = useState(null);
  const [watchTimeBreak, setWatchTimeBreak] = useState(null);
  const [audienceDemo, setAudienceDemo] = useState(null);
  const [engagementTS, setEngagementTS] = useState(null);
  const [peakHoursList, setPeakHoursList] = useState([]);

  // Local UX toggles
  const [chartMetric, setChartMetric] = useState('views'); // views, watchTime, ctr, engagement
  const [hoveredPoint, setHoveredPoint] = useState(null);
  const [hoveredEngPoint, setHoveredEngPoint] = useState(null);

  // Fetch all dashboard data
  useEffect(() => {
    async function fetchAllAnalytics() {
      setLoading(true);
      setError(null);
      try {
        const [
          overviewData,
          viewsTSData,
          platformsData,
          topVideosData,
          ctrData,
          engData,
          watchData,
          audienceData,
          engTSData,
          peakData
        ] = await Promise.all([
          getOverview(selectedPlatform, selectedRange),
          getViewsTimeseries(selectedPlatform, selectedRange),
          getPlatformBreakdown(selectedRange),
          getTopVideos(selectedPlatform, selectedRange),
          getCTRBreakdown(selectedRange),
          getEngagementBreakdown(selectedRange),
          getWatchTimeBreakdown(selectedRange),
          getAudienceDemographics(selectedRange),
          getEngagementTimeseries(selectedRange),
          getPeakHours()
        ]);

        setOverview(overviewData);
        setViewsTimeseries(viewsTSData);
        setPlatformBreakdown(platformsData);
        setTopVideosList(topVideosData);
        setCtrFunnel(ctrData);
        setEngagementBreak(engData);
        setWatchTimeBreak(watchData);
        setAudienceDemo(audienceData);
        setEngagementTS(engTSData);
        setPeakHoursList(peakData);
      } catch (err) {
        console.error('Failed to load analytics data:', err);
        setError('Unable to fetch analytics data. Please ensure the backend is connected.');
      } finally {
        setLoading(false);
      }
    }

    fetchAllAnalytics();
  }, [selectedPlatform, selectedRange]);

  // Helper to trigger CSV file download
  const handleExportCSV = () => {
    const url = getExportCSVURL(selectedPlatform, selectedRange);
    window.open(url, '_blank');
  };

  // Helper to format values
  const fmtNum = (val) => {
    if (val === undefined || val === null) return '0';
    if (val >= 1000000) return (val / 1000000).toFixed(1) + 'M';
    if (val >= 1000) return (val / 1000).toFixed(1) + 'K';
    return val.toString();
  };

  // Custom premium SVG chart renderer
  const renderSVGChart = (labels, dataPoints, strokeColor = '#8a2be2', fillColor = 'rgba(138, 43, 226, 0.15)', metricName = 'Value') => {
    if (!dataPoints || dataPoints.length === 0) return null;
    
    const svgW = 600;
    const svgH = 220;
    const padX = 40;
    const padY = 20;
    
    const chartW = svgW - (padX * 2);
    const chartH = svgH - (padY * 2);
    
    const maxVal = Math.max(...dataPoints, 1);
    const minVal = Math.min(...dataPoints, 0);
    const valRange = maxVal - minVal;
    
    // Calculate node points
    const points = dataPoints.map((val, idx) => {
      const x = padX + (idx / (dataPoints.length - 1)) * chartW;
      const y = (padY + chartH) - ((val - minVal) / valRange) * chartH;
      return { x, y, val, label: labels[idx], idx };
    });
    
    // Construct line path using Bezier curves or simple lines
    let d = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      d += ` L ${points[i].x} ${points[i].y}`;
    }
    
    const fillD = `${d} L ${points[points.length - 1].x} ${padY + chartH} L ${points[0].x} ${padY + chartH} Z`;
    
    return (
      <div className="svg-chart-container">
        <svg viewBox={`0 0 ${svgW} ${svgH}`} className="premium-svg-chart" width="100%" height="100%">
          <defs>
            <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={strokeColor} stopOpacity="0.4" />
              <stop offset="100%" stopColor={strokeColor} stopOpacity="0.0" />
            </linearGradient>
          </defs>
          
          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((p, idx) => {
            const y = padY + chartH * p;
            const gridVal = maxVal - (valRange * p);
            return (
              <g key={idx} className="chart-grid-line">
                <line x1={padX} y1={y} x2={svgW - padX} y2={y} stroke="rgba(255,255,255,0.06)" strokeDasharray="3 3" />
                <text x={padX - 8} y={y + 4} textAnchor="end" fontSize="9" fill="rgba(255,255,255,0.3)">
                  {gridVal >= 1000 ? fmtNum(gridVal) : gridVal.toFixed(1)}
                </text>
              </g>
            );
          })}
          
          {/* Shaded Area */}
          <path d={fillD} fill="url(#chartGrad)" />
          
          {/* Main Curve */}
          <path d={d} fill="none" stroke={strokeColor} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          
          {/* Interactive points */}
          {points.map((pt, idx) => (
            <circle
              key={idx}
              cx={pt.x}
              cy={pt.y}
              r={hoveredPoint && hoveredPoint.idx === idx ? 5 : 2}
              fill={hoveredPoint && hoveredPoint.idx === idx ? '#00e5ff' : strokeColor}
              stroke="white"
              strokeWidth={hoveredPoint && hoveredPoint.idx === idx ? 1.5 : 0}
              className="chart-dot"
              onMouseEnter={() => setHoveredPoint(pt)}
              onMouseLeave={() => setHoveredPoint(null)}
            />
          ))}
          
          {/* X axis labels (limited to avoid overlap) */}
          {points.filter((_, i) => i % Math.max(1, Math.floor(points.length / 6)) === 0 || i === points.length - 1).map((pt, idx) => (
            <text key={idx} x={pt.x} y={svgH - 4} textAnchor="middle" fontSize="9.5" fill="rgba(255,255,255,0.4)">
              {pt.label}
            </text>
          ))}
        </svg>
        
        {/* Tooltip Overlay */}
        {hoveredPoint && (
          <div
            className="chart-tooltip glass-panel"
            style={{
              position: 'absolute',
              left: `${(hoveredPoint.x / svgW) * 100}%`,
              top: `${(hoveredPoint.y / svgH) * 100 - 18}%`,
              transform: 'translate(-50%, -100%)',
              pointerEvents: 'none',
              zIndex: 10
            }}
          >
            <div className="tooltip-date">{hoveredPoint.label}</div>
            <div className="tooltip-value">
              <span className="tooltip-label">{metricName}:</span> {typeof hoveredPoint.val === 'number' && hoveredPoint.val % 1 !== 0 ? hoveredPoint.val.toFixed(2) : fmtNum(hoveredPoint.val)}
            </div>
          </div>
        )}
      </div>
    );
  };

  // Custom multi-series SVG chart renderer (e.g. for engagement tabs)
  const renderMultiSeriesChart = (labels, datasets) => {
    if (!datasets || datasets.length === 0) return null;
    
    const svgW = 600;
    const svgH = 220;
    const padX = 40;
    const padY = 20;
    
    const chartW = svgW - (padX * 2);
    const chartH = svgH - (padY * 2);

    // Get max over all series
    let allVals = [];
    datasets.forEach(d => { allVals = [...allVals, ...d.data]; });
    const maxVal = Math.max(...allVals, 1);
    const minVal = 0;
    const valRange = maxVal - minVal;

    return (
      <div className="svg-chart-container">
        <svg viewBox={`0 0 ${svgW} ${svgH}`} className="premium-svg-chart" width="100%" height="100%">
          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((p, idx) => {
            const y = padY + chartH * p;
            const gridVal = maxVal - (valRange * p);
            return (
              <g key={idx} className="chart-grid-line">
                <line x1={padX} y1={y} x2={svgW - padX} y2={y} stroke="rgba(255,255,255,0.06)" strokeDasharray="3 3" />
                <text x={padX - 8} y={y + 4} textAnchor="end" fontSize="9" fill="rgba(255,255,255,0.3)">
                  {fmtNum(gridVal)}
                </text>
              </g>
            );
          })}

          {/* Render each series */}
          {datasets.map((series, sIdx) => {
            const points = series.data.map((val, idx) => {
              const x = padX + (idx / (series.data.length - 1)) * chartW;
              const y = (padY + chartH) - ((val - minVal) / valRange) * chartH;
              return { x, y, val, label: labels[idx], seriesName: series.name, color: series.color };
            });

            let d = `M ${points[0].x} ${points[0].y}`;
            for (let i = 1; i < points.length; i++) {
              d += ` L ${points[i].x} ${points[i].y}`;
            }

            return (
              <g key={sIdx} className="chart-series-group">
                <path d={d} fill="none" stroke={series.color} strokeWidth="2" strokeLinecap="round" />
                {points.map((pt, idx) => (
                  <circle
                    key={idx}
                    cx={pt.x}
                    cy={pt.y}
                    r={hoveredEngPoint && hoveredEngPoint.idx === idx && hoveredEngPoint.sIdx === sIdx ? 5 : 1.5}
                    fill={hoveredEngPoint && hoveredEngPoint.idx === idx && hoveredEngPoint.sIdx === sIdx ? '#ffffff' : series.color}
                    className="chart-dot"
                    onMouseEnter={() => setHoveredEngPoint({ ...pt, idx, sIdx })}
                    onMouseLeave={() => setHoveredEngPoint(null)}
                  />
                ))}
              </g>
            );
          })}

          {/* X axis labels */}
          {labels.filter((_, i) => i % Math.max(1, Math.floor(labels.length / 5)) === 0 || i === labels.length - 1).map((lbl, idx) => {
            const x = padX + (labels.indexOf(lbl) / (labels.length - 1)) * chartW;
            return (
              <text key={idx} x={x} y={svgH - 4} textAnchor="middle" fontSize="9.5" fill="rgba(255,255,255,0.4)">
                {lbl}
              </text>
            );
          })}
        </svg>

        {/* Legend */}
        <div className="chart-legend">
          {datasets.map((s, idx) => (
            <div key={idx} className="legend-item">
              <span className="legend-dot" style={{ backgroundColor: s.color }}></span>
              <span className="legend-name">{s.name}</span>
            </div>
          ))}
        </div>

        {/* Tooltip Overlay */}
        {hoveredEngPoint && (
          <div
            className="chart-tooltip glass-panel"
            style={{
              position: 'absolute',
              left: `${(hoveredEngPoint.x / svgW) * 100}%`,
              top: `${(hoveredEngPoint.y / svgH) * 100 - 18}%`,
              transform: 'translate(-50%, -100%)',
              pointerEvents: 'none',
              zIndex: 10
            }}
          >
            <div className="tooltip-date">{hoveredEngPoint.label}</div>
            <div className="tooltip-value" style={{ color: hoveredEngPoint.color }}>
              <span className="tooltip-label">{hoveredEngPoint.seriesName}:</span> {fmtNum(hoveredEngPoint.val)}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="analytics-page">
      {/* Header section */}
      <div className="analytics-header">
        <div>
          <h1 className="gradient-text">Studio Analytics</h1>
          <p>Real-time analytics and publication tracking engine for your generated assets.</p>
        </div>
        
        <div className="analytics-filters-bar">
          <div className="filters-group">
            <select
              className="filter-select"
              value={selectedPlatform}
              onChange={e => setSelectedPlatform(e.target.value)}
              id="platform-filter"
            >
              {platformsList.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
            
            <select
              className="filter-select"
              value={selectedRange}
              onChange={e => setSelectedRange(e.target.value)}
              id="range-filter"
            >
              {rangesList.map(r => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>
          </div>

          <button className="export-btn premium-btn" onClick={handleExportCSV}>
            <span>📤 Export Report (CSV)</span>
          </button>
        </div>
      </div>

      {/* Tabs navigation */}
      <div className="analytics-tabs">
        <button
          className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          📈 Performance Overview
        </button>
        <button
          className={`tab-btn ${activeTab === 'engagement' ? 'active' : ''}`}
          onClick={() => setActiveTab('engagement')}
        >
          🔥 Engagement Insights
        </button>
        <button
          className={`tab-btn ${activeTab === 'audience' ? 'active' : ''}`}
          onClick={() => setActiveTab('audience')}
        >
          👥 Audience Demographics
        </button>
        <button
          className={`tab-btn ${activeTab === 'funnel' ? 'active' : ''}`}
          onClick={() => setActiveTab('funnel')}
        >
          🎯 Retention & Funnels
        </button>
      </div>

      {/* Error display */}
      {error && (
        <div className="analytics-error-banner glass-panel">
          <span className="error-icon">⚠️</span>
          <div className="error-details">
            <h4>Connection Error</h4>
            <p>{error}</p>
          </div>
        </div>
      )}

      {/* Loading state */}
      {loading ? (
        <div className="analytics-loading-placeholder">
          <div className="loading-spinner"></div>
          <p>Processing time-series charts and audience statistics...</p>
        </div>
      ) : (
        <div className="tab-contents-container animate-fade-in">
          
          {/* ==================== OVERVIEW TAB ==================== */}
          {activeTab === 'overview' && overview && (
            <>
              {/* Stat grid */}
              <div className="analytics-stats-grid">
                {[
                  { key: 'totalViews', label: 'Total Views', icon: '👁️', stroke: '#8a2be2' },
                  { key: 'watchHours', label: 'Watch Time (hrs)', icon: '⏱️', stroke: '#00e5ff' },
                  { key: 'totalLikes', label: 'Total Likes', icon: '❤️', stroke: '#ff007f' },
                  { key: 'avgCTR', label: 'Avg Click CTR', icon: '🔗', stroke: '#00ffcc' },
                  { key: 'newSubscribers', label: 'Subscribers Net', icon: '👥', stroke: '#ffd700' },
                  { key: 'engagementRate', label: 'Engagement Rate', icon: '💬', stroke: '#ff6b6b' },
                ].map((statDef) => {
                  const stat = overview[statDef.key] || { value: 0, formatted: '0', change: '0%', up: true };
                  return (
                    <div className="analytics-stat glass-panel" key={statDef.key}>
                      <div className="astat-top">
                        <span className="astat-icon">{statDef.icon}</span>
                        <span className={`astat-change ${stat.up ? 'up' : 'down'}`}>
                          {stat.change}
                        </span>
                      </div>
                      <div className="astat-value">{stat.formatted}</div>
                      <div className="astat-label">{statDef.label}</div>
                      <div className="astat-indicator-line" style={{ backgroundColor: statDef.stroke }}></div>
                    </div>
                  );
                })}
              </div>

              {/* Main timeseries chart card */}
              <div className="analytics-grid">
                <div className="analytics-card glass-panel chart-card">
                  <div className="chart-card-header">
                    <div className="chart-title-group">
                      <h2>Interactive Metric Plotter</h2>
                      <p>View daily metrics over selected time period.</p>
                    </div>
                    
                    {/* Metric Selectors */}
                    <div className="chart-metric-selectors">
                      {[
                        { id: 'views', label: 'Views', color: '#8a2be2' },
                        { id: 'watchTime', label: 'Watch Hours', color: '#00e5ff' },
                        { id: 'ctr', label: 'CTR %', color: '#00ffcc' },
                        { id: 'engagement', label: 'Engagement %', color: '#ff6b6b' }
                      ].map(sel => (
                        <button
                          key={sel.id}
                          className={`metric-sel-btn ${chartMetric === sel.id ? 'active' : ''}`}
                          style={{ '--active-border-color': sel.color }}
                          onClick={() => setChartMetric(sel.id)}
                        >
                          {sel.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {viewsTimeseries && (
                    <div className="chart-body">
                      {renderSVGChart(
                        viewsTimeseries.labels,
                        viewsTimeseries[chartMetric],
                        chartMetric === 'views' ? '#8a2be2' : chartMetric === 'watchTime' ? '#00e5ff' : chartMetric === 'ctr' ? '#00ffcc' : '#ff6b6b',
                        'rgba(138, 43, 226, 0.1)',
                        chartMetric.toUpperCase()
                      )}
                    </div>
                  )}
                </div>

                {/* Platforms breakdown progress list */}
                <div className="analytics-card glass-panel platform-breakdown-card">
                  <div className="panel-header">
                    <h2>Platform Distribution</h2>
                  </div>
                  <div className="platform-breakdown">
                    {platformBreakdown.map((plat, idx) => {
                      const icon = plat.platform === 'YouTube' ? '▶' : plat.platform === 'Instagram' ? '📷' : plat.platform === 'TikTok' ? '🎵' : '𝑓';
                      const color = plat.platform === 'YouTube' ? '#ff4444' : plat.platform === 'Instagram' ? '#e1306c' : plat.platform === 'TikTok' ? '#00e5ff' : '#1877f2';
                      return (
                        <div className="pb-row" key={idx}>
                          <div className="pb-icon" style={{ borderColor: color, color: color }}>{icon}</div>
                          <div className="pb-info">
                            <div className="pb-top">
                              <span className="pb-name">{plat.platform}</span>
                              <span className="pb-views">{plat.viewsFormatted} views</span>
                            </div>
                            <div className="pb-bar">
                              <div
                                className="pb-fill animate-progress"
                                style={{ width: `${plat.percentage}%`, background: `linear-gradient(90deg, ${color}, rgba(255,255,255,0.1))` }}
                              />
                            </div>
                            <div className="pb-footer-details">
                              <span className="pb-pct">{plat.percentage}% share</span>
                              <span className="pb-extra-metric">CTR: {plat.ctr}%</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Top videos table */}
              <div className="analytics-card glass-panel top-videos-card">
                <div className="panel-header">
                  <h2>Top Performing Assets</h2>
                  <span className="panel-link">Ranked by video impressions & views</span>
                </div>
                
                <div className="top-videos-table">
                  <div className="tv-header-row">
                    <span>Rank</span>
                    <span>Video Title</span>
                    <span>Platform</span>
                    <span>Views</span>
                    <span>Avg Ret.</span>
                    <span>CTR</span>
                    <span>Eng Rate</span>
                  </div>
                  {topVideosList.map((v, idx) => (
                    <div className="tv-row" key={idx} id={`top-video-${v.rank}`}>
                      <span className="tv-rank">{v.rank}</span>
                      <span className="tv-title" title={v.title}>{v.title}</span>
                      <span className="tv-platform" style={{
                        borderColor: v.platformColor || '#8a2be2',
                        color: v.platformColor || '#fff',
                        background: `${v.platformColor || '#8a2be2'}15`
                      }}>
                        {v.platform}
                      </span>
                      <span className="tv-views">{v.viewsFormatted}</span>
                      <span className="tv-retention">{v.watchPct}%</span>
                      <span className="tv-ctr">{v.ctr}%</span>
                      <span className="tv-engagement">{v.engagementRate}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* ==================== ENGAGEMENT TAB ==================== */}
          {activeTab === 'engagement' && engagementBreak && (
            <div className="engagement-tab-grid">
              
              {/* Engagement Stat Cards */}
              <div className="engagement-cards-grid">
                {[
                  { name: 'likes', title: 'Likes Received', icon: '❤️', color: '#ff007f' },
                  { name: 'comments', title: 'Comments Added', icon: '💬', color: '#8a2be2' },
                  { name: 'shares', title: 'Content Shares', icon: '🔗', color: '#00e5ff' },
                  { name: 'saves', title: 'Saved in Playlists', icon: '💾', color: '#00ffcc' }
                ].map((item) => {
                  const data = engagementBreak[item.name] || { value: 0, formatted: '0', pct: 0 };
                  return (
                    <div className="eng-stat-card glass-panel" key={item.name}>
                      <div className="eng-card-icon" style={{ backgroundColor: `${item.color}15`, color: item.color }}>{item.icon}</div>
                      <div className="eng-card-info">
                        <h3>{item.title}</h3>
                        <div className="eng-card-val">{data.formatted}</div>
                        <div className="eng-card-pct">{data.pct}% of total engagement</div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="analytics-grid">
                {/* Multi-series chart */}
                <div className="analytics-card glass-panel chart-card">
                  <div className="panel-header">
                    <div>
                      <h2>Engagement Categories Growth</h2>
                      <p>Time-series distribution of social interaction classes.</p>
                    </div>
                  </div>
                  {engagementTS && (
                    <div className="chart-body">
                      {renderMultiSeriesChart(
                        engagementTS.labels,
                        [
                          { name: 'Likes', data: engagementTS.likes, color: '#ff007f' },
                          { name: 'Comments', data: engagementTS.comments, color: '#8a2be2' },
                          { name: 'Shares', data: engagementTS.shares, color: '#00e5ff' },
                          { name: 'Saves', data: engagementTS.saves, color: '#00ffcc' }
                        ]
                      )}
                    </div>
                  )}
                </div>

                {/* Peak Hours distribution heatmap */}
                <div className="analytics-card glass-panel hourly-activity-card">
                  <div className="panel-header">
                    <h2>Audience Activity Peaks</h2>
                  </div>
                  <p className="panel-desc-small">Identifies best publishing slots (UTC).</p>
                  
                  <div className="peak-hours-grid">
                    {peakHoursList.map((item, idx) => {
                      const heatIndex = Math.min(10, Math.floor(item.score / 2.5));
                      return (
                        <div
                          className="hour-block animate-scale-up"
                          key={idx}
                          title={`${item.label} — Activity Index: ${item.score}/10`}
                          style={{
                            backgroundColor: `rgba(0, 229, 255, ${0.1 + (heatIndex * 0.09)})`,
                            border: heatIndex > 7 ? '1px solid rgba(0, 229, 255, 0.4)' : 'none'
                          }}
                        >
                          <span className="hour-label">{item.hour}h</span>
                        </div>
                      );
                    })}
                  </div>
                  
                  <div className="heatmap-legend">
                    <span>Inactive</span>
                    <div className="legend-gradient"></div>
                    <span>Highly Active</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ==================== AUDIENCE TAB ==================== */}
          {activeTab === 'audience' && audienceDemo && (
            <div className="audience-tab-layout">
              <div className="demographics-grid">
                
                {/* Gender Split Slider Grid */}
                <div className="analytics-card glass-panel gender-split-card">
                  <h2>Gender Representation</h2>
                  <p className="stat-subtitle">Calculated based on social graph statistics.</p>
                  
                  <div className="gender-bar-container">
                    <div className="gender-split-ruler">
                      <div className="g-split male-split" style={{ width: `${audienceDemo.gender.male}%` }}>
                        <span className="g-pct">{audienceDemo.gender.male}%</span>
                        <span className="g-label">Male</span>
                      </div>
                      <div className="g-split female-split" style={{ width: `${audienceDemo.gender.female}%` }}>
                        <span className="g-pct">{audienceDemo.gender.female}%</span>
                        <span className="g-label">Female</span>
                      </div>
                      <div className="g-split other-split" style={{ width: `${audienceDemo.gender.other}%` }}>
                        <span className="g-pct">{audienceDemo.gender.other}%</span>
                        <span className="g-label">Other</span>
                      </div>
                    </div>
                  </div>

                  <div className="gender-summary">
                    <div className="gender-item-bullet"><span className="color-dot male"></span> Male: {audienceDemo.gender.male}%</div>
                    <div className="gender-item-bullet"><span className="color-dot female"></span> Female: {audienceDemo.gender.female}%</div>
                    <div className="gender-item-bullet"><span className="color-dot other"></span> Other: {audienceDemo.gender.other}%</div>
                  </div>
                </div>

                {/* Age distribution */}
                <div className="analytics-card glass-panel age-groups-card">
                  <h2>Age Demographics</h2>
                  <p className="stat-subtitle">Distribution of viewers by age clusters.</p>
                  
                  <div className="age-distribution-bars">
                    {audienceDemo.age.map((ag, idx) => (
                      <div className="age-row" key={idx}>
                        <span className="age-group-label">{ag.group}</span>
                        <div className="age-bar-wrapper">
                          <div className="age-bar-fill animate-progress" style={{ width: `${ag.percentage}%` }}></div>
                        </div>
                        <span className="age-val-label">{ag.percentage}%</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Geography Map details */}
                <div className="analytics-card glass-panel geo-card">
                  <h2>Top Countries</h2>
                  <p className="stat-subtitle">Geographical distribution of content downloads.</p>
                  
                  <div className="geo-countries-list">
                    {audienceDemo.geography.map((geo, idx) => (
                      <div className="geo-country-row" key={idx}>
                        <div className="country-info-header">
                          <span className="country-flag">{geo.code}</span>
                          <span className="country-name">{geo.country}</span>
                        </div>
                        <div className="geo-bar-wrapper">
                          <div
                            className="geo-bar-fill animate-progress"
                            style={{
                              width: `${geo.percentage}%`,
                              backgroundColor: idx === 0 ? '#8a2be2' : idx === 1 ? '#00e5ff' : 'rgba(255, 255, 255, 0.2)'
                            }}
                          ></div>
                        </div>
                        <span className="geo-percentage">{geo.percentage}%</span>
                      </div>
                    ))}
                  </div>
                </div>
                
              </div>
            </div>
          )}

          {/* ==================== FUNNEL & RETENTION TAB ==================== */}
          {activeTab === 'funnel' && ctrFunnel && watchTimeBreak && (
            <div className="funnel-tab-layout">
              <div className="analytics-grid">
                
                {/* Funnel visualizer */}
                <div className="analytics-card glass-panel ctr-funnel-card">
                  <h2>CTR Conversion Funnel</h2>
                  <p className="stat-subtitle">Tracks conversion from impression to actual view.</p>
                  
                  <div className="funnel-container">
                    
                    {/* Impressions step */}
                    <div className="funnel-step tier-1">
                      <div className="funnel-step-label">1. Video Impressions</div>
                      <div className="funnel-step-val">{ctrFunnel.impressionsFormatted}</div>
                      <div className="funnel-shape"></div>
                    </div>
                    
                    {/* Conversion 1 indicator */}
                    <div className="funnel-conversion-gap">
                      <span className="gap-arrow">↓</span>
                      <span className="gap-label">Click-Through Rate (CTR): <strong>{ctrFunnel.avgCTR}%</strong></span>
                    </div>

                    {/* Clicks step */}
                    <div className="funnel-step tier-2">
                      <div className="funnel-step-label">2. Video Clicks</div>
                      <div className="funnel-step-val">{ctrFunnel.clicksFormatted}</div>
                      <div className="funnel-shape"></div>
                    </div>

                    {/* Conversion 2 indicator */}
                    <div className="funnel-conversion-gap">
                      <span className="gap-arrow">↓</span>
                      <span className="gap-label">Retention Conversion: <strong>{ctrFunnel.conversionRate}%</strong></span>
                    </div>

                    {/* Views step */}
                    <div className="funnel-step tier-3">
                      <div className="funnel-step-label">3. Completed Views</div>
                      <div className="funnel-step-val">{ctrFunnel.viewsFormatted}</div>
                      <div className="funnel-shape"></div>
                    </div>

                  </div>
                </div>

                {/* Audience retention curve */}
                <div className="analytics-card glass-panel retention-curve-card">
                  <h2>Audience Retention Curve</h2>
                  <p className="stat-subtitle">Tracks average viewer attention percentage across video duration.</p>
                  
                  <div className="retention-curve-container">
                    {/* Render Retention Curve */}
                    {renderSVGChart(
                      Array.from({ length: 101 }, (_, i) => `${i}%`),
                      watchTimeBreak.retentionCurve,
                      '#00e5ff',
                      'rgba(0, 229, 255, 0.05)',
                      'RETENTION'
                    )}
                  </div>
                  
                  <div className="retention-breakdown-details">
                    <div className="ret-kpi">
                      <span className="ret-kpi-lbl">Avg View Duration</span>
                      <span className="ret-kpi-val">{watchTimeBreak.avgViewDurationLabel}</span>
                    </div>
                    <div className="ret-kpi">
                      <span className="ret-kpi-lbl">Avg Percentage Watched</span>
                      <span className="ret-kpi-val">{watchTimeBreak.avgViewPercentage}%</span>
                    </div>
                    <div className="ret-kpi">
                      <span className="ret-kpi-lbl">Longest Safe Duration</span>
                      <span className="ret-kpi-val">{fmtNum(watchTimeBreak.longestVideoSec)} sec</span>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}

        </div>
      )}
    </div>
  );
}
