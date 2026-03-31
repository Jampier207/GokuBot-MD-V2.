import { pinimg, pinsearch, pinvid } from '../../lib/pinterest.js'

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

    try {
      let results

      if (input.includes('pin.it') || input.includes('pinterest.com/pin/')) {
        const data = await pinimg(input, 5)

        if (Array.isArray(data)) {
          results = data.map(v => v.image)
        } else {
          results = [data.image]
        }
      } else {
        const data = await pinsearch(input, 5)
        results = data.map(v => v.image)
      }

      if (!results.length) {
        return client.sendMessage(m.chat, {
          text: '✦ Sin resultados'
        }, { quoted: m })
      }

      for (let img of results) {
        await client.sendMessage(m.chat, {
          image: { url: img },
          caption: '✎ Resultado'
        }, {
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
      }

    } catch (e) {
      client.sendMessage(m.chat, {
        text: '※ Error al obtener resultados'
      }, { quoted: m })
    }
  }
}