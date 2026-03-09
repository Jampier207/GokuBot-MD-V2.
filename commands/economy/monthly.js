export default {
  command: ['monthly', 'mensual'],
  category: 'rpg',
  run: async (client, m) => {
    if (!m?.sender || !m?.chat) return

    const db = global.db.data

    const botId = client.user.id.split(':')[0] + '@s.whatsapp.net'
    const settings = db.settings?.[botId] || {}
    const monedas = settings.currency || 'Coins'

    if (!db.chats[m.chat]) db.chats[m.chat] = {}
    const chat = db.chats[m.chat]

    if (chat.adminonly || !chat.rpg)
      return m.reply('∆ Estos comandos están desactivados en este grupo.')

    if (!chat.users) chat.users = {}
    if (!chat.users[m.sender]) {
      chat.users[m.sender] = {
        coins: 0,
        lastMonthly: 0
      }
    }

    const user = chat.users[m.sender]

    const MONTHLY_COOLDOWN = 30 * 24 * 60 * 60 * 1000
    const now = Date.now()

    if (user.lastMonthly && now - user.lastMonthly < MONTHLY_COOLDOWN) {
      const restante = MONTHLY_COOLDOWN - (now - user.lastMonthly)
      return m.reply(
        `⌛ Ya reclamaste tu recompensa mensual.\n\n↻ Vuelve en *${msToTime(restante)}*.`
      )
    }

    const coins = 120000

    user.lastMonthly = now
    user.coins += coins

    const texto = `▒ *RECOMPENSA MENSUAL*

¤ ${monedas}: *${coins.toLocaleString()}*

↺ Vuelve en 30 días para reclamar otra recompensa.`

    return client.reply(m.chat, texto, m)
  }
}

function msToTime(ms) {
  const d = Math.floor(ms / (1000 * 60 * 60 * 24))
  const h = Math.floor((ms / (1000 * 60 * 60)) % 24)
  const m = Math.floor((ms / (1000 * 60)) % 60)
  const s = Math.floor((ms / 1000) % 60)

  return `${d}d ${h}h ${m}m ${s}s`
}