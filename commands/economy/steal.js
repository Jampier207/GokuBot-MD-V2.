import { resolveLidToRealJid } from "../../lib/utils.js"

export default {
  command: ['steal', 'rob', 'robar'],
  category: 'rpg',
  run: async (client, m) => {
    const db = global.db.data
    const chatId = m.chat
    const botId = client.user.id.split(':')[0] + '@s.whatsapp.net'
    const monedas = db.settings?.[botId]?.currency || 'Coins'
    const chatData = db.chats?.[chatId]

    if (!chatData || chatData.adminonly || !chatData.rpg)
      return m.reply('⛨ Estos comandos están desactivados en este grupo.')

    if (!chatData.users) chatData.users = {}

    const mentioned =
      m.mentionedJid?.[0] ||
      (m.quoted ? m.quoted.sender : null)

    if (!mentioned)
      return m.reply(`⌬ Debes mencionar a alguien para robarle ${monedas}.`)

    const target = await resolveLidToRealJid(mentioned, client, chatId)

    if (target === m.sender)
      return m.reply('⌬ No puedes robarte a ti mismo.')

    if (!chatData.users[m.sender])
      chatData.users[m.sender] = { coins: 0, roboCooldown: 0 }

    if (!chatData.users[target])
      return m.reply('⌬ El usuario mencionado no está registrado.')

    const senderData = chatData.users[m.sender]
    const targetData = chatData.users[target]

    if (targetData.coins < 50)
      return m.reply(
        `⌁ ${db.users[target]?.name || target.split('@')[0]} no tiene suficientes ${monedas}.`
      )

    const now = Date.now()
    if (senderData.roboCooldown > now)
      return m.reply(
        `⌁ Debes esperar ${msToTime(senderData.roboCooldown - now)} para volver a robar.`
      )

    senderData.roboCooldown = now + global.applyCooldown(10 * 60 * 1000, m.sender)

    const cantidadRobada = Math.min(
      Math.floor(Math.random() * 5000) + 50,
      targetData.coins
    )

    senderData.coins += cantidadRobada
    targetData.coins -= cantidadRobada

    await client.sendMessage(
      chatId,
      {
        text: `⛨ Le robaste *${cantidadRobada.toLocaleString()} ${monedas}* a *${db.users[target]?.name || target.split('@')[0]}*.`,
        mentions: [target],
      },
      { quoted: m }
    )
  },
}

function msToTime(ms) {
  const s = Math.floor((ms / 1000) % 60)
  const m = Math.floor((ms / 60000) % 60)
  return `${m} minuto${m !== 1 ? 's' : ''}, ${s} segundo${s !== 1 ? 's' : ''}`
}