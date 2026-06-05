import { useEffect, useId, useRef } from 'react'
import type { ChartInsights, InsightBlock } from '../lib/insights'

interface Props {
  open: boolean
  onClose: () => void
  legend: ChartInsights['chartLegend']
  guideCards: InsightBlock[]
  howToReadParagraphs: string[]
}

function InsightCard({ title, text }: InsightBlock) {
  return (
    <article className="insight-card">
      <h3>{title}</h3>
      <p>{text}</p>
    </article>
  )
}

export default function ChartHelpModal({
  open,
  onClose,
  legend,
  guideCards,
  howToReadParagraphs,
}: Props) {
  const titleId = useId()
  const closeRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!open) return

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }

    document.body.style.overflow = 'hidden'
    document.addEventListener('keydown', onKeyDown)
    closeRef.current?.focus()

    return () => {
      document.body.style.overflow = ''
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="chart-help-backdrop" onClick={onClose}>
      <div
        className="chart-help-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={(e) => e.stopPropagation()}
      >
        <header className="chart-help-header">
          <h2 id={titleId}>How to read your Kundali</h2>
          <button
            ref={closeRef}
            type="button"
            className="chart-help-close"
            onClick={onClose}
            aria-label="Close"
          >
            ×
          </button>
        </header>

        <div className="chart-help-body">
          <div className="insight-legend">
            <p className="subtitle">Symbols on the chart</p>
            <ul className="legend-list">
              {legend.map((item) => (
                <li key={item.symbol}>
                  <span className="legend-symbol">{item.symbol}</span>
                  <span>{item.meaning}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="insight-grid">
            {guideCards.map((block) => (
              <InsightCard key={block.title} title={block.title} text={block.text} />
            ))}
          </div>

          <div className="insight-prose chart-help-prose">
            {howToReadParagraphs.map((text, i) => (
              <p key={i}>{text}</p>
            ))}
          </div>
        </div>

        <footer className="chart-help-footer">
          <button type="button" className="primary-btn" onClick={onClose}>
            Got it
          </button>
        </footer>
      </div>
    </div>
  )
}
