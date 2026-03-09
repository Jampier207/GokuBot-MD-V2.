export default {
  command: ['ppt'],
  category: 'rpg',

  run: async (client, m, args, usedPrefix) => {
    if (!m?.sender) return

    const db = global.db.data
    const chat = db.chats[m.chat]
    if (!chat) return
    if (!chat.users) chat.users = {}

    if (chat.adminonly || !chat.rpg)
      return m.reply('◆ El juego está desactivado.')

    if (!chat.users[m.sender]) {
      chat.users[m.sender] = {
        coins: 0,
        exp: 0,
        pptCooldown: 0
      }
    }

    const user = chat.users[m.sender]
    if (!user.pptCooldown) user.pptCooldown = 0

    const botId = client.user.id.split(':')[0] + '@s.whatsapp.net'
    const moneda = db.settings?.[botId]?.currency || 'Coins'

    const now = Date.now()
    const baseCooldown = 10 * 60 * 1000
    const cooldown = global.applyCooldown(baseCooldown, m.sender)

    const remaining = user.pptCooldown - now
    if (remaining > 0)
      return m.reply(`⌛ Espera *${msToTime(remaining)}* para volver a jugar.`)

    const opciones = ['piedra', 'papel', 'tijera']
    const userPick = (args[0] || '').toLowerCase()

    if (!opciones.includes(userPick))
      return m.reply(`◇ Uso:\n${usedPrefix}ppt piedra | papel | tijera`)

    user.pptCooldown = now + cooldown

    const botPick = opciones[Math.floor(Math.random() * opciones.length)]
    const result = winner(userPick, botPick)

    const reward = Math.floor(Math.random() * 3000) + 500
    const exp = Math.floor(Math.random() * 800) + 200

    if (result === 'WIN') {
      user.coins += reward
      user.exp += exp
      return client.reply(
        m.chat,
        `◆ RESULTADO: VICTORIA\n\n` +
        `▣ Tú: ${userPick}\n` +
        `▣ Bot: ${botPick}\n\n` +
        `▲ +${reward.toLocaleString()} ${moneda}\n` +
        `◆ +${exp} EXP`,
        m
      )
    }

    if (result === 'LOSE') {
      user.coins = Math.max(0, user.coins - reward)
      return client.reply(
        m.chat,
        `◆ RESULTADO: DERROTA\n\n` +
        `▣ Tú: ${userPick}\n` +
        `▣ Bot: ${botPick}\n\n` +
        `▼ -${reward.toLocaleString()} ${moneda}`,
        m
      )
    }

    user.coins += 200
    user.exp += 200

    return client.reply(
      m.chat,
      `◆ RESULTADO: EMPATE\n\n` +
      `▣ Ambos: ${userPick}\n\n` +
      `● +200 ${moneda}\n` +
      `◆ +200 EXP`,
      m
    )
  }
}

function winner(u, b) {
  if (u === b) return 'DRAW'
  if (
    (u === 'piedra' && b === 'tijera') ||
    (u === 'papel' && b === 'piedra') ||
    (u === 'tijera' && b === 'papel')
  ) return 'WIN'
  return 'LOSE'
}

function msToTime(ms) {
  const m = Math.floor(ms / 60000)
  const s = Math.floor((ms % 60000) / 1000)
  if (m === 0) return `${s} segundo${s !== 1 ? 's' : ''}`
  return `${m} minuto${m !== 1 ? 's' : ''}, ${s} segundo${s !== 1 ? 's' : ''}`
}