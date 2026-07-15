const ICON_PATHS = {
  home: (
    <>
      <path d="M3 10.6 12 3l9 7.6" />
      <path d="M5.4 9.2V21h13.2V9.2" />
      <path d="M9.3 21v-6.4h5.4V21" />
    </>
  ),
  car: (
    <>
      <path d="m5 11 1.6-4.2A2.8 2.8 0 0 1 9.2 5h5.6a2.8 2.8 0 0 1 2.6 1.8L19 11" />
      <path d="M4 11h16v6H4z" />
      <path d="M6.5 17.5v1.8" />
      <path d="M17.5 17.5v1.8" />
      <path d="M7.4 14h.1" />
      <path d="M16.5 14h.1" />
    </>
  ),
  wrench: (
    <>
      <path d="M14.7 6.3a4.6 4.6 0 0 0-5.2 5.9l-5.8 5.8a2 2 0 0 0 2.8 2.8l5.8-5.8a4.6 4.6 0 0 0 5.9-5.2l-3 3-3-3z" />
    </>
  ),
  calendar: (
    <>
      <path d="M7 3v3" />
      <path d="M17 3v3" />
      <path d="M4.5 8.5h15" />
      <path d="M5 5.5h14v15H5z" />
    </>
  ),
  chat: (
    <>
      <path d="M4 5.5h16v10.8H8.4L4 20z" />
      <path d="M8 9.5h8" />
      <path d="M8 13h5.5" />
    </>
  ),
  user: (
    <>
      <path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8" />
      <path d="M4.8 20a7.2 7.2 0 0 1 14.4 0" />
    </>
  ),
  file: (
    <>
      <path d="M6 3.5h8l4 4V20.5H6z" />
      <path d="M14 3.5v4h4" />
      <path d="M9 12h6" />
      <path d="M9 15.5h4" />
    </>
  ),
  bell: (
    <>
      <path d="M6.5 10a5.5 5.5 0 0 1 11 0v4.2l1.8 2.2H4.7l1.8-2.2z" />
      <path d="M10 19a2.2 2.2 0 0 0 4 0" />
    </>
  ),
  spark: (
    <>
      <path d="m12 3 1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z" />
      <path d="m5 4 .6 1.6L7 6l-1.4.4L5 8l-.6-1.6L3 6l1.4-.4z" />
      <path d="m18 15 .6 1.6L20 17l-1.4.4L18 19l-.6-1.6L16 17l1.4-.4z" />
    </>
  ),
  search: (
    <>
      <path d="M10.5 17a6.5 6.5 0 1 0 0-13 6.5 6.5 0 0 0 0 13" />
      <path d="m15.2 15.2 4.3 4.3" />
    </>
  ),
  plus: (
    <>
      <path d="M12 5v14" />
      <path d="M5 12h14" />
    </>
  ),
  arrow: <path d="m9 18 6-6-6-6" />,
  clock: (
    <>
      <path d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18" />
      <path d="M12 7.5V12l3 2" />
    </>
  ),
  star: (
    <path d="m12 3 2.7 5.5 6.1.9-4.4 4.3 1 6.1-5.4-2.9-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z" />
  ),
  send: (
    <>
      <path d="M21 3 10 14" />
      <path d="m21 3-7 18-4-7-7-4z" />
    </>
  ),
  attachment: (
    <path d="m8.5 12.5 6.8-6.8a3.2 3.2 0 0 1 4.5 4.5l-8.4 8.4a5 5 0 0 1-7.1-7.1l8-8" />
  ),
  close: (
    <>
      <path d="m6 6 12 12" />
      <path d="M18 6 6 18" />
    </>
  ),
  back: <path d="m15 18-6-6 6-6" />,
  logout: (
    <>
      <path d="M10 5H5v14h5" />
      <path d="M14 16l4-4-4-4" />
      <path d="M18 12H9" />
    </>
  ),
  shield: (
    <>
      <path d="M12 3 5.5 5.5v5.7c0 4.2 2.7 7.7 6.5 9.3 3.8-1.6 6.5-5.1 6.5-9.3V5.5z" />
      <path d="m9 12 2 2 4-4" />
    </>
  ),
  alert: (
    <>
      <path d="M12 4 3.5 19h17z" />
      <path d="M12 9v4" />
      <path d="M12 16.5h.1" />
    </>
  ),
}

export function UserIcon({ name, size = 20, className = '', title }) {
  return (
    <svg
      aria-hidden={title ? undefined : 'true'}
      aria-label={title}
      className={`user-icon ${className}`}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
    >
      {ICON_PATHS[name] || ICON_PATHS.alert}
    </svg>
  )
}
