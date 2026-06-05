export interface PlaceResult {
  id: number
  name: string
  admin1?: string
  country?: string
  countryCode?: string
  latitude: number
  longitude: number
  timezone: string
  displayName: string
}

interface OpenMeteoResult {
  id: number
  name: string
  latitude: number
  longitude: number
  timezone: string
  country?: string
  country_code?: string
  admin1?: string
}

interface OpenMeteoResponse {
  results?: OpenMeteoResult[]
}

export async function searchPlaces(query: string, signal?: AbortSignal): Promise<PlaceResult[]> {
  const q = query.trim()
  if (q.length < 2) return []

  const url = new URL('https://geocoding-api.open-meteo.com/v1/search')
  url.searchParams.set('name', q)
  url.searchParams.set('count', '10')
  url.searchParams.set('language', 'en')

  const res = await fetch(url.toString(), { signal })
  if (!res.ok) throw new Error('Place search failed. Try again in a moment.')

  const data = (await res.json()) as OpenMeteoResponse
  if (!data.results?.length) return []

  return data.results.map((r) => {
    const parts = [r.name, r.admin1, r.country].filter(Boolean)
    return {
      id: r.id,
      name: r.name,
      admin1: r.admin1,
      country: r.country,
      countryCode: r.country_code,
      latitude: r.latitude,
      longitude: r.longitude,
      timezone: r.timezone,
      displayName: parts.join(', '),
    }
  })
}
