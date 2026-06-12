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
    const { data } = await supabase
      .from('collection')
      .select('qromo_id')
      .eq('user_id', userId)

    setColeccion(data?.map((item) => item.qromo_id) || [])
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
    setCodigo('')

    const qromoGanado = qromos.find(q => q.id === codeData.qromo_id)
    setMensajeCanje(`¡Desbloqueaste ${qromoGanado?.nombre || 'un QRomo'}!`)
  }

  const qromosFiltrados =
    filtro === 'todos' ? qromos : qromos.filter((q) => q.rareza === filtro)

  const obtenidos = qromos.filter((q) => coleccion.includes(q.id))

  if (!usuario) {
    return (
      <div className="login-page">
        <div className="login-card">
          <h1>QRomos</h1>
          <h2>Colección Mundial 2026</h2>

          <input placeholder="Nickname" value={nickname} onChange={(e) => setNickname(e.target.value)} />
          <input placeholder="PIN" value={pin} onChange={(e) => setPin(e.target.value)} />

          <div>
            <button onClick={entrar}>Entrar</button>
            <button onClick={crearCuenta}>Crear cuenta</button>
          </div>

          <p>{mensaje}</p>
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
        <div><small>QRomos</small><strong>{obtenidos.length} / 30</strong></div>
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
        <p>{mensajeCanje}</p>
      </section>

      <div className="filters">
        <button onClick={() => setFiltro('todos')}>Todos</button>
        <button onClick={() => setFiltro('comun')}>Comunes</button>
        <button onClick={() => setFiltro('rara')}>Raras</button>
        <button onClick={() => setFiltro('legendaria')}>Legendarias</button>
      </div>

      <main className="grid">
        {qromosFiltrados.map((qromo) => {
          const obtenido = coleccion.includes(qromo.id)

          return (
            <div key={qromo.id} className={`qromo-card ${qromo.rareza} ${obtenido ? 'obtenido' : 'bloqueado'}`}>
              <div className="number">{String(qromo.id).padStart(3, '0')}</div>
              <div className="shield">{obtenido ? '⚽' : '🔒'}</div>
              <h3>{obtenido ? qromo.nombre : 'Bloqueado'}</h3>
              <p>{qromo.rareza}</p>
            </div>
          )
        })}
      </main>
    </div>
  )
}

export default App