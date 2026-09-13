import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

type Beast = {
  id: number
  name: string
  country: string
  rarity: string
  beast_type: string
  power: number
  image: string
  hp: number
  maxHp: number
  shield: number
  actions: number
  magicBuff: number
  weakened: number
  specialUsed: boolean
  forcedSpecial: boolean
}

const specialNames: Record<number, string> = {
  1: 'Rugido del Sol', 2: 'Eclipse de Nueve Colas', 3: 'Colmillo del Ragnarök',
  4: 'Zarpazo del Maharajá', 5: 'Enigma de las Arenas', 6: 'Tormenta Celestial',
  7: 'Picado del Olimpo', 8: 'Vendaval Esmeralda', 9: 'Trueno del Billabong',
  10: 'Eclipse de Obsidiana', 11: 'Abrazo Boreal', 12: 'Embestida Carmesí',
}

function fighter(beast: Omit<Beast, 'hp' | 'maxHp' | 'shield' | 'actions' | 'magicBuff' | 'weakened' | 'specialUsed' | 'forcedSpecial'>): Beast {
  const extra = beast.beast_type === 'defensa' ? 28 : beast.beast_type === 'apoyo' ? 16 : 0
  const maxHp = 95 + Math.round((beast.power - 60) * 1.2) + extra
  return { ...beast, hp: maxHp, maxHp, shield: 0, actions: 0, magicBuff: 0, weakened: 0, specialUsed: false, forcedSpecial: false }
}

function typeMultiplier(attacker: string, defender: string) {
  const advantages: Record<string, string[]> = {
    ataque: ['hechiceria', 'lucha'], defensa: ['ataque'], hechiceria: ['defensa', 'apoyo'],
    velocidad: ['hechiceria', 'ataque'], lucha: ['defensa'], apoyo: ['velocidad'],
  }
  return advantages[attacker]?.includes(defender) ? 1.25 : 1
}

