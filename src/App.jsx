import { useEffect, useState, useRef } from 'react'
import { supabase } from './supabase'
import { bestias as bestiasIniciales } from './data/bestias'
import Matter from 'matter-js'
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

// === 2. LOS 16 QROMOS DE LA OFRENDA (MICTLÁN) ===
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

// === 3. LA VILLA NAVIDEÑA (26 COLECCIONABLES) ===
const PERSONAJES_NAVIDAD = [
  // --- 10 TARJETAS DORADAS (LEGENDARIAS) ---
  { id: 'N01', nombre: 'Santa Claus', rareza: 'legendaria', imagen: '/navidad/santa.png' },
  { id: 'N02', nombre: 'Sra. Claus', rareza: 'legendaria', imagen: '/navidad/sra-claus.png' },
  { id: 'N03', nombre: 'Reno', rareza: 'legendaria', imagen: '/navidad/reno.png' },
  { id: 'N04', nombre: 'Duende', rareza: 'legendaria', imagen: '/navidad/duende.png' },
  { id: 'N05', nombre: 'Oveja', rareza: 'legendaria', imagen: '/navidad/oveja.png' },
  { id: 'N06', nombre: 'Niño con Gorrito', rareza: 'legendaria', imagen: '/navidad/nino.png' },
  { id: 'N07', nombre: 'Cascanueces', rareza: 'legendaria', imagen: '/navidad/cascanueces.png' },
  { id: 'N08', nombre: 'Espíritu de la Estrella', rareza: 'legendaria', imagen: '/navidad/espiritu.png' },
  { id: 'N09', nombre: 'Monstruo QRomos', rareza: 'legendaria', imagen: '/navidad/monstruo.png' },
  { id: 'N10', nombre: 'Pastor', rareza: 'legendaria', imagen: '/navidad/pastor.png' },

  // --- 7 TARJETAS RARAS (DIGITALES - EXPANSIÓN DE LORE) ---
  { id: 'N11', nombre: 'Trineo Mágico', rareza: 'rara', imagen: '/navidad/trineo.png' },
  { id: 'N12', nombre: 'Árbol de la Villa', rareza: 'rara', imagen: '/navidad/arbol.png' },
  { id: 'N13', nombre: 'Fábrica de Juguetes', rareza: 'rara', imagen: '/navidad/fabrica.png' },
  { id: 'N14', nombre: 'Muñeco de Nieve', rareza: 'rara', imagen: '/navidad/nieve.png' },
  { id: 'N15', nombre: 'Tren Expreso', rareza: 'rara', imagen: '/navidad/tren.png' },
  { id: 'N16', nombre: 'Estrella de Belén', rareza: 'rara', imagen: '/navidad/estrella.png' },
  { id: 'N17', nombre: 'Buzón del Polo Norte', rareza: 'rara', imagen: '/navidad/buzon.png' },

  // --- 9 TARJETAS COMUNES (DIGITALES - OBJETOS COTIDIANOS) ---
  { id: 'N18', nombre: 'Galleta de Jengibre', rareza: 'comun', imagen: '/navidad/galleta.png' },
  { id: 'N19', nombre: 'Bastón de Caramelo', rareza: 'comun', imagen: '/navidad/baston.png' },
  { id: 'N20', nombre: 'Regalo Misterioso', rareza: 'comun', imagen: '/navidad/regalo.png' },
  { id: 'N21', nombre: 'Campana Dorada', rareza: 'comun', imagen: '/navidad/campana.png' },
  { id: 'N22', nombre: 'Bota Navideña', rareza: 'comun', imagen: '/navidad/bota.png' },
  { id: 'N23', nombre: 'Taza de Chocolate', rareza: 'comun', imagen: '/navidad/chocolate.png' },
  { id: 'N24', nombre: 'Esfera de Cristal', rareza: 'comun', imagen: '/navidad/esfera-cristal.png' },
  { id: 'N25', nombre: 'Corona de Pino', rareza: 'comun', imagen: '/navidad/corona.png' },
  { id: 'N26', nombre: 'Vela de Adviento', rareza: 'comun', imagen: '/navidad/vela.png' }
]

