const msToTime = (ms) => {
  const m = Math.floor(ms / 60000)
  const s = Math.floor((ms % 60000) / 1000)
  if (m === 0) return `${s} segundo${s !== 1 ? 's' : ''}`
  return `${m} minuto${m !== 1 ? 's' : ''}, ${s} segundo${s !== 1 ? 's' : ''}`
}

export default {
  command: ['slut'],
  category: 'rpg',
  run: async (client, m) => {
    if (!m?.sender) return

    const db = global.db.data
    const chat = db.chats[m.chat]
    if (!chat) return

    if (chat.adminonly || !chat.rpg)
      return m.reply('⟣ Estos comandos están desactivados en este grupo.')

    if (!chat.users[m.sender]) {
      chat.users[m.sender] = {
        coins: 0,
        bank: 0,
        slutCooldown: 0
      }
    }

    const user = chat.users[m.sender]
    const botId = client.user.id.split(':')[0] + '@s.whatsapp.net'
    const currency = db.settings?.[botId]?.currency || 'Coins'

    const now = Date.now()
    const remaining = user.slutCooldown - now
    if (remaining > 0)
      return m.reply(`⟡ Debes esperar ${msToTime(remaining)} antes de intentar nuevamente.`)

    const baseCooldown = 10 * 60 * 1000
    const cooldown = global.applyCooldown(baseCooldown, m.sender)

    user.slutCooldown = now + cooldown

    const amount = Math.floor(Math.random() * 5000) + 500
    const success = Math.random() < 0.5

    const winMessages = [
      `Organizaste un show privado y ganaste ${amount.toLocaleString()} ${currency}`,
      `Tu actuación fue un éxito y ganaste ${amount.toLocaleString()} ${currency}`,
      `Te llovieron propinas y ganaste ${amount.toLocaleString()} ${currency}`,
      `Tu carisma conquistó al público y ganaste ${amount.toLocaleString()} ${currency}`
    ]

    const loseMessages = [
      `La noche salió mal y perdiste ${amount.toLocaleString()} ${currency}`,
      `Un cliente problemático arruinó todo y perdiste ${amount.toLocaleString()} ${currency}`,
      `El show fue un fracaso y perdiste ${amount.toLocaleString()} ${currency}`
    ]

    if (success) {
      user.coins += amount
      await client.reply(
        m.chat,
        `⟠ RESULTADO\n\n⟢ ${winMessages[Math.floor(Math.random() * winMessages.length)]}`,
        m
      )
    } else {
      const total = user.coins + user.bank
      const loss = Math.min(amount, total)

      if (user.coins >= loss) {
        user.coins -= loss
      } else {
        const rest = loss - user.coins
        user.coins = 0
        user.bank -= rest
      }

      await client.reply(
        m.chat,
        `⟠ RESULTADO\n\n⟤ ${loseMessages[Math.floor(Math.random() * loseMessages.length)]}`,
        m
      )
    }
  }
}