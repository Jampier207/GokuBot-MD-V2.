export default {
  command: ['waittimes', 'cooldowns', 'economyinfo', 'einfo'],
  category: 'rpg',
  run: async (client, m) => {
    const db = global.db.data
    const chatId = m.chat
    const botId = client.user.id.split(':')[0] + "@s.whatsapp.net"
    const chatData = db.chats[chatId]

    if (chatData.adminonly || !chatData.rpg)
      return m.reply(`✦ Comandos RPG desactivados en este chat.`)

    const user = chatData.users[m.sender]
    const now = Date.now()
    const oneDay = 24 * 60 * 60 * 1000

    const cooldowns = {
      Work: Math.max(0, (user.workCooldown || 0) - now),
      Slut: Math.max(0, (user.slutCooldown || 0) - now),
      Crime: Math.max(0, (user.crimeCooldown || 0) - now),
      Daily: Math.max(0, (user.lastDaily || 0) + oneDay - now),
      Mine: Math.max(0, (user.mineCooldown || 0) - now),
      Ritual: Math.max(0, (user.ritualCooldown || 0) - now),
      Ruleta: Math.max(0, (user.rtCooldown || 0) - now),
      Steal: Math.max(0, (user.roboCooldown || 0) - now),
      Ppt: Math.max(0, (user.pptCooldown || 0) - now),
      Weekly: Math.max(0, (user.lastWeekly || 0) + 7 * oneDay - now),
      Monthly: Math.max(0, (user.lastMonthly || 0) + 30 * oneDay - now),
      Explorar: Math.max(0, (user.explorarCooldown || 0) - now),
      Invertir: Math.max(0, (user.invertirCooldown || 0) - now)
    }

    const formatTime = (ms) => {
      if (ms <= 0) return 'Ahora.'
      const totalSeconds = Math.floor(ms / 1000)
      const days = Math.floor(totalSeconds / 86400)
      const hours = Math.floor((totalSeconds % 86400) / 3600)
      const minutes = Math.floor((totalSeconds % 3600) / 60)
      const seconds = totalSeconds % 60
      const parts = []
      if (days > 0) parts.push(`${days}d`)
      if (hours > 0) parts.push(`${hours}h`)
      if (minutes > 0) parts.push(`${minutes}m`)
      if (seconds > 0) parts.push(`${seconds}s`)
      return parts.join(' ')
    }

    const coins = user.coins || 0
    const currency = db.settings?.[botId]?.currency || 'Coins'
    const name = db.users[m.sender]?.name || m.sender.split('@')[0]

    const mensaje = `
✧ Usuario <${name}>

• Work      » ${formatTime(cooldowns.Work)}
• Slut      » ${formatTime(cooldowns.Slut)}
• Crime     » ${formatTime(cooldowns.Crime)}
• Daily     » ${formatTime(cooldowns.Daily)}
• Mine      » ${formatTime(cooldowns.Mine)}
• Ritual    » ${formatTime(cooldowns.Ritual)}
• Ruleta    » ${formatTime(cooldowns.Ruleta)}
• Steal     » ${formatTime(cooldowns.Steal)}
• Ppt       » ${formatTime(cooldowns.Ppt)}
• Weekly    » ${formatTime(cooldowns.Weekly)}
• Monthly   » ${formatTime(cooldowns.Monthly)}
• Explorar  » ${formatTime(cooldowns.Explorar)}
• Invertir  » ${formatTime(cooldowns.Invertir)}

✧ Coins totales » ¥${coins.toLocaleString()} ${currency}
`

    await client.sendContextInfoIndex(m.chat, mensaje, {}, m, true, {})
  }
};