export default {
  command: ['sell', 'vender'],
  category: 'gacha',
  run: async (client, m, args) => {
    if (!m || !m.chat) return

    const db = global.db.data
    const chatId = m.chat
    const userId = m.sender

    const botId = client.user.id.split(':')[0] + '@s.whatsapp.net'
    const botSettings = db.settings?.[botId] || {}
    const currency = botSettings.currency || 'monedas'
    const botname = botSettings.namebot2 || 'Bot'

    const chatData = db.chats?.[chatId]

    if (!chatData)
      return m.reply(
        '▢ Este chat no está inicializado.\n' +
        '▢ Usa cualquier comando primero.'
      )

    if (chatData.adminonly || !chatData.gacha)
      return m.reply(
        '▣ Función deshabilitada.\n' +
        '▣ Consulta con un administrador.'
      )

    const precio = parseInt(args[0])
    const nombre = args.slice(1).join(' ').trim().toLowerCase()

    if (!nombre || isNaN(precio))
      return m.reply(
        '◇ Uso incorrecto\n' +
        '◇ Ejemplo:\n' +
        '◇ vender 5000 Rem'
      )

    if (precio < 5000)
      return m.reply(
        '✧ Precio insuficiente\n' +
        `✧ Mínimo permitido: 5,000 ${currency}`
      )

    if (precio > 20_000_000)
      return m.reply(
        '✦ Precio excesivo\n' +
        `✦ Máximo permitido: 20,000,000 ${currency}`
      )

    const userData = chatData.users?.[userId]

    if (!userData)
      return m.reply(
        '▸ No se encontraron datos del usuario.\n' +
        '▸ Intenta nuevamente.'
      )

    if (!userData.characters?.length)
      return m.reply(
        '❖ Inventario vacío\n' +
        '❖ No tienes personajes.'
      )

    const index = userData.characters.findIndex(
      c => c.name?.toLowerCase() === nombre
    )

    if (index === -1)
      return m.reply(
        '✧ Personaje no encontrado\n' +
        `✧ *${args.slice(1).join(' ')}* no está en tu inventario.`
      )

    const personaje = userData.characters[index]
    const expira = new Date(
      Date.now() + 3 * 24 * 60 * 60 * 1000
    ).toISOString()

    if (!Array.isArray(userData.personajesEnVenta))
      userData.personajesEnVenta = []

    userData.personajesEnVenta.push({
      ...personaje,
      precio,
      vendedor: userId,
      expira
    })

    userData.characters.splice(index, 1)

    const texto =
      '╭─ 🏷️ PERSONAJE EN VENTA\n' +
      '│\n' +
      `│ ✦ Nombre\n` +
      `│   ${personaje.name}\n` +
      '│\n' +
      `│ ⛁ Precio\n` +
      `│   ${precio.toLocaleString()} ${currency}\n` +
      '│\n' +
      '│ ⏳ Duración\n' +
      '│   3 días\n' +
      '│\n' +
      `│ ⧉ Vendedor\n` +
      `│   @${userId.split('@')[0]}\n` +
      '╰───────────────'

    await client.sendMessage(
      chatId,
      { text: texto, mentions: [userId] },
      { quoted: m }
    )
  }
}