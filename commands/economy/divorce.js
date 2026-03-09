export default {
  command: ['divorce'],
  category: 'rpg',
  run: async (client, m) => {
    if (!m?.sender) return

    const db = global.db.data
    const userId = m.sender
    const user = db.users[userId]

    if (!user) {
      return m.reply('❌ No estás registrado en el sistema.')
    }

    const partnerId = user.marry
    if (!partnerId) {
      return m.reply('💔 No estás casado con nadie actualmente.')
    }

    const partner = db.users[partnerId]

    user.marry = ''
    if (partner) partner.marry = ''

    const userName = user.name || userId.split('@')[0]
    const partnerName = partner?.name || partnerId.split('@')[0]

    return m.reply(
      `💔 *DIVORCIO FINALIZADO*\n` +
      `━━━━━━━━━━━━━━\n` +
      `👤 *${userName}*\n` +
      `💍 ha terminado su matrimonio con\n` +
      `👤 *${partnerName}*\n\n` +
      `🕊️ Ahora ambos son libres nuevamente.`
    )
  },
}