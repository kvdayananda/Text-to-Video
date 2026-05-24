import { useState } from 'react';
import './ScriptWriterPage.css';

const niches = ['Technology', 'Finance & Crypto', 'Fitness & Health', 'Motivational', 'History & Facts', 'Short Stories'];
const tones = ['Viral & Punchy', 'Educational & Clear', 'Casual & Friendly', 'Suspenseful & Dramatic', 'Professional & Corporate'];

const sampleScripts = {
  Technology: `[SCENE 1: HOOK]
Did you know that 85% of people are using ChatGPT completely wrong? 🤯
In this video, I'll show you the exact 3-step prompt framework that will make you 10x more productive in under 60 seconds!

[SCENE 2: PROBLEM]
Most users type simple commands like "write an email." But that gives generic, boring results. 
To get elite output, you need to assign a role, supply constraints, and specify formatting.

[SCENE 3: SOLUTION]
Step 1: Role-Play. Tell ChatGPT exactly who it is. For example, "You are a senior copyright editor."
Step 2: Context. Provide target audience and guidelines.
Step 3: Output specs. E.g. "Deliver a bulleted list with no introduction."

[SCENE 4: CTA]
Try this right now and watch your results skyrocket! 🚀
If you want more secret AI frameworks, double tap and hit that subscribe button!`,
  
  Finance: `[SCENE 1: HOOK]
If you have $1,000 sitting in a savings account right now, you are actively losing money to inflation! 📉
Here are the top 3 high-yield assets that millionaires are using to store wealth in 2025.

[SCENE 2: ASSET 1]
First up, High-Yield Savings Accounts (HYSAs). Stop letting traditional banks pay you 0.01%. Top HYSAs are yielding over 4.5% interest, completely risk-free.

[SCENE 3: ASSET 2]
Second, Index Funds. Broad-market ETFs like the S&P 500 historically compound wealth at an average rate of 10% per year. It's passive, automated growth.

[SCENE 4: CTA]
Stop working for money, and make your money work for you! 💰
Drop a comment with your favorite investment asset, and follow for daily finance hacks!`
};

