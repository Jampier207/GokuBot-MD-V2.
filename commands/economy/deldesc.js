export default {
  command: ['deldescription', 'deldesc'],
  category: 'rpg',

  run: async (client, m) => {
    const user = global.db.data.users[m.sender]

    if (!user)
      return m.reply('⚠️ No estás registrado en el sistema.')

    if (!user.description)
      return m.reply('📝 No tienes una descripción registrada.')

    user.description = null

    return m.reply(
      '🗑️ *Descripción eliminada*\n\n' +
      '✨ Puedes crear una nueva cuando quieras.'
    )
  }
}