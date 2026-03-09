export default {
  command: ['clearwarns', 'resetwarns'],
  category: 'grupo',
  group: true,
  admin: true,

  run: async (client, m) => {
    const chat = global.db.data.chats[m.chat]
    if (!chat || !chat.warns || Object.keys(chat.warns).length === 0) {
      return m.reply('✅ No hay advertencias para limpiar en este grupo.')
    }

    const totalUsuarios = Object.keys(chat.warns).length

    chat.warns = {}

    await client.sendMessage(
      m.chat,
      {
        text:
          `🧹 *ADVERTENCIAS LIMPIADAS*\n\n` +
          `✔️ Se eliminaron todas las advertencias del grupo.\n` +
          `👥 Usuarios afectados: *${totalUsuarios}*`
      },
      { quoted: m }
    )
  }
}