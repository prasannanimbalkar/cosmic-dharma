import { useMemo, useState } from 'react'
import type { BirthChart } from '../lib/astrology'
import { buildChartInsights, type InsightBlock } from '../lib/insights'
interface Props {
  chart: BirthChart
  onOpenHelp?: () => void
}

function InsightCard({ title, text }: InsightBlock) {
  return (
    <article className="insight-card">
      <h3>{title}</h3>
      <p>{text}</p>
    </article>
  )
}

function CardSection({
  title,
  cards,
  defaultOpen = true,
  hint,
}: {
  title: string
  cards: InsightBlock[]
  defaultOpen?: boolean
  hint?: string
}) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <section className="insight-section">
      <button
        type="button"
        className="insight-section-toggle"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <span>{title}</span>
        <span className="toggle-icon" aria-hidden>
          {open ? '−' : '+'}
        </span>
      </button>
      {open && (
        <div className="insight-grid">
          {cards.map((block) => (
            <InsightCard key={block.title} title={block.title} text={block.text} />
          ))}
        </div>
      )}
      {!open && hint && <p className="insight-hint">{hint}</p>}
    </section>
  )
}

function ProseSection({
  section,
  defaultOpen = true,
}: {
  section: { title: string; paragraphs: string[] }
  defaultOpen?: boolean
}) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <section className="insight-section">
      <button
        type="button"
        className="insight-section-toggle"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <span>{section.title}</span>
        <span className="toggle-icon" aria-hidden>
          {open ? '−' : '+'}
        </span>
      </button>
      {open && (
        <div className="insight-prose">
          {section.paragraphs.map((text, i) => (
            <p key={i}>{text}</p>
          ))}
        </div>
      )}
    </section>
  )
}

export default function ChartGuide({ chart, onOpenHelp }: Props) {
  const insights = useMemo(() => buildChartInsights(chart), [chart])

  return (
    <div className="chart-guide-wrap">
      <div className="chart-guide card">
        <div className="chart-guide-header">
          <div>
            <h2>Understanding your Kundali</h2>
            <p className="guide-tagline">
              Personalized readings for {chart.name} in everyday language—what matters for you, not astrology
              jargon.
            </p>
          </div>
          {onOpenHelp && (
            <button type="button" className="chart-help-trigger" onClick={onOpenHelp}>
              How do I read this chart?
            </button>
          )}
        </div>

        <CardSection title="What stands out for you" cards={insights.highlightCards} defaultOpen />
        <CardSection
          title="Each planet in your life areas"
          cards={insights.planetCards}
          defaultOpen={false}
          hint="Expand for a short card on each planet—where it sits and how it may show up in daily life."
        />

        <p className="disclaimer">
          This reading is for education and self-reflection. It is not medical, legal, or financial advice. For
          important life decisions, speak with qualified professionals you trust.
        </p>
      </div>

      <div className="chart-guide-detailed card">
        <h2>Detailed reading</h2>
        <ProseSection section={insights.yourStory} defaultOpen />
        <ProseSection section={insights.planetaryStory} defaultOpen={false} />
      </div>
    </div>
  )
}
