export default {
  command: ['restart'],
  category: 'owner',
  owner: true,

  run: async (client, m) => {
    if (!m?.sender) return

    const owners = (global.owner || []).map(v =>
      typeof v === 'string' ? v : v[0]
    )

    if (!owners.includes(m.sender.split('@')[0])) {
      return m.reply('🚫 Solo el owner puede usar este comando.')
    }

    await client.reply(
      m.chat,
      `🍧 Reiniciando el Bot...\n> *Espere un momento...*`,
      m
    )

    setTimeout(() => {
      process.exit(0)
    }, 3000)
  }
}