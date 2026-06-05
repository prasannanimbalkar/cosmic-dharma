import { PLANET_SYMBOLS } from '../lib/constants'
import type { BirthChart } from '../lib/astrology'
import { formatDegree, longitudeToNakshatra } from '../lib/astrology'

interface Props {
  chart: BirthChart
}

function PadaCell({ value }: { value: number | string }) {
  return (
    <td className="col-pada">
      <span className="pada-box">{value}</span>
    </td>
  )
}

export default function PlanetTable({ chart }: Props) {
  const lagnaNak = longitudeToNakshatra(chart.lagna)

  return (
    <div className="card navagraha-table-card">
      <h2>Navagraha Positions</h2>
      <p className="subtitle">
        Technical positions at birth. Rashi is the sign; Nakshatra is the lunar star; Pada is its quarter. See
        “Understanding your Kundali” above for plain-language meaning.
      </p>
      <div className="table-wrap">
        <table className="navagraha-table">
          <thead>
            <tr>
              <th>Graha</th>
              <th>Rashi</th>
              <th>Degree</th>
              <th>Nakshatra</th>
              <th className="col-pada">Pada</th>
            </tr>
          </thead>
          <tbody>
            <tr className="lagna-row">
              <td>
                <span className="graha">Asc Lagna</span>
              </td>
              <td>{chart.lagnaName}</td>
              <td className="col-degree">{formatDegree(chart.lagna)}</td>
              <td>{lagnaNak.name}</td>
              <PadaCell value={lagnaNak.pada} />
            </tr>
            {chart.planets.map((p) => (
              <tr key={p.name}>
                <td>
                  <span className="graha">
                    {PLANET_SYMBOLS[p.name]} {p.name}
                    {p.retrograde && <span className="retro-tag">R</span>}
                  </span>
                </td>
                <td>{p.rashiName}</td>
                <td className="col-degree">{formatDegree(p.longitude)}</td>
                <td>{p.nakshatraName}</td>
                <PadaCell value={p.pada} />
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="meta">
        Ayanamsa: {chart.ayanamsa.toFixed(4)}° · Moon Nakshatra Lord: {chart.moonNakshatraLord}
      </p>
    </div>
  )
}
