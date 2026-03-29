import axios from 'axios'
import { ytDownload, ytSearch } from '../../lib/scrapers/youtube.js'

const newsletterJid = '120363402960178567@newsletter'
const newsletterName = '🌹 GokuBot-MD ~ Jxmpier207 💖'

export default {
  command: ['play2', 'mp4', 'ytmp4', 'ytvideo', 'playvideo'],
  category: 'downloader',

  run: async (client, m, args, usedPrefix, command) => {

    if (!args[0]) {
      return m.reply(`╔══════════════════╗
║  YOUTUBE VIDEO   ║
╠══════════════════╣
║ Ingrese video o enlace
╚══════════════════╝`)
    }

    let url = args[0]

    try {

      if (!url.includes('youtu')) {
        const results = await ytSearch(args.join(' '))
        if (!results[0]) throw new Error('Sin resultados')
        url = results[0].url
      }

      const data = await ytDownload(url, 'video', '360p')

      if (!data?.url) throw new Error('No se obtuvo video')

      const caption = `╔══════════════════╗
║  YOUTUBE VIDEO   ║
╠══════════════════╣
║ Titulo   : ${data.title || '-'}
║ Canal    : ${data.uploader || '-'}
║ Calidad  : ${data.quality || '360p'}
║ Tamaño   : ${data.size || '-'}
║ Duracion : ${data.duration || '-'}
╠══════════════════╣
║ Enlace   : ${url}
╚══════════════════╝`

      const contextInfo = {
        forwardingScore: 999,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
          newsletterJid,
          newsletterName,
          serverMessageId: 1
        }
      }

      await client.sendMessage(
        m.chat,
        {
          image: { url: data.thumb },
          caption
        },
        { quoted: m, contextInfo }
      )

      const res = await axios.get(data.url, {
        responseType: 'arraybuffer',
        timeout: 120000
      })

      const buffer = res.data

      await client.sendMessage(
        m.chat,
        {
          video: buffer,
          mimetype: 'video/mp4'
        },
        { quoted: m, contextInfo }
      )

    } catch (e) {
      await m.reply(`╔══════════════════╗
║      ERROR       ║
╠══════════════════╣
║ Comando : ${usedPrefix + command}
║ Motivo  : ${e.message}
╚══════════════════╝`)
    }
  }
}