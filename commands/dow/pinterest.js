import { pinimg, pinsearch } from '../../lib/scrapers/pinterest.js'

export default {
  command: ['pin', 'pinterest'],
  category: 'search',
  run: async (client, m, args) => {
    const newsletterJid = '120363402960178567@newsletter'

    if (!args[0]) {
      return client.sendMessage(m.chat, {
        text: '※ Ingresa texto o link de Pinterest'
      }, { quoted: m })
    }

    const input = args.join(' ')
    let medias = []

    try {
      let results = []
      let isLink = input.includes('pin.it') || input.includes('pinterest.com/pin/')

      if (isLink) {
        const data = await pinimg(input, 10)
        results = Array.isArray(data) ? data : [data]
      } else {
        results = await pinsearch(input, 10)
      }

      for (const result of results.slice(0, 10)) {

        let caption = `➤ Pinterest\n\n`

        if (isLink) {
          caption +=
            `${result.title ? `❖ ${result.title}\n` : ''}` +
            `${result.creator?.fullName ? `※ ${result.creator.fullName}\n` : ''}` +
            `${result.saves ? `✦ ${result.saves} saves\n` : ''}` +
            `${result.createdAt ? `✎ ${result.createdAt}` : ''}`
        }

        medias.push({
          type: 'image',
          data: { url: result.image || result.url },
          caption: caption.trim()
        })
      }

      if (!medias.length) {
        return client.sendMessage(m.chat, {
          text: '✦ Sin resultados'
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
        text: '※ Error al obtener resultados'
      }, { quoted: m })
    }
  }
}