function simulate(player: Beast[], rival: Beast[]) {
  let playerActive = 0
  let rivalActive = 0
  let side: 'jugador' | 'rival' = player[0].beast_type === 'velocidad' || rival[0].beast_type !== 'velocidad' ? 'jugador' : 'rival'
  const events: Record<string, unknown>[] = []

  for (let turn = 1; turn <= 120; turn += 1) {
    const attackers = side === 'jugador' ? player : rival
    const defenders = side === 'jugador' ? rival : player
    const attackerIndex = side === 'jugador' ? playerActive : rivalActive
    const defenderIndex = side === 'jugador' ? rivalActive : playerActive
    const attacker = attackers[attackerIndex]
    const defender = defenders[defenderIndex]
    attacker.actions += 1

    const special = !attacker.specialUsed && (attacker.forcedSpecial || attacker.hp <= attacker.maxHp * .42 || attacker.actions >= 3)
    const technique = attacker.actions % 2 === 0
    if (special) { attacker.specialUsed = true; attacker.forcedSpecial = false }

    if (attacker.beast_type === 'apoyo' && (attacker.actions % 3 === 0 || special)) {
      const wounded = attackers.filter((item) => item.hp > 0 && item.hp < item.maxHp).sort((a, b) => a.hp / a.maxHp - b.hp / b.maxHp)
      if (wounded.length) {
        const target = wounded[0]
        const healing = Math.min(Math.round((special ? 26 : 14) + attacker.power * .08), target.maxHp - target.hp)
        target.hp += healing
        events.push({ turn, side, kind: 'curacion', actorId: attacker.id, targetId: target.id, healing, actorHp: attacker.hp, targetHp: target.hp, special, skill: special ? specialNames[attacker.id] : 'Luz restauradora', text: `${attacker.name} restaura ${healing} PV de ${target.name}.` })
        side = side === 'jugador' ? 'rival' : 'jugador'
        continue
      }
    }

    let multiplier = 1
    let skill = 'Golpe básico'
    if (technique) {
      if (attacker.beast_type === 'ataque') { multiplier = 1.5; skill = 'Furia ancestral' }
      if (attacker.beast_type === 'defensa') { multiplier = 1.15; skill = 'Muralla viviente'; attacker.shield = 14 }
      if (attacker.beast_type === 'hechiceria') { multiplier = 1.4; skill = 'Sello arcano' }
      if (attacker.beast_type === 'velocidad') { multiplier = 1.2; skill = 'Paso relámpago' }
      if (attacker.beast_type === 'lucha') { multiplier = 1.4; skill = 'Rugido de combate' }
      if (attacker.beast_type === 'apoyo') { multiplier = 1.2; skill = 'Pulso de energía' }
    }
    if (special) { multiplier = 1.85; skill = specialNames[attacker.id] || 'Poder ancestral'; if (attacker.beast_type === 'defensa') attacker.shield = 22 }
    if (attacker.beast_type === 'lucha' && attacker.hp <= attacker.maxHp * .4) multiplier *= 1.3

    let magicText = ''
    if (attacker.beast_type === 'hechiceria' && (technique || special)) {
      if (Math.random() < .5) { attacker.magicBuff = special ? 3 : 2; magicText = `${attacker.name} aumenta su poder mágico.` }
      else { defender.weakened = special ? 3 : 2; magicText = `${defender.name} queda debilitado.` }
    }
    if (attacker.magicBuff > 0) { multiplier *= 1.2; attacker.magicBuff -= 1 }
    if (attacker.weakened > 0) { multiplier *= .85; attacker.weakened -= 1 }

    const critical = attacker.beast_type === 'ataque' && Math.random() < .25
    if (critical) multiplier *= 1.3
    const evaded = defender.beast_type === 'velocidad' && Math.random() < .25
    const defense = defender.beast_type === 'defensa' && attacker.beast_type !== 'hechiceria' ? 4 : 0
    let damage = evaded ? 0 : Math.max(7, Math.round((10 + attacker.power * .13 + Math.floor(Math.random() * 7)) * typeMultiplier(attacker.beast_type, defender.beast_type) * multiplier) - defense)
    const absorbed = evaded ? 0 : Math.min(defender.shield, damage)
    damage -= absorbed
    defender.shield -= absorbed
    const lastStand = !evaded && damage >= defender.hp && !defender.specialUsed && !defender.forcedSpecial
    defender.hp = lastStand ? 1 : Math.max(0, defender.hp - damage)
    if (lastStand) defender.forcedSpecial = true

    let text = evaded ? `¡${defender.name} evade el ataque de ${attacker.name}!` : `${attacker.name} usa ${skill} y causa ${damage} de daño.`
    if (critical && !evaded) text += ' ¡Golpe crítico!'
    if (absorbed) text += ` El escudo absorbe ${absorbed}.`
    if (magicText) text += ` ${magicText}`
    if (lastStand) text += ` ¡${defender.name} resiste para liberar su especial!`
    events.push({ turn, side, kind: evaded ? 'evasion' : 'ataque', actorId: attacker.id, targetId: defender.id, damage, absorbed, actorHp: attacker.hp, targetHp: defender.hp, shield: defender.shield, critical, special, skill, text })

    if (defender.hp === 0) {
      const next = defenderIndex + 1
      events.push({ turn, side, kind: 'caida', targetId: defender.id, text: `¡${defender.name} ha caído!` })
      if (next >= defenders.length) return { winner: side, turns: turn, events }
      if (side === 'jugador') rivalActive = next
      else playerActive = next
      events.push({ turn, side, kind: 'entrada', targetId: defenders[next].id, text: `${defenders[next].name} entra al campo.` })
    }
    side = side === 'jugador' ? 'rival' : 'jugador'
  }
  return { winner: 'jugador' as const, turns: 120, events }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  try {
    const { challenger_id, pin, opponent_id } = await req.json()
    if (!challenger_id || !pin || !opponent_id || Number(challenger_id) === Number(opponent_id)) throw new Error('INVALID_REQUEST')

    const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)
    const { data: user } = await supabase.from('users').select('id, pin').eq('id', challenger_id).eq('pin', pin).maybeSingle()
    if (!user) throw new Error('INVALID_SESSION')

    async function loadTeam(userId: number) {
      const { data: team } = await supabase.from('teams').select('id').eq('user_id', userId).maybeSingle()
      if (!team) throw new Error('TEAM_NOT_FOUND')
      const { data: members } = await supabase.from('team_members').select('beast_id, position').eq('team_id', team.id).order('position')
      if (!members || members.length !== 3) throw new Error('TEAM_INCOMPLETE')
      const ids = members.map((item) => Number(item.beast_id))
      const { data: beasts } = await supabase.from('beasts').select('id, name, country, rarity, beast_type, power, image').in('id', ids)
      if (!beasts || beasts.length !== 3) throw new Error('BEASTS_NOT_FOUND')
      return ids.map((id) => fighter(beasts.find((item) => Number(item.id) === id)! as never))
    }

    const [player, rival] = await Promise.all([loadTeam(Number(challenger_id)), loadTeam(Number(opponent_id))])
    const result = simulate(player, rival)
    const { data: battleId, error } = await supabase.from('pvp_battle_history').insert({
      challenger_id, opponent_id,
      result: result.winner === 'jugador' ? 'victoria' : 'derrota',
      turns: result.turns,
      duration_seconds: result.events.length * 3,
      challenger_team: player.map((item) => item.id),
      opponent_team: rival.map((item) => item.id),
    }).select('id').single()
    if (error) throw error

    const { data: rankingData, error: rankingError } = await supabase.rpc('apply_pvp_ranking', {
      p_battle_id: battleId.id,
    })
    if (rankingError) throw rankingError

    return new Response(JSON.stringify({
      battle_id: battleId.id,
      winner: result.winner,
      player,
      rival,
      events: result.events,
      ranking: rankingData?.[0] || null,
    }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  } catch (error) {
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'UNKNOWN_ERROR' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  }
})
