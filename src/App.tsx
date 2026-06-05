import { useEffect, useMemo, useState } from 'react'
import BirthForm, { type BirthFormSubmit } from './components/BirthForm'
import KundliCharts from './components/KundliChart'
import PlanetTable from './components/PlanetTable'
import DashaTimeline from './components/DashaTimeline'
import ChartGuide from './components/ChartGuide'
import ChartHelpModal from './components/ChartHelpModal'
import { buildChartInsights } from './lib/insights'
import ThemeToggle from './components/ThemeToggle'
import { computeChart, type BirthChart } from './lib/astrology'
import { saveLead } from './lib/leads'
import { applyTheme, getInitialTheme, type Theme } from './lib/theme'
import './App.css'

function App() {
  const [chart, setChart] = useState<BirthChart | null>(null)
  const [theme, setTheme] = useState<Theme>(getInitialTheme)
  const [chartHelpOpen, setChartHelpOpen] = useState(false)
  const chartInsights = useMemo(() => (chart ? buildChartInsights(chart) : null), [chart])

  useEffect(() => {
    applyTheme(theme)
  }, [theme])

  const handleSubmit = async ({ birth, email }: BirthFormSubmit) => {
    setChart(computeChart(birth))
    requestAnimationFrame(() => {
      document.getElementById('kundali-results')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })

    const result = await saveLead({
      email,
      name: birth.name,
    })
    if (!result.ok && result.reason !== 'not_configured') {
      console.warn('Could not save email:', result.message ?? result.reason)
    }
  }

  return (
    <div className="app">
      <header className="hero">
        <div className="hero-top">
          <ThemeToggle theme={theme} onChange={setTheme} />
        </div>
        <div className="hero-glow" />
        <p className="eyebrow">Vedic Astrology</p>
        <h1>Cosmic Dharma</h1>
        <p className="tagline">
          Read the sky you were born under—your Janma Kundali, planetary rhythms, and life&apos;s path in
          plain words.
        </p>
      </header>

      <main className={`layout ${chart ? 'layout-chart' : 'layout-entry'}`}>
        <section className="form-section">
          <BirthForm onSubmit={handleSubmit} hasChart={chart !== null} />
        </section>

        {chart ? (
          <section className="results" id="kundali-results">
            <div className="summary card">
              <h2>{chart.name}&apos;s Kundali</h2>
              <p>
                Lagna: <strong>{chart.lagnaName}</strong> · Ayanamsa (Lahiri):{' '}
                <strong>{chart.ayanamsa.toFixed(4)}°</strong>
              </p>
            </div>
            <KundliCharts chart={chart} onOpenHelp={() => setChartHelpOpen(true)} />
            <ChartGuide chart={chart} onOpenHelp={() => setChartHelpOpen(true)} />
            <PlanetTable chart={chart} />
            <DashaTimeline chart={chart} />
          </section>
        ) : (
          <section className="results">
            <div className="empty card">
              <div className="mandala" aria-hidden />
              <h2>Your chart awaits</h2>
              <p>Enter your birth details to reveal your chart—the cosmic pattern behind your dharma.</p>
            </div>
          </section>
        )}
      </main>

      {chartInsights && (
        <ChartHelpModal
          open={chartHelpOpen}
          onClose={() => setChartHelpOpen(false)}
          legend={chartInsights.chartLegend}
          guideCards={chartInsights.guideCards}
          howToReadParagraphs={chartInsights.howToRead.paragraphs}
        />
      )}

      <footer>
        <p>Sidereal zodiac · Whole sign houses · Lahiri Ayanamsa · For educational purposes</p>
      </footer>
    </div>
  )
}

export default App
