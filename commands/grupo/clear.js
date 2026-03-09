function getLastActive(usedTime) {
  if (!usedTime) return 0
  if (typeof usedTime === 'number') return usedTime
  if (usedTime instanceof Date) return usedTime.getTime()
  return new Date(usedTime).getTime()
}

function msToTime(ms) {
  const sec = Math.floor(ms / 1000)
  const min = Math.floor(sec / 60)
  const hour = Math.floor(min / 60)
  const day = Math.floor(hour / 24)
  return `${day}d ${hour % 24}h ${min % 60}m ${sec % 60}s`
}

export default {
  command: ['clear'],
  category: 'grupo',
  run: async (client, m, command, args) => {
    const chat = global.db.data.chats[m.chat]
    if (!chat) return m.reply('No se encontraron datos del grupo.')

    const metadata = await client.groupMetadata(m.chat)
    const senderId = m.sender.split(':')[0]
    const participant = metadata.participants.find(
      p => p.id.split(':')[0] === senderId
    )
    const isAdmin = participant?.admin === 'admin' || participant?.admin === 'superadmin'

    if (!isAdmin) return m.reply('Este comando solo puede usarlo un admin.')

    const now = Date.now()
    const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000
    let userList = []
    let totalWaifus = 0
    let totalDinero = 0

    for (const jid in chat.users) {
      const userData = chat.users[jid]
      const lastActive = getLastActive(userData?.usedTime)
      const inactiveTime = now - lastActive
      const isValid = typeof lastActive === 'number' && lastActive > 0
      const isInactive = isValid && inactiveTime > THIRTY_DAYS_MS

      if (isInactive) {
        const waifus = userData?.characters?.length || 0
        const dinero = userData?.coins || 0
        const name = global.db.data.users[jid]?.name || jid.split('@')[0]
        const formattedTime = msToTime(inactiveTime)

        userList.push(`*${name}* [${waifus}] → inactivo hace ${formattedTime}`)
        totalWaifus += waifus
        totalDinero += dinero
      }
    }

    if (userList.length === 0) return m.reply('No hay usuarios inactivos en este grupo.')

    const currency = global.db.data.settings[client.user.id.split(':')[0] + '@s.whatsapp.net']?.currency || 'Coins'

    let message = '✦═━ USUARIOS INACTIVOS ━═✦\n'
    message += `Claims totales     :: ${totalWaifus.toLocaleString()}\n`
    message += `${currency} totales       :: ${totalDinero.toLocaleString()}\n`
    message += `Usuarios inactivos :: ${userList.length}\n\n`
    userList = userList.map((line, i) => `${i + 1}. ${line}`)
    message += userList.join('\n')
    message += '\n\nUsa el comando /deleteuser <número> para borrar un usuario específico.'

    client.reply(m.chat, message, m)
  }
}