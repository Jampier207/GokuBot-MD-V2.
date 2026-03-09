const msToTime = (duration) => {
  const seconds = Math.floor((duration / 1000) % 60)
  const minutes = Math.floor((duration / (1000 * 60)) % 60)
  const hours = Math.floor((duration / (1000 * 60 * 60)) % 24)
  const days = Math.floor(duration / (1000 * 60 * 60 * 24))

  const pad = (n) => n.toString().padStart(2, '0')
  return `${days} d y ${pad(hours)} h ${pad(minutes)} m y ${pad(seconds)} s`
}

export default {
  command: ['weekly', 'semanal'],
  category: 'rpg',
  run: async (client, m) => {
    const db = global.db.data
    const chatId = m.chat
    const botId = client.user.id.split(':')[0] + '@s.whatsapp.net'
    const botSettings = db.settings[botId]
    const chatData = db.chats[chatId]

    if (chatData.adminonly || !chatData.rpg)
      return m.reply(`✶ Estos comandos estan desactivados en este grupo.`)

    const user = chatData.users[m.sender]
    const cooldown = 7 * 24 * 60 * 60 * 1000
    const lastClaim = user.lastWeekly || 0

    if (Date.now() - lastClaim < cooldown) {
      const timeLeft = msToTime(cooldown - (Date.now() - lastClaim))
      return client.reply(
        chatId,
        `✷ Debes esperar ${timeLeft} para volver a reclamar tu recompensa semanal`,
        m
      )
    }

    user.lastWeekly = Date.now()

    const coins = 100000
    const exp = 10000
    const currency = botSettings.currency || 'Monedas'

    const message = `✺  RECOMPENSA SEMANAL  ✺

✹ Exp › ${exp.toLocaleString()}
✹ ${currency} › ${coins.toLocaleString()}

${dev}`.trim()

    await client.sendContextInfoIndex(m.chat, message, {}, m, true, {})

    user.exp = (user.exp || 0) + exp
    user.coins = (user.coins || 0) + coins
  },
}