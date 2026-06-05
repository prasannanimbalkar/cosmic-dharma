import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react'
import { searchPlaces, type PlaceResult } from '../lib/geocoding'

interface Props {
  value: PlaceResult | null
  onChange: (place: PlaceResult | null) => void
  disabled?: boolean
}

export default function PlaceSearch({ value, onChange, disabled }: Props) {
  const listId = useId()
  const wrapperRef = useRef<HTMLDivElement>(null)
  const [query, setQuery] = useState(value?.displayName ?? '')
  const [results, setResults] = useState<PlaceResult[]>([])
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeIdx, setActiveIdx] = useState(-1)

  useEffect(() => {
    if (value) setQuery(value.displayName)
  }, [value])

  useEffect(() => {
    if (disabled) return

    const q = query.trim()
    if (value && q === value.displayName) {
      setResults([])
      setOpen(false)
      return
    }
    if (q.length < 2) {
      setResults([])
      setOpen(false)
      setError(null)
      return
    }

    const controller = new AbortController()
    const timer = window.setTimeout(async () => {
      setLoading(true)
      setError(null)
      try {
        const places = await searchPlaces(q, controller.signal)
        setResults(places)
        setOpen(places.length > 0)
        setActiveIdx(-1)
        if (places.length === 0) setError('No places found. Try a nearby city.')
      } catch (e) {
        if ((e as Error).name === 'AbortError') return
        setResults([])
        setOpen(false)
        setError(e instanceof Error ? e.message : 'Search failed')
      } finally {
        setLoading(false)
      }
    }, 350)

    return () => {
      clearTimeout(timer)
      controller.abort()
    }
  }, [query, value, disabled])

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', onDocClick)
    return () => document.removeEventListener('mousedown', onDocClick)
  }, [])

  const pick = (place: PlaceResult) => {
    onChange(place)
    setQuery(place.displayName)
    setOpen(false)
    setResults([])
    setError(null)
  }

  const clear = () => {
    onChange(null)
    setQuery('')
    setResults([])
    setError(null)
    setOpen(false)
  }

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (!open || results.length === 0) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIdx((i) => (i + 1) % results.length)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIdx((i) => (i <= 0 ? results.length - 1 : i - 1))
    } else if (e.key === 'Enter' && activeIdx >= 0) {
      e.preventDefault()
      pick(results[activeIdx])
    } else if (e.key === 'Escape') {
      setOpen(false)
    }
  }

  return (
    <div className="place-search" ref={wrapperRef}>
      <label htmlFor={`${listId}-input`}>
        Birth Place
        <div className="place-input-wrap">
          <input
            id={`${listId}-input`}
            type="text"
            autoComplete="off"
            placeholder="Search city, town, village…"
            value={query}
            disabled={disabled}
            onChange={(e) => {
              setQuery(e.target.value)
              if (value) onChange(null)
            }}
            onFocus={() => results.length > 0 && setOpen(true)}
            onKeyDown={onKeyDown}
            role="combobox"
            aria-expanded={open}
            aria-controls={`${listId}-listbox`}
            aria-autocomplete="list"
          />
          {value && !disabled && (
            <button type="button" className="place-clear" onClick={clear} aria-label="Clear place">
              ×
            </button>
          )}
        </div>
      </label>

      {loading && <p className="place-hint">Searching…</p>}
      {error && !loading && <p className="place-error">{error}</p>}

      {value && !disabled && (
        <p className="place-meta">
          {value.latitude.toFixed(4)}°, {value.longitude.toFixed(4)}° · {value.timezone}
        </p>
      )}

      {open && results.length > 0 && (
        <ul id={`${listId}-listbox`} className="place-results" role="listbox">
          {results.map((place, i) => (
            <li key={place.id} role="option" aria-selected={i === activeIdx}>
              <button
                type="button"
                className={i === activeIdx ? 'active' : ''}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => pick(place)}
              >
                <span className="place-name">{place.displayName}</span>
                <span className="place-coords">
                  {place.latitude.toFixed(2)}°, {place.longitude.toFixed(2)}°
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}

      <p className="place-attribution">
        Place search via{' '}
        <a href="https://open-meteo.com/en/docs/geocoding-api" target="_blank" rel="noreferrer">
          Open-Meteo
        </a>
      </p>
    </div>
  )
}
