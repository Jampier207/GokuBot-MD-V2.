const findCharacterByName = (name, characters) => {
  return characters.find(
    (c) => c.name?.toLowerCase() === name.toLowerCase()
  )
}

export default {
  command: ['trade', 'cambiar'],
  category: 'gacha',
  run: async (client, m, args, command, text, usedPrefix) => {
    const db = global.db.data
    const chatId = m.chat
    const userId = m.sender
    const chatData = db.chats[chatId]

    if (!chatData || chatData.adminonly || !chatData.gacha)
      return m.reply('🌿 Los intercambios están desactivados en este grupo.')

    if (chatData.timeTrade && chatData.timeTrade > Date.now())
      return m.reply(
        '⏳ Ya hay un intercambio activo.\n' +
        '› Espera a que finalice o expire.'
      )

    const partes = args.join(' ').split('/').map(t => t.trim())
    if (partes.length !== 2)
      return m.reply(
        '📘 *Formato correcto*\n\n' +
        `› ${usedPrefix + command} *Tu personaje / Personaje del otro usuario*`
      )

    const [nombrePropio, nombreAjeno] = partes

    const userCharacters = chatData.users?.[userId]?.characters || []
    const personajePropio = findCharacterByName(nombrePropio, userCharacters)

    if (!personajePropio)
      return m.reply(
        `❌ No tienes el personaje:\n` +
        `› *${nombrePropio}*`
      )

    const otherEntry = Object.entries(chatData.users || {}).find(
      ([, u]) =>
        Array.isArray(u.characters) &&
        u.characters.some(
          (c) => c.name?.toLowerCase() === nombreAjeno.toLowerCase()
        )
    )

    if (!otherEntry)
      return m.reply(
        `❌ El personaje *${nombreAjeno}* no está disponible para intercambio.`
      )

    const otherUserId = otherEntry[0]
    const otherCharacters = otherEntry[1].characters
    const personajeAjeno = findCharacterByName(nombreAjeno, otherCharacters)

    if (otherUserId === userId)
      return m.reply('⚠️ No puedes intercambiar contigo mismo.')

    chatData.intercambios = chatData.intercambios || []
    chatData.intercambios.push({
      solicitante: userId,
      destinatario: otherUserId,
      personajeSolicitante: personajePropio,
      personajeDestinatario: personajeAjeno,
      expiracion: Date.now() + 60_000,
    })

    chatData.timeTrade = Date.now() + 60_000

    const mensaje =
      `╭───〔 🔁 𝑰𝒏𝒕𝒆𝒓𝒄𝒂𝒎𝒃𝒊𝒐 〕───╮\n` +
      `│\n` +
      `│ 👤 Solicitante:\n` +
      `│ @${userId.split('@')[0]}\n` +
      `│\n` +
      `│ 🎴 Ofrece:\n` +
      `│ ${personajePropio.name}\n` +
      `│\n` +
      `│ 🎴 Solicita:\n` +
      `│ ${personajeAjeno.name}\n` +
      `│\n` +
      `│ ⏱ Tiempo límite:\n` +
      `│ 1 minuto\n` +
      `│\n` +
      `╰───────────────╯\n\n` +
      `✅ Para aceptar:\n` +
      `› ${usedPrefix}accepttrade\n\n` +
      `❌ Para rechazar:\n` +
      `› ${usedPrefix}rejecttrade`

    await client.sendMessage(
      chatId,
      {
        text: mensaje,
        mentions: [userId, otherUserId],
      },
      { quoted: m }
    )
  },
}