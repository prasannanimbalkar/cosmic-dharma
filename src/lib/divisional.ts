import { RASHIS_ENGLISH } from './constants'
import type { BirthChart, PlanetPosition } from './astrology'
import { navamshaSignIndex } from './astrology'

function houseSignsFromLagna(lagnaRashi: number): number[] {
  return Array.from({ length: 12 }, (_, i) => (lagnaRashi + i) % 12)
}

function remapPlanetsToNavamsha(planets: PlanetPosition[]): PlanetPosition[] {
  return planets.map((p) => {
    const rashi = navamshaSignIndex(p.longitude)
    const inSign = p.longitude % 30
    const degreeInSign = (inSign % (30 / 9)) * 9
    return {
      ...p,
      rashi,
      rashiName: RASHIS_ENGLISH[rashi],
      degreeInSign,
    }
  })
}

/** D9 — Navamsha chart (whole sign from Navamsha Lagna) */
export function buildNavamshaChart(base: BirthChart): BirthChart {
  const lagnaRashi = navamshaSignIndex(base.lagna)
  return {
    ...base,
    lagnaRashi,
    lagnaName: RASHIS_ENGLISH[lagnaRashi],
    houseSigns: houseSignsFromLagna(lagnaRashi),
    planets: remapPlanetsToNavamsha(base.planets),
  }
}

/** Chandra Kundali — Moon as ascendant (whole sign) */
export function buildMoonChart(base: BirthChart): BirthChart {
  const moon = base.planets.find((p) => p.name === 'Moon')!
  const lagnaRashi = moon.rashi
  return {
    ...base,
    lagna: moon.longitude,
    lagnaRashi,
    lagnaName: RASHIS_ENGLISH[lagnaRashi],
    houseSigns: houseSignsFromLagna(lagnaRashi),
  }
}
