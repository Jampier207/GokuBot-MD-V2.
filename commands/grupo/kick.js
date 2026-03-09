import { jidDecode } from '@whiskeysockets/baileys'

export default {
  command: ['kick'],
  category: 'grupo',
  isAdmin: true,
  botAdmin: true,
  run: async (...args) => {
    const conn = args.find(a => a?.user) || global.conn
    const m = args.find(a => a?.key?.remoteJid)
    if (!conn || !m) return

    const chatId = m.key.remoteJid

    const reply = (text, mentions = []) =>
      conn.sendMessage(chatId, { text, mentions }, { quoted: m })

    const context =
      m.message?.extendedTextMessage?.contextInfo || {}

    const mentioned =
      context.mentionedJid || []

    const user =
      mentioned.length > 0
        ? mentioned[0]
        : context.participant || null

    if (!user) {
      return reply('🌱 Menciona o responde al mensaje del usuario que deseas expulsar.')
    }

    let metadata
    try {
      metadata = await conn.groupMetadata(chatId)
    } catch {
      return reply('❌ No se pudo obtener la información del grupo.')
    }

    const ownerGroup =
      metadata.owner || chatId.split('-')[0] + '@s.whatsapp.net'

    const ownerBot =
      global.owner?.[0]?.[0]
        ? global.owner[0][0] + '@s.whatsapp.net'
        : null

    const botJid =
      jidDecode(conn.user.id)?.user + '@s.whatsapp.net'

    if (user === botJid) {
      return reply('🤖 No puedo expulsarme a mí mismo.')
    }

    if (user === ownerGroup) {
      return reply('🚫 No puedo expulsar al propietario del grupo.')
    }

    if (ownerBot && user === ownerBot) {
      return reply('🚫 No puedo expulsar al propietario del bot.')
    }

    const participant = metadata.participants.find(
      p => p.id === user
    )

    if (!participant) {
      return reply(
        `⚠️ @${user.split('@')[0]} ya no está en el grupo.`,
        [user]
      )
    }

    try {
      await conn.groupParticipantsUpdate(chatId, [user], 'remove')
      return reply(
        `👢 @${user.split('@')[0]} fue expulsado del grupo.`,
        [user]
      )
    } catch (e) {
      console.error(e)
      return reply('❌ Ocurrió un error al expulsar al usuario.')
    }
  }
}