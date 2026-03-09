const msToTime = (duration) => {
  const seconds = Math.floor((duration / 1000) % 60)
  const minutes = Math.floor((duration / (1000 * 60)) % 60)

  const pad = (n) => n.toString().padStart(2, '0')
  if (minutes === 0) return `${pad(seconds)} segundo${seconds !== 1 ? 's' : ''}`
  return `${pad(minutes)} minuto${minutes !== 1 ? 's' : ''}, ${pad(seconds)} segundo${seconds !== 1 ? 's' : ''}`
}

export default {
  command: ['rt', 'roulette', 'ruleta'],
  category: 'rpg',
  run: async (client, m, args) => {
    if (!m?.sender) return

    const db = global.db.data
    const chatId = m.chat
    const senderId = m.sender
    const botId = client.user.id.split(':')[0] + '@s.whatsapp.net'
    const botSettings = db.settings[botId]
    const chatData = db.chats[chatId]

    if (chatData.adminonly || !chatData.rpg)
      return m.reply('» El casino se encuentra cerrado «')

    if (!chatData.users[senderId]) {
      chatData.users[senderId] = {
        coins: 0,
        rtCooldown: 0
      }
    }

    const user = chatData.users[senderId]
    if (!user.rtCooldown) user.rtCooldown = 0

    const currency = botSettings?.currency || 'Monedas'
    const now = Date.now()
    const cooldown = 10 * 60 * 1000
    const remaining = user.rtCooldown - now

    if (remaining > 0)
      return m.reply(`≈ Debes esperar *${msToTime(remaining)}* antes de apostar nuevamente ≈`)

    if (args.length !== 2)
      return m.reply(`• Uso correcto: ruleta *cantidad* red | black | green •`)

    const amount = parseInt(args[0])
    const color = args[1].toLowerCase()
    const validColors = ['red', 'black', 'green']

    if (isNaN(amount) || amount < 200)
      return m.reply(`≈ Apuesta mínima: 200 ${currency} ≈`)

    if (!validColors.includes(color))
      return m.reply(`≈ Colores válidos: red, black, green ≈`)

    if (user.coins < amount)
      return m.reply(`• No tienes suficientes ${currency} •`)

    user.rtCooldown = now + cooldown

    const rand = Math.random() * 100
    let resultColor

    if (rand < 50) resultColor = 'red'
    else if (rand < 80) resultColor = 'black'
    else resultColor = 'green'

    let multiplier = 2
    if (resultColor === 'green') multiplier = 14

    if (resultColor === color) {
      const reward = Math.floor(amount * multiplier)
      user.coins += reward

      await client.reply(
        chatId,
        `• La ruleta salió en *${resultColor.toUpperCase()}* y ganaste ${reward.toLocaleString()} ${currency}`,
        m,
        { mentions: [senderId] }
      )
    } else {
      user.coins -= amount

      await client.reply(
        chatId,
        `• La ruleta salió en *${resultColor.toUpperCase()}* y perdiste ${amount.toLocaleString()} ${currency}`,
        m,
        { mentions: [senderId] }
      )
    }
  },
}