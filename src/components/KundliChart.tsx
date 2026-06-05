import { useMemo, useState } from 'react'
import { PLANET_ABBR, RASHIS_ENGLISH, type ChartTab } from '../lib/constants'
import { planetDignity } from '../lib/dignity'
import type { BirthChart, PlanetPosition } from '../lib/astrology'
import { formatDegreeCompact, planetsInHouse, planetsInSign, houseForSign } from '../lib/astrology'
import { buildMoonChart, buildNavamshaChart } from '../lib/divisional'
import { NORTH_HOUSE_POSITIONS } from './chartLayout'

interface Props {
  chart: BirthChart
  onOpenHelp?: () => void
}

const TABS: { id: ChartTab; label: string }[] = [
  { id: 'lagna', label: 'Lagna' },
  { id: 'navamsha', label: 'Navamsha' },
  { id: 'moon', label: 'Moon' },
]

function HousePlanets({
  planets,
  showLagna,
  lagnaDegree,
}: {
  planets: PlanetPosition[]
  showLagna?: boolean
  lagnaDegree?: number
}) {
  return (
    <ul className="house-planet-list">
      {showLagna && lagnaDegree !== undefined && (
        <li>
          <span className="p-deg">{formatDegreeCompact(lagnaDegree)}</span>
          <span className="p-abbr">La</span>
        </li>
      )}
      {planets.map((p) => {
        const dignity = planetDignity(p.name, p.rashi)
        return (
          <li key={p.name}>
            <span className="p-deg">{formatDegreeCompact(p.degreeInSign)}</span>
            <span className="p-abbr">{PLANET_ABBR[p.name]}</span>
            {p.retrograde && <span className="p-retro">*</span>}
            {dignity === 'exalted' && <span className="p-dignity exalted">↑</span>}
            {dignity === 'debilitated' && <span className="p-dignity debilitated">↓</span>}
          </li>
        )
      })}
    </ul>
  )
}

function SignHeader({ signIdx }: { signIdx: number }) {
  return (
    <div className="sign-header">
      <span className="sign-rashi-num">{signIdx + 1}</span>
      <span className="sign-rashi-name">{RASHIS_ENGLISH[signIdx]}</span>
    </div>
  )
}

export function NorthIndianChart({ chart }: { chart: BirthChart }) {
  return (
    <div className="north-chart-wrap">
      <svg className="north-svg" viewBox="0 0 100 100" role="img" aria-label="North Indian chart">
        <rect className="chart-bg-fill" x="0" y="0" width="100" height="100" />
        <rect className="chart-line" x="0.4" y="0.4" width="99.2" height="99.2" fill="none" strokeWidth="0.45" />
        <line className="chart-line" x1="0" y1="0" x2="100" y2="100" strokeWidth="0.38" />
        <line className="chart-line" x1="100" y1="0" x2="0" y2="100" strokeWidth="0.38" />
        <polygon className="chart-line" points="50,0 100,50 50,100 0,50" fill="none" strokeWidth="0.38" />
      </svg>
      {NORTH_HOUSE_POSITIONS.map(({ house, x, y, place }) => {
        const houseIdx = house - 1
        const signIdx = chart.houseSigns[houseIdx]
        const occupants = planetsInHouse(chart, houseIdx)
        const showLagna = signIdx === chart.lagnaRashi
        const planetsAboveSign = place === 'label-bc'
        return (
          <div
            key={house}
            className={`north-house-slot ${place} north-h${house}`}
            style={{ left: `${x}%`, top: `${y}%` }}
          >
            {planetsAboveSign && (
              <HousePlanets
                planets={occupants}
                showLagna={showLagna}
                lagnaDegree={showLagna ? chart.lagna % 30 : undefined}
              />
            )}
            <SignHeader signIdx={signIdx} />
            {!planetsAboveSign && (
              <HousePlanets
                planets={occupants}
                showLagna={showLagna}
                lagnaDegree={showLagna ? chart.lagna % 30 : undefined}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}

export function SouthIndianChart({ chart }: { chart: BirthChart }) {
  const layout: { sign: number; pos: string }[] = [
    { sign: 11, pos: 's-pi' },
    { sign: 0, pos: 's-ar' },
    { sign: 1, pos: 's-ta' },
    { sign: 2, pos: 's-ge' },
    { sign: 10, pos: 's-aq' },
    { sign: -1, pos: 'center' },
    { sign: 3, pos: 's-cn' },
    { sign: 9, pos: 's-cp' },
    { sign: 4, pos: 's-le' },
    { sign: 8, pos: 's-sg' },
    { sign: 7, pos: 's-sc' },
    { sign: 6, pos: 's-li' },
    { sign: 5, pos: 's-vi' },
  ]

  return (
    <div className="kundli-grid south-grid">
      {layout.map(({ sign, pos }) => {
        if (sign < 0) {
          return <div key={pos} className={`cell ${pos}`} />
        }
        const occupants = planetsInSign(chart, sign)
        const houseNum = houseForSign(chart.lagnaRashi, sign)
        const isLagna = sign === chart.lagnaRashi
        return (
          <div key={pos} className={`cell ${pos} ${isLagna ? 'lagna-sign-cell' : ''}`}>
            <SignHeader signIdx={sign} />
            {!isLagna && <span className="house-num">{houseNum}</span>}
            {isLagna && <span className="house-num">Asc</span>}
            <HousePlanets
              planets={occupants}
              showLagna={isLagna}
              lagnaDegree={isLagna ? chart.lagna % 30 : undefined}
            />
          </div>
        )
      })}
    </div>
  )
}

export default function KundliCharts({ chart, onOpenHelp }: Props) {
  const [tab, setTab] = useState<ChartTab>('lagna')
  const [showSouth, setShowSouth] = useState(false)

  const activeChart = useMemo(() => {
    if (tab === 'navamsha') return buildNavamshaChart(chart)
    if (tab === 'moon') return buildMoonChart(chart)
    return chart
  }, [chart, tab])

  return (
    <div className="chart-card-ref">
      <div className="chart-tabs-row">
        <div className="chart-tabs" role="tablist">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={tab === t.id}
              className={`chart-tab ${tab === t.id ? 'active' : ''}`}
              onClick={() => setTab(t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>
        {onOpenHelp && (
          <button type="button" className="chart-help-trigger chart-help-trigger-inline" onClick={onOpenHelp}>
            How to read this?
          </button>
        )}
      </div>

      <div className="chart-panel north-panel">
        <NorthIndianChart chart={activeChart} />
      </div>

      <div className="chart-south-toggle">
        <button type="button" className="link-btn" onClick={() => setShowSouth((v) => !v)}>
          {showSouth ? 'Hide South Indian chart' : 'Show South Indian chart'}
        </button>
      </div>

      {showSouth && (
        <div className="chart-panel south-panel">
          <SouthIndianChart chart={activeChart} />
        </div>
      )}
    </div>
  )
}
