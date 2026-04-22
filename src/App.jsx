import { useMemo, useState } from 'react'
import { generateComponentWithGemini } from './lib/gemini'
import { buildPreviewDoc } from './lib/previewTemplate'

const STARTER_PROMPTS = [
  'Build a glassmorphism pricing card with monthly/yearly toggle and a primary CTA.',
  'Create a responsive navbar with logo, 4 links, and a mobile hamburger menu.',
  'Generate a modern CTA button with loading state and icon support.',
  'Create a dashboard stat card with sparkline placeholder and trend indicator.',
]

const DEFAULT_MODEL = import.meta.env.VITE_GEMINI_MODEL || 'gemini-3-flash-preview'

function App() {
  const [prompt, setPrompt] = useState(STARTER_PROMPTS[0])
  const [model, setModel] = useState(DEFAULT_MODEL)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState('jsx')
  const [result, setResult] = useState({
    componentName: 'GeneratedComponent',
    jsx: `export default function GeneratedComponent() {
  return (
    <button className="cta-button">Generate with Gemini</button>
  )
}`,
    css: `.cta-button {
  border: 0;
  border-radius: 999px;
  padding: 12px 18px;
  color: #f8fafc;
  background: linear-gradient(135deg, #ea580c, #dc2626);
  font-weight: 700;
  cursor: pointer;
}`,
    notes: 'Use the prompt box and click Generate to replace this starter component.',
  })

  const previewDoc = useMemo(
    () => buildPreviewDoc(result.jsx, result.css, result.componentName),
    [result],
  )

  const handleGenerate = async () => {
    setError('')
    setLoading(true)

    try {
      const generated = await generateComponentWithGemini({ prompt, model })
      setResult(generated)
      setActiveTab('jsx')
    } catch (err) {
      setError(err.message || 'Something went wrong while calling Gemini.')
    } finally {
      setLoading(false)
    }
  }

  const copyCurrentTab = async () => {
    const value = activeTab === 'jsx' ? result.jsx : result.css
    await navigator.clipboard.writeText(value)
  }

  return (
    <div className="page">
      <div className="ambient ambient-left" aria-hidden="true" />
      <div className="ambient ambient-right" aria-hidden="true" />

      <header className="topbar">
        <h1>React Component Studio</h1>
        <p>Generate buttons, navbars, cards, and full UI blocks with Gemini.</p>
      </header>

      <main className="grid">
        <section className="panel controls-panel">
          <div className="panel-head">
            <h2>Prompt Builder</h2>
            <span className="badge">Vite + React</span>
          </div>

          <label className="field">
            <span>Gemini Model</span>
            <input
              value={model}
              onChange={(e) => setModel(e.target.value)}
              placeholder="gemini-3-flash-preview"
            />
          </label>

          <label className="field">
            <span>Component Request</span>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={8}
              placeholder="Describe the component you want..."
            />
          </label>

          <div className="chips">
            {STARTER_PROMPTS.map((item) => (
              <button key={item} type="button" className="chip" onClick={() => setPrompt(item)}>
                {item.slice(0, 36)}...
              </button>
            ))}
          </div>

          <button className="generate-btn" onClick={handleGenerate} disabled={loading}>
            {loading ? 'Generating...' : 'Generate Component'}
          </button>

          {error && <p className="error-text">{error}</p>}
        </section>

        <section className="panel output-panel">
          <div className="panel-head">
            <h2>{result.componentName}</h2>
            <div className="tab-actions">
              <button
                className={`tab ${activeTab === 'jsx' ? 'tab-active' : ''}`}
                onClick={() => setActiveTab('jsx')}
              >
                JSX
              </button>
              <button
                className={`tab ${activeTab === 'css' ? 'tab-active' : ''}`}
                onClick={() => setActiveTab('css')}
              >
                CSS
              </button>
              <button className="copy-btn" onClick={copyCurrentTab}>
                Copy
              </button>
            </div>
          </div>

          <pre className="code-block">
            <code>{activeTab === 'jsx' ? result.jsx : result.css}</code>
          </pre>

          {result.notes && <p className="small-note">{result.notes}</p>}
        </section>

        <section className="panel preview-panel">
          <div className="panel-head">
            <h2>Live Preview</h2>
            <span className="badge">Sandboxed</span>
          </div>

          <iframe
            title="Generated Component Preview"
            className="preview-frame"
            sandbox="allow-scripts"
            srcDoc={previewDoc}
          />
        </section>
      </main>
    </div>
  )
}

export default App
