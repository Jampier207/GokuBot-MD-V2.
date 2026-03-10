import fetch from 'node-fetch'
import { resolveLidToRealJid } from "../../lib/utils.js"

export default {
  command: ['levelup', 'level', 'lvl'],
  category: 'profile',
  run: async (client, m, args) => {
    if (!m?.sender || !m?.chat) return

    const db = global.db.data
    const chatId = m.chat

    const mentioned = m.mentionedJid || []
    const who2 = mentioned[0] || (m.quoted ? m.quoted.sender : m.sender)
    const who = await resolveLidToRealJid(who2, client, chatId)

    const user = db.users?.[who]
    if (!user) {
      return m.reply(`✧ El usuario no está registrado en el bot.`)
    }

    const name = user.name || who.split('@')[0]

    const users = Object.entries(db.users || {}).map(([jid, data]) => ({
      jid,
      level: data.level || 0
    }))
    users.sort((a, b) => b.level - a.level)
    const rank = users.findIndex(u => u.jid === who) + 1 || '—'

    try {
      const params = new URLSearchParams({
        username: name,
        level: user.level || 0,
        exp: user.exp || 0,
        rank: rank
      })
      const res = await fetch(`https://api.stellarwa.xyz/generate/levelup?${params.toString()}`)
      const json = await res.json()

      if (!json.status || !json.url) throw new Error('No se pudo generar la imagen.')

      await client.sendMessage(
        chatId,
        { image: { url: json.url }, caption: `⭐ *Nivel de ${name}* ⭐` },
        { quoted: m }
      )
    } catch (e) {
      const text = `
╭───〔 📊 *NIVEL DEL USUARIO* 〕
│ 👤 Usuario : *${name}*
│ ⭐ Nivel   : *${user.level || 0}*
│ 🧠 Exp     : *${user.exp?.toLocaleString() || 0}*
│ 🏆 Ranking : *#${rank}*
│ ⚙️ Comandos: *${user.usedcommands?.toLocaleString() || 0}*
╰─────────────────────
`
      await client.sendMessage(chatId, { text, mentions: [who] }, { quoted: m })
    }
  }
}