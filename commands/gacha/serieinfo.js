import { promises as fs } from 'fs'

async function loadCharacters() {
  const data = await fs.readFile('./lib/characters.json', 'utf-8')
  return JSON.parse(data)
}

export default {
  command: ['serieinfo', 'animeinfo', 'ainfo'],
  category: 'gacha',
  run: async (client, m, args, command, text, usedPrefix) => {
    const db = global.db.data
    const chatId = m.chat
    const chatData = db.chats[chatId]

    if (!chatData || chatData.adminonly || !chatData.gacha)
      return m.reply('❖ Este comando está desactivado en este grupo.')

    const name = args.join(' ').trim()
    if (!name)
      return m.reply(
        `✦ Uso correcto:\n` +
        `› ${usedPrefix + command} <nombre del anime>`
      )

    try {
      const characters = await loadCharacters()

      const animeCharacters = characters.filter(
        (c) =>
          c.source &&
          c.source.toLowerCase().trim() === name.toLowerCase().trim()
      )

      if (!animeCharacters.length)
        return m.reply(`✦ No se encontró información del anime *${name}*.`)

      let claimed = 0
      const list = []

      for (const char of animeCharacters) {
        const ownerEntry = Object.entries(chatData.users || {}).find(
          ([, u]) =>
            Array.isArray(u.characters) &&
            u.characters.some((c) => c.name === char.name)
        )

        if (ownerEntry) claimed++

        const ownerId = ownerEntry ? ownerEntry[0] : null
        const ownerName = ownerId
          ? db.users?.[ownerId]?.name || ownerId.split('@')[0]
          : null

        list.push(
          ownerName
            ? `• ${char.name}\n  ↳ Estado: Reclamado\n  ↳ Dueño: ${ownerName}`
            : `• ${char.name}\n  ↳ Estado: Disponible`
        )
      }

      const message =
        `『 ${name} 』\n` +
        `┇\n` +
        `┇ ꜱᴛᴀᴛꜱ: ${claimed}/${animeCharacters.length}\n` +
        `┇ ᴛᴏᴛᴀʟ: ${animeCharacters.length}\n` +
        `┇\n` +
        `┇ ᴘᴇʀꜱᴏɴᴀᴊᴇꜱ:\n` +
        `┇\n` +
        `┇ ` + list.join('\n┇ ') + `\n` +
        `┇\n` +
        `┖───────────────────`;


      await client.sendMessage(chatId, { text: message }, { quoted: m })
    } catch (err) {
      console.error(err)
      await m.reply('※ Ocurrió un error al obtener la información del anime.')
    }
  },
}