import { resolveLidToRealJid } from "../../lib/utils.js"

export default {
  command: ['count', 'mensajes', 'messages', 'msgcount'],
  category: 'grupo',
  run: async (client, m, args, usedPrefix, command, text) => {
    const db = global.db.data
    const chatId = m.chat
    const chatData = db.chats[chatId]

    const mentioned = m.mentionedJid
    const who2 = mentioned.length > 0
      ? mentioned[0]
      : (m.quoted ? m.quoted.sender : m.sender)

    const who = await resolveLidToRealJid(who2, client, m.chat)

    if (!chatData.users?.[who])
      return m.reply(
`════════════════════
🌱 El usuario mencionado no está registrado en el bot.
════════════════════`
      )

    const userStats = chatData.users[who].stats || {}
    const now = new Date()
    const daysArg = parseInt(args[0]) || 30
    const cutoff = new Date(now.getTime() - daysArg * 24 * 60 * 60 * 1000)

    const days = Object.entries(userStats)
      .filter(([date]) => new Date(date) >= cutoff)
      .sort((a, b) => new Date(b[0]) - new Date(a[0]))

    const totalMsgs = days.reduce((acc, [, d]) => acc + (d.msgs || 0), 0)
    const totalCmds = days.reduce((acc, [, d]) => acc + (d.cmds || 0), 0)

    let report =
`╔══════════════════════╗
║      REGISTRO DE ACTIVIDAD
╚══════════════════════╝

🌱 Usuario › @${who.split('@')[0]}
🌱 Periodo › Últimos ${daysArg} días

────────── Resumen ──────────
🌱 Mensajes Totales  › ${totalMsgs}
🌱 Comandos Totales  › ${totalCmds}

──────── Detalle Diario ────────
`

    for (const [date, d] of days) {
      const fecha = new Date(date).toLocaleDateString('es-CO', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        timeZone: 'America/Bogota'
      })

      report += `
🌱 ${fecha}
   • Mensajes  : ${d.msgs || 0}
   • Comandos  : ${d.cmds || 0}
`
    }

    report += `\n════════════════════`

    await client.reply(chatId, report.trim(), m, { mentions: [who] })
  }
}