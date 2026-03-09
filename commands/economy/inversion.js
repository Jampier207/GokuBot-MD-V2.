export default {
  command: ['invertir'],
  category: 'rpg',

  run: async (client, m, args) => {
    if (!m?.sender) return

    const db = global.db.data
    const chat = db.chats[m.chat]
    if (!chat) return
    if (chat.adminonly || !chat.rpg)
      return m.reply('◇ El modo RPG está desactivado aquí.')

    if (!chat.users[m.sender]) {
      chat.users[m.sender] = {
        coins: 0,
        bank: 0,
        inversiones: [],
        invertirCooldown: 0
      }
    }

    const user = chat.users[m.sender]
    if (!user.inversiones) user.inversiones = []
    if (!user.invertirCooldown) user.invertirCooldown = 0

    const userGlobal = db.users[m.sender] || {}
    const esPremium = userGlobal?.premiumTime && userGlobal.premiumTime > Date.now()

    const maxInversiones = esPremium ? 5 : 1

    const botId = client.user.id.split(':')[0] + '@s.whatsapp.net'
    const moneda = db.settings?.[botId]?.currency || 'Coins'

    const now = Date.now()

    if (!esPremium && user.invertirCooldown > now)
      return m.reply(`◇ Debes esperar ${ms(user.invertirCooldown - now)} antes de volver a invertir.`)

    if (user.inversiones.length >= maxInversiones)
      return m.reply(
        esPremium
          ? '◇ Ya alcanzaste el máximo de 5 inversiones activas.'
          : '◇ Solo puedes tener 1 inversión activa.\n◇ Con premium puedes tener hasta 5.'
      )

    if (!args[0])
      return m.reply('◇ Ingresa la cantidad a invertir.')

    const cantidad = Number(args[0].replace(/[^0-9]/g, ''))
    if (!cantidad || cantidad <= 0)
      return m.reply('▣ Cantidad inválida.')

    if (cantidad > user.coins)
      return m.reply(`▣ No tienes suficiente ${moneda}.`)

    user.coins -= cantidad

    if (!esPremium) {
      user.invertirCooldown = now + 10 * 60 * 1000
    }

    const duracion = 60 * 1000 + Math.floor(Math.random() * 60 * 1000)
    const inversionId = Date.now() + Math.floor(Math.random() * 1000)

    user.inversiones.push({
      id: inversionId,
      cantidad
    })

    m.reply(
      `◇ Has invertido ¥${cantidad.toLocaleString()} ${moneda}.\n` +
      `◇ Inversiones activas: ${user.inversiones.length}/${maxInversiones}\n` +
      `◇ Resultado en 1-2 minutos.`
    )

    setTimeout(() => {

      const index = user.inversiones.findIndex(i => i.id === inversionId)
      if (index === -1) return

      user.inversiones.splice(index, 1)

      const r = Math.random()
      let resultado = 0
      let mensaje = ''

      if (r < 0.10) {
        resultado = cantidad * (1.8 + Math.random() * 0.2)
        mensaje = '◇ Inversión excelente. El mercado explotó a tu favor.'
      }
      else if (r < 0.35) {
        resultado = cantidad * (1.4 + Math.random() * 0.2)
        mensaje = '◇ Buen rendimiento. Obtviste ganancias sólidas.'
      }
      else if (r < 0.65) {
        resultado = cantidad * (1 + Math.random() * 0.1)
        mensaje = '◇ Ganancia moderada.'
      }
      else if (r < 0.85) {
        resultado = -cantidad * (0.1 + Math.random() * 0.2)
        mensaje = '◇ Pequeña caída del mercado.'
      }
      else {
        resultado = -cantidad * (0.4 + Math.random() * 0.1)
        mensaje = '◇ Fuerte caída. La inversión perdió bastante valor.'
      }

      resultado = Math.floor(resultado)
      if (resultado + cantidad < 0) resultado = -cantidad

      user.coins += cantidad + resultado

      client.reply(
        m.chat,
        `◇ Resultado de inversión\n\n` +
        `Capital inicial: ¥${cantidad.toLocaleString()} ${moneda}\n` +
        `${mensaje}\n` +
        `Resultado final: ${resultado >= 0 ? '+' : ''}${(cantidad + resultado).toLocaleString()} ${moneda}`,
        m
      )

    }, duracion)
  }
}

function ms(ms) {
  if (ms <= 0) return 'Ahora.'
  const totalSeconds = Math.floor(ms / 1000)
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60
  const parts = []
  if (hours > 0) parts.push(`${hours}h`)
  if (minutes > 0) parts.push(`${minutes}m`)
  if (seconds > 0) parts.push(`${seconds}s`)
  return parts.join(' ')
}