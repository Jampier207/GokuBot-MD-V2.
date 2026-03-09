export default {
  command: ['delbirth'],
  category: 'rpg',

  run: async (client, m) => {
    const user = global.db.data.users[m.sender]

    if (!user)
      return m.reply('⚠️ No estás registrado en el sistema.')

    if (!user.birth)
      return m.reply('📅 No tienes una fecha de nacimiento registrada.')

    user.birth = null

    return m.reply(
      '🗑️ *Fecha de nacimiento eliminada*\n\n' +
      '✨ Puedes establecer una nueva cuando quieras.'
    )
  }
}