import { PLANET_SYMBOLS } from '../lib/constants'
import type { BirthChart } from '../lib/astrology'

interface Props {
  chart: BirthChart
}

function fmt(d: Date): string {
  return d.toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })
}

export default function DashaTimeline({ chart }: Props) {
  const now = new Date()
  return (
    <div className="card">
      <h2>Vimshottari Dasha</h2>
      <p className="subtitle">
        Life unfolds in chapters ruled by each planet. The highlighted period is your current Mahadasha—the
        main background theme for these years.
      </p>
      <div className="dasha-list">
        {chart.vimshottari.map((d) => {
          const active = now >= d.start && now < d.end
          return (
            <div key={d.lord + d.start.toISOString()} className={`dasha-item ${active ? 'active' : ''}`}>
              <div className="dasha-lord">
                <span className="symbol">{PLANET_SYMBOLS[d.lord]}</span>
                <span>{d.lord}</span>
                {active && <span className="badge">Current</span>}
              </div>
              <div className="dasha-dates">
                {fmt(d.start)} — {fmt(d.end)}
              </div>
              <div className="dasha-years">{d.years.toFixed(2)} years</div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
