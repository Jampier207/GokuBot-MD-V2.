export default {
  command: ['mine'],
  category: 'rpg',

  run: async (client, m) => {
    if (!m?.sender) return

    const db = global.db.data
    const chat = db.chats[m.chat]
    if (!chat) return
    if (!chat.users) chat.users = {}

    if (chat.adminonly || !chat.rpg)
      return m.reply('✦ Los comandos RPG están desactivados en este grupo.')

    if (!chat.users[m.sender]) {
      chat.users[m.sender] = {
        coins: 0,
        mineCooldown: 0
      }
    }

    const user = chat.users[m.sender]

    if (!user.mineCooldown) user.mineCooldown = 0

    const botId = client.user.id.split(':')[0] + '@s.whatsapp.net'
    const moneda = db.settings?.[botId]?.currency || 'Coins'

    const now = Date.now()
    const baseCooldown = 10 * 60 * 1000
    const cooldown = global.applyCooldown(baseCooldown, m.sender)

    const remaining = user.mineCooldown - now
    if (remaining > 0)
      return m.reply(`⛏️ Espera *${msToTime(remaining)}* para minar otra vez.`)

    user.mineCooldown = now + cooldown

    const reward = Math.floor(Math.random() * 4500) + 500
    user.coins += reward

    const mensajes = [
      'Excavaste profundamente en una cueva olvidada',
      'Golpeaste una roca brillante llena de minerales',
      'Encontraste un filón oculto bajo tierra',
      'Minaste en una montaña peligrosa',
      'Exploraste una mina abandonada',
      'Rompiste una piedra rara con tu pico',
      'Descubriste un túnel secreto lleno de recursos',
      'Trabajaste duro bajo tierra durante horas',
      'Hallaste minerales valiosos entre escombros',
      'La suerte estuvo de tu lado en la mina'
    ]

    const texto = mensajes[Math.floor(Math.random() * mensajes.length)]

    await client.reply(
      m.chat,
      `⛏️ ${texto}\n💰 Obtuviste *${reward.toLocaleString()} ${moneda}*`,
      m
    )
  }
}

function msToTime(ms) {
  const m = Math.floor(ms / 60000)
  const s = Math.floor((ms % 60000) / 1000)
  if (m === 0) return `${s} segundo${s !== 1 ? 's' : ''}`
  return `${m} minuto${m !== 1 ? 's' : ''}, ${s} segundo${s !== 1 ? 's' : ''}`
}