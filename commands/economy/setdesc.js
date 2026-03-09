export default {
  command: ['setdescription', 'setdesc'],
  category: 'rpg',
  run: async (client, m, args) => {
    if (!m?.sender) return

    const user = global.db.data.users[m.sender]
    const prefix = m.usedPrefix || '/'

    if (!user) return

    if (user.description)
      return m.reply(
        `✦ Ya tienes una descripción establecida.\nUsa *${prefix}deldescription* para eliminarla.`
      )

    const input = args.join(' ').trim()
    if (!input)
      return m.reply('✦ Debes escribir una descripción válida.')

    if (input.length > 300)
      return m.reply('✦ La descripción no puede superar los 300 caracteres.')

    user.description = input
    return m.reply(`✎ Descripción guardada:\n> *${input}*`)
  }
}