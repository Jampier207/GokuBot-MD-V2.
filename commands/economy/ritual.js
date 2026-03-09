export default {
  command: ['ritual'],
  category: 'rpg',
  run: async (client, m) => {
    if (!m?.sender) return

    const db = global.db.data
    const botId = client?.user?.id.split(':')[0] + '@s.whatsapp.net'
    const monedas = db.settings?.[botId]?.currency || 'Coins'

    const chat = db.chats[m.chat]
    if (!chat) return
    if (!chat.users) chat.users = {}

    if (chat.adminonly || !chat.rpg)
      return m.reply('◆ El sistema RPG está desactivado.')

    if (!chat.users[m.sender]) {
      chat.users[m.sender] = {
        coins: 0,
        ritualCooldown: 0
      }
    }

    const user = chat.users[m.sender]
    if (!user.ritualCooldown) user.ritualCooldown = 0

    const now = Date.now()
    const baseCooldown = 15 * 60 * 1000
    const cooldown = global.applyCooldown(baseCooldown, m.sender)

    const remaining = user.ritualCooldown - now
    if (remaining > 0)
      return m.reply(`⌛ Debes esperar *${msToTime(remaining)}* para invocar otro ritual.`)

    user.ritualCooldown = now + cooldown

    const roll = Math.random()
    let reward = 0
    let narration = ''
    let bonusMsg = ''

    if (roll < 0.05) {
      reward = Math.floor(Math.random() * 100000) + 50000
      narration = '✦ Has invocado una entidad ancestral que libera un tesoro arcano'
      bonusMsg = '\n◆ RECOMPENSA MÍTICA OBTENIDA'
    } 
    else if (roll < 0.25) {
      reward = Math.floor(Math.random() * 10000) + 2000
      narration = '◇ El portal dimensional colapsa en riquezas ardientes'
    } 
    else if (roll < 0.75) {
      reward = Math.floor(Math.random() * 5000) + 500
      narration = '◈ Las energías ocultas responden a tu llamado'
    } 
    else {
      const loss = Math.floor(Math.random() * 2000) + 500
      user.coins = Math.max(0, user.coins - loss)
      return m.reply(
        `✖ El ritual se distorsionó...\n` +
        `▼ Maldición activa: -${loss.toLocaleString()} ${monedas}`
      )
    }

    if (Math.random() < 0.15) {
      const bonus = Math.floor(Math.random() * 4000) + 1000
      reward += bonus
      bonusMsg += `\n✧ Energía adicional: +${bonus.toLocaleString()} ${monedas}`
    }

    user.coins += reward

    let msg =
      `✦ RITUAL COMPLETADO\n\n` +
      `${narration}\n\n` +
      `▲ Ganancia: +${reward.toLocaleString()} ${monedas}`

    if (bonusMsg) msg += `\n${bonusMsg}`

    await client.reply(m.chat, msg, m)
  },
}

function msToTime(duration) {
  let seconds = Math.floor((duration / 1000) % 60)
  let minutes = Math.floor((duration / (1000 * 60)) % 60)
  minutes = minutes < 10 ? '0' + minutes : minutes
  seconds = seconds < 10 ? '0' + seconds : seconds
  if (minutes === '00') return `${seconds} segundo${seconds > 1 ? 's' : ''}`
  return `${minutes} minuto${minutes > 1 ? 's' : ''}, ${seconds} segundo${seconds > 1 ? 's' : ''}`
}