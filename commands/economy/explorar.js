export default {
  command: ['explorar'],
  category: 'rpg',
  run: async (client, m) => {
    if (!m?.sender) return

    const chat = global.db.data.chats[m.chat]
    if (!chat) return
    if (chat.adminonly || !chat.rpg)
      return m.reply('◧ El modo RPG está desactivado aquí.')

    if (!chat.users[m.sender]) {
      chat.users[m.sender] = {
        coins: 0,
        bank: 0,
        explorarCooldown: 0,
        premium: false
      }
    }

    const user = chat.users[m.sender]
    const botId = client.user.id.split(':')[0] + '@s.whatsapp.net'
    const monedas = global.db.data.settings?.[botId]?.currency || 'Coins'

    const now = Date.now()
    const cooldownTime = user.premium ? 5 * 60 * 1000 : 10 * 60 * 1000

    if (user.explorarCooldown > now) {
      const restante = user.explorarCooldown - now
      return m.reply(`◔ Espera ${msToTime(restante)} para volver a explorar.`)
    }

    user.explorarCooldown = now + cooldownTime

    const eventos = [
      { tipo: 'g', texto: 'Exploraste unas ruinas y encontraste' },
      { tipo: 'g', texto: 'Descubriste un cofre oculto con' },
      { tipo: 'g', texto: 'Investigaste una cueva y obtuviste' },
      { tipo: 'g', texto: 'Hallaste un tesoro perdido con' },
      { tipo: 'p', texto: 'Te emboscaron en el bosque y perdiste' },
      { tipo: 'p', texto: 'Caíste en una trampa y dejaste' },
      { tipo: 'p', texto: 'Un ladrón te robó' }
    ]

    const evento = eventos[Math.floor(Math.random() * eventos.length)]

    if (evento.tipo === 'p') {

      if (user.coins > 0) {
        const maxPerdida = Math.min(3000, user.coins)
        const quitar = Math.floor(Math.random() * maxPerdida) + 1
        user.coins -= quitar

        return client.sendContextInfoIndex(
          m.chat,
          `◘ ${evento.texto} ${quitar.toLocaleString()} ${monedas}`,
          {},
          m,
          true,
          {}
        )
      }

      if (user.bank > 0) {
        const maxPerdidaBanco = Math.min(3000, user.bank)
        const quitar = Math.floor(Math.random() * maxPerdidaBanco) + 1
        user.bank -= quitar

        return client.sendContextInfoIndex(
          m.chat,
          `◘ ${evento.texto} ${quitar.toLocaleString()} ${monedas} del banco`,
          {},
          m,
          true,
          {}
        )
      }

      return client.sendContextInfoIndex(
        m.chat,
        `◙ ${evento.texto} pero no tenías nada que perder`,
        {},
        m,
        true,
        {}
      )
    }

    const cantidad = Math.floor(Math.random() * 5000) + 1
    user.coins += cantidad

    return client.sendContextInfoIndex(
      m.chat,
      `◍ ${evento.texto} ${cantidad.toLocaleString()} ${monedas}`,
      {},
      m,
      true,
      {}
    )
  }
}

function msToTime(ms) {
  const m = Math.floor(ms / 60000)
  const s = Math.floor((ms % 60000) / 1000)
  return `${m}m ${s}s`
}