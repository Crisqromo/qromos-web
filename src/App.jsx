import { useEffect, useState, useRef } from 'react'
import { supabase } from './supabase'
import { bestias as bestiasIniciales } from './data/bestias'
import './App.css'

// === 1. LOS 18 MATERIALES DEL MICTLÁN ===
const MATERIALES = [
  { id: 'M01', nombre: 'Azúcar', icono: '🍚' },
  { id: 'M02', nombre: 'Agua', icono: '💧' },
  { id: 'M03', nombre: 'Masa', icono: '🌽' },
  { id: 'M04', nombre: 'Cacao', icono: '🍫' },
  { id: 'M05', nombre: 'Papel', icono: '📄' },
  { id: 'M06', nombre: 'Tijeras', icono: '✂️' },
  { id: 'M07', nombre: 'Cera', icono: '🕯️' },
  { id: 'M08', nombre: 'Fuego', icono: '🔥' },
  { id: 'M09', nombre: 'Cempasúchil', icono: '🌼' },
  { id: 'M10', nombre: 'Barro', icono: '🏺' },
  { id: 'M11', nombre: 'Sal', icono: '🧂' },
  { id: 'M12', nombre: 'Madera', icono: '🪵' },
  { id: 'M13', nombre: 'Ceniza', icono: '🌫️' },
  { id: 'M14', nombre: 'Hoja de Tamal', icono: '🌿' },
  { id: 'M15', nombre: 'Chile', icono: '🌶️' },
  { id: 'M16', nombre: 'Calabaza', icono: '🎃' },
  { id: 'M17', nombre: 'Incienso', icono: '🪄' },
  { id: 'M18', nombre: 'Agave', icono: '🌵' }
]

// === 2. LOS 16 QROMOS DE LA OFRENDA ===
const RECETAS = {
  'M05,M06': { id: 'Q01', nombre: 'Papel Picado', desc: 'El viento sagrado que avisa la llegada de las almas.', imagen: '/materiales/papel-picado.png' },
  'M07,M08': { id: 'Q02', nombre: 'Veladora', desc: 'La luz y esperanza que guía los pasos en la oscuridad.', imagen: '/materiales/veladora.png' },
  'M09,M13': { id: 'Q03', nombre: 'Camino de Flores', desc: 'Traza el sendero aromático hacia el altar del hogar.', imagen: '/materiales/camino-flores.png' },
  'M02,M10': { id: 'Q04', nombre: 'Vaso Purificador', desc: 'Mitiga la sed del alma tras el largo viaje del Mictlán.', imagen: '/materiales/vaso.png' },
  'M10,M11': { id: 'Q05', nombre: 'Platito con Sal', desc: 'Purifica el espíritu para que no se corrompa en su camino.', imagen: '/materiales/sal.png' },
  'M08,M17': { id: 'Q06', nombre: 'Incienso Purificador', desc: 'Limpia el altar de malos espíritus con su aroma divino.', imagen: '/materiales/incienso.png' },
  'M02,M18': { id: 'Q07', nombre: 'Caballito de Tequila', desc: 'Bebida de alegría para recordar los mejores brindis en vida.', imagen: '/materiales/tequila.png' },
  'M05,M12': { id: 'Q08', nombre: 'Retrato de Memoria', desc: 'El recuerdo vivo que evita la última y definitiva muerte.', imagen: '/materiales/retrato.png' },
  'M11,M13': { id: 'Q09', nombre: 'Cruz de Ceniza', desc: 'Expiación y descanso para las culpas pendientes del difunto.', imagen: '/materiales/cruz.png' },
  'M08,M10': { id: 'Q10', nombre: 'Xoloitzcuintle', desc: 'El guardián sagrado que ayuda a cruzar las aguas del río Apanohuacalhuia.', imagen: '/materiales/xolo.png' },
  'M01,M03': { id: 'Q11', nombre: 'Pan de Muerto', desc: 'Consagración de la fraternidad y el ciclo eterno de vida y muerte.', imagen: '/materiales/pan.png' },
  'M01,M02': { id: 'Q12', nombre: 'Calaverita de Azúcar', desc: 'Recuerda que la muerte también tiene dulzura y festejo.', imagen: '/materiales/calaverita-azucar.png' },
  'M01,M04': { id: 'Q13', nombre: 'Calaverita de Chocolate', desc: 'Tributo al alimento de los dioses aztecas en el inframundo.', imagen: '/materiales/calaverita-chocolate.png' },
  'M03,M14': { id: 'Q14', nombre: 'Plato de Tamales', desc: 'El festín caliente para alimentar el cuerpo etéreo del viajero.', imagen: '/materiales/tamales.png' },
  'M04,M15': { id: 'Q15', nombre: 'Cazuela de Mole', desc: 'El banquete sagrado de celebración para agasajar a los difuntos.', imagen: '/materiales/mole.png' },
  'M01,M16': { id: 'Q16', nombre: 'Dulce de Calabaza', desc: 'La dulzura de la tierra y la generosidad de la cosecha.', imagen: '/materiales/calabaza.png' }
}

