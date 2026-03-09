export default {
  command: ['setgpbanner'],
  category: 'grupo',
  isAdmin: true,
  botAdmin: true,
  run: async (...args) => {
    const conn = args.find(a => a?.user) || global.conn
    const m = args.find(a => a?.key?.remoteJid)
    if (!conn || !m) return

    const chatId = m.key.remoteJid

    const reply = txt =>
      conn.sendMessage(chatId, { text: txt }, { quoted: m })

    const quoted =
      m.message?.extendedTextMessage?.contextInfo?.quotedMessage

    if (!quoted) {
      return reply('🌱 Responde a una *imagen* para cambiar el banner del grupo.')
    }

    const mime =
      quoted?.imageMessage?.mimetype || ''

    if (!/image/.test(mime)) {
      return reply('❌ El mensaje citado no contiene una imagen.')
    }

    try {
      const buffer = await conn.downloadMediaMessage(
        {
          key: {
            remoteJid: chatId,
            id: m.message.extendedTextMessage.contextInfo.stanzaId
          },
          message: quoted
        },
        'buffer'
      )

      if (!buffer) {
        return reply('❌ No se pudo descargar la imagen.')
      }

      await conn.updateProfilePicture(chatId, buffer)
      return reply('✅ *La imagen del grupo se actualizó correctamente.*')
    } catch (e) {
      return reply('❌ No se pudo actualizar la imagen del grupo.')
    }
  }
}