export default {
  command: ['waifusboard', 'waifustop', 'topwaifus'],
  category: 'gacha',
  use: '[página]',

  run: async (client, m, args) => {
    const db = global.db.data
    const chatId = m.chat
    const chatData = db.chats?.[chatId]

    if (!chatData || chatData.adminonly || !chatData.gacha)
      return m.reply(
        `🌿 El sistema *Gacha* está desactivado en este grupo.`
      )

    const users = Object.entries(chatData.users || {})
      .filter(([_, u]) => (u.characters?.length || 0) > 5)
      .map(([id, u]) => ({
        userId: id,
        characters: u.characters,
        name: db.users?.[id]?.name || id.split('@')[0],
      }))

    if (!users.length)
      return m.reply(
        `❀ No hay usuarios con más de *5 waifus* en este grupo.`
      )

    const sorted = users.sort(
      (a, b) => (b.characters?.length || 0) - (a.characters?.length || 0)
    )

    const page = parseInt(args[0]) || 1
    const pageSize = 10
    const totalPages = Math.ceil(sorted.length / pageSize)

    if (page < 1 || page > totalPages)
      return m.reply(
        `📘 La página *${page}* no existe.\n` +
        `› Total de páginas: *${totalPages}*`
      )

    const startIndex = (page - 1) * pageSize
    const list = sorted.slice(startIndex, startIndex + pageSize)

    let message =
      `╭───〔 💖 𝑻𝒐𝒑 𝑾𝒂𝒊𝒇𝒖𝒔 〕───╮\n` +
      `│\n` +
      `│ 👑 Usuarios con más waifus\n` +
      `│\n`

    message += list.map((u, i) =>
      `│ ✦ *${startIndex + i + 1}.* ${u.name}\n` +
      `│    💗 Waifus › *${u.characters.length}*`
    ).join('\n│\n')

    message +=
      `\n│\n` +
      `│ 📄 Página *${page}* de *${totalPages}*\n`

    if (page < totalPages)
      message +=
        `│ ➜ Siguiente › *${prefa}waifusboard ${page + 1}*\n`

    message += `╰────────────────────╯`

    await client.sendMessage(
      chatId,
      { text: message },
      { quoted: m }
    )
  }
}