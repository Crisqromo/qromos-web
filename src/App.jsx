import { useEffect, useState } from 'react'
import { supabase } from './supabase'
import './App.css'

function App() {
  const [nickname, setNickname] = useState('')
  const [pin, setPin] = useState('')
  const [mensaje, setMensaje] = useState('')
  const [usuario, setUsuario] = useState(null)
  const [qromos, setQromos] = useState([])
  const [coleccion, setColeccion] = useState([])
  const [filtro, setFiltro] = useState('todos')
  const [codigo, setCodigo] = useState('')
  const [mensajeCanje, setMensajeCanje] = useState('')
  const [ultimoQromo, setUltimoQromo] = useState(null)
  const [qromoSeleccionado, setQromoSeleccionado] = useState(null)

  useEffect(() => {
    cargarQromos()
  }, [])

  useEffect(() => {
  const partes = window.location.pathname.split('/')
  if (partes[1] === 'canjear' && partes[2]) {
    setCodigo(partes[2].toUpperCase())
    setMensajeCanje('Código detectado desde QR. Inicia sesión y presiona Canjear.')
  }
}, [])

  useEffect(() => {
    if (usuario) cargarColeccion(usuario.id)
  }, [usuario])

  async function cargarQromos() {
    const { data } = await supabase
      .from('qromos')
      .select('id, nombre, rareza')
      .order('id')

    setQromos(data || [])
  }

  async function cargarColeccion(userId) {
  const { data, error } = await supabase
    .from('collection')
    .select('qromo_id')
    .eq('user_id', Number(userId))

  if (error) {
    console.log('Error cargando colección:', error)
    setColeccion([])
    return
  }

  setColeccion(data?.map((item) => Number(item.qromo_id)) || [])
}

  async function crearCuenta() {
    if (!nickname || !pin) return setMensaje('Escribe nickname y PIN')

    const { error } = await supabase.from('users').insert([{ nickname, pin }])

    if (error) return setMensaje('Ese nickname ya existe o hubo un error')
    setMensaje('Cuenta creada correctamente')
  }

  async function entrar() {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('nickname', nickname)
      .eq('pin', pin)
      .single()

    if (error || !data) return setMensaje('Nickname o PIN incorrecto')
    setUsuario(data)
  }

  async function canjearCodigo() {
    setMensajeCanje('')

    const limpio = codigo.trim().toUpperCase()

    if (!limpio) {
      setMensajeCanje('Escribe un código')
      return
    }

    const { data: codeData, error: codeError } = await supabase
      .from('codes')
      .select('*')
      .eq('code', limpio)
      .single()
    
    if (codeError || !codeData) {
      setMensajeCanje('Código no válido')
      return
    }

    if (codeData.used_by) {
      setMensajeCanje('Este código ya fue usado')
      return
    }

    const { error: collectionError } = await supabase
      .from('collection')
      .insert([{
        user_id: usuario.id,
        qromo_id: codeData.qromo_id,
        code: limpio
      }])

    if (collectionError) {
      setMensajeCanje('Ya tienes este QRomo en tu colección')
      return
    }

    await supabase
      .from('codes')
      .update({
        used_by: usuario.id,
        used_at: new Date().toISOString()
      })
      .eq('code', limpio)

    await cargarColeccion(usuario.id)

setColeccion((prev) =>
  prev.includes(codeData.qromo_id)
    ? prev
    : [...prev, codeData.qromo_id]
)

setCodigo('')

    const qromoGanado = qromos.find(
  q => q.id === codeData.qromo_id
)

setUltimoQromo(qromoGanado)

setMensajeCanje(
  `¡Desbloqueaste ${qromoGanado?.nombre || 'un QRomo'}!`
)
}
  const qromosFiltrados =
    filtro === 'todos' ? qromos : qromos.filter((q) => q.rareza === filtro)

  const obtenidos = qromos.filter((q) =>
  coleccion.includes(Number(q.id))
)
  const porcentaje = Math.round((obtenidos.length / 30) * 100)

 if (!usuario) {
  return (
    <div className="login-page">
      <div className="login-bg-glow glow-one"></div>
      <div className="login-bg-glow glow-two"></div>

      <div className="login-card premium-login">
        <div className="login-badge">COLECCIÓN MUNDIAL 2026</div>

        <h1 className="login-logo">QRomos</h1>
        <p className="login-subtitle">
          Colecciona, desbloquea y completa tus QRomos digitales.
        </p>

        <div className="login-form">
          <label>Nickname</label>
          <input
            placeholder="Ej. CrisQromos"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
          />

          <label>PIN</label>
          <input
            placeholder="Tu PIN secreto"
            type="password"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
          />

          <button className="primary-login-btn" onClick={entrar}>
            Entrar a mi álbum
          </button>

          <button className="secondary-login-btn" onClick={crearCuenta}>
            Crear cuenta nueva
          </button>
        </div>

        {mensaje && <p className="login-message">{mensaje}</p>}

        <div className="login-footer">
          <span>30 QRomos</span>
          <span>Rarezas</span>
          <span>Canje por QR</span>
        </div>
      </div>
    </div>
  )
}

  return (
    <div className="album-page">
      <header className="hero">
        <div className="profile-card">
          <div className="avatar">QR</div>
          <div>
            <strong>{usuario.nickname}</strong>
            <p>Coleccionista</p>
          </div>
        </div>

        <div className="title-box">
          <p>MI ÁLBUM</p>
          <h1>QRomos</h1>
          <span>COLECCIÓN MUNDIAL 2026</span>
        </div>

        <button className="logout" onClick={() => setUsuario(null)}>Cerrar sesión</button>
      </header>

        <section className="stats">
  <div className="stat-card">
    <small>QRomos</small>
    <strong>{obtenidos.length} / 30</strong>

    <div className="album-progress-bar">
  <div
    className="album-progress-fill"
    style={{ width: `${porcentaje}%` }}
  ></div>
</div>

    <span className="progress-text">{porcentaje}% completado</span>
  </div>
        <div><small>Comunes</small><strong>{obtenidos.filter(q => q.rareza === 'comun').length} / 20</strong></div>
        <div><small>Raras</small><strong>{obtenidos.filter(q => q.rareza === 'rara').length} / 7</strong></div>
        <div><small>Legendarias</small><strong>{obtenidos.filter(q => q.rareza === 'legendaria').length} / 3</strong></div>
      </section>

      <section style={{ textAlign: 'center', margin: '24px 0' }}>
        <h2>Canjear código</h2>
        <input
          placeholder="Ej. TEST-BRA-005"
          value={codigo}
          onChange={(e) => setCodigo(e.target.value)}
          style={{ padding: 12, width: 260, textTransform: 'uppercase' }}
        />
        <button onClick={canjearCodigo} style={{ marginLeft: 8 }}>
          Canjear
        </button>
        {!ultimoQromo && <p>{mensajeCanje}</p>}
        {ultimoQromo && (
  <div className={`reward-card reward-${ultimoQromo.rareza}`}>
    <div className="reward-title">
      {
  ultimoQromo.rareza === 'legendaria'
    ? '👑 ¡QROMO LEGENDARIO!'
    : ultimoQromo.rareza === 'rara'
    ? '💎 QROMO RARO'
    : '🎉 NUEVO QROMO'
}
    </div>
    <div className="reward-image-wrapper">
  <img
    className="reward-image"
    src={`/qromos/${String(ultimoQromo.id).padStart(3, '0')}.png`}
    alt={ultimoQromo.nombre}
  />
</div>

    <h3>{ultimoQromo.nombre}</h3>

    <p className="reward-rareza">
      {ultimoQromo.rareza.toUpperCase()}
    </p>

    <span>
      +1 agregado a tu colección
    </span>
  </div>
)}
      </section>

      <div className="filters">
        <button onClick={() => setFiltro('todos')}>Todos</button>
        <button onClick={() => setFiltro('comun')}>Comunes</button>
        <button onClick={() => setFiltro('rara')}>Raras</button>
        <button onClick={() => setFiltro('legendaria')}>Legendarias</button>
      </div>

      <main className="grid">
        {qromosFiltrados.map((qromo) => {
          const obtenido = coleccion.includes(Number(qromo.id))

          return (
            <div
  key={qromo.id}
  className={`qromo-card ${qromo.rareza} ${obtenido ? 'obtenido' : 'bloqueado'}`}
  onClick={() => obtenido && setQromoSeleccionado(qromo)}
>
              <div className="number">{String(qromo.id).padStart(3, '0')}</div>
              <div className="card-image-box">
  {obtenido ? (
    <img
      className="qromo-image"
      src={`/qromos/${String(qromo.id).padStart(3, '0')}.png`}
      alt={qromo.nombre}
    />
  ) : (
    <div className="mystery-card">
  <div className="lock-icon mystery-lock">🔒</div>
</div>
  )}
</div>

<h3>
  {obtenido ? qromo.nombre : 'QRomo Misterioso'}
</h3>

<p>
  {qromo.rareza.toUpperCase()}
</p>
            </div>
          )
        })}
      </main>
      {qromoSeleccionado && (
  <div className="modal-overlay" onClick={() => setQromoSeleccionado(null)}>
    <div className="modal-card" onClick={(e) => e.stopPropagation()}>
      <button className="modal-close" onClick={() => setQromoSeleccionado(null)}>
        ×
      </button>

      <img
        className="modal-qromo-image"
        src={`/qromos/${String(qromoSeleccionado.id).padStart(3, '0')}.png`}
        alt={qromoSeleccionado.nombre}
      />

      <h2>{qromoSeleccionado.nombre}</h2>
      <p>{qromoSeleccionado.rareza.toUpperCase()}</p>
    </div>
  </div>
)}
    </div>
  )
}

export default App