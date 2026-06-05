import * as Astronomy from 'astronomy-engine'
import {
  DASHA_ORDER,
  DASHA_YEARS,
  NAKSHATRA_LORDS,
  NAKSHATRAS,
  PLANETS,
  RASHIS_ENGLISH,
  type PlanetName,
} from './constants'

export interface BirthInput {
  name: string
  year: number
  month: number
  day: number
  hour: number
  minute: number
  lat: number
  lon: number
  tzOffsetHours: number
}

export interface PlanetPosition {
  name: PlanetName
  longitude: number
  rashi: number
  rashiName: string
  degreeInSign: number
  nakshatra: number
  nakshatraName: string
  pada: number
  retrograde: boolean
}

export interface DashaPeriod {
  lord: PlanetName
  start: Date
  end: Date
  years: number
}

export interface BirthChart {
  name: string
  birthUtc: Date
  ayanamsa: number
  lagna: number
  lagnaRashi: number
  lagnaName: string
  planets: PlanetPosition[]
  houseSigns: number[]
  vimshottari: DashaPeriod[]
  moonNakshatraLord: PlanetName
}

const DEG = Math.PI / 180
const RAD = 180 / Math.PI

function norm360(deg: number): number {
  let d = deg % 360
  if (d < 0) d += 360
  return d
}

/** Lahiri ayanamsa (degrees), suitable for standard Jyotish charts */
export function lahiriAyanamsa(year: number, month: number, day: number): number {
  const y = year + (month - 1 + (day - 1) / 30) / 12
  return 22.460148 + (y - 1900) * (50.2564 / 3600)
}

function localToUtc(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
  tzOffsetHours: number,
): Date {
  const localMs = Date.UTC(year, month - 1, day, hour, minute, 0)
  return new Date(localMs - tzOffsetHours * 3600 * 1000)
}

function tropicalAscendant(time: Astronomy.AstroTime, lat: number, lon: number): number {
  const gast = Astronomy.SiderealTime(time)
  const lstDeg = norm360(gast * 15 + lon)
  const theta = lstDeg * DEG
  const eps = 23.4392911 * DEG
  const phi = lat * DEG
  const asc = Math.atan2(
    Math.cos(theta),
    -Math.sin(theta) * Math.cos(eps) - Math.tan(phi) * Math.sin(eps),
  )
  return norm360(asc * RAD)
}

function eclipticLongitude(body: Astronomy.Body, time: Astronomy.AstroTime): number {
  const vec = Astronomy.GeoVector(body, time, true)
  const ecl = Astronomy.Ecliptic(vec)
  return norm360(ecl.elon)
}

function meanLunarNode(time: Astronomy.AstroTime): number {
  const T = time.ut / 36525
  return norm360(125.044522 - 1934.136261 * T + 0.0020708 * T * T)
}

function isRetrograde(body: Astronomy.Body, time: Astronomy.AstroTime): boolean {
  const t2 = time.AddDays(1)
  const lon1 = eclipticLongitude(body, time)
  const lon2 = eclipticLongitude(body, t2)
  let diff = lon2 - lon1
  if (diff > 180) diff -= 360
  if (diff < -180) diff += 360
  return diff < 0
}

export function navamshaSignIndex(longitude: number): number {
  const sign = Math.floor(longitude / 30) % 12
  const inSign = longitude % 30
  const part = Math.min(8, Math.floor(inSign / (30 / 9)))

  const chara = [0, 3, 6, 9]
  const sthira = [1, 4, 7, 10]
  let start = sign
  if (sthira.includes(sign)) start = (sign + 8) % 12
  else if (!chara.includes(sign)) start = (sign + 4) % 12

  return (start + part) % 12
}

export function longitudeToRashi(lon: number): { index: number; name: string; degreeInSign: number } {
  const index = Math.floor(lon / 30) % 12
  const degreeInSign = lon % 30
  return { index, name: RASHIS_ENGLISH[index], degreeInSign }
}

export function longitudeToNakshatra(lon: number): {
  index: number
  name: string
  pada: number
  lord: PlanetName
} {
  const span = 360 / 27
  const index = Math.min(26, Math.floor(lon / span))
  const rem = lon - index * span
  const pada = Math.min(4, Math.floor(rem / (span / 4)) + 1)
  const lord = NAKSHATRA_LORDS[index % 9] as PlanetName
  return { index, name: NAKSHATRAS[index], pada, lord }
}

function buildPlanet(
  name: PlanetName,
  siderealLon: number,
  retrograde: boolean,
): PlanetPosition {
  const { index, name: rashiName, degreeInSign } = longitudeToRashi(siderealLon)
  const nak = longitudeToNakshatra(siderealLon)
  return {
    name,
    longitude: siderealLon,
    rashi: index,
    rashiName,
    degreeInSign,
    nakshatra: nak.index,
    nakshatraName: nak.name,
    pada: nak.pada,
    retrograde,
  }
}

