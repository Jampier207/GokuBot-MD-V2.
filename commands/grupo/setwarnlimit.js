export default {
  command: ['setwarnlimit'],
  category: 'grupo',
  isAdmin: true,
  run: async (...args) => {
    const conn = args.find(a => a?.user) || global.conn
    const m = args.find(a => a?.key?.remoteJid)
    const usedprefix = args.find(a => typeof a === 'string') || global.prefix || '.'
    if (!conn || !m) return

    const chatId = m.key.remoteJid

    if (!global.db?.data?.chats) global.db.data.chats = {}
    if (!global.db.data.chats[chatId]) {
      global.db.data.chats[chatId] = {
        warnLimit: 0,
        expulsar: false
      }
    }

    const chat = global.db.data.chats[chatId]

    const text =
      m.message?.conversation ||
      m.message?.extendedTextMessage?.text ||
      ''

    const raw = text.split(/\s+/)[1]
    const limit = parseInt(raw)

    const reply = txt =>
      conn.sendMessage(chatId, { text: txt }, { quoted: m })

    if (isNaN(limit) || limit < 0 || limit > 10) {
      return reply(
        `⚠️ *Límite inválido*\n\n` +
        `📌 El límite debe ser un número entre *1* y *10*\n` +
        `🛑 Usa *0* para desactivar la expulsión automática\n\n` +
        `✨ Ejemplos:\n` +
        `➤ *${usedprefix}setwarnlimit 5*\n` +
        `➤ *${usedprefix}setwarnlimit 0*\n\n` +
        `🔥 Estado actual: ${
          chat.expulsar
            ? `\`${chat.warnLimit}\` advertencias`
            : '`Desactivado`'
        }`
      )
    }

    if (limit === 0) {
      chat.warnLimit = 0
      chat.expulsar = false
      return reply(
        `🛑 *Expulsión automática desactivada*\n\n` +
        `Los usuarios ya no serán eliminados por advertencias.`
      )
    }

    chat.warnLimit = limit
    chat.expulsar = true

    return reply(
      `✅ *Límite actualizado*\n\n` +
      `⚠️ Advertencias máximas: *${limit}*\n` +
      `🚨 Los usuarios serán *expulsados automáticamente* al alcanzar este límite.`
    )
  }
}