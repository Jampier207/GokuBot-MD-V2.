export default {
  command: ['bot'],
  category: 'grupo',
  isAdmin: true,
  run: async (client, m, args) => {
    const chat = global.db.data.chats[m.chat]
    const estado = chat.isBanned ?? false
    const botName = global.db.data.settings[client.user.id.split(':')[0] + "@s.whatsapp.net"].namebot

    if (args[0] === 'off') {
      if (estado)
        return m.reply(
`────────────────────
🌱 El *Bot* ya estaba *desactivado* en este grupo.
────────────────────`
        )

      chat.isBanned = true

      return m.reply(
`────────────────────
🌱 Has *Desactivado* a *${botName}* en este grupo.
────────────────────`
      )
    }

    if (args[0] === 'on') {
      if (!estado)
        return m.reply(
`────────────────────
🌱 *${botName}* ya estaba *activado* en este grupo.
────────────────────`
        )

      chat.isBanned = false

      return m.reply(
`────────────────────
🌱 Has *Activado* a *${botName}* en este grupo.
────────────────────`
      )
    }

    return m.reply(
`════════════════════
🌱 Estado de ${botName}

🌱 Actual › ${estado ? 'Desactivado' : 'Activado'}

🌱 Puede cambiarse con:

• bot on
• bot off
════════════════════`
    )
  },
}; 
