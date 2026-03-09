export default {
  command: ['delpasatiempo', 'removehobby'],
  category: 'rpg',
  run: async (client, m, args) => {
    if (!m?.sender) return

    const users = global.db.data.users
    if (!users[m.sender]) users[m.sender] = {}

    const user = users[m.sender]

    if (!user.pasatiempo || user.pasatiempo === 'No definido') {
      return m.reply('🚫 No tienes ningún pasatiempo establecido.')
    }

    user.pasatiempo = 'No definido'

    return m.reply('🗑️ Tu pasatiempo ha sido eliminado correctamente.')
  }
}