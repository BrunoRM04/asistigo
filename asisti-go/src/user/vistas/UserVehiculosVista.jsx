import { useMemo, useState } from 'react'
import { UserIcon } from '../UserIcon'

const USER_MARCAS_AUTO = [
  'Abarth',
  'Acura',
  'Alfa Romeo',
  'Audi',
  'BAIC',
  'BMW',
  'BYD',
  'Cadillac',
  'Changan',
  'Chery',
  'Chevrolet',
  'Citroen',
  'Cupra',
  'Daihatsu',
  'Dodge',
  'Dongfeng',
  'DS',
  'FAW',
  'Ferrari',
  'Fiat',
  'Ford',
  'GAC',
  'Geely',
  'Great Wall',
  'Haval',
  'Honda',
  'Hyundai',
  'Isuzu',
  'JAC',
  'Jeep',
  'Jetour',
  'Kia',
  'Lada',
  'Lamborghini',
  'Lancia',
  'Land Rover',
  'Lexus',
  'Mahindra',
  'Maserati',
  'Mazda',
  'Mercedes-Benz',
  'MG',
  'Mini',
  'Mitsubishi',
  'Nissan',
  'Omoda',
  'Opel',
  'Peugeot',
  'Porsche',
  'RAM',
  'Renault',
  'Saab',
  'Seat',
  'Skoda',
  'Smart',
  'SsangYong',
  'Subaru',
  'Suzuki',
  'Tata',
  'Tesla',
  'Toyota',
  'Volkswagen',
  'Volvo',
]

const USER_MARCAS_MOTO = [
  'Aprilia',
  'Bajaj',
  'Benelli',
  'Beta',
  'Bimota',
  'BMW Motorrad',
  'Can-Am',
  'CFMoto',
  'Ducati',
  'GasGas',
  'Gilera',
  'Harley-Davidson',
  'Hero',
  'Honda',
  'Husqvarna',
  'Indian',
  'Jawa',
  'Kawasaki',
  'Keeway',
  'KTM',
  'Kymco',
  'Lifan',
  'Mondial',
  'Moto Guzzi',
  'Motomel',
  'MV Agusta',
  'Piaggio',
  'QJMotor',
  'Royal Enfield',
  'RVM',
  'Suzuki',
  'SYM',
  'Triumph',
  'TVS',
  'Vespa',
  'Voge',
  'Yamaha',
  'Zanella',
  'Zontes',
]

const USER_MODELOS_AUTO = {
  Audi: ['A1', 'A3', 'A4', 'A5', 'Q2', 'Q3', 'Q5', 'Q7'],
  BMW: ['Serie 1', 'Serie 2', 'Serie 3', 'Serie 5', 'X1', 'X3', 'X5'],
  Chevrolet: ['Onix', 'Prisma', 'Cruze', 'Tracker', 'S10', 'Spin', 'Corsa', 'Classic'],
  Citroen: ['C3', 'C4', 'C4 Cactus', 'Berlingo', 'Jumpy'],
  Fiat: ['Mobi', 'Argo', 'Cronos', 'Pulse', 'Strada', 'Toro', 'Fiorino', 'Uno'],
  Ford: ['Ka', 'Fiesta', 'Focus', 'EcoSport', 'Territory', 'Ranger', 'Maverick'],
  Honda: ['Fit', 'City', 'Civic', 'HR-V', 'CR-V', 'WR-V'],
  Hyundai: ['HB20', 'Accent', 'Elantra', 'Creta', 'Tucson', 'Santa Fe'],
  Jeep: ['Renegade', 'Compass', 'Commander', 'Wrangler', 'Grand Cherokee'],
  Kia: ['Picanto', 'Rio', 'Cerato', 'Sportage', 'Sorento'],
  'Mercedes-Benz': ['Clase A', 'Clase B', 'Clase C', 'Clase E', 'GLA', 'GLC', 'Sprinter'],
  Nissan: ['March', 'Versa', 'Sentra', 'Kicks', 'Frontier', 'X-Trail'],
  Peugeot: ['208', '2008', '301', '308', '3008', 'Partner', 'Expert'],
  Renault: ['Kwid', 'Sandero', 'Logan', 'Stepway', 'Duster', 'Captur', 'Kangoo', 'Oroch'],
  Suzuki: ['Alto', 'Swift', 'Baleno', 'Vitara', 'Jimny', 'S-Cross'],
  Toyota: ['Etios', 'Yaris', 'Corolla', 'Corolla Cross', 'Hilux', 'SW4', 'RAV4'],
  Volkswagen: ['Gol', 'Up', 'Polo', 'Virtus', 'Vento', 'Golf', 'Nivus', 'T-Cross', 'Taos', 'Saveiro', 'Amarok'],
  Volvo: ['XC40', 'XC60', 'XC90', 'S60', 'V60'],
}