export default function ScriptWriterPage() {
  const [topic, setTopic] = useState('');
  const [niche, setNiche] = useState('Technology');
  const [tone, setTone] = useState('Viral & Punchy');
  const [length, setLength] = useState('60s');
  const [generating, setGenerating] = useState(false);
  const [script, setScript] = useState('');
  const [copied, setCopied] = useState(false);

  const handleGenerate = () => {
    if (!topic.trim()) return;
    setGenerating(true);
    setScript('');

    // Call backend AI script generation
    fetch(`${import.meta.env.VITE_API_BASE || 'http://localhost:8000'}/api/ai/script`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: topic, niche, tone, length, provider: 'openai' }),
    })
      .then(res => res.json())
      .then(data => {
        setGenerating(false);
        if (data?.script) setScript(data.script);
        else setScript('// Error: no script returned');
      })
      .catch(err => {
        setGenerating(false);
        setScript('// Error generating script: ' + (err.message || 'network'));
      });
  };

  const handleQuickImprove = type => {
    if (!script) return;
    setGenerating(true);
    setTimeout(() => {
      setGenerating(false);
      if (type === 'cta') {
        setScript(prev => prev + '\n\n[SCENE 5: STRONG CTA]\n👉 Click the link in our bio to access the full VisionForge AI video suite today! Special 20% launch discount ending soon!');
      } else if (type === 'punchy') {
        setScript(prev => prev.replace('Did you know that', 'STOP scrolling! 🛑 Did you know').replace('If you have $1,000', 'ATTENTION! 🚨 If you have $1,000'));
      } else if (type === 'shorten') {
        setScript(prev => prev.split('\n\n').slice(0, 3).join('\n\n'));
      }
    }, 1200);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(script);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="script-writer-page">
      <div className="sw-header">
        <h1>AI Script Writer</h1>
        <p>Draft highly-optimized scripts for your channels with viral hooks and clear call-to-actions.</p>
      </div>

      <div className="sw-layout">
        {/* Configuration Panel */}
        <div className="sw-config-col">
          <div className="sw-card glass-panel">
            <div className="sw-card-header">
              <span>✍️</span>
              <h2>Configure Script</h2>
            </div>

            <div className="form-group">
              <label htmlFor="script-topic">Script Topic / Prompt</label>
              <textarea
                id="script-topic"
                rows={4}
                placeholder="e.g. 3 ChatGPT secrets that will save you 100 hours of work, using a professional but punchy hook..."
                value={topic}
                onChange={e => setTopic(e.target.value)}
                className="sw-input sw-textarea"
                disabled={generating}
              />
            </div>

            <div className="sw-settings-row">
              <div className="form-group flex-1">
                <label htmlFor="script-niche">Niche Niche</label>
                <select
                  id="script-niche"
                  value={niche}
                  onChange={e => setNiche(e.target.value)}
                  className="sw-input sw-select"
                  disabled={generating}
                >
                  {niches.map(n => <option key={n}>{n}</option>)}
                </select>
              </div>

              <div className="form-group flex-1">
                <label htmlFor="script-tone">Voice Tone</label>
                <select
                  id="script-tone"
                  value={tone}
                  onChange={e => setTone(e.target.value)}
                  className="sw-input sw-select"
                  disabled={generating}
                >
                  {tones.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Script Length Target</label>
              <div className="sw-length-chips" id="length-chips">
                {['30s (Shorts)', '60s (Viral)', '3 min (Explainer)', '5 min (Long)'].map(l => (
                  <button
                    key={l}
                    className={`length-chip ${length === l ? 'active' : ''}`}
                    onClick={() => setLength(l)}
                    disabled={generating}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleGenerate}
              className={`btn-primary sw-gen-btn ${generating && !script ? 'loading' : ''}`}
              id="sw-generate-btn"
              disabled={!topic.trim() || generating}
            >
              {generating && !script ? (
                <><span className="sw-spinner" />Composing Script…</>
              ) : (
                '✍️ Generate AI Script'
              )}
            </button>
          </div>
        </div>

        {/* Output Workspace */}
        <div className="sw-output-col">
          {!script && !generating ? (
            <div className="sw-placeholder glass-panel">
              <div className="swp-icon">📝</div>
              <h3>Script Workspace</h3>
              <p>Set your topic and options on the left side, then click Generate to view your viral script here.</p>
            </div>
          ) : (
            <div className="sw-workspace-card glass-panel">
              <div className="sw-work-header">
                <h2>Generated Script Workspace</h2>
                <div className="sw-work-actions">
                  <button className="ghost-btn-sm" onClick={handleCopy} id="sw-copy-btn">
                    {copied ? '✓ Copied!' : '📋 Copy'}
                  </button>
                </div>
              </div>

              {generating ? (
                <div className="sw-generating-state">
                  <span className="sw-spinner big" />
                  <p>AI is thinking and re-writing your script...</p>
                </div>
              ) : (
                <textarea
                  className="sw-workspace-textarea"
                  value={script}
                  onChange={e => setScript(e.target.value)}
                  id="sw-script-textarea"
                />
              )}

              {/* Quick edit helper operations */}
              {!generating && (
                <div className="sw-quick-helpers">
                  <div className="helper-lbl">✨ Quick Adjustments:</div>
                  <div className="helper-buttons">
                    <button className="helper-btn" onClick={() => handleQuickImprove('punchy')} id="sw-helper-punchy">
                      🔥 Make Hook Punchier
                    </button>
                    <button className="helper-btn" onClick={() => handleQuickImprove('cta')} id="sw-helper-cta">
                      📢 Append Video CTA
                    </button>
                    <button className="helper-btn" onClick={() => handleQuickImprove('shorten')} id="sw-helper-short">
                      ✂️ Trim Script Length
                    </button>
                  </div>
                </div>
              )}

              {/* Next step CTA */}
              {!generating && (
                <div className="sw-cta-footer">
                  <button className="btn-primary sw-create-video-cbtn" id="sw-turn-into-video-btn">
                    🎬 Turn Script into Video →
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
