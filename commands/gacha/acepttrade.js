export default {
  command: ['accepttrade', 'aceptarintercambio'],
  category: 'gacha',
  run: async (client, m) => {
    const db = global.db.data
    const chatId = m.chat
    const userId = m.sender
    const chatData = db.chats[chatId]

    if (!chatData)
      return m.reply('🍪 No se encontraron datos del chat.')

    if (chatData.adminonly || !chatData.gacha)
      return m.reply('🍪 Estos comandos están desactivados en este grupo.')

    const intercambio = chatData.intercambios?.find(
      (i) => i.expiracion > Date.now() && i.destinatario === userId
    )

    if (!intercambio)
      return m.reply('🍪 No tienes ninguna solicitud de intercambio activa.')

    const solicitanteChars =
      chatData.users[intercambio.solicitante]?.characters || []

    const destinatarioChars =
      chatData.users[intercambio.destinatario]?.characters || []

    chatData.users[intercambio.solicitante].characters = [
      ...solicitanteChars.filter(
        (c) => c.name !== intercambio.personaje1.name
      ),
      intercambio.personaje2,
    ]

    chatData.users[intercambio.destinatario].characters = [
      ...destinatarioChars.filter(
        (c) => c.name !== intercambio.personaje2.name
      ),
      intercambio.personaje1,
    ]

    chatData.intercambios = chatData.intercambios.filter(
      (i) => i !== intercambio
    )

    chatData.timeTrade = 0

    const mensajeConfirmacion =
      `╭─────── 🌸 𝗜𝗡𝗧𝗘𝗥𝗖𝗔𝗠𝗕𝗜𝗢 🌸 ───────╮
│
│  ✨ ¡Intercambio completado con éxito!
│
│  🔁 Personajes intercambiados:
│
│  🧩 ${intercambio.personaje1.name}
│  └─ ahora pertenece a
│     👤 ${db.users[userId]?.name || userId.split('@')[0]}
│
│  🧩 ${intercambio.personaje2.name}
│  └─ ahora pertenece a
│     👤 ${db.users[intercambio.solicitante]?.name || intercambio.solicitante.split('@')[0]}
│
╰──────────── 🌿 𝗚𝗔𝗖𝗛𝗔 🌿 ────────────╯

${dev}`

    await client.sendMessage(
      chatId,
      { text: mensajeConfirmacion },
      { quoted: m }
    )
  },
}