function App() {
  const [nickname, setNickname] = useState('')
  const [pin, setPin] = useState('')
  const [mensaje, setMensaje] = useState('')
  const [usuario, setUsuario] = useState(null)

  // Modificamos para arrancar en la temporada de Navidad por defecto
  const [temporadaActiva, setTemporadaActiva] = useState('navidad')

  // === ESTADOS TEMPORADA 4 (NAVIDAD GACHAPÓN) ===
  const [monedasNavidad, setMonedasNavidad] = useState(0)
  const [navidadDesbloqueados, setNavidadDesbloqueados] = useState([])
  const [premioNavidad, setPremioNavidad] = useState(null)
  const [isSpinning, setIsSpinning] = useState(false)
  const [faseEsfera, setFaseEsfera] = useState(null) // 'cayendo' | 'temblando' | 'rota' | null
  const gachaponRef = useRef(null)
  const engineRef = useRef(null)

  // Agrega esto donde tengas tus otros useEffect o al inicio de tu componente principal:
useEffect(() => {
  const queryParams = new URLSearchParams(window.location.search);
  const codigoUrl = queryParams.get('code');

  // Si hay un código en el enlace y el usuario ya está cargado, lo canjea en automático
  if (codigoUrl && usuario && usuario.id) {
    canjearQRNavidad(codigoUrl);
    // Limpiamos la URL para que no se quede el ?code= en la barra de direcciones
    window.history.replaceState({}, document.title, window.location.pathname);
  }
}, [usuario]);

  // === ESTADOS PARA CONTROL DE AUDIO ===
  const [isPlayingMusic, setIsPlayingMusic] = useState(false)
  const backgroundAudioRef = useRef(null)
  const gachaponSoundRef = useRef(null)

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

  const [inventario, setInventario] = useState({}) 
  const [mesaTrabajo, setMesaTrabajo] = useState([])
  const [slotSeleccionado, setSlotSeleccionado] = useState(null)
  const [qromosDesbloqueados, setQromosDesbloqueados] = useState([])
  const [resultadoCreacion, setResultadoCreacion] = useState(null)
  const [mictlanSeleccionado, setMictlanSeleccionado] = useState(null)
  
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
      cargarMictlan(usuario.id)
      cargarNavidad(usuario.id)
      
      const guardada = localStorage.getItem(`dedicatoria_${usuario.id}`)
      if (guardada) {
        setDedicatoria(guardada)
        setDedicatoriaGuardada(true)
      }
    } 
  }, [usuario])

  // Pausar música si cambian de temporada o cierran sesión
  useEffect(() => {
    if ((temporadaActiva !== 'navidad' || !usuario) && backgroundAudioRef.current) {
      backgroundAudioRef.current.pause()
      setIsPlayingMusic(false)
    }
  }, [temporadaActiva, usuario])

  useEffect(() => {
  let streamActivo = null;

  const encenderCamara = async () => {
    // Si el modal está abierto y el recuadro de video existe en la pantalla
    if (mostrarEscaner && videoRef.current) {
      try {
        // Pedimos permiso para usar la cámara trasera del celular
        streamActivo = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: 'environment' } 
        });
        
        // Conectamos la señal de la cámara al recuadro negro
        videoRef.current.srcObject = streamActivo;
        
        // ¡Forzamos a que el video empiece a reproducirse!
        await videoRef.current.play();
        
      } catch (err) {
        console.error("Error al encender cámara:", err);
        alert("Asegúrate de darle permisos de cámara al navegador.");
      }
    }
  };

  encenderCamara();

  // Función de limpieza: apagar la cámara cuando cierras el modal
  return () => {
    if (streamActivo) {
      streamActivo.getTracks().forEach(track => track.stop());
    }
  };
}, [mostrarEscaner]); // Se ejecuta cada vez que abres o cierras el escáner

  // === EFECTO DE FÍSICAS: MÁQUINA GACHAPÓN (MATTER.JS) ===
  useEffect(() => {
    if (!usuario) return; // <-- Espera a que inicies sesión
    if (temporadaActiva !== 'navidad') return;
    if (!gachaponRef.current) return;

    // Limpiamos el contenedor por si tenía un canvas viejo
    gachaponRef.current.innerHTML = '';

    const { Engine, Render, Runner, Composite, Bodies } = Matter;
    const engine = Engine.create();
    engineRef.current = engine;
    const world = engine.world;

    const render = Render.create({
      element: gachaponRef.current,
      engine: engine,
      options: {
        width: 265,  // <-- Exactamente igual a tu div .cristal-fisicas-custom
        height: 265, // <-- Exactamente igual a tu div .cristal-fisicas-custom
        background: 'transparent',
        wireframes: false
      }
    });

    Render.run(render);
    const runner = Runner.create();
    Runner.run(runner, engine);

    // Paredes ajustadas a 265x265 con piso cerrado para que no se caigan al vacío
    const boundaries = [
      Bodies.rectangle(132, 260, 265, 20, { isStatic: true, render: { visible: false } }), // Piso inferior sólido
      Bodies.rectangle(132, 5, 265, 20, { isStatic: true, render: { visible: false } }),   // Techo
      Bodies.rectangle(5, 132, 20, 265, { isStatic: true, render: { visible: false } }),   // Pared izquierda
      Bodies.rectangle(260, 132, 20, 265, { isStatic: true, render: { visible: false } }), // Pared derecha
      Bodies.rectangle(45, 225, 120, 20, { isStatic: true, angle: Math.PI / 5, render: { visible: false } }),  // Curva inferior izq
      Bodies.rectangle(220, 225, 120, 20, { isStatic: true, angle: -Math.PI / 5, render: { visible: false } }) // Curva inferior der
    ];

    const esferas = [];
    
    // Subimos a 45 esferas para llenar bien la pecera
    for (let i = 0; i < 45; i++) {
      const x = Math.random() * 160 + 50;
      const y = Math.random() * 100 + 30;
      
      // 1. Dejamos el choque físico en 15 para que se acerquen bastante y se encimen
      const radio = 15; 
      
      esferas.push(Bodies.circle(x, y, radio, {
        restitution: 0.7, // Un poco menos saltarinas para que se asienten bien en montón
        friction: 0.005, 
        density: 0.04,
        // Les damos un ángulo inicial al azar para que no se vean todas derechitas iguales
        angle: Math.random() * Math.PI * 2, 
        render: { 
          sprite: {
            texture: '/navidad/esfera.png',
            // 2. Subimos la escala visual al doble (de 0.05 a 0.11)
            xScale: 0.11, 
            yScale: 0.11
          }
        }
      }));
    }

    Composite.add(world, [...boundaries, ...esferas]);

    return () => {
      Render.stop(render);
      Runner.stop(runner);
      Engine.clear(engine);
      if (render.canvas) {
        render.canvas.remove();
      }
    };
  }, [temporadaActiva, usuario]); // <-- ¡AQUÍ ESTABA EL SECRETO! Agregar 'usuario'

  // === LÓGICA DEL GACHAPÓN NAVIDEÑO ===
  async function jugarGachapon() {
    if (monedasNavidad <= 0 || isSpinning) return;
    
    // 🔊 SONIDO MECÁNICO AL DARLE CLIC AL BOTÓN
    if (gachaponSoundRef.current) {
      gachaponSoundRef.current.currentTime = 0;
      gachaponSoundRef.current.play().catch(e => console.log("SFX bloqueado:", e));
    }

    setIsSpinning(true);
    setMonedasNavidad(prev => prev - 1); // Descuenta 1 moneda

    // 1. Agitar esferas con potencia real (Velocidad directa + Giro)
    const shakeInterval = setInterval(() => {
      if (engineRef.current) {
        const bodies = Matter.Composite.allBodies(engineRef.current.world);
        bodies.forEach(body => {
          if (!body.isStatic) {
            // Las disparamos con velocidad directa hacia arriba y a los lados
            Matter.Body.setVelocity(body, {
              x: (Math.random() - 0.5) * 10, // Rebote loco a los lados
              y: -(Math.random())   // Impulso fuerte hacia el techo
            });
            // Las hacemos girar sobre su propio eje mientras vuelan
            Matter.Body.setAngularVelocity(body, (Math.random() - 0.5) * 0.4);
          }
        });
      }
    }, 120);

    // 2. Sistema RNG 
    const rng = Math.floor(Math.random() * 100) + 1;
    let rarezaGanada = 'comun';
    if (rng <= 5) rarezaGanada = 'legendaria';
    else if (rng <= 40) rarezaGanada = 'rara';

    const posiblesPremios = PERSONAJES_NAVIDAD.filter(p => p.rareza === rarezaGanada);
    const premioFinal = posiblesPremios[Math.floor(Math.random() * posiblesPremios.length)];

    // 3. Detener temblor, sacar esfera, romperla y revelar premio
    setTimeout(() => {
      clearInterval(shakeInterval); // Detenemos las físicas
      
      // Fase A: La esfera sale de la boquilla de la máquina hacia el frente
      setFaseEsfera('cayendo');

      // Fase B: A los 600ms empieza a vibrar fuerte como si fuera a estallar
      setTimeout(() => {
        setFaseEsfera('temblando');
      }, 600);

      // Fase C: A los 1500ms ¡PUM! Se rompe con un destello
      setTimeout(() => {
        setFaseEsfera('rota');
      }, 1500);

      // Fase D: A los 1900ms limpiamos la esfera y mostramos la tarjeta ganadora
      setTimeout(async () => {
        setFaseEsfera(null);
        setIsSpinning(false);
        
        if (!navidadDesbloqueados.includes(premioFinal.id)) {
          await supabase.from('collection').insert({ user_id: usuario.id, qromo_id: premioFinal.id });
          setNavidadDesbloqueados(prev => [...prev, premioFinal.id]);
        }
        setPremioNavidad(premioFinal);
      }, 1900);

    }, 2200); // Tiempo que dura agitándose la máquina
  }

  // === FUNCIONES GENERALES Y LOGIN ===
  async function crearCuenta() {
    if (!nickname || !pin) return setMensaje('Escribe nickname y PIN')
    const { error } = await supabase.from('users').insert([{ nickname, pin }])
    if (error) return setMensaje('Error al crear cuenta')
    setMensaje('Cuenta creada correctamente')
  }

  async function entrar() {
    if (!nickname) return setMensaje('Por favor escribe tu Nickname')
    if (pin === '0000') {
      setUsuario({ id: 1, nickname: nickname })
      setMensaje('')
      return
    }
   const { data, error } = await supabase.from('users').select('*').eq('nickname', nickname).eq('pin', pin).single()
  
  if (error || !data) return setMensaje('Nickname o PIN incorrecto (Usa PIN 0000 para prueba)')
  
  setUsuario(data)
  // 👇 NUEVA LÍNEA: Cargamos las monedas que el usuario ya tenía guardadas
  setMonedasNavidad(data.monedas_navidad || 0)
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
    if (data) {
      // FILTRO CORREGIDO: Evita que los QRomos de Navidad ('N') o Mictlán ('Q') se cuelen en la colección general
      const idsLimpios = data
        .map((item) => String(item.qromo_id))
        .filter(id => !id.startsWith('N') && !id.startsWith('Q'))
      setColeccion(idsLimpios)
    }
  }

  async function cargarNavidad(userId) {
    const { data } = await supabase.from('collection').select('qromo_id').eq('user_id', userId)
    const col = data ? data.map(item => String(item.qromo_id)) : []
    const navQromos = col.filter(id => id.startsWith('N'))
    setNavidadDesbloqueados(navQromos)
  }

  async function cargarMictlan(userId) {
    const { data: colData } = await supabase.from('collection').select('qromo_id').eq('user_id', userId)
    const col = colData ? colData.map(item => String(item.qromo_id)) : []
    const mictlanQromos = col.filter(id => id.startsWith('Q'))
    setQromosDesbloqueados(mictlanQromos)

    const { data: qrs } = await supabase.from('codigos_qr').select('material_id').eq('redeemed_by', userId)
    let inv = {}
    if (qrs) {
      qrs.forEach(qr => {
        inv[qr.material_id] = (inv[qr.material_id] || 0) + 1
      })
    }

    mictlanQromos.forEach(qId => {
      const recetaEntry = Object.entries(RECETAS).find(([mats, q]) => q.id === qId)
      if (recetaEntry) {
        const matsUsados = recetaEntry[0].split(',')
        matsUsados.forEach(mId => {
          if (inv[mId]) inv[mId]--
        })
      }
    })
    setInventario(inv)
  }

  
 // === CANJEAR CÓDIGO EXCLUSIVAMENTE POR ESCÁNER QR ===
