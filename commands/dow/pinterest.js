import scraper from 'zenbot-scraper'

global.pinSessions = global.pinSessions || new Map()

export default {
  command: ['pin', 'pinterest', 'next'],
  category: 'search',

  run: async (client, m, args, command) => {

    if (command === 'next') {
      const session = global.pinSessions.get(m.sender)
      if (!session) return m.reply('No hay búsqueda activa')

      session.index++

      if (session.index >= session.list.length) {
        global.pinSessions.delete(m.sender)
        return m.reply('No hay más resultados')
      }

      const img = session.list[session.index]

      return client.sendMessage(
        m.chat,
        {
          image: { url: img },
          caption:
            `*Resultado ${session.index + 1}/${session.list.length}*\n` +
            `*Búsqueda:* ${session.text}\n\n` +
            `Usa *.next*`
        },
        { quoted: m }
      )
    }

    const text = args.join(' ')
    if (!text) return m.reply('Ingresa una búsqueda')

    try {
      const results = await scraper.pinterest(text)

      if (!results || results.length === 0) {
        return m.reply('Sin resultados')
      }

      const list = results.slice(0, 10)

      global.pinSessions.set(m.sender, {
        index: 0,
        list,
        text
      })

      await client.sendMessage(
        m.chat,
        {
          image: { url: list[0] },
          caption:
            `*Resultado 1/${list.length}*\n` +
            `*Búsqueda:* ${text}\n\n` +
            `Usa *.next*`
        },
        { quoted: m }
      )

    } catch (e) {
      m.reply('Error: ' + e.message)
    }
  },
}