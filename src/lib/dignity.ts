import type { PlanetName } from './constants'

const EXALTED: Partial<Record<PlanetName, number>> = {
  Sun: 0,
  Moon: 1,
  Mars: 9,
  Mercury: 5,
  Jupiter: 3,
  Venus: 11,
  Saturn: 6,
}

const DEBILITATED: Partial<Record<PlanetName, number>> = {
  Sun: 6,
  Moon: 7,
  Mars: 3,
  Mercury: 11,
  Jupiter: 9,
  Venus: 5,
  Saturn: 0,
}

export function planetDignity(
  planet: PlanetName,
  rashi: number,
): 'exalted' | 'debilitated' | null {
  if (EXALTED[planet] === rashi) return 'exalted'
  if (DEBILITATED[planet] === rashi) return 'debilitated'
  return null
}
