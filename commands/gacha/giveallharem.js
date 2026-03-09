import { resolveLidToRealJid } from "../../lib/utils.js"

export default {
  command: ['giveallharem'],
  category: 'gacha',
  run: async (client, m) => {
    if (!m || !m.chat) return

    const db = global.db.data
    const chatId = m.chat
    const senderId = m.sender
    const chatData = db.chats?.[chatId]

    if (!chatData) return m.reply('✦ Este chat no está registrado.')

    if (chatData.adminonly || !chatData.gacha)
      return m.reply('✦ El sistema gacha está desactivado en este grupo.')

    const mentioned =
      m.mentionedJid?.[0] ||
      (m.quoted ? m.quoted.sender : null)

    if (!mentioned)
      return m.reply('✦ Menciona o responde al usuario que recibirá tu harem.')

    const realJid = await resolveLidToRealJid(mentioned, client, chatId)

    if (!realJid || realJid === senderId)
      return m.reply('✦ No puedes regalarte personajes a ti mismo.')

    const fromUser = chatData.users?.[senderId]
    if (!fromUser?.characters?.length)
      return m.reply('✦ No tienes personajes para regalar.')

    if (!chatData.users[realJid]) {
      chatData.users[realJid] = {
        characters: [],
        characterCount: 0,
        totalRwcoins: 0
      }
    }

    const toUser = chatData.users[realJid]

    const cantidad = fromUser.characters.length
    const primerPersonaje = fromUser.characters[0]?.name || "Personaje"

    for (const char of fromUser.characters) {
      toUser.characters.push(char)
      toUser.characterCount++
      toUser.totalRwcoins += char.value || 0
    }

    fromUser.characters = []
    fromUser.characterCount = 0
    fromUser.totalRwcoins = 0

    let texto

    if (cantidad === 1) {
      texto = `✦ @${senderId.split('@')[0]} dio a *${primerPersonaje}* a @${realJid.split('@')[0]}`
    } else {
      texto = `✦ @${senderId.split('@')[0]} dio *todo su harem (${cantidad})* a @${realJid.split('@')[0]}`
    }

    const mensaje = `
╭〔 GACHA TRANSFER 〕
│
│ ${texto}
│
╰──────────────
`.trim()

    await client.sendMessage(
      chatId,
      {
        text: mensaje,
        mentions: [senderId, realJid]
      },
      { quoted: m }
    )
  }
}