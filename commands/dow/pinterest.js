import { pinsearch } from '../../lib/scrapers/pinterest.js'

export default {
  command: ['pin', 'pinterest'],
  category: 'search',

  run: async (client, m, args) => {

    const text = args.join(' ')
    if (!text) return m.reply('✎ Ingresa una búsqueda')

    try {
      const results = await pinsearch(text, 10)

      if (!results || results.length === 0) {
        return m.reply('✎ Sin resultados')
      }

      const medias = []

      for (const result of results.slice(0, 10)) {

        const caption =
          `➤ Pinterest Search\n\n` +
          `${result.title ? `❖ Título: ${result.title}\n` : ''}` +
          `${result.full_name ? `※ Autor: ${result.full_name}\n` : ''}` +
          `${result.likes ? `✦ Likes: ${result.likes}\n` : ''}` +
          `${result.created ? `✎ Fecha: ${result.created}` : ''}`

        medias.push({
          type: 'image',
          data: { url: result.hd || result.url },
          caption
        })
      }

      if (medias.length) {
        await client.sendAlbumMessage(m.chat, medias, { quoted: m })
      } else {
        await m.reply('✎ No se pudieron procesar los resultados')
      }

    } catch (e) {
      m.reply('✎ Error: ' + e.message)
    }
  }
}