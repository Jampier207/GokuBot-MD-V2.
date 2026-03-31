import axios from 'axios'
import { pinvid } from '../../lib/scrapers/pinterest.js'

export default {
  command: ['pinvid'],
  category: 'search',
  run: async (client, m, args) => {
    const newsletterJid = '120363402960178567@newsletter'

    if (!args[0]) {
      return client.sendMessage(m.chat, {
        text: '※ Ingresa texto o link'
      }, { quoted: m })
    }

    const input = args.join(' ')
    let medias = []

    try {
      const results = await pinvid(input, 10)

      for (const result of results) {
        const url = result.video || result.sd || result.original
        if (!url) continue

        try {
          await axios.head(url, { timeout: 5000 })

          const caption =
            `➤ Pinterest Video\n\n` +
            `❖ Calidad HD disponible`

          medias.push({
            type: 'video',
            data: { url },
            caption
          })

          if (medias.length >= 5) break

        } catch {
          continue
        }
      }

      if (!medias.length) {
        return client.sendMessage(m.chat, {
          text: '✦ Sin videos'
        }, { quoted: m })
      }

      await client.sendAlbumMessage(m.chat, medias, {
        quoted: m,
        contextInfo: {
          forwardingScore: 999,
          isForwarded: true,
          forwardedNewsletterMessageInfo: {
            newsletterJid,
            newsletterName: '🌹 GokuBot-MD ~ Jxmpier207 💖'
          }
        }
      })

    } catch (e) {
      client.sendMessage(m.chat, {
        text: '※ Error al obtener videos'
      }, { quoted: m })
    }
  }
}