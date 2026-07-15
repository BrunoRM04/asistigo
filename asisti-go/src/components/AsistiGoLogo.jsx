export function AsistiGoLogo({ className = '' }) {
  const clases = ['asistigo-logo', className].filter(Boolean).join(' ')

  return (
    <div className={clases} aria-label="AsistiGo">
      <svg className="asistigo-logo-mark" viewBox="0 0 32 32" aria-hidden="true">
        <circle cx="16" cy="16" r="14.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeDasharray="3 4" />
        <circle cx="16" cy="16" r="3.4" fill="currentColor" />
      </svg>
      <span>AsistiGo</span>
    </div>
  )
}
