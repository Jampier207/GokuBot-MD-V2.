import { resolveLidToRealJid } from "../../lib/utils.js"

export default {
  command: ['warns'],
  category: 'grupo',
  isAdmin: true,
  run: async (...args) => {
    const conn = args.find(a => a?.user) || global.conn
    const m = args.find(a => a?.key?.remoteJid)
    if (!conn || !m) return

    const chatId = m.key.remoteJid

    if (!global.db?.data?.chats) global.db.data.chats = {}
    if (!global.db.data.chats[chatId]) global.db.data.chats[chatId] = {}
    if (!global.db.data.chats[chatId].users) global.db.data.chats[chatId].users = {}

    const chat = global.db.data.chats[chatId]

    const reply = (text, mentions = []) =>
      conn.sendMessage(chatId, { text, mentions }, { quoted: m })

    const context = m.message?.extendedTextMessage?.contextInfo
    const mentioned = context?.mentionedJid || []

    const who2 = mentioned.length
      ? mentioned[0]
      : context?.participant || false

    if (!who2) {
      return reply(
        '⚠️ *Uso incorrecto*\n\n' +
        '👤 Menciona o responde al mensaje del usuario para ver sus advertencias.'
      )
    }

    const userId = await resolveLidToRealJid(who2, conn, chatId)

    if (!chat.users[userId] || !Array.isArray(chat.users[userId].warnings)) {
      return reply(
        `ℹ️ @${userId.split('@')[0]} no tiene advertencias registradas.`,
        [userId]
      )
    }

    const user = chat.users[userId]
    const total = user.warnings.length

    if (total === 0) {
      return reply(
        `ℹ️ @${userId.split('@')[0]} no tiene advertencias registradas.`,
        [userId]
      )
    }

    const name = global.db.data.users?.[userId]?.name || 'Usuario'

    const warningList = user.warnings
      .map((w, i) => {
        const index = total - i
        const author = w.by ? `\n👮 Por: @${w.by.split('@')[0]}` : ''
        return (
          `🔸 *#${index}*\n` +
          `📝 Motivo: ${w.reason}\n` +
          `🕒 Fecha: ${w.timestamp}${author}`
        )
      })
      .join('\n\n')

    const mentions = [
      userId,
      ...user.warnings.map(w => w.by).filter(Boolean)
    ]

    return reply(
      `📋 *Historial de Advertencias*\n\n` +
      `👤 Usuario: @${userId.split('@')[0]} (${name})\n` +
      `⚠️ Total: *${total}*\n\n` +
      `${warningList}`,
      mentions
    )
  }
}