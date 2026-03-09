export default {
  command: ['removesale', 'removerventa'],
  category: 'gacha',
  run: async (client, m, args) => {
    if (!m || !m.chat) return

    const db = global.db.data
    const chatId = m.chat
    const userId = m.sender
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

    const nombre = args.join(' ').trim().toLowerCase()

    if (!nombre)
      return m.reply(
        '◇ Uso incorrecto.\n' +
        '◇ Escribe el nombre del personaje.'
      )

    const userData = chatData.users?.[userId]

    if (!userData)
      return m.reply(
        '▸ No se encontraron datos tuyos.\n' +
        '▸ Intenta nuevamente.'
      )

    if (!userData.personajesEnVenta?.length)
      return m.reply(
        '✦ No tienes personajes en venta.\n' +
        '✦ Nada que retirar.'
      )

    const index = userData.personajesEnVenta.findIndex(
      p => p.name?.toLowerCase() === nombre
    )

    if (index === -1)
      return m.reply(
        '✧ Personaje no encontrado.\n' +
        `✧ *${args.join(' ')}* no está en tu lista de ventas.`
      )

    const retirado = userData.personajesEnVenta.splice(index, 1)[0]

    if (!Array.isArray(userData.characters))
      userData.characters = []

    userData.characters.push(retirado)

    const texto =
      '╭─ ❌ VENTA CANCELADA\n' +
      '│\n' +
      `│ ✦ Personaje\n` +
      `│   ${retirado.name}\n` +
      '│\n' +
      '│ ❖ Estado\n' +
      '│   Devuelto a tu inventario\n' +
      '│\n' +
      '│ ⧉ Acción completada\n' +
      '╰───────────────'

    await client.sendMessage(
      chatId,
      { text: texto },
      { quoted: m }
    )
  }
}