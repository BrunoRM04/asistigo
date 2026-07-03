const ICONOS_MECANICO = {
  inicio: (
    <>
      <path d="M3 10.6 12 3l9 7.6" />
      <path d="M5.4 9.2V21h13.2V9.2" />
      <path d="M9.3 21v-6.4h5.4V21" />
    </>
  ),
  solicitudes: (
    <>
      <path d="M4 5h16v13H4z" />
      <path d="m4 7 8 6 8-6" />
    </>
  ),
  agenda: (
    <>
      <path d="M7 3v3" />
      <path d="M17 3v3" />
      <path d="M4.5 8.5h15" />
      <path d="M5 5.5h14v15H5z" />
    </>
  ),
  clientes: (
    <>
      <path d="M9 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7" />
      <path d="M2.8 20a6.2 6.2 0 0 1 12.4 0" />
      <path d="M17 10.5a3 3 0 1 0 0-6" />
      <path d="M16.5 14a5 5 0 0 1 4.7 5" />
    </>
  ),
  servicios: (
    <path d="M14.7 6.3a4.6 4.6 0 0 0-5.2 5.9l-5.8 5.8a2 2 0 0 0 2.8 2.8l5.8-5.8a4.6 4.6 0 0 0 5.9-5.2l-3 3-3-3z" />
  ),
  presupuestos: (
    <>
      <path d="M6 3.5h8l4 4V20.5H6z" />
      <path d="M14 3.5v4h4" />
      <path d="M9 12h6" />
      <path d="M9 15.5h4" />
    </>
  ),
  estadisticas: (
    <>
      <path d="M4 19V9" />
      <path d="M10 19V5" />
      <path d="M16 19v-7" />
      <path d="M22 19H2" />
    </>
  ),
  chat: (
    <>
      <path d="M4 5.5h16v10.8H8.4L4 20z" />
      <path d="M8 9.5h8" />
      <path d="M8 13h5.5" />
    </>
  ),
  perfil: (
    <>
      <path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8" />
      <path d="M4.8 20a7.2 7.2 0 0 1 14.4 0" />
    </>
  ),
  buscar: (
    <>
      <path d="M10.5 17a6.5 6.5 0 1 0 0-13 6.5 6.5 0 0 0 0 13" />
      <path d="m15.2 15.2 4.3 4.3" />
    </>
  ),
  campana: (
    <>
      <path d="M6.5 10a5.5 5.5 0 0 1 11 0v4.2l1.8 2.2H4.7l1.8-2.2z" />
      <path d="M10 19a2.2 2.2 0 0 0 4 0" />
    </>
  ),
  auto: (
    <>
      <path d="m5 11 1.6-4.2A2.8 2.8 0 0 1 9.2 5h5.6a2.8 2.8 0 0 1 2.6 1.8L19 11" />
      <path d="M4 11h16v6H4z" />
      <path d="M6.5 17.5v1.8" />
      <path d="M17.5 17.5v1.8" />
    </>
  ),
  moneda: (
    <>
      <path d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18" />
      <path d="M15 8.5h-4.1a1.9 1.9 0 0 0 0 3.8h2.2a1.9 1.9 0 0 1 0 3.8H9" />
      <path d="M12 6.8v10.4" />
    </>
  ),
  estrella: <path d="m12 3 2.7 5.5 6.1.9-4.4 4.3 1 6.1-5.4-2.9-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z" />,
  check: (
    <>
      <path d="M20 6 9 17l-5-5" />
    </>
  ),
  cerrar: (
    <>
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </>
  ),
  mas: (
    <>
      <path d="M12 5v14" />
      <path d="M5 12h14" />
    </>
  ),
  volver: <path d="m15 18-6-6 6-6" />,
  enviar: (
    <>
      <path d="M21 3 10 14" />
      <path d="m21 3-7 18-4-7-7-4z" />
    </>
  ),
  reloj: (
    <>
      <path d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18" />
      <path d="M12 7.5V12l3 2" />
    </>
  ),
  camara: (
    <>
      <path d="M4 8h3l1.5-2h7L17 8h3v11H4z" />
      <path d="M12 16a3.2 3.2 0 1 0 0-6.4 3.2 3.2 0 0 0 0 6.4" />
    </>
  ),
  ayuda: (
    <>
      <path d="M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20" />
      <path d="M9.1 9a3 3 0 0 1 5.82 1c0 2-3 2-3 4" />
      <path d="M12 17h.01" />
    </>
  ),
  salir: (
    <>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <path d="M16 17 21 12l-5-5" />
      <path d="M21 12H9" />
    </>
  ),
  adelante: <path d="m9 18 6-6-6-6" />,
}

export function MecanicoIcon({ nombre, tamano = 20, titulo, className = '' }) {
  return (
    <svg
      aria-hidden={titulo ? undefined : 'true'}
      aria-label={titulo}
      className={`mecanico-icono ${className}`}
      width={tamano}
      height={tamano}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
    >
      {ICONOS_MECANICO[nombre] || ICONOS_MECANICO.servicios}
    </svg>
  )
}
