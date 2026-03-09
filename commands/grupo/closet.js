export default {
  command: ['closet'],
  category: 'grupo',
  isAdmin: true,
  botAdmin: true,

  run: async (...args) => {
    const conn = args.find(a => a?.user) || global.conn
    const m = args.find(a => a?.key?.remoteJid)
    if (!conn || !m) return

    const chatId = m.key.remoteJid
    const reply = (text) =>
      conn.sendMessage(chatId, { text }, { quoted: m })

    if (!chatId.endsWith('@g.us'))
      return reply('Este comando solo funciona en grupos.')

    if (!global.closeTimeouts)
      global.closeTimeouts = {}

    const body =
      m.message?.conversation ||
      m.message?.extendedTextMessage?.text ||
      ''

    const timeArg = body.trim().split(/\s+/)[1] || null

    const parseTime = (timeStr) => {
      if (!timeStr) return null
      const match = timeStr.match(/^(\d+)(min|mnt|h|hr|d|dia)$/i)
      if (!match) return null

      const value = parseInt(match[1])
      const unit = match[2].toLowerCase()

      if (unit === 'min' || unit === 'mnt')
        return value * 60000

      if (unit === 'h' || unit === 'hr')
        return value * 3600000

      if (unit === 'd' || unit === 'dia')
        return value * 86400000

      return null
    }

    const duration = parseTime(timeArg)

    let metadata
    try {
      metadata = await conn.groupMetadata(chatId)
    } catch {
      return reply('No se pudo obtener la información del grupo.')
    }

    if (!duration && metadata.announce === true)
      return reply('🔒 El grupo ya está cerrado.')

    try {
      await conn.groupSettingUpdate(chatId, 'announcement')

      if (duration) {

        if (global.closeTimeouts[chatId])
          clearTimeout(global.closeTimeouts[chatId])

        reply(`🔒 Grupo cerrado por ${timeArg}.`)

        global.closeTimeouts[chatId] = setTimeout(async () => {
          try {
            await conn.groupSettingUpdate(chatId, 'not_announcement')
            await conn.sendMessage(chatId, { text: '🔓 Grupo reabierto automáticamente.' })
            delete global.closeTimeouts[chatId]
          } catch {}
        }, duration)

      } else {
        reply('🔒 Grupo cerrado correctamente.')
      }

    } catch {
      return reply('Ocurrió un error al cerrar el grupo.')
    }
  }
}
