import { resolveLidToRealJid } from "../../lib/utils.js"

let proposals = {}

export default {
  command: ['marry'],
  category: 'rpg',
  run: async (client, m, args) => {
    if (!m?.chat || !m?.sender) return

    const db = global.db.data
    const chatId = m.chat
    const proposer = m.sender

    const mentioned = m.mentionedJid || []
    const who2 = mentioned.length > 0
      ? mentioned[0]
      : m.quoted?.sender

    if (!who2)
      return m.reply('《✧》 Menciona a la persona con la que quieres casarte.')

    const proposee = await resolveLidToRealJid(who2, client, chatId)

    if (!db.users[proposer] || !db.users[proposee])
      return m.reply('《✧》 Uno de los usuarios no está registrado en el bot.')

    if (proposer === proposee)
      return m.reply('《✧》 No puedes casarte contigo mismo.')

    if (db.users[proposer].marry)
      return m.reply(`《✧》 Ya estás casado con *${db.users[db.users[proposer].marry]?.name || 'alguien'}*.`)

    if (db.users[proposee].marry)
      return m.reply(`《✧》 *${db.users[proposee].name || proposee.split('@')[0]}* ya está casado.`)

    setTimeout(() => {
      delete proposals[proposer]
    }, 120000)

    if (proposals[proposee] === proposer) {
      delete proposals[proposee]

      db.users[proposer].marry = proposee
      db.users[proposee].marry = proposer

      return m.reply(
        `💍 *¡Matrimonio confirmado!*\n\n` +
        `✨ *${db.users[proposer].name || proposer.split('@')[0]}* y ` +
        `*${db.users[proposee].name || proposee.split('@')[0]}* ahora están casados.`
      )
    }

    proposals[proposer] = proposee

    await client.sendMessage(
      chatId,
      {
        text:
          `💌 *@${proposee.split('@')[0]}*, has recibido una propuesta de matrimonio.\n\n` +
          `💍 De: *@${proposer.split('@')[0]}*\n\n` +
          `✧ Para aceptar, responde con:\n` +
          `> *marry @${proposer.split('@')[0]}*\n\n` +
          `⏳ La propuesta expira en 2 minutos.`,
        mentions: [proposer, proposee]
      },
      { quoted: m }
    )
  }
}