export default {
  command: ['delgenre'],
  category: 'rpg',
  run: async (client, m) => {
    if (!m?.sender) return

    const users = global.db.data.users
    if (!users[m.sender]) users[m.sender] = {}

    const user = users[m.sender]

    if (!user.genre)
      return m.reply('🚫 No tienes un género asignado.')

    user.genre = ''

    return m.reply('🗑️ Tu género ha sido eliminado correctamente.')
  }
}