const USER_MODELOS_MOTO = {
  Bajaj: ['Boxer', 'Rouser NS 125', 'Rouser NS 160', 'Rouser NS 200', 'Dominar 250', 'Dominar 400'],
  Benelli: ['TNT 15', 'TNT 25', 'TNT 300', 'TRK 251', 'TRK 502'],
  Ducati: ['Monster', 'Scrambler', 'Multistrada', 'Panigale', 'Diavel'],
  Gilera: ['Smash', 'VC 150', 'Sahel', 'AC4', 'Runner'],
  'Harley-Davidson': ['Street 750', 'Sportster', 'Iron 883', 'Fat Boy', 'Street Glide'],
  Honda: ['Wave', 'Biz', 'XR 150L', 'XR 190L', 'CB 190R', 'CB 300F', 'CB 500F', 'XRE 300', 'NC 750X'],
  Kawasaki: ['Ninja 300', 'Ninja 400', 'Z400', 'Z650', 'Versys 650', 'KLR 650'],
  KTM: ['Duke 200', 'Duke 250', 'Duke 390', 'Adventure 250', 'Adventure 390'],
  Motomel: ['Blitz', 'S2', 'Skua', 'Sirius', 'DLX'],
  'Royal Enfield': ['Hunter 350', 'Classic 350', 'Meteor 350', 'Himalayan', 'Interceptor 650'],
  Suzuki: ['AX 100', 'GN 125', 'Gixxer', 'V-Strom 250', 'V-Strom 650'],
  Triumph: ['Trident 660', 'Street Triple', 'Tiger 900', 'Bonneville T100'],
  Yamaha: ['Crypton', 'FZ FI', 'FZ 25', 'MT-03', 'R3', 'XTZ 125', 'XTZ 250', 'Teneré 700'],
  Zanella: ['ZB', 'RX 150', 'ZR 150', 'Patagonian Eagle', 'Sapucai'],
}

const USER_COLORES = [
  'Blanco',
  'Negro',
  'Gris',
  'Plata',
  'Rojo',
  'Azul',
  'Verde',
  'Amarillo',
  'Naranja',
  'Marron',
  'Bordo',
  'Dorado',
  'Otro',
]

const USER_COMBUSTIBLES = ['Nafta', 'Diesel', 'Hibrido', 'Electrico', 'GNC', 'GLP', 'Flex', 'Otro']

function normalizarPatente(valor) {
  return valor.trim().toUpperCase()
}