function vimshottariDasha(moonLon: number, birthUtc: Date): DashaPeriod[] {
  const span = 360 / 27
  const nakIndex = Math.min(26, Math.floor(moonLon / span))
  const remInNak = moonLon - nakIndex * span
  const lordIndex = nakIndex % 9
  const balanceFraction = 1 - remInNak / span
  const firstLord = DASHA_ORDER[lordIndex]
  const firstYears = DASHA_YEARS[firstLord] * balanceFraction

  const periods: DashaPeriod[] = []
  let cursor = new Date(birthUtc)

  const addPeriod = (lord: PlanetName, years: number) => {
    const end = new Date(cursor)
    end.setTime(end.getTime() + years * 365.25 * 24 * 3600 * 1000)
    periods.push({ lord, start: new Date(cursor), end, years })
    cursor = end
  }

  addPeriod(firstLord, firstYears)
  let idx = (lordIndex + 1) % 9
  while (periods.length < 12) {
    const lord = DASHA_ORDER[idx]
    addPeriod(lord, DASHA_YEARS[lord])
    idx = (idx + 1) % 9
  }

  return periods
}

export function computeChart(input: BirthInput): BirthChart {
  const birthUtc = localToUtc(
    input.year,
    input.month,
    input.day,
    input.hour,
    input.minute,
    input.tzOffsetHours,
  )
  const time = Astronomy.MakeTime(birthUtc)
  const ay = lahiriAyanamsa(input.year, input.month, input.day)

  const tropAsc = tropicalAscendant(time, input.lat, input.lon)
  const lagna = norm360(tropAsc - ay)
  const lagnaR = longitudeToRashi(lagna)

  const bodies: { name: PlanetName; body?: Astronomy.Body; custom?: () => number }[] = [
    { name: 'Sun', body: Astronomy.Body.Sun },
    { name: 'Moon', body: Astronomy.Body.Moon },
    { name: 'Mars', body: Astronomy.Body.Mars },
    { name: 'Mercury', body: Astronomy.Body.Mercury },
    { name: 'Jupiter', body: Astronomy.Body.Jupiter },
    { name: 'Venus', body: Astronomy.Body.Venus },
    { name: 'Saturn', body: Astronomy.Body.Saturn },
    { name: 'Rahu', custom: () => meanLunarNode(time) },
    { name: 'Ketu', custom: () => norm360(meanLunarNode(time) + 180) },
  ]

  const planets: PlanetPosition[] = bodies.map(({ name, body, custom }) => {
    const trop = custom ? custom() : eclipticLongitude(body!, time)
    const sid = norm360(trop - ay)
    const retro =
      name !== 'Rahu' && name !== 'Ketu' && body
        ? isRetrograde(body, time)
        : false
    return buildPlanet(name, sid, retro)
  })

  const houseSigns = Array.from({ length: 12 }, (_, i) => (lagnaR.index + i) % 12)

  const moon = planets.find((p) => p.name === 'Moon')!
  const moonLord = longitudeToNakshatra(moon.longitude).lord

  return {
    name: input.name,
    birthUtc,
    ayanamsa: ay,
    lagna,
    lagnaRashi: lagnaR.index,
    lagnaName: lagnaR.name,
    planets,
    houseSigns,
    vimshottari: vimshottariDasha(moon.longitude, birthUtc),
    moonNakshatraLord: moonLord,
  }
}

export function formatDegree(lon: number): string {
  const signLon = lon % 30
  const deg = Math.floor(signLon)
  const minFloat = (signLon - deg) * 60
  const min = Math.floor(minFloat)
  const sec = Math.floor((minFloat - min) * 60)
  return `${deg}° ${min}' ${sec}"`
}

/** Two-digit degree within sign for chart house labels */
export function formatDegreeCompact(degreeInSign: number): string {
  return Math.floor(degreeInSign).toString().padStart(2, '0')
}

export function planetsInHouse(chart: BirthChart, houseIndex: number): PlanetPosition[] {
  const sign = chart.houseSigns[houseIndex]
  return chart.planets.filter((p) => p.rashi === sign)
}

export function planetsInSign(chart: BirthChart, signIndex: number): PlanetPosition[] {
  return chart.planets.filter((p) => p.rashi === signIndex)
}

/** Whole-sign house number (1–12) for a fixed rashi in South Indian layout */
export function houseForSign(lagnaRashi: number, signIndex: number): number {
  return ((signIndex - lagnaRashi + 12) % 12) + 1
}

export { PLANETS }
