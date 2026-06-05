import { useState, type FormEvent, type MouseEvent } from 'react'
import type { BirthInput } from '../lib/astrology'
import type { PlaceResult } from '../lib/geocoding'
import { isLeadCaptureEnabled, isValidEmail } from '../lib/leads'
import { timezoneOffsetHours } from '../lib/timezone'
import PlaceSearch from './PlaceSearch'

export interface BirthFormSubmit {
  birth: BirthInput
  email: string
}

interface Props {
  onSubmit: (data: BirthFormSubmit) => void
  hasChart?: boolean
}

const captureLeads = isLeadCaptureEnabled()

const PICKER_HIT_PX = 44

/** Open native picker only when clicking the icon / empty right area — leave text editable */
function handleDateTimeClick(e: MouseEvent<HTMLInputElement>) {
  const input = e.currentTarget
  const rect = input.getBoundingClientRect()
  if (e.clientX < rect.right - PICKER_HIT_PX) return

  if (typeof input.showPicker === 'function') {
    try {
      input.showPicker()
    } catch {
      // Already open or blocked by the browser
    }
  }
}

export default function BirthForm({ onSubmit, hasChart = false }: Props) {
  const [name, setName] = useState('')
  const [date, setDate] = useState('1990-08-15')
  const [time, setTime] = useState('06:30')
  const [place, setPlace] = useState<PlaceResult | null>(null)
  const [email, setEmail] = useState('')
  const [consent, setConsent] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const emailValid = isValidEmail(email)
  const canSubmit = emailValid && place !== null && (!captureLeads || consent)

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    setFormError(null)

    if (!canSubmit) {
      if (!emailValid) setFormError('Enter a valid email address.')
      else if (!place) setFormError('Search and select your birth place.')
      else setFormError('Please confirm you understand what we store.')
      return
    }

    const [y, m, d] = date.split('-').map(Number)
    const [h, min] = time.split(':').map(Number)

    onSubmit({
      birth: {
        name: name.trim() || 'Seeker',
        year: y,
        month: m,
        day: d,
        hour: h,
        minute: min,
        lat: place!.latitude,
        lon: place!.longitude,
        tzOffsetHours: timezoneOffsetHours(place!.timezone, y, m, d, h, min),
      },
      email: email.trim().toLowerCase(),
    })
  }

  return (
    <form
      className={`birth-form card${hasChart ? ' has-chart' : ''}`}
      onSubmit={handleSubmit}
    >
      <h2>Birth Details</h2>
      <p className="subtitle">
        {hasChart
          ? 'Update your details below and tap Generate Kundali again to refresh the chart.'
          : 'Enter Janma Kundali particulars'}
      </p>

      <div className="birth-form-grid">
        <label>
          Name
          <input
            type="text"
            placeholder="Your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </label>

        <div className={`field-dates${hasChart ? '' : ' row'}`}>
          <label>
            Date of Birth
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              onClick={handleDateTimeClick}
              required
            />
          </label>
          <label>
            Time of Birth
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              onClick={handleDateTimeClick}
              required
            />
          </label>
        </div>

        <div className="birth-form-place">
          <PlaceSearch value={place} onChange={setPlace} />
        </div>

        <div className="email-section">
        {/* <p className="privacy-note">
          We only save your <strong>email</strong> and <strong>name</strong> for follow-up. Your
          birth date, time, place, and chart are <strong>not stored</strong> on our servers—they
          stay in your browser.
        </p> */}
        <label className="birth-form-email">
          Email
          <input
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>
        </div>

        <div className="birth-form-footer">
          {captureLeads && (
            <label className="checkbox consent">
              <input
                type="checkbox"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
              />
              <span>
                I understand only my <strong>email</strong> and <strong>name</strong> are saved for follow-up, a noting else.
              </span>
            </label>
          )}
          <div className="birth-form-actions">
            {formError && <p className="place-error">{formError}</p>}
            <button type="submit" className="primary-btn" disabled={!canSubmit}>
              {hasChart ? 'Regenerate Kundali' : 'Generate Kundali'}
            </button>
          </div>
        </div>
      </div>
    </form>
  )
}
