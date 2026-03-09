import fs from 'fs'
import { resolveLidToRealJid } from "../../lib/utils.js"

function loadCharacters() {
  try {
    return JSON.parse(fs.readFileSync('./lib/characters.json', 'utf-8'))
  } catch {
    return []
  }
}

export default {
  command: ['harem', 'miswaifus', 'claims'],
  category: 'gacha',
  run: async (client, m, args) => {
    if (!m || !m.chat) return

    const db = global.db.data
    const chatId = m.chat
    const chatData = db.chats?.[chatId]

    if (!chatData)
      return m.reply(
        '▢ Chat no registrado.\n' +
        '▢ Usa un comando primero.'
      )

    if (chatData.adminonly || !chatData.gacha)
      return m.reply(
        '▣ Sistema Gacha desactivado.\n' +
        '▣ Consulta a un administrador.'
      )

    const mentioned =
      m.mentionedJid?.[0] ||
      (m.quoted ? m.quoted.sender : m.sender)

    const userId = await resolveLidToRealJid(mentioned, client, chatId)
    const userData = chatData.users?.[userId]

    const userName =
      db.users?.[userId]?.name ||
      userId.split('@')[0]

    if (!userData?.characters?.length) {
      return m.reply(
        userId === m.sender
          ? '◇ Inventario vacío.\n◇ No tienes personajes reclamados.'
          : `◇ Inventario vacío.\n◇ *${userName}* no tiene personajes.`
      )
    }

    const allCharacters = loadCharacters()

    const total = userData.characters.length
    const perPage = 20
    const page = Math.max(1, Number(args[0]) || 1)
    const pages = Math.ceil(total / perPage)

    if (page > pages)
      return m.reply(
        '▸ Página inválida.\n' +
        `▸ Total disponible: ${pages}`
      )

    const start = (page - 1) * perPage
    const end = Math.min(start + perPage, total)
    const slice = userData.characters.slice(start, end)

    let text =
      '╭─ 🎴 HAREM PERSONAL\n' +
      `│\n` +
      `│ ✦ Usuario\n` +
      `│   ${userName}\n` +
      `│\n` +
      `│ ❖ Total de personajes\n` +
      `│   ${total}\n` +
      `│\n` +
      '├─ 📜 LISTADO\n'

    slice.forEach((char, i) => {
      const base = allCharacters.find(c => c.name === char.name)
      const value = base?.value || char.value || 0

      text +=
        `│ ${start + i + 1} ▸ ${char.name}\n` +
        `│    ⤷ Valor: ${value.toLocaleString()}\n`
    })

    text +=
      '│\n' +
      `│ ⧗ Página ${page} de ${pages}\n` +
      '╰───────────────'

    await client.sendMessage(chatId, { text }, { quoted: m })
  }
}