async function canjearQRNavidad(codigoEscaneado) {
  if (!codigoEscaneado) return setMensajeCanje('Escanea un código QR válido.');
  const codigoLimpio = codigoEscaneado.trim().toLowerCase();
  setMensajeCanje(`Buscando código...`);

  

    const { data: qrData, error: qrError } = await supabase
      .from('codigos_qr')
      .select('*')
      .eq('code', codigoLimpio)
      .maybeSingle()

    if (qrError) return setMensajeCanje(`Error técnico: ${qrError.message}`)
    if (!qrData) return setMensajeCanje('❌ Código no encontrado en la base de datos.')
    if (qrData.is_redeemed) return setMensajeCanje('⚠️ Este código ya fue reclamado anteriormente.')

    // Marcar como canjeado
    const { error: updateError } = await supabase.from('codigos_qr').update({
      is_redeemed: true, redeemed_by: usuario.id, redeemed_at: new Date().toISOString()
    }).eq('code', codigoLimpio)

    if (updateError) return setMensajeCanje(`Error al guardar: ${updateError.message}`)

    // ¡Éxito! Sumamos una moneda de Navidad al usuario
    // ... (tu código anterior de validación del QR se queda igualito)

if (updateError) return setMensajeCanje(`Error al guardar: ${updateError.message}`)

// NUEVO: Consultamos cuántas monedas tiene actualmente en Supabase
const { data: usuarioDb } = await supabase
      .from('users')
      .select('monedas_navidad')
      .eq('id', usuario.id)
      .single()

    const totalMonedas = (usuarioDb?.monedas_navidad || 0) + 1

    // Guardamos el nuevo total en su cuenta de Supabase
    await supabase
      .from('users')
      .update({ monedas_navidad: totalMonedas })
      .eq('id', usuario.id)

    // Actualizamos el número en la pantalla
    setMonedasNavidad(totalMonedas)
    setMensajeCanje(`✨ ¡Código canjeado con éxito! +1 Moneda QRomos`)
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

  async function mezclarEnMesa() {
    if (mesaTrabajo.length !== 2) return
    const mezclaKey = [...mesaTrabajo].sort().join(',')
    const recetaDescubierta = RECETAS[mezclaKey]

    if (recetaDescubierta) {
      const yaLaTenia = qromosDesbloqueados.includes(recetaDescubierta.id)
      if (!yaLaTenia) {
        await supabase.from('collection').insert({ user_id: usuario.id, qromo_id: recetaDescubierta.id })
        setQromosDesbloqueados(prev => [...prev, recetaDescubierta.id])
      }
      setResultadoCreacion({ exito: true, repetido: yaLaTenia, ...recetaDescubierta })
      setMesaTrabajo([]) 
    } else {
      setResultadoCreacion({ exito: false, nombre: 'Artesanía Fallida', desc: 'Los materiales no combinan. Han regresado a tu canasta.', imagen: '❌' })
      mesaTrabajo.forEach(matId => setInventario(prev => ({ ...prev, [matId]: (prev[matId] || 0) + 1 })))
      setMesaTrabajo([])
    }
  }

  async function guardarDedicatoria() {
    if (!dedicatoria.trim()) return setMensajeDedicatoria('Escribe unas palabras para consagrar tu ofrenda.')
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
  const obtenidos = qromos.filter((q) => coleccion.includes(String(q.id)))
  const porcentaje = Math.round((obtenidos.length / 30) * 100) || 0

  // === RENDERIZADO LOGIN ===
  if (!usuario) {
    return (
      <div className="login-page navidad-theme" style={{position: 'relative', overflow: 'hidden'}}>
        {/* Lluvia densa y unificada de copos blancos de hielo */}
        <div className="copo-nieve-unico" style={{left: '5%', animationDuration: '6s', animationDelay: '0s'}}>❅</div>
        <div className="copo-nieve-unico" style={{left: '12%', animationDuration: '9s', animationDelay: '2s'}}>❅</div>
        <div className="copo-nieve-unico" style={{left: '20%', animationDuration: '5s', animationDelay: '1s'}}>❅</div>
        <div className="copo-nieve-unico" style={{left: '28%', animationDuration: '7s', animationDelay: '3s'}}>❅</div>
        <div className="copo-nieve-unico" style={{left: '35%', animationDuration: '8s', animationDelay: '0.5s'}}>❅</div>
        <div className="copo-nieve-unico" style={{left: '45%', animationDuration: '11s', animationDelay: '2.5s'}}>❅</div>
        <div className="copo-nieve-unico" style={{left: '52%', animationDuration: '6.5s', animationDelay: '1.2s'}}>❅</div>
        <div className="copo-nieve-unico" style={{left: '60%', animationDuration: '8.5s', animationDelay: '4s'}}>❅</div>
        <div className="copo-nieve-unico" style={{left: '68%', animationDuration: '7.2s', animationDelay: '0.8s'}}>❅</div>
        <div className="copo-nieve-unico" style={{left: '75%', animationDuration: '5.5s', animationDelay: '3.2s'}}>❅</div>
        <div className="copo-nieve-unico" style={{left: '83%', animationDuration: '10s', animationDelay: '1.8s'}}>❅</div>
        <div className="copo-nieve-unico" style={{left: '92%', animationDuration: '6.8s', animationDelay: '2.1s'}}>❅</div>

        {/* Estrellas de 8 puntos con aura brillante */}
        <div className="estrella-aura" style={{top: '12%', left: '15%', animationDuration: '2s', animationDelay: '0.3s'}}>✷</div>
        <div className="estrella-aura" style={{top: '28%', left: '82%', animationDuration: '2.5s', animationDelay: '1s'}}>✷</div>
        <div className="estrella-aura" style={{top: '65%', left: '10%', animationDuration: '1.8s', animationDelay: '0.7s'}}>✷</div>
        <div className="estrella-aura" style={{top: '80%', left: '85%', animationDuration: '3s', animationDelay: '1.5s'}}>✷</div>
        <div className="estrella-aura" style={{top: '42%', left: '8%', animationDuration: '2.2s', animationDelay: '0.9s'}}>✷</div>
        <div className="estrella-aura" style={{top: '18%', left: '75%', animationDuration: '2.7s', animationDelay: '1.4s'}}>✷</div>

        <div className="login-card premium-login" style={{zIndex: 2}}>
          <div className="login-badge" style={{background: '#00b3aa', color: 'white'}}>NUEVA TEMPORADA</div>
          <div className="login-logo-container">
            <h1 className="login-logo">QRomos</h1>
            <h2 className="login-season-title">Edición Navideña</h2>
          </div>
          <p className="login-subtitle">Descubre tu coleccionable y reclama tu figura física 3D con el QR dorado.</p>

          <div className="login-form">
            <label>Nickname</label>
            <input placeholder="Ej. Fanqromos" value={nickname} onChange={(e) => setNickname(e.target.value)} />
            <label>PIN de Verificación</label>
            <input placeholder="Un PIN de 4 digitos)" type="password" value={pin} onChange={(e) => setPin(e.target.value)} />
            <button className="primary-login-btn" onClick={entrar}>Entrar a mi colección</button>
            <button className="secondary-login-btn" onClick={crearCuenta}>Crear cuenta nueva</button>
          </div>

          {mensaje && <p className="login-message">{mensaje}</p>}
        </div>
      </div>
    )
  }

  return (
    <div className={`album-page ${temporadaActiva}-theme`}>
      <header className="hero">
        <div className="profile-card">
          <div className="avatar">QR</div>
          <div>
            <strong>{usuario.nickname}</strong>
            <p>Qroleccionador</p>
          </div>
        </div>
        
        <div className="title-box">
          {temporadaActiva === 'navidad' ? (
            <div className="mictlan-title-wrapper">
              <p className="temporada-tag">TEMPORADA 4</p>
              <h1 className="mictlan-title-text" style={{color:'#fff', filter:'none', background:'none', textFillColor:'initial', WebkitTextFillColor:'initial'}}>❄️VILLA NAVIDEÑA❄️</h1>
              <span className="subtitle-tag">Juega en el Gachapón para revelar tus Qromos</span>
            </div>
          ) : temporadaActiva === 'mictlan' ? (
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
        <button className={temporadaActiva === 'navidad' ? 'season-option active' : 'season-option'} onClick={() => setTemporadaActiva('navidad')}>
          <small>Temporada 4</small><strong>Navidad</strong><span className="new-label" style={{background:'#00b33c'}}>NUEVO</span>
        </button>
        <button className={temporadaActiva === 'mictlan' ? 'season-option active' : 'season-option'} onClick={() => setTemporadaActiva('mictlan')}>
          <small>Temporada 3</small>
          <strong>El Mictlán</strong>
          <span className="temporada-estado">Archivo</span>
        </button>
        <button className={temporadaActiva === 'bestias-mundo' ? 'season-option active' : 'season-option'} onClick={() => setTemporadaActiva('bestias-mundo')}>
          <small>Temporada 2</small><strong>Bestias</strong><span className="archive-label">Archivo</span>
        </button>
        <button className={temporadaActiva === 'mundial-2026' ? 'season-option active' : 'season-option'} onClick={() => setTemporadaActiva('mundial-2026')}>
          <small>Temporada 1</small><strong>Mundial</strong><span className="archive-label">Archivo</span>
        </button>
      </nav>

      {/* ==================== VISTA TEMPORADA 4 (NAVIDAD GACHAPÓN) ==================== */}
      {temporadaActiva === 'navidad' && (
        <main className="alquimia-season" style={{padding: '20px', position: 'relative', overflow: 'hidden'}}>
          
          {/* 🔊 AUDIOS OCULTOS DE AMBIENTE Y GACHAPÓN */}
          <audio 
            ref={backgroundAudioRef} 
            loop 
            src="/navidad/navidad.mp3" 
          />
          <audio 
            ref={gachaponSoundRef} 
            src="/navidad/gachapon.mp3" 
          />

          {/* 🎵 BOTÓN FLOTANTE PARA ACTIVAR/DESACTIVAR MÚSICA */}
          <button 
            onClick={() => {
              if (isPlayingMusic) {
                backgroundAudioRef.current.pause();
              } else {
                backgroundAudioRef.current.play().catch(e => console.log("Audio play bloqueado:", e));
              }
              setIsPlayingMusic(!isPlayingMusic);
            }}
            style={{
              position: 'absolute',
              top: '15px',
              right: '20px',
              background: isPlayingMusic ? '#40a973' : 'rgba(15, 23, 42, 0.75)',
              color: 'white',
              border: '1px solid #ffd700',
              padding: '8px 16px',
              borderRadius: '20px',
              cursor: 'pointer',
              zIndex: 100,
              fontWeight: 'bold',
              fontSize: '13px',
              backdropFilter: 'blur(4px)',
              boxShadow: '0 4px 12px rgba(0,0,0,0.4)'
            }}
          >
            {isPlayingMusic ? '🎵 Música: ON' : '🔇 Música: OFF'}
          </button>

          {/* Fondo Animado de Copos y Estrellas */}
          <div className="nevada-fondo-global">
            <div className="copo-nieve-unico" style={{left: '8%', animationDuration: '7s', animationDelay: '0s'}}>❄️</div>
            <div className="copo-nieve-unico" style={{left: '25%', animationDuration: '9s', animationDelay: '1.5s'}}>❄️</div>
            <div className="copo-nieve-unico" style={{left: '42%', animationDuration: '6s', animationDelay: '0.8s'}}>❄️</div>
            <div className="copo-nieve-unico" style={{left: '65%', animationDuration: '8s', animationDelay: '2.2s'}}>❄️</div>
            <div className="copo-nieve-unico" style={{left: '88%', animationDuration: '6.5s', animationDelay: '0.3s'}}>❄️</div>

            <div className="estrella-aura" style={{top: '5%', left: '15%', animationDuration: '2.1s', animationDelay: '0.2s'}}>✷</div>
            <div className="estrella-aura" style={{top: '15%', left: '82%', animationDuration: '2.6s', animationDelay: '1.1s'}}>✷</div>
            <div className="estrella-aura" style={{top: '50%', left: '5%', animationDuration: '1.9s', animationDelay: '0.6s'}}>✷</div>
            <div className="estrella-aura" style={{top: '75%', left: '90%', animationDuration: '3.1s', animationDelay: '1.4s'}}>✷</div>
          </div>

          {/* ESCÁNER QR PARA OBTENER MONEDAS */}
          <section className="beast-redeem" style={{position: 'relative', zIndex: 2, marginBottom: '25px', marginTop: '35px'}}>
            <div>
              <p className="eyebrow">OBTENER MONEDAS</p>
              <h3>Escanear QR de tus bolsitas</h3>
              <p>Cada QR te otorga 1 oportunidad para girar el Gachapón.</p>
            </div>
            <div className="beast-redeem-controls">
              
              <button className="scan-button" onClick={() => setMostrarEscaner(true)}>📷 Escanear</button>
              <button className="redeem-button" onClick={canjearQRNavidad}>Canjear QR</button>
            </div>
            {mensajeCanje && <p className="beast-redeem-message">{mensajeCanje}</p>}
          </section>

          <section className="beast-redeem" style={{textAlign: 'center', marginBottom: '30px', position: 'relative', zIndex: 2}}>
            <h2>Gachapón Navideño</h2>
            <div style={{fontSize: '22px', margin: '15px 0', color: '#ffd700', fontWeight: 'bold'}}>
              🪙 Fichas: {monedasNavidad}
            </div>
            <p>Inserta una moneda para agitar la máquina y ganar un coleccionable.</p>
          </section>

          {/* MÁQUINA GACHAPÓN */}
          <section style={{display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '40px', position: 'relative', zIndex: 2}}>
            <style>{`
              .maquina-container-padre {
                width: 100%;
                display: flex;
                justify-content: center;
                align-items: center;
                overflow: hidden; /* Evita barras de desplazamiento horizontales en el cel */
                padding: 10px 0;
              }
              .maquina-wrapper {
                position: relative;
                width: 550px;
                min-width: 550px;
                height: 650px;
                display: flex;
                justify-content: center;
                align-items: center;
                margin: 0 auto; /* Centrado absoluto en PC */
                transform-origin: center center; /* Que se encoge desde su propio centro */
              }
              .maquina-png-img {
                position: absolute;
                top: 100px;
                width: 150%;
                z-index: 20;
                pointer-events: none;
              }
              .cristal-fisicas-custom {
                position: absolute;
                top: 200px;
                left: 142px;
                width: 265px;
                height: 265px;
                border-radius: 50%;
                overflow: hidden;
                z-index: 5;
                background: transparent;
              }

              /* AJUSTE PARA CELULARES */
              @media (max-width: 500px) {
                .maquina-wrapper {
                  transform: scale(0.60); /* Ligeramente más compacto para que entre holgado */
                  margin-top: -60px;     /* Sube el espacio sobrante de arriba */
                  margin-bottom: -250px;  /* Sube el botón para que no quede volando abajo */
                }
              }
            `}</style>

            <div className="maquina-container-padre">
              <div className="maquina-wrapper">
                <div ref={gachaponRef} className="cristal-fisicas-custom" style={{ width: '265px', height: '265px' }}></div>
                <img src="/navidad/maquina-frente.png" alt="Máquina Gachapón" className="maquina-png-img" />
              </div>
            </div>
            
            <button 
              className="mezclar-btn" 
              style={{marginTop: '10px', background: monedasNavidad > 0 && !isSpinning ? '#40a973' : '#333', color: 'white', opacity: monedasNavidad > 0 && !isSpinning ? 1 : 0.5}}
              disabled={monedasNavidad <= 0 || isSpinning}
              onClick={jugarGachapon}
            >
              {isSpinning ? '¡AGITANDO ESFERAS!...' : 'INGRESAR MONEDA (1)'}
            </button>
          </section>

          {/* ÁLBUM DE LA VILLA NAVIDEÑA */}
          <section className="coleccion-qromos-final" style={{position: 'relative', zIndex: 2}}>
            <div className="inventario-header">
              <h3>La Villa Navideña</h3>
              <span>{navidadDesbloqueados.length} / {PERSONAJES_NAVIDAD.length} Coleccionables</span>
            </div>
            <div className="grid-16">
              {PERSONAJES_NAVIDAD.map(pj => {
                const desbloqueado = navidadDesbloqueados.includes(pj.id)
                return (
                  <div key={pj.id} className={`qromo-card ${desbloqueado ? 'obtenido mictlan-card interactiva' : 'bloqueado'}`} style={{borderColor: desbloqueado ? (pj.rareza==='legendaria' ? '#ffd700' : pj.rareza==='rara' ? '#2685ff' : '#aaa') : '#222'}}>
                     <div className="card-image-box">
                       {desbloqueado ? (
                         <img src={pj.imagen} alt={pj.nombre} className="card-tcg-img" />
                       ) : (
                         <div className="mystery-lock" style={{color: '#111'}}>🔒</div>
                       )}
                     </div>
                     <h3 className="card-title-label" style={{color: desbloqueado ? '#fff' : '#444'}}>{desbloqueado ? pj.nombre : '???'}</h3>
                  </div>
                )
              })}
            </div>
          </section>

          {/* ANIMACIÓN DE ESFERA SALIENDO Y ROMPIÉNDOSE */}
          {faseEsfera && (
            <div className="esfera-overlay-show">
              <style>{`
                .esfera-overlay-show {
                  position: fixed;
                  inset: 0;
                  background: rgba(0, 0, 0, 0.75);
                  display: flex;
                  flex-direction: column;
                  justify-content: center;
                  align-items: center;
                  z-index: 9998;
                  backdrop-filter: blur(4px);
                  animation: fadeInBg 0.3s ease forwards;
                }
                @keyframes fadeInBg {
                  from { opacity: 0; }
                  to { opacity: 1; }
                }
                .esfera-protagonista {
                  width: 190px;
                  height: 190px;
                  object-fit: contain;
                  filter: drop-shadow(0 0 25px rgba(255, 215, 0, 0.7));
                }
                /* 1. Sale desde abajo hacia el centro */
                .esfera-cayendo {
                  animation: saltoFrente 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
                }
                @keyframes saltoFrente {
                  0% { transform: translateY(220px) scale(0.15) rotate(-180deg); opacity: 0; }
                  60% { opacity: 1; }
                  100% { transform: translateY(0) scale(1) rotate(0deg); opacity: 1; }
                }
                /* 2. Vibra y se hincha antes de estallar */
                .esfera-temblando {
                  animation: temblorCritico 0.1s infinite;
                  filter: drop-shadow(0 0 45px #ffd700) brightness(1.25);
                }
                @keyframes temblorCritico {
                  0% { transform: translate(0, 0) rotate(0deg) scale(1.08); }
                  25% { transform: translate(-8px, 6px) rotate(-8deg) scale(1.12); }
                  50% { transform: translate(8px, -6px) rotate(8deg) scale(1.15); }
                  75% { transform: translate(-8px, -6px) rotate(-5deg) scale(1.12); }
                  100% { transform: translate(6px, 6px) rotate(5deg) scale(1.18); }
                }
                /* 3. Estalla y se abre en pedazos */
                .esfera-rota {
                  animation: estallidoEsfera 0.4s ease-out forwards;
                }
                @keyframes estallidoEsfera {
                  0% { transform: scale(1.2); filter: brightness(3) drop-shadow(0 0 80px white); opacity: 1; }
                  50% { transform: scale(2.1); filter: brightness(5) blur(6px); opacity: 0.8; }
                  100% { transform: scale(2.8); filter: brightness(10) blur(15px); opacity: 0; }
                }
                .chispas-explosion {
                  position: absolute;
                  font-size: 65px;
                  pointer-events: none;
                  animation: expandirChispas 0.4s ease-out forwards;
                }
                @keyframes expandirChispas {
                  0% { transform: scale(0.3); opacity: 1; }
                  100% { transform: scale(2.8); opacity: 0; }
                }
              `}</style>

              <img 
                src="/navidad/esfera.png" 
                alt="Esfera Ganadora" 
                className={`esfera-protagonista esfera-${faseEsfera}`} 
              />
              
              {faseEsfera === 'temblando' && (
                <p style={{ color: '#ffd700', marginTop: '25px', fontWeight: 'bold', fontSize: '20px', letterSpacing: '2px', textShadow: '0 2px 10px rgba(0,0,0,0.8)' }}>
                  ¡ABRIENDO ESFERA!...
                </p>
              )}

              {faseEsfera === 'rota' && (
                <div className="chispas-explosion">✨💥❄️✨</div>
              )}
            </div>
          )}

          {/* MODAL DE PREMIO */}
          {premioNavidad && (
            <div className="modal-overlay" onClick={() => setPremioNavidad(null)} style={{zIndex: 9999}}>
              <div className="modal-card mictlan-modal" style={{borderColor: premioNavidad.rareza === 'legendaria' ? '#ffd700' : '#2685ff'}} onClick={e => e.stopPropagation()}>
                <button className="modal-close" onClick={() => setPremioNavidad(null)}>×</button>
                <h2 style={{color: 'white', marginBottom: '15px'}}>¡Obtuviste una figura!</h2>
                <img src={premioNavidad.imagen} alt={premioNavidad.nombre} className="modal-tcg-image" />
                <h3 style={{color: '#ffd700', fontSize: '26px'}}>{premioNavidad.nombre}</h3>
                <p style={{color: '#aaa', textTransform: 'uppercase', letterSpacing: '2px'}}>{premioNavidad.rareza}</p>
                {premioNavidad.rareza === 'legendaria' && <p style={{color: '#ff9d00', fontWeight: 'bold'}}></p>}
                <button className="continuar-btn" style={{marginTop: '15px'}} onClick={() => setPremioNavidad(null)}>Guardar en Álbum</button>
              </div>
            </div>
          )}
        </main>
      )}

      {/* ==================== VISTA TEMPORADA 3 (MICTLÁN - ARCHIVADA) ==================== */}
      {temporadaActiva === 'mictlan' && (
        <main className="alquimia-season" style={{position: 'relative', padding: '20px'}}>
          <div className="archive-notice" style={{marginBottom: '25px'}}>
            <div><strong>Temporada archivada</strong><p>Tu ofrenda y tus QRomos del Mictlán están guardados de forma segura.</p></div>
            <span>Solo visualización</span>
          </div>

          {ofrendaCompleta && (
            <section className="gran-altar-final" style={{marginBottom: '30px'}}>
              <h2>¡Ofrenda Consagrada!</h2>
              <p>Has reunido los 16 elementos sagrados para iluminar el camino.</p>
              <div className="altar-foto-container">
                 <img src="/altar-completo.jpg" alt="Ofrenda Monumental" className="altar-img-hd" />
                 {dedicatoria && (
                   <div className="pergamino-dedicatoria" style={{marginTop: '15px'}}>
                     <p>“{dedicatoria}”</p><small>— Altar consagrado por {usuario.nickname}</small>
                   </div>
                 )}
              </div>
            </section>
          )}

          <section className="coleccion-qromos-final">
            <div className="inventario-header">
              <h3>Álbum de la Ofrenda (Archivo)</h3>
              <span>{qromosDesbloqueados.length} / 16 QRomos</span>
            </div>
            <div className="grid-16">
              {Object.values(RECETAS).map(qromo => {
                const desbloqueado = qromosDesbloqueados.includes(qromo.id)
                return (
                  <div key={qromo.id} className={`qromo-card ${desbloqueado ? 'obtenido mictlan-card interactiva' : 'bloqueado'}`} onClick={() => desbloqueado && setMictlanSeleccionado(qromo)}>
                     <div className="card-image-box">{desbloqueado ? <img src={qromo.imagen} alt={qromo.nombre} className="card-tcg-img" /> : <div className="mystery-lock">🔒</div>}</div>
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
          <div className="archive-notice"><div><strong>Temporada archivada</strong><p>Tu equipo y progreso están guardados de forma segura.</p></div><span>Solo visualización</span></div>
          <section className="beasts-grid">
            {bestiasFiltradas.map((bestia) => {
              const desbloqueada = bestiasDesbloqueadas.includes(Number(bestia.id))
              return (
                <button className={`beast-card ${bestia.rareza} ${desbloqueada ? 'desbloqueada' : 'bloqueada'}`} key={bestia.id} onClick={() => desbloqueada && setBestiaSeleccionada(bestia)}>
                  <img src={bestia.imagen} alt={bestia.nombre} />
                  {!desbloqueada && <span className="beast-lock">🔒 Bloqueada</span>}
                  <div className="beast-card-meta"><div><span>{bestia.pais}</span><strong>{bestia.nombre}</strong></div><b>{bestia.poder}</b></div>
                </button>
              )
            })}
          </section>
        </main>
      )}

      {/* ==================== VISTA TEMPORADA 1 (MUNDIAL) ==================== */}
      {temporadaActiva === 'mundial-2026' && (
        <main className="grid" style={{padding: '20px'}}>
          <div className="archive-notice" style={{gridColumn: '1 / -1'}}><div><strong>Temporada archivada</strong></div><span>Solo visualización</span></div>
          {qromosFiltrados
            // ORDENAMIENTO NUMÉRICO ESTRICTO
            .sort((a, b) => Number(a.id) - Number(b.id))
            .filter((qromo) => {
              const idStr = String(qromo.id);
              return !idStr.startsWith('Q') && !idStr.startsWith('N');
            })
            .map((qromo) => {
              const obtenido = coleccion.includes(String(qromo.id))
              return (
                <div key={qromo.id} className={`qromo-card ${qromo.rareza} ${obtenido ? 'obtenido' : 'bloqueado'}`} onClick={() => obtenido && setQromoSeleccionado(qromo)}>
                  <div className="number">{String(qromo.id).padStart(3, '0')}</div>
                  <div className="card-image-box">{obtenido ? <img className="qromo-image" src={`/qromos/${String(qromo.id).padStart(3, '0')}.png`} alt={qromo.nombre} /> : <div className="mystery-lock">🔒</div>}</div>
                  <h3>{obtenido ? qromo.nombre : 'QRomo Misterioso'}</h3>
                </div>
              )
            })}
        </main>
      )}

      {/* ==================== MODALES ==================== */}
      
      {mictlanSeleccionado && (
        <div className="modal-overlay" onClick={() => setMictlanSeleccionado(null)}>
          <div className="modal-card mictlan-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setMictlanSeleccionado(null)}>×</button>
            <img src={mictlanSeleccionado.imagen} alt={mictlanSeleccionado.nombre} className="modal-tcg-image" />
            <h2>{mictlanSeleccionado.nombre}</h2>
            <p className="modal-tcg-desc">{mictlanSeleccionado.desc}</p>
          </div>
        </div>
      )}

      {slotSeleccionado !== null && (
        <div className="modal-overlay" onClick={() => setSlotSeleccionado(null)}>
          <div className="selector-card" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setSlotSeleccionado(null)}>×</button>
            <h3>Selecciona un Material</h3>
            <div className="selector-grid">
              {MATERIALES.map(mat => {
                const cantidad = inventario[mat.id] || 0;
                if (cantidad <= 0) return null;
                return (
                  <button key={mat.id} className="selector-item" onClick={() => colocarEnSlot(mat.id)}>
                    <span className="sel-icono">{mat.icono}</span><span className="sel-nombre">{mat.nombre}</span><span className="sel-cant">x{cantidad}</span>
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {resultadoCreacion && (
        <div className="modal-overlay" onClick={() => setResultadoCreacion(null)}>
          <div className={`modal-card pocion-modal ${resultadoCreacion.exito ? 'exito' : 'fracaso'}`} onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setResultadoCreacion(null)}>×</button>
            {resultadoCreacion.exito ? <img src={resultadoCreacion.imagen} alt={resultadoCreacion.nombre} className="modal-tcg-image" /> : <div className="pocion-icono-grande">❌</div>}
            <h2>{resultadoCreacion.nombre}</h2>
            <p>{resultadoCreacion.desc}</p>
            <button className="continuar-btn" onClick={() => setResultadoCreacion(null)}>Continuar</button>
          </div>
        </div>
      )}

      {mostrarEscaner && (
  <div className="modal-overlay scanner-overlay" onClick={() => setMostrarEscaner(false)}>
    <div className="scanner-card" onClick={(e) => e.stopPropagation()}>
      <button className="modal-close" onClick={() => setMostrarEscaner(false)}>×</button>
      <h2 style={{color: '#ff8c00', marginBottom: '10px'}}>Escanea el QR</h2>
      
      {/* Añadimos un min-height y display flex/block para forzar el espacio */}
      <div className="scanner-frame" style={{ width: '100%', minHeight: '280px', background: '#000', borderRadius: '8px', overflow: 'hidden' }}>
        <video ref={videoRef} muted playsInline style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px' }} />
      </div>
    </div>
  </div>
)}

    </div>
  )
}

export default App