export function UserVehiculosVista({ vehiculos, onAgregarVehiculo, onActualizarVehiculo, onEliminarVehiculo }) {
  const [modalAbierto, setModalAbierto] = useState(false)
  const [vehiculoEditando, setVehiculoEditando] = useState(null)
  const [tipoVehiculo, setTipoVehiculo] = useState('auto')
  const [marcaSeleccionada, setMarcaSeleccionada] = useState('')
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState('')

  const marcas = tipoVehiculo === 'moto' ? USER_MARCAS_MOTO : USER_MARCAS_AUTO
  const modelosPorMarca = tipoVehiculo === 'moto' ? USER_MODELOS_MOTO : USER_MODELOS_AUTO

  const modelos = useMemo(() => {
    const directos = modelosPorMarca[marcaSeleccionada] || []
    if (directos.length) return directos
    return Object.values(modelosPorMarca).flat()
  }, [marcaSeleccionada, modelosPorMarca])

  const anios = useMemo(() => {
    const actual = new Date().getFullYear()
    return Array.from({ length: actual - 1959 }, (_, indice) => actual - indice)
  }, [])

  const cerrarModal = () => {
    setModalAbierto(false)
    setVehiculoEditando(null)
    setTipoVehiculo('auto')
    setMarcaSeleccionada('')
  }

  const abrirEdicion = (vehiculo) => {
    setVehiculoEditando(vehiculo)
    setTipoVehiculo(vehiculo.tipo || 'auto')
    setMarcaSeleccionada(vehiculo.marca || '')
    setError('')
    setModalAbierto(true)
  }

  const guardarVehiculo = async (evento) => {
    evento.preventDefault()
    const datos = new FormData(evento.currentTarget)
    const marca = String(datos.get('marca') || '').trim()
    const modelo = String(datos.get('modelo') || '').trim()
    const anio = Number(datos.get('anio') || new Date().getFullYear())
    const km = Number(datos.get('km') || 0)
    const tipo = String(datos.get('tipo') || 'auto')
    const foto = datos.get('foto')

    setError('')
    setGuardando(true)

    try {
      const payload = {
        tipo,
        marca,
        modelo,
        anio,
        km,
        patente: normalizarPatente(String(datos.get('patente') || '')),
        combustible: String(datos.get('combustible') || ''),
        version: String(datos.get('version') || '').trim(),
        motor: String(datos.get('motor') || '').trim(),
        color: String(datos.get('color') || '').trim(),
        numero_matricula: String(datos.get('numero_matricula') || '').trim(),
        foto_nombre: foto instanceof File && foto.name ? foto.name : '',
        proximo_servicio: String(datos.get('proximo_servicio') || '').trim(),
        proximo_km: Number(datos.get('proximo_km') || 0),
      }

      if (vehiculoEditando) {
        await onActualizarVehiculo({ ...payload, id: vehiculoEditando.id })
      } else {
        await onAgregarVehiculo(payload)
      }

      cerrarModal()
    } catch (err) {
      setError(err.message)
    } finally {
      setGuardando(false)
    }
  }

  return (
    <section className="user-vista">
      <div className="user-titulo-bloque">
        <h1 className="user-titulo-pagina">Mis vehiculos</h1>
        <p className="user-subtitulo-pagina">Registra, revisa y actualiza tus autos y motos.</p>
      </div>

      <div className="user-cuadricula-vehiculos">
        {vehiculos.map((v) => (
          <article key={v.id} className="user-vehiculo-card">
            <span className="user-vehiculo-card-icono"><UserIcon name="car" size={28} /></span>
            <div className="user-vehiculo-card-info">
              <p className="user-vehiculo-nombre">
                {v.marca} {v.modelo}
              </p>
              <p className="user-patente user-patente-inline">{v.patente}</p>
              <div className="user-vehiculo-meta">
                <span><b>{v.anio}</b> modelo</span>
                <span><b>{v.km.toLocaleString('es-AR')}</b> km</span>
                <span><b>{v.salud}%</b> salud</span>
              </div>
            </div>
            <div className="user-fila-botones user-vehiculo-acciones">
              <button className="user-boton user-boton-secundario" type="button" onClick={() => abrirEdicion(v)}>
                Editar
              </button>
              <button
                className="user-boton user-boton-secundario user-boton-outline"
                type="button"
                onClick={() => window.confirm('¿Eliminar este vehiculo de tu cuenta?') && onEliminarVehiculo(v.id)}
              >
                Eliminar
              </button>
            </div>
          </article>
        ))}

        <button className="user-vehiculo-card user-vehiculo-card-agregar" type="button" onClick={() => setModalAbierto(true)}>
          <span className="user-vehiculo-card-icono"><UserIcon name="plus" size={25} /></span>
          <div className="user-vehiculo-card-info">
            <p className="user-linea-titulo">Agregar vehiculo</p>
            <p className="user-linea-subtitulo">Auto, moto o utilitario</p>
          </div>
        </button>
      </div>

      <div className="user-tarjeta user-detalle-vehiculo">
        <div className="user-detalle-top">
          <span className="user-icono-redondo"><UserIcon name="shield" size={24} /></span>
          <div>
            <p className="user-eyebrow">Documentacion y mantenimiento</p>
            <h2 className="user-titulo-seccion">Resumen operativo</h2>
          </div>
        </div>
        <div className="user-cuadricula-estadisticas">
          <article className="user-tarjeta-estadistica">
            <strong>{vehiculos.length}</strong>
            <span>Vehiculos activos</span>
          </article>
          <article className="user-tarjeta-estadistica">
            <strong>{vehiculos.reduce((total, v) => total + v.historial.length, 0)}</strong>
            <span>Servicios cargados</span>
          </article>
          <article className="user-tarjeta-estadistica">
            <strong>{vehiculos.length ? Math.round(vehiculos.reduce((total, v) => total + v.salud, 0) / vehiculos.length) : 0}%</strong>
            <span>Salud promedio</span>
          </article>
        </div>
      </div>

      {modalAbierto && (
        <div className="user-modal-fondo">
          <div className="user-modal" role="dialog" aria-modal="true" aria-labelledby="user-vehiculo-form-titulo">
            <div className="user-modal-cabecera">
              <div>
                <p className="user-eyebrow">Nuevo vehiculo</p>
                <h2 className="user-titulo-seccion" id="user-vehiculo-form-titulo">
                  {vehiculoEditando ? 'Editar vehiculo' : 'Agregar auto o moto'}
                </h2>
              </div>
              <button className="user-boton-icono" type="button" onClick={cerrarModal} aria-label="Cerrar formulario">
                <UserIcon name="back" size={18} />
              </button>
            </div>

            <form className="user-formulario-vehiculo" onSubmit={guardarVehiculo}>
              <div className="user-formulario-grid">
                <label className="user-campo">
                  <span>Tipo de vehiculo *</span>
                  <select
                    className="user-entrada"
                    name="tipo"
                    value={tipoVehiculo}
                    onChange={(evento) => {
                      setTipoVehiculo(evento.target.value)
                      setMarcaSeleccionada('')
                    }}
                    required
                  >
                    <option value="auto">Auto</option>
                    <option value="moto">Moto</option>
                  </select>
                </label>

                <label className="user-campo">
                  <span>Marca *</span>
                  <input
                    className="user-entrada"
                    list="user-marcas-vehiculo"
                    name="marca"
                    value={marcaSeleccionada}
                    onChange={(evento) => setMarcaSeleccionada(evento.target.value)}
                    placeholder="Buscar o escribir marca"
                    required
                  />
                  <datalist id="user-marcas-vehiculo">
                    {marcas.map((marca) => (
                      <option value={marca} key={marca} />
                    ))}
                  </datalist>
                </label>

                <label className="user-campo">
                  <span>Modelo *</span>
                  <input
                    className="user-entrada"
                    list="user-modelos-vehiculo"
                    name="modelo"
                    placeholder="Buscar o escribir modelo"
                    defaultValue={vehiculoEditando?.modelo || ''}
                    required
                  />
                  <datalist id="user-modelos-vehiculo">
                    {modelos.map((modelo) => (
                      <option value={modelo} key={`${marcaSeleccionada}-${modelo}`} />
                    ))}
                  </datalist>
                </label>

                <label className="user-campo">
                  <span>Año *</span>
                  <select className="user-entrada" name="anio" defaultValue={vehiculoEditando?.anio || new Date().getFullYear()} required>
                    {anios.map((anio) => (
                      <option value={anio} key={anio}>{anio}</option>
                    ))}
                  </select>
                </label>

                <label className="user-campo">
                  <span>Matricula *</span>
                  <input className="user-entrada" name="patente" placeholder="Ej: AB 123 CD" defaultValue={vehiculoEditando?.patente || ''} required />
                </label>

                <label className="user-campo">
                  <span>Kilometraje actual *</span>
                  <input className="user-entrada" type="number" name="km" min="0" placeholder="0" defaultValue={vehiculoEditando?.km || 0} required />
                </label>

                <label className="user-campo">
                  <span>Combustible *</span>
                  <select className="user-entrada" name="combustible" defaultValue={vehiculoEditando?.combustible || ''} required>
                    <option value="">Seleccionar</option>
                    {USER_COMBUSTIBLES.map((combustible) => (
                      <option value={combustible} key={combustible}>{combustible}</option>
                    ))}
                  </select>
                </label>

                <label className="user-campo">
                  <span>Version</span>
                  <input className="user-entrada" name="version" placeholder="Ej: Highline, Sport, ABS" defaultValue={vehiculoEditando?.version || ''} />
                </label>

                <label className="user-campo">
                  <span>Cilindrada / motor</span>
                  <input className="user-entrada" name="motor" placeholder="Ej: 2.0 TSI / 150 cc" defaultValue={vehiculoEditando?.motor || ''} />
                </label>

                <label className="user-campo">
                  <span>Color</span>
                  <input className="user-entrada" list="user-colores-vehiculo" name="color" placeholder="Seleccionar o escribir color" defaultValue={vehiculoEditando?.color || ''} />
                  <datalist id="user-colores-vehiculo">
                    {USER_COLORES.map((color) => (
                      <option value={color} key={color} />
                    ))}
                  </datalist>
                </label>

                <label className="user-campo user-campo-ancho">
                  <span>Numero de matricula</span>
                  <input className="user-entrada" name="numero_matricula" placeholder="Numero de matricula si lo tenes disponible" defaultValue={vehiculoEditando?.numero_matricula || ''} />
                </label>

                <label className="user-campo">
                  <span>Proximo servicio</span>
                  <input className="user-entrada" name="proximo_servicio" placeholder="Ej: Cambio de aceite" defaultValue={vehiculoEditando?.proximo_servicio || ''} />
                </label>

                <label className="user-campo">
                  <span>Proximo kilometraje</span>
                  <input className="user-entrada" type="number" min="0" name="proximo_km" defaultValue={vehiculoEditando?.proximo_km || ''} />
                </label>

                <label className="user-campo user-campo-ancho">
                  <span>Foto del vehiculo</span>
                  <input className="user-entrada user-entrada-archivo" type="file" name="foto" accept="image/*" />
                </label>
              </div>

              <div className="user-modal-pie">
                {error && <p className="user-registro-error">{error}</p>}
                <button className="user-boton user-boton-secundario" type="button" onClick={cerrarModal}>
                  Cancelar
                </button>
                <button className="user-boton user-boton-principal" type="submit" disabled={guardando}>
                  {guardando ? 'Guardando...' : vehiculoEditando ? 'Actualizar vehiculo' : 'Guardar vehiculo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  )
}
