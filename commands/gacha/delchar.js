export default {
  command: ['delchar', 'delwaifu', 'deletechar'],
  category: 'gacha',

  run: async (client, m, args, command, text, usedPrefix) => {
    if (!m || !m.chat) return

    const db = global.db.data
    const chatData = db.chats?.[m.chat]
    const userId = m.sender
    const userData = chatData?.users?.[userId]

    if (!chatData)
      return m.reply('🍩 No hay datos del chat.')

    if (chatData.adminonly || !chatData.gacha)
      return m.reply('🍭 Estos comandos están desactivados en este grupo.')

    if (!userData?.characters?.length)
      return m.reply('🌳 No tienes personajes en tu inventario.')

    if (!args.length)
      return m.reply(
        `🍪 Usa:\n${usedPrefix + command} <nombre del personaje>`
      )

    const characterName = args.join(' ').toLowerCase().trim()

    const index = userData.characters.findIndex(
      c => c.name && c.name.toLowerCase() === characterName
    )

    if (index === -1)
      return m.reply(
        `🍧 El personaje *${args.join(' ')}* no está en tu inventario.`
      )

    const removed = userData.characters.splice(index, 1)[0]

    return m.reply(
      `🍬 El personaje *${removed.name}* fue eliminado de tu inventario.`
    )
  }
}