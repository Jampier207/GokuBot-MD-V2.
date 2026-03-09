import { promises as fs } from 'fs'

async function loadCharacters() {
  const data = await fs.readFile('./lib/characters.json', 'utf-8')
  return JSON.parse(data)
}

export default {
  command: ['slist', 'serielist', 'animelist'],
  category: 'gacha',
  run: async (client, m, args, command, text, usedPrefix) => {
    const db = global.db.data
    const chatId = m.chat
    const chatData = db.chats[chatId]

    if (!chatData || chatData.adminonly || !chatData.gacha)
      return m.reply('🌿 Este comando está desactivado en este grupo.')

    try {
      const characters = await loadCharacters()

      const sources = characters.reduce((acc, char) => {
        if (!char.source) return acc
        const name = char.source.trim()
        acc[name] = (acc[name] || 0) + 1
        return acc
      }, {})

      const sorted = Object.entries(sources).sort(([, a], [, b]) => b - a)

      const perPage = 15
      const page = Math.max(1, parseInt(args[0]) || 1)
      const totalPages = Math.ceil(sorted.length / perPage)

      if (page > totalPages)
        return m.reply(
          `🍂 Página inválida.\n` +
          `› Páginas disponibles: *${totalPages}*`
        )

      const start = (page - 1) * perPage
      const list = sorted.slice(start, start + perPage)

      let message =
        `╭───〔 📚 𝑨𝒏𝒊𝒎𝒆 𝑳𝒊𝒔𝒕 〕───╮\n` +
        `│\n` +
        `│ 🎬 Series registradas:\n` +
        `│   ${sorted.length}\n` +
        `│\n` +
        `╰───────────────╯\n\n`

      list.forEach(([name, count], i) => {
        message +=
          `✦ ${start + i + 1}. ${name}\n` +
          `  ↳ Personajes: ${count}\n\n`
      })

      message +=
        `📄 Página ${page} de ${totalPages}\n` +
        `🍃 Usa: ${usedPrefix + command} <número>`

      await client.sendMessage(chatId, { text: message }, { quoted: m })
    } catch (err) {
      console.error(err)
      await m.reply('🍁 Ocurrió un error al cargar la lista de animes.')
    }
  },
}