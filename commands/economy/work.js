export default {
  command: ['w', 'work'],
  category: 'rpg',
  run: async (client, m) => {
    if (!m?.sender) return

    const chat = global.db.data.chats[m.chat]
    if (!chat) return

    if (chat.adminonly || !chat.rpg)
      return m.reply('▤ Estos comandos están desactivados en este grupo.')

    if (!chat.users[m.sender]) {
      chat.users[m.sender] = {
        coins: 0,
        workCooldown: 0
      }
    }

    const user = chat.users[m.sender]
    const botId = client.user.id.split(':')[0] + '@s.whatsapp.net'
    const monedas = global.db.data.settings?.[botId]?.currency || 'Coins'

    const now = Date.now()
    const restante = user.workCooldown - now
    if (restante > 0)
      return m.reply(`▥ Debes esperar ${msToTime(restante)} para trabajar de nuevo.`)

    user.workCooldown = now + global.applyCooldown(10 * 60 * 1000, m.sender)

    const recompensa = Math.floor(Math.random() * 5000) + 500
    user.coins += recompensa

    await client.sendContextInfoIndex(
      m.chat,
      `▦ ${pickRandom(trabajo)} *¥${recompensa.toLocaleString()} ${monedas}*.`,
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
  return `${m} minuto${m !== 1 ? 's' : ''}, ${s} segundo${s !== 1 ? 's' : ''}`
}

function pickRandom(list) {
  return list[Math.floor(Math.random() * list.length)]
}

const trabajo = [
  'Trabajaste recolectando lechugas en el campo de Goku y ganaste',
  'Ayudaste en el taller de cápsulas de Bulma y obtuviste',
  'Diseñaste planos para la Corporación Cápsula y ganaste',
  'Tomaste fotos durante un torneo y recibiste',
  'Trabajaste cuidando mascotas exóticas y ganaste',
  'Narraste historias antiguas y obtuviste',
  'Colaboraste en un proyecto especial y ganaste',
  'Trabajaste como jardinero y recibiste',
  'Fuiste DJ en una fiesta y ganaste',
  'Pintaste un mural y te dieron'
]