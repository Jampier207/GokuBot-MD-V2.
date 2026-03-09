import { resolveLidToRealJid } from "../../lib/utils.js"

export default {
  command: ['balance', 'bal'],
  category: 'rpg',

  run: async (client, m, args) => {
    const db = global.db.data
    const prefix =
      m.usedPrefix ||
      (m.text?.[0]?.match(/^[./#!]/) ? m.text[0] : '')

    if (!m.chat || !m.sender)
      return m.reply('◧ Error interno.')

    const chatId = m.chat
    const sender = m.sender
    const chatData = db.chats?.[chatId]

    if (!chatData)
      return m.reply('◨ Chat no registrado.')

    if (chatData.adminonly || !chatData.rpg)
      return m.reply('◩ Comandos RPG desactivados.')

    const botId = client.user.id.split(':')[0] + '@s.whatsapp.net'
    const moneda = db.settings?.[botId]?.currency || 'Monedas'

    const mentioned = m.mentionedJid || []
    const target =
      mentioned[0] ||
      (m.quoted ? m.quoted.sender : sender)

    const who = await resolveLidToRealJid(target, client, chatId)

    if (!chatData.users?.[who])
      return m.reply('◪ Usuario no registrado.')

    const user = chatData.users[who]
    const coins = user.coins || 0
    const bank = user.bank || 0
    const total = coins + bank
    const name = db.users?.[who]?.name || 'Usuario'

    const text = `◫ BALANCE ECONÓMICO
════════════════
Usuario: ${name}

Efectivo: ${coins.toLocaleString()} ${moneda}
Banco: ${bank.toLocaleString()} ${moneda}

Total: ${total.toLocaleString()} ${moneda}

Usa ${prefix}deposit para proteger tu dinero`

    await client.sendMessage(chatId, { text }, { quoted: m })
  }
}
