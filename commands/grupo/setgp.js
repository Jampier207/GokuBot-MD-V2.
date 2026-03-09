export default {
  command: ['setgpname', 'setnamegp'],
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

    const newName = text.split(/\s+/).slice(1).join(' ').trim()

    const reply = txt =>
      conn.sendMessage(chatId, { text: txt }, { quoted: m })

    if (!newName) {
      return reply(
        `🌱 *Uso correcto:*\n\n` +
        `➤ Escribe el nuevo nombre del grupo\n` +
        `Ejemplo:\n` +
        `• setgpname Mi grupo cool`
      )
    }

    try {
      await conn.groupUpdateSubject(chatId, newName)
      return reply(`✅ *Nombre del grupo actualizado correctamente.*`)
    } catch (e) {
      return reply('❌ No se pudo cambiar el nombre del grupo.')
    }
  }
}