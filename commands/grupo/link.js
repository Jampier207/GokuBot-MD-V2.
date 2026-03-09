export default {
  command: ['link'],
  category: 'grupo',
  botAdmin: true,
  run: async (...args) => {
    const conn = args.find(a => a?.user) || global.conn
    const m = args.find(a => a?.key?.remoteJid)
    if (!conn || !m) return

    const chatId = m.key.remoteJid

    const reply = text =>
      conn.sendMessage(chatId, { text }, { quoted: m })

    try {
      const code = await conn.groupInviteCode(chatId)
      const link = `https://chat.whatsapp.com/${code}`

      return reply(
        `╭─〔 🔗 𝐄𝐍𝐋𝐀𝐂𝐄 𝐃𝐄𝐋 𝐆𝐑𝐔𝐏𝐎 〕─╮
│
│ 🌐 ${link}
│
╰────────────────────╯`
      )
    } catch (e) {
      return reply('❌ No pude obtener el enlace del grupo.')
    }
  }
}