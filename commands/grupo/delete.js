export default {
  command: ['delete', 'del'],
  category: 'grupo',
  isAdmin: true,
  botAdmin: true,
  run: async (...args) => {
    const conn = args.find(a => a?.user) || global.conn
    const m = args.find(a => a?.key?.remoteJid)
    if (!conn || !m) return

    const chatId = m.key.remoteJid

    const reply = text =>
      conn.sendMessage(chatId, { text }, { quoted: m })

    const quoted = m.message?.extendedTextMessage?.contextInfo
    if (!quoted) {
      return reply('🌱 Responde al mensaje que deseas eliminar.')
    }

    const stanzaId = quoted.stanzaId
    const participant = quoted.participant

    if (!stanzaId || !participant) {
      return reply('❌ No se pudo obtener la información del mensaje.')
    }

    const botJid = conn.user.id.split(':')[0] + '@s.whatsapp.net'
    const fromMe = participant === botJid

    try {
      await conn.sendMessage(chatId, {
        delete: {
          remoteJid: chatId,
          fromMe,
          id: stanzaId,
          participant
        }
      })
    } catch (e) {
      try {
        await conn.sendMessage(chatId, {
          delete: m.quoted.key
        })
      } catch {
        return reply('❌ No se pudo eliminar el mensaje.')
      }
    }
  }
}