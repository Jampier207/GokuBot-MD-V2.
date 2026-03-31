import { pinsearch } from '../../lib/scrapers/pinterest.js'

global.pinSessions = global.pinSessions || new Map()

export default {
  command: ['pin', 'next'],
  category: 'search',

  run: async (client, m, args, command) => {

    if (command === 'next') {
      const session = global.pinSessions.get(m.sender)
      if (!session) return m.reply('No hay búsqueda activa')

      session.index++

      if (session.index >= session.results.length) {
        global.pinSessions.delete(m.sender)
        return m.reply('No hay más resultados')
      }

      const item = session.results[session.index]

      return client.sendMessage(
        m.chat,
        {
          image: { url: item.image },
          caption:
            `Resultado ${session.index + 1}/${session.results.length}\n` +
            `Búsqueda: ${session.text}`
        },
        { quoted: m }
      )
    }

    const text = args.join(' ')
    if (!text) return m.reply('Ingresa una búsqueda')

    try {
      const results = await pinsearch(text, 10)

      if (!results || results.length === 0) {
        return m.reply('Sin resultados')
      }

      global.pinSessions.set(m.sender, {
        index: 4,
        results,
        text
      })

      const firstFive = results.slice(0, 5)

      for (let i = 0; i < firstFive.length; i++) {
        const item = firstFive[i]

        await client.sendMessage(
          m.chat,
          {
            image: { url: item.image },
            caption:
              `Resultado ${i + 1}/${results.length}\n` +
              `Búsqueda: ${text}`
          },
          { quoted: m }
        )
      }

    } catch (e) {
      m.reply('Error: ' + e.message)
    }
  }
}