function App() {
  const [nickname, setNickname] = useState('')
  const [pin, setPin] = useState('')
  const [mensaje, setMensaje] = useState('')
  const [usuario, setUsuario] = useState(null)
  
  const [temporadaActiva, setTemporadaActiva] = useState('mictlan')

  // === ESTADOS TEMPORADA 3 (MICTLÁN) ===
  const [mostrarEscaner, setMostrarEscaner] = useState(false)
  const videoRef = useRef(null)

  const [codigoDulce, setCodigoDulce] = useState(() => {
    const partes = window.location.pathname.split('/')
    return (partes[1] === 'canjear' || partes[1] === 'canjear-material') && partes[2] 
      ? decodeURIComponent(partes[2]).toUpperCase() 
      : ''
  })
  
  const [mensajeCanje, setMensajeCanje] = useState(() => {
    const partes = window.location.pathname.split('/')
    return (partes[1] === 'canjear' || partes[1] === 'canjear-material') && partes[2]
      ? 'Código detectado. Presiona Revelar.'
      : ''
  })

  // Inventario inicial surtido
  const [inventario, setInventario] = useState({ 
    'M01': 3, 'M02': 2, 'M05': 3, 'M06': 1, 'M18': 2,
    'M03': 1, 'M04': 2, 'M07': 2, 'M08': 3, 'M10': 2
  }) 

  const [mesaTrabajo, setMesaTrabajo] = useState([])
  const [slotSeleccionado, setSlotSeleccionado] = useState(null)
  const [qromosDesbloqueados, setQromosDesbloqueados] = useState([])
  const [resultadoCreacion, setResultadoCreacion] = useState(null)
  const [mictlanSeleccionado, setMictlanSeleccionado] = useState(null)
  
  // Estados para la dedicatoria de la ofrenda
  const [dedicatoria, setDedicatoria] = useState('')
  const [dedicatoriaGuardada, setDedicatoriaGuardada] = useState(false)
  const [mensajeDedicatoria, setMensajeDedicatoria] = useState('')
  
  const ofrendaCompleta = qromosDesbloqueados.length === 16

  // === ESTADOS TEMPORADA 2 (BESTIAS) ===
  const [bestiasCatalogo, setBestiasCatalogo] = useState(bestiasIniciales)
  const [bestiasDesbloqueadas, setBestiasDesbloqueadas] = useState([])
  const [filtroBestia, setFiltroBestia] = useState('todos')
  const [bestiaSeleccionada, setBestiaSeleccionada] = useState(null)

  // === ESTADOS TEMPORADA 1 (MUNDIAL) ===
  const [qromos, setQromos] = useState([])
  const [coleccion, setColeccion] = useState([])
  const [filtro, setFiltro] = useState('todos')
  const [qromoSeleccionado, setQromoSeleccionado] = useState(null)

  useEffect(() => { 
    cargarQromos()
    cargarBestias() 
  }, [])

  useEffect(() => { 
    if (usuario) { 
      cargarColeccion(usuario.id)
      cargarBestiasUsuario(usuario.id)
      
      // Cargar dedicatoria guardada previamente
      const guardada = localStorage.getItem(`dedicatoria_${usuario.id}`)
      if (guardada) {
        setDedicatoria(guardada)
        setDedicatoriaGuardada(true)
      }
    } 
  }, [usuario])

  // === MOTOR DE ESCÁNER DE CÁMARA ===
  useEffect(() => {
    if (!mostrarEscaner) return undefined
    let stream
    let animationId
    let cancelado = false

    async function iniciarEscaner() {
      if (!('BarcodeDetector' in window)) {
        setMensajeCanje('Tu navegador no permite escanear directamente. Puedes escribir el código.')
        setMostrarEscaner(false)
        return
      }
      try {
        const detector = new window.BarcodeDetector({ formats: ['qr_code'] })
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: 'environment' } },
          audio: false
        })
        if (!videoRef.current || cancelado) return
        videoRef.current.srcObject = stream
        await videoRef.current.play()

        async function detectar() {
          if (cancelado || !videoRef.current) return
          try {
            const resultados = await detector.detect(videoRef.current)
            if (resultados.length) {
              let rawValue = resultados[0].rawValue.trim()
              try {
                const url = new URL(rawValue)
                const partes = url.pathname.split('/').filter(Boolean)
                rawValue = decodeURIComponent(partes.at(-1) || '').toUpperCase()
              } catch {
                rawValue = rawValue.toUpperCase()
              }
              setCodigoDulce(rawValue)
              setMensajeCanje('QR detectado. Presiona Revelar Material.')
              setMostrarEscaner(false)
              return
            }
          } catch {}
          animationId = requestAnimationFrame(detectar)
        }
        detectar()
      } catch {
        setMensajeCanje('No se pudo abrir la cámara. Escribe el código.')
        setMostrarEscaner(false)
      }
    }
    iniciarEscaner()
    return () => {
      cancelado = true
      if (animationId) cancelAnimationFrame(animationId)
      stream?.getTracks().forEach((track) => track.stop())
    }
  }, [mostrarEscaner])

  // === FUNCIONES LOGIN Y DB ===
  async function crearCuenta() {
    if (!nickname || !pin) return setMensaje('Escribe nickname y PIN')
    const { error } = await supabase.from('users').insert([{ nickname, pin }])
    if (error) return setMensaje('Error al crear cuenta')
    setMensaje('Cuenta creada correctamente')
  }

  async function entrar() {
    if (!nickname) return setMensaje('Por favor escribe tu Nickname')
    
    // Llave maestra para pruebas con PIN 0000
    if (pin === '0000') {
      setUsuario({ id: 1, nickname: nickname })
      setMensaje('')
      return
    }

    const { data, error } = await supabase.from('users').select('*').eq('nickname', nickname).eq('pin', pin).single()
    if (error || !data) return setMensaje('Nickname o PIN incorrecto (Usa PIN 0000 para prueba)')
    setUsuario(data)
  }

  async function cargarBestias() {
    const { data, error } = await supabase.from('beasts').select('id, name, country, rarity, beast_type, power, image').order('id')
    if (!error && data?.length) {
      setBestiasCatalogo(data.map((b) => ({ id: Number(b.id), nombre: b.name, pais: b.country, rareza: b.rarity, tipo: b.beast_type, poder: b.power, imagen: b.image })))
    } else {
      setBestiasCatalogo(bestiasIniciales)
    }
  }

  async function cargarBestiasUsuario(userId) {
    const { data } = await supabase.rpc('get_user_beasts', { p_user_id: Number(userId) })
    if (data) setBestiasDesbloqueadas(data.map((item) => Number(item.beast_id)))
  }

  async function cargarQromos() {
    const { data } = await supabase.from('qromos').select('id, nombre, rareza').order('id')
    if (data) setQromos(data)
  }

  async function cargarColeccion(userId) {
    const { data } = await supabase.from('collection').select('qromo_id').eq('user_id', Number(userId))
    if (data) setColeccion(data.map((item) => Number(item.qromo_id)))
  }

  // === FUNCIONES MICTLÁN ===
  function simularCanjeDulce() {
    if (!codigoDulce) return setMensajeCanje('Escribe o escanea un código.')
    const randomMat = MATERIALES[Math.floor(Math.random() * MATERIALES.length)].id
    setInventario(prev => ({ ...prev, [randomMat]: (prev[randomMat] || 0) + 1 }))
    setMensajeCanje('¡Material agregado a tu canasta!')
    setCodigoDulce('')
  }

  function colocarEnSlot(matId) {
    if (slotSeleccionado === null) return
    if (!inventario[matId] || inventario[matId] <= 0) return

    setInventario(prev => ({ ...prev, [matId]: prev[matId] - 1 }))
    
    setMesaTrabajo(actual => {
      const nuevaMesa = [...actual]
      const anteriorId = nuevaMesa[slotSeleccionado]
      if (anteriorId) {
        setInventario(inv => ({ ...inv, [anteriorId]: (inv[anteriorId] || 0) + 1 }))
      }
      nuevaMesa[slotSeleccionado] = matId
      return nuevaMesa
    })

    setSlotSeleccionado(null)
  }

  function regresarAInventarioDesdeSlot(indexMesa) {
    const matId = mesaTrabajo[indexMesa]
    if (!matId) return

    const nuevaMesa = [...mesaTrabajo]
    nuevaMesa[indexMesa] = null
    setMesaTrabajo(nuevaMesa.filter(Boolean))
    
    setInventario(prev => ({ ...prev, [matId]: (prev[matId] || 0) + 1 }))
  }

  function mezclarEnMesa() {
    if (mesaTrabajo.length !== 2) return
    const mezclaKey = [...mesaTrabajo].sort().join(',')
    const recetaDescubierta = RECETAS[mezclaKey]

    if (recetaDescubierta) {
      const yaLaTenia = qromosDesbloqueados.includes(recetaDescubierta.id)
      setResultadoCreacion({ exito: true, repetido: yaLaTenia, ...recetaDescubierta })
      if (!yaLaTenia) setQromosDesbloqueados(prev => [...prev, recetaDescubierta.id])
      setMesaTrabajo([]) 
    } else {
      setResultadoCreacion({ exito: false, nombre: 'Artesanía Fallida', desc: 'Los materiales no combinan. Han regresado a tu canasta.', imagen: '❌' })
      mesaTrabajo.forEach(matId => setInventario(prev => ({ ...prev, [matId]: (prev[matId] || 0) + 1 })))
      setMesaTrabajo([])
    }
  }

  async function guardarDedicatoria() {
    if (!dedicatoria.trim()) {
      setMensajeDedicatoria('Escribe unas palabras para consagrar tu ofrenda.')
      return
    }

    try {
      localStorage.setItem(`dedicatoria_${usuario.id}`, dedicatoria)
      await supabase.from('users').update({ dedicatoria: dedicatoria }).eq('id', usuario.id)
      setDedicatoriaGuardada(true)
      setMensajeDedicatoria('🕯️ Ofrenda consagrada con éxito. El recuerdo perdurará.')
      setTimeout(() => setMensajeDedicatoria(''), 4500)
    } catch {
      setDedicatoriaGuardada(true)
      setMensajeDedicatoria('🕯️ Dedicatoria guardada en tu altar.')
    }
  }

  const qromosFiltrados = filtro === 'todos' ? qromos : qromos.filter((q) => q.rareza === filtro)
  const bestiasFiltradas = filtroBestia === 'todos' ? bestiasCatalogo : bestiasCatalogo.filter((bestia) => bestia.rareza === filtroBestia || bestia.tipo === filtroBestia)
  const obtenidos = qromos.filter((q) => coleccion.includes(Number(q.id)))
  const porcentaje = Math.round((obtenidos.length / 30) * 100) || 0

  if (!usuario) {
    return (
      <div className="login-page mictlan-theme">
        <div className="login-bg-glow glow-orange"></div>
        <div className="login-bg-glow glow-purple"></div>

        <div className="login-card premium-login">
          <div className="login-badge">NUEVA TEMPORADA</div>
          <div className="login-logo-container">
            <h1 className="login-logo">QRomos</h1>
            <h2 className="login-season-title">Camino al Mictlán</h2>
          </div>
          <p className="login-subtitle">Crea tu ofrenda sagrada y revive tus colecciones pasadas.</p>

          <div className="login-form">
            <label>Nickname</label>
            <input placeholder="Ej. CrisQromos" value={nickname} onChange={(e) => setNickname(e.target.value)} />
            <label>PIN de Verificación</label>
            <input placeholder="Tu PIN secreto (Usa 0000 para prueba)" type="password" value={pin} onChange={(e) => setPin(e.target.value)} />
            <button className="primary-login-btn" onClick={entrar}>Entrar a mi colección</button>
            <button className="secondary-login-btn" onClick={crearCuenta}>Crear cuenta nueva</button>
          </div>

          {mensaje && <p className="login-message">{mensaje}</p>}
        </div>
      </div>
    )
  }

  return (
    <div className="album-page mictlan-theme">
      <header className="hero">
        <div className="profile-card">
          <div className="avatar">QR</div>
          <div>
            <strong>{usuario.nickname}</strong>
            <p>Coleccionista & Artesano</p>
          </div>
        </div>
        
        <div className="title-box">
          {temporadaActiva === 'mictlan' ? (
            <div className="mictlan-title-wrapper">
              <p className="temporada-tag">TEMPORADA 3</p>
              <h1 className="mictlan-title-text">CAMINO AL MICTLÁN</h1>
              <span className="subtitle-tag">Fabrica los 16 QRomos de la Ofrenda</span>
            </div>
          ) : (
            <>
              <p className="temporada-tag">
                {temporadaActiva === 'bestias-mundo' ? 'TEMPORADA 2' : 'TEMPORADA 1'}
              </p>
              <h1>{temporadaActiva === 'bestias-mundo' ? 'Bestias del Mundo' : 'Mundial 2026'}</h1>
              <span className="subtitle-tag">Álbum archivado - Solo visualización</span>
            </>
          )}
        </div>

        <button className="logout" onClick={() => setUsuario(null)}>Cerrar sesión</button>
      </header>

      <nav className="season-switcher" aria-label="Seleccionar temporada">
        <button className={temporadaActiva === 'mictlan' ? 'season-option active' : 'season-option'} onClick={() => setTemporadaActiva('mictlan')}>
          <small>Temporada 3</small><strong>El Mictlán</strong><span className="new-label">ACTIVA</span>
        </button>
        <button className={temporadaActiva === 'bestias-mundo' ? 'season-option active' : 'season-option'} onClick={() => setTemporadaActiva('bestias-mundo')}>
          <small>Temporada 2</small><strong>Bestias</strong><span className="archive-label">Archivo</span>
        </button>
        <button className={temporadaActiva === 'mundial-2026' ? 'season-option active' : 'season-option'} onClick={() => setTemporadaActiva('mundial-2026')}>
          <small>Temporada 1</small><strong>Mundial</strong><span className="archive-label">Archivo</span>
        </button>
      </nav>

      {/* ==================== VISTA TEMPORADA 3 (MICTLÁN) ==================== */}
      {temporadaActiva === 'mictlan' && (
        <main className="alquimia-season">
          {ofrendaCompleta && (
            <section className="gran-altar-final">
              <h2>¡Ofrenda Consagrada!</h2>
              <p>Has reunido los 16 elementos sagrados para iluminar el camino.</p>
              <div className="altar-foto-container">
                 <img 
                   src="/altar-completo.jpg" 
                   alt="Ofrenda Monumental del Mictlán" 
                   className="altar-img-hd" 
                 />
                 <div className="dedicatoria-box">
                    <label>¿A quién dedicas esta ofrenda?</label>
                    <div className="dedicatoria-input-group">
                      <input 
                        type="text" 
                        placeholder="Ej. Con amor eterno para mis abuelos..." 
                        value={dedicatoria} 
                        onChange={(e) => {
                          setDedicatoria(e.target.value)
                          setDedicatoriaGuardada(false)
                        }} 
                      />
                      <button 
                        className="guardar-dedicatoria-btn"
                        onClick={guardarDedicatoria}
                      >
                        {dedicatoriaGuardada ? '✓ Consagrada' : 'Consagrar Ofrenda'}
                      </button>
                    </div>

                    {mensajeDedicatoria && (
                      <p className="dedicatoria-feedback">{mensajeDedicatoria}</p>
                    )}

                    {dedicatoriaGuardada && dedicatoria && (
                      <div className="pergamino-dedicatoria">
                        <p>“{dedicatoria}”</p>
                        <small>— Altar consagrado por {usuario.nickname}</small>
                      </div>
                    )}
                 </div>
              </div>
            </section>
          )}

          <section className="beast-redeem">
            <div>
              <p className="eyebrow">OBTENER RECURSOS</p>
              <h3>Escanear QR de tus dulces</h3>
              <p>Consigue materias primas para la ofrenda.</p>
            </div>
            <div className="beast-redeem-controls">
              <input value={codigoDulce} onChange={(e) => setCodigoDulce(e.target.value.toUpperCase())} placeholder="CÓDIGO" />
              <button className="scan-button" onClick={() => setMostrarEscaner(true)}>📷 Escanear</button>
              <button className="redeem-button" onClick={simularCanjeDulce}>Revelar Material</button>
            </div>
            {mensajeCanje && <p className="beast-redeem-message">{mensajeCanje}</p>}
          </section>

          <section className="caldero-section">
            <div className="caldero-header">
              <h3>Mesa de Trabajo</h3>
              <p>Haz clic en los espacios para elegir material. Si fallas, no los pierdes.</p>
            </div>
            <div className="caldero-slots">
              {[0, 1].map((index) => {
                const matId = mesaTrabajo[index]
                const matInfo = MATERIALES.find(i => i.id === matId)
                return (
                  <div 
                    key={index} 
                    className={`caldero-slot ${matInfo ? 'lleno' : 'vacio'}`} 
                    onClick={() => {
                      if (matInfo) {
                        regresarAInventarioDesdeSlot(index)
                      } else {
                        setSlotSeleccionado(index)
                      }
                    }}
                  >
                    {matInfo ? (
                      <>
                        <span className="slot-icono">{matInfo.icono}</span>
                        <small>{matInfo.nombre}</small>
                        <span className="slot-quitar">×</span>
                      </>
                    ) : (
                      <span>+</span>
                    )}
                  </div>
                )
              })}
            </div>
            <button className={`mezclar-btn ${mesaTrabajo.filter(Boolean).length === 2 ? 'listo' : ''}`} disabled={mesaTrabajo.filter(Boolean).length !== 2} onClick={mezclarEnMesa}>
              {mesaTrabajo.filter(Boolean).length === 2 ? '¡CREAR ARTESANÍA!' : 'Faltan materiales'}
            </button>
          </section>

          <section className="inventario-section-lista">
            <div className="inventario-header">
              <h3>Canasta de Materiales</h3>
              <span>Total en inventario: {Object.values(inventario).reduce((a, b) => a + b, 0)}</span>
            </div>
            <p className="inventario-sub">Listado oficial de materias primas del Mictlán.</p>
            
            <div className="materiales-lista">
              {MATERIALES.map(mat => {
                const cantidad = inventario[mat.id] || 0
                const disponible = cantidad > 0

                return (
                  <div key={mat.id} className={`material-fila ${disponible ? 'disponible' : 'agotado'}`}>
                    <div className="mat-info-izq">
                      <span className="mat-icono-chico">{mat.icono}</span>
                      <span className="mat-nombre">{mat.nombre}</span>
                    </div>
                    <div className="mat-contador">
                      {disponible ? (
                        <span className="badge-num">Tienes: {cantidad}</span>
                      ) : (
                        <span className="badge-cero">0</span>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </section>

          <section className="coleccion-qromos-final">
            <div className="inventario-header">
              <h3>Álbum de la Ofrenda</h3>
              <span>{qromosDesbloqueados.length} / 16 QRomos</span>
            </div>
            <div className="grid-16">
              {Object.values(RECETAS).map(qromo => {
                const desbloqueado = qromosDesbloqueados.includes(qromo.id)
                return (
                  <div 
                    key={qromo.id} 
                    className={`qromo-card ${desbloqueado ? 'obtenido mictlan-card interactiva' : 'bloqueado'}`}
                    onClick={() => desbloqueado && setMictlanSeleccionado(qromo)}
                  >
                     <div className="card-image-box">
                       {desbloqueado ? (
                         <img src={qromo.imagen} alt={qromo.nombre} className="card-tcg-img" />
                       ) : (
                         <div className="mystery-lock">🔒</div>
                       )}
                     </div>
                     <h3 className="card-title-label">{desbloqueado ? qromo.nombre : '???'}</h3>
                  </div>
                )
              })}
            </div>
          </section>
        </main>
      )}

      {/* ==================== VISTA TEMPORADA 2 (BESTIAS) ==================== */}
      {temporadaActiva === 'bestias-mundo' && (
        <main className="beasts-season">
          <div className="archive-notice">
            <div><strong>Temporada archivada</strong><p>Tu equipo y progreso están guardados de forma segura.</p></div>
            <span>Solo visualización</span>
          </div>
          <section className="beasts-stats">
            <div><strong>4</strong><span>Comunes</span></div>
            <div><strong>5</strong><span>Raras</span></div>
            <div><strong>3</strong><span>Legendarias</span></div>
            <div><strong>6</strong><span>Tipos</span></div>
          </section>
          <div className="beasts-filters">
            {['todos', 'comun', 'rara', 'legendaria', 'ataque', 'defensa', 'hechiceria', 'apoyo', 'velocidad', 'lucha'].map((opcion) => (
              <button key={opcion} className={filtroBestia === opcion ? 'active' : ''} onClick={() => setFiltroBestia(opcion)}>
                {opcion === 'todos' ? 'Todas' : opcion}
              </button>
            ))}
          </div>
          <section className="beasts-grid">
            {bestiasFiltradas.map((bestia) => {
              const desbloqueada = bestiasDesbloqueadas.includes(Number(bestia.id))
              return (
                <button className={`beast-card ${bestia.rareza} ${desbloqueada ? 'desbloqueada' : 'bloqueada'}`} key={bestia.id} onClick={() => desbloqueada && setBestiaSeleccionada(bestia)}>
                  <img src={bestia.imagen} alt={bestia.nombre} />
                  {!desbloqueada && <span className="beast-lock">🔒 Bloqueada</span>}
                  <div className="beast-card-meta">
                    <div><span>{bestia.pais}</span><strong>{bestia.nombre}</strong></div>
                    <b>{bestia.poder}</b>
                  </div>
                </button>
              )
            })}
          </section>
        </main>
      )}

      {/* ==================== VISTA TEMPORADA 1 (MUNDIAL) ==================== */}
      {temporadaActiva === 'mundial-2026' && (
        <main className="grid" style={{padding: '20px'}}>
          <div className="archive-notice" style={{gridColumn: '1 / -1'}}>
            <div><strong>Temporada archivada</strong><p>Tu colección completa del Mundial 2026.</p></div>
            <span>Solo visualización</span>
          </div>
          <section className="stats" style={{gridColumn: '1 / -1'}}>
            <div className="stat-card">
              <small>QRomos</small>
              <strong>{obtenidos.length} / 30</strong>
              <div className="album-progress-bar"><div className="album-progress-fill" style={{ width: `${porcentaje}%` }}></div></div>
              <span className="progress-text">{porcentaje}% completado</span>
            </div>
            <div><small>Comunes</small><strong>{obtenidos.filter(q => q.rareza === 'comun').length} / 20</strong></div>
            <div><small>Raras</small><strong>{obtenidos.filter(q => q.rareza === 'rara').length} / 7</strong></div>
            <div><small>Legendarias</small><strong>{obtenidos.filter(q => q.rareza === 'legendaria').length} / 3</strong></div>
          </section>
          <div className="filters" style={{gridColumn: '1 / -1'}}>
            <button onClick={() => setFiltro('todos')}>Todos</button>
            <button onClick={() => setFiltro('comun')}>Comunes</button>
            <button onClick={() => setFiltro('rara')}>Raras</button>
            <button onClick={() => setFiltro('legendaria')}>Legendarias</button>
          </div>
          {qromosFiltrados.map((qromo) => {
            const obtenido = coleccion.includes(Number(qromo.id))
            return (
              <div key={qromo.id} className={`qromo-card ${qromo.rareza} ${obtenido ? 'obtenido' : 'bloqueado'}`} onClick={() => obtenido && setQromoSeleccionado(qromo)}>
                <div className="number">{String(qromo.id).padStart(3, '0')}</div>
                <div className="card-image-box">
                  {obtenido ? <img className="qromo-image" src={`/qromos/${String(qromo.id).padStart(3, '0')}.png`} alt={qromo.nombre} /> : <div className="mystery-card"><div className="lock-icon mystery-lock">🔒</div></div>}
                </div>
                <h3>{obtenido ? qromo.nombre : 'QRomo Misterioso'}</h3>
                <p>{qromo.rareza.toUpperCase()}</p>
              </div>
            )
          })}
        </main>
      )}

      {/* ==================== MODALES Y SELECTORES ==================== */}
      
      {/* Modal Detalle de Carta Mictlán HD al dar clic */}
      {mictlanSeleccionado && (
        <div className="modal-overlay" onClick={() => setMictlanSeleccionado(null)}>
          <div className="modal-card mictlan-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setMictlanSeleccionado(null)}>×</button>
            <img 
              src={mictlanSeleccionado.imagen} 
              alt={mictlanSeleccionado.nombre} 
              className="modal-tcg-image" 
            />
            <h2>{mictlanSeleccionado.nombre}</h2>
            <p className="modal-tcg-desc">{mictlanSeleccionado.desc}</p>
          </div>
        </div>
      )}

      {/* Modal Selector de Material para la Mesa */}
      {slotSeleccionado !== null && (
        <div className="modal-overlay" onClick={() => setSlotSeleccionado(null)}>
          <div className="selector-card" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setSlotSeleccionado(null)}>×</button>
            <h3>Selecciona un Material</h3>
            <p>Solo puedes elegir materiales de los que tengas existencias.</p>
            
            <div className="selector-grid">
              {MATERIALES.map(mat => {
                const cantidad = inventario[mat.id] || 0
                if (cantidad <= 0) return null

                return (
                  <button key={mat.id} className="selector-item" onClick={() => colocarEnSlot(mat.id)}>
                    <span className="sel-icono">{mat.icono}</span>
                    <span className="sel-nombre">{mat.nombre}</span>
                    <span className="sel-cant">x{cantidad}</span>
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* Modal de Creación */}
      {resultadoCreacion && (
        <div className="modal-overlay" onClick={() => setResultadoCreacion(null)}>
          <div className={`modal-card pocion-modal ${resultadoCreacion.exito ? 'exito' : 'fracaso'}`} onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setResultadoCreacion(null)}>×</button>
            {resultadoCreacion.exito ? (
               <img src={resultadoCreacion.imagen} alt={resultadoCreacion.nombre} className="modal-tcg-image" />
            ) : (
               <div className="pocion-icono-grande">❌</div>
            )}
            <h2>{resultadoCreacion.nombre}</h2>
            <p>{resultadoCreacion.desc}</p>
            {resultadoCreacion.exito && resultadoCreacion.repetido && <p style={{color:'#ff8c00', fontSize:'12px'}}>*Ya tenías este QRomo en tu álbum.*</p>}
            <button className="continuar-btn" onClick={() => setResultadoCreacion(null)}>Continuar</button>
          </div>
        </div>
      )}

      {/* Modal Escáner de Cámara */}
      {mostrarEscaner && (
        <div className="modal-overlay scanner-overlay" onClick={() => setMostrarEscaner(false)}>
          <div className="scanner-card" onClick={(event) => event.stopPropagation()}>
            <button className="modal-close" onClick={() => setMostrarEscaner(false)}>×</button>
            <h2 style={{color: '#ff8c00', marginBottom: '10px'}}>Escanea el QR</h2>
            <p style={{marginBottom: '20px'}}>Coloca el código dentro del recuadro.</p>
            <div className="scanner-frame"><video ref={videoRef} muted playsInline style={{width: '100%', borderRadius: '8px'}} /></div>
          </div>
        </div>
      )}

      {bestiaSeleccionada && (
        <div className="modal-overlay" onClick={() => setBestiaSeleccionada(null)}>
          <div className="modal-card beast-modal" onClick={(e) => setBestiaSeleccionada(null)}>
            <button className="modal-close" onClick={() => setBestiaSeleccionada(null)}>×</button>
            <img src={bestiaSeleccionada.imagen} alt={bestiaSeleccionada.nombre} />
            <h2>{bestiaSeleccionada.nombre}</h2>
            <p>{bestiaSeleccionada.pais} · Poder {bestiaSeleccionada.poder}</p>
          </div>
        </div>
      )}

      {qromoSeleccionado && (
        <div className="modal-overlay" onClick={() => setQromoSeleccionado(null)}>
          <div className="modal-card" onClick={(e) => setQromoSeleccionado(null)}>
            <button className="modal-close" onClick={() => setQromoSeleccionado(null)}>×</button>
            <img className="modal-qromo-image" src={`/qromos/${String(qromoSeleccionado.id).padStart(3, '0')}.png`} alt={qromoSeleccionado.nombre} />
            <h2>{qromoSeleccionado.nombre}</h2>
            <p>{qromoSeleccionado.rareza.toUpperCase()}</p>
          </div>
        </div>
      )}
    </div>
  )
}

export default App