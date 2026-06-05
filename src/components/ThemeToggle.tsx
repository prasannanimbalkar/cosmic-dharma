import type { Theme } from '../lib/theme'

interface Props {
  theme: Theme
  onChange: (theme: Theme) => void
}

export default function ThemeToggle({ theme, onChange }: Props) {
  return (
    <div className="theme-toggle" role="group" aria-label="Color theme">
      <button
        type="button"
        className={theme === 'dark' ? 'active' : ''}
        aria-pressed={theme === 'dark'}
        onClick={() => onChange('dark')}
      >
        Dark
      </button>
      <button
        type="button"
        className={theme === 'light' ? 'active' : ''}
        aria-pressed={theme === 'light'}
        onClick={() => onChange('light')}
      >
        Light
      </button>
    </div>
  )
}
