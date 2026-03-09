export default {
  command: ['delmeta'],
  category: 'utils',
  run: async (client, m) => {
    const db = global.db.data
    const userId = m.sender
    const user = db.users[userId]

    try {
      user.metadatos = global.packname || ''
      user.metadatos2 = global.author || ''

      await client.reply(
        m.chat,
        '> ➤ Metadatos restaurados a los valores predeterminados del bot.',
        m
      )
    } catch (e) {
      await m.reply('❖ Ocurrió un error al restaurar los metadatos.')
    }
  },
} 
