export default {
  command: ['gachainfo', 'ginfo', 'infogacha'],
  category: 'gacha',

  run: async (client, m, args, command, text, usedPrefix) => {
    if (!m || !m.chat) return

    const db = global.db.data
    const chatData = db.chats?.[m.chat]
    const userId = m.sender
    const user = chatData?.users?.[userId]
    const now = Date.now()

    if (!chatData || !user)
      return m.reply('No hay datos suficientes para mostrar tu información.')

    if (chatData.adminonly || !chatData.gacha)
      return m.reply('Estos comandos están desactivados en este grupo.')

    const cooldowns = {
      vote: Math.max(0, (user.voteCooldown || 0) - now),
      roll: Math.max(0, (user.rwCooldown || 0) - now),
      claim: Math.max(0, (user.claimCooldown || 0) - now)
    }

    const formatTime = (ms) => {
      if (ms <= 0) return 'Disponible'
      const totalSeconds = Math.floor(ms / 1000)
      const h = Math.floor(totalSeconds / 3600)
      const m = Math.floor((totalSeconds % 3600) / 60)
      const s = totalSeconds % 60
      return [
        h ? `${h}h` : null,
        m ? `${m}m` : null,
        s ? `${s}s` : null
      ].filter(Boolean).join(' ')
    }

    const nombre = db.users?.[userId]?.name || userId.split('@')[0]
    const personajes = user.characters || []
    const valorTotal = personajes.reduce((a, c) => a + (c.value || 0), 0)

    const mensaje = `
╭━━━〔 𝙂𝘼𝘾𝙃𝘼 𝙄𝙉𝙁𝙊 〕━━━╮
│
│  ◇ Usuario
│  └─ ${nombre}
│
│  ◇ Cooldowns
│  ├ RollWaifu : ${formatTime(cooldowns.roll)}
│  ├ Claim     : ${formatTime(cooldowns.claim)}
│  └ Vote      : ${formatTime(cooldowns.vote)}
│
│  ◇ Inventario
│  ├ Personajes : ${personajes.length}
│  └ Valor total: ${valorTotal.toLocaleString()}
│
╰━━━━━━━━━━━━━━━━╯`.trim()

    await client.sendMessage(
      m.chat,
      { text: mensaje },
      { quoted: m }
    )
  }
}