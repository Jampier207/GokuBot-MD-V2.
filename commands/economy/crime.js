export default {
  command: ['crime'],
  category: 'rpg',
  run: async (client, m) => {
    if (!m?.sender) return

    const chat = global.db.data.chats[m.chat]
    if (!chat) return

    if (chat.adminonly || !chat.rpg)
      return m.reply('◬ El modo RPG está desactivado en este grupo.')

    if (!chat.users[m.sender]) {
      chat.users[m.sender] = {
        coins: 0,
        bank: 0,
        crimeCooldown: 0
      }
    }

    const user = chat.users[m.sender]
    const botId = client.user.id.split(':')[0] + '@s.whatsapp.net'
    const monedas = global.db.data.settings?.[botId]?.currency || 'Coins'

    const now = Date.now()

    const baseCooldown = 10 * 60 * 1000
    const cooldown = global.applyCooldown(baseCooldown, m.sender)

    const restante = user.crimeCooldown - now

    if (restante > 0)
      return m.reply(`◭ Debes esperar ${msToTime(restante)} antes de intentar nuevamente.`)

    user.crimeCooldown = now + cooldown

    const exito = Math.random() < 0.5
    const cantidad = Math.floor(Math.random() * 5000) + 500

    const successMessages = [
      `Realizaste un atraco perfecto y ganaste ${cantidad.toLocaleString()} ${monedas}.`,
      `Hackeaste un sistema bancario y obtuviste ${cantidad.toLocaleString()} ${monedas}.`,
      `Ejecutaste un plan maestro y conseguiste ${cantidad.toLocaleString()} ${monedas}.`
    ]

    const failMessages = [
      `La policía te atrapó y perdiste ${cantidad.toLocaleString()} ${monedas}.`,
      `El golpe salió mal y perdiste ${cantidad.toLocaleString()} ${monedas}.`,
      `Fuiste delatado y perdiste ${cantidad.toLocaleString()} ${monedas}.`
    ]

    if (exito) {
      user.coins += cantidad
      return client.reply(
        m.chat,
        `◮ ${successMessages[Math.floor(Math.random() * successMessages.length)]}`,
        m
      )
    } else {
      const total = user.coins + user.bank

      if (total >= cantidad) {
        if (user.coins >= cantidad) {
          user.coins -= cantidad
        } else {
          const rest = cantidad - user.coins
          user.coins = 0
          user.bank -= rest
        }
      } else {
        user.coins = 0
        user.bank = 0
      }

      return client.reply(
        m.chat,
        `◯ ${failMessages[Math.floor(Math.random() * failMessages.length)]}`,
        m
      )
    }
  }
}

function msToTime(ms) {
  const m = Math.floor(ms / 60000)
  const s = Math.floor((ms % 60000) / 1000)
  return `${m} minuto${m !== 1 ? 's' : ''}, ${s} segundo${s !== 1 ? 's' : ''}`
}