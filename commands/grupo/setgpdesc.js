export default {
  command: ['setgpdesc'],
  category: 'grupo',
  isAdmin: true,
  botAdmin: true,
  run: async (...args) => {
    const conn = args.find(a => a?.user) || global.conn
    const m = args.find(a => a?.key?.remoteJid)
    if (!conn || !m) return

    const chatId = m.key.remoteJid

    const text =
      m.message?.conversation ||
      m.message?.extendedTextMessage?.text ||
      ''

    const newDesc = text.split(/\s+/).slice(1).join(' ').trim()

    const reply = txt =>
      conn.sendMessage(chatId, { text: txt }, { quoted: m })

    if (!newDesc) {
      return reply(
        `🌱 *Uso correcto:*\n\n` +
        `➤ Escribe la nueva descripción del grupo\n` +
        `Ejemplo:\n` +
        `• setgpdesc Grupo oficial de amigos`
      )
    }

    try {
      await conn.groupUpdateDescription(chatId, newDesc)
      return reply('✅ *La descripción del grupo fue actualizada correctamente.*')
    } catch (e) {
      return reply('❌ No se pudo cambiar la descripción del grupo.')
    }
  }
}