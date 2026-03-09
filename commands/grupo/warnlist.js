export default {
  command: ['warnlist'],
  category: 'grupo',
  group: true,
  admin: true,

  run: async (client, m) => {
    const chat = global.db.data.chats[m.chat]
    if (!chat || !chat.warns) {
      return m.reply('✅ No hay usuarios con warns en este grupo.')
    }

    let text = '⚠️ *WARNLIST DEL GRUPO*\n\n'
    let count = 0
    let mentions = []

    for (const jid of Object.keys(chat.warns)) {
      const warns = chat.warns[jid]

      if (!Array.isArray(warns) || warns.length === 0) {
        delete chat.warns[jid]
        continue
      }

      count++
      mentions.push(jid)

      text += `👤 @${jid.split('@')[0]}\n`
      text += `📊 Advertencias: ${warns.length}/3\n`

      warns.forEach((w, i) => {
        text += `\n🔸 #${i + 1}`
        text += `\n📝 Motivo: ${w.reason || 'Sin motivo'}`
        text += `\n🕒 Fecha: ${w.date || 'Desconocida'}\n`
      })

      text += '\n──────────────\n\n'
    }

    if (count === 0) {
      return m.reply('✅ No hay usuarios con warns en este grupo.')
    }

    await client.sendMessage(
      m.chat,
      { text: text.trim(), mentions },
      { quoted: m }
    )
  }
}