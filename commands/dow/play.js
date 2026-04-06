import axios from 'axios'
import { ytDownload, ytSearch } from '../../lib/scrapers/youtube.js'

const newsletterJid = '120363402960178567@newsletter'
const newsletterName = '🌹 GokuBot-MD ~ Jxmpier207 💖'

export default {
  command: ['play', 'mp3', 'ytmp3', 'ytaudio', 'playaudio'],
  category: 'downloader',

  run: async (client, m, args, usedPrefix, command) => {

    if (!args[0]) {
      return m.reply(`╔══════════════════╗\n║  YOUTUBE AUDIO   ║\n╠══════════════════╣\n║ Ingrese canción o enlace\n╚══════════════════╝`)
    }

    let url = args[0]

    try {
      if (!url.includes('youtu')) {
        const results = await ytSearch(args.join(' '))
        if (!results[0]) throw new Error('Sin resultados')
        url = results[0].url
      }

      const data = await ytDownload(url, 'mp3', '128k')
      if (!data?.url) throw new Error('No se obtuvo audio')

      const caption = `╔══════════════════╗\n║  YOUTUBE AUDIO   ║\n╠══════════════════╣\n║ Titulo   : ${data.title || '-'}\n║ Canal    : ${data.uploader || '-'}\n║ Calidad  : ${data.quality || '128k'}\n║ Tamaño   : ${data.size || '-'}\n║ Duracion : ${data.duration || '-'}\n╠══════════════════╣\n║ Enlace   : ${url}\n╚══════════════════╝`

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
          caption,
          contextInfo
        },
        { quoted: m }
      )

      const res = await axios.get(data.url, {
        responseType: 'arraybuffer',
        timeout: 60000
      })

      const buffer = res.data

      await client.sendMessage(
        m.chat,
        {
          audio: buffer,
          mimetype: 'audio/mpeg',
          contextInfo
        },
        { quoted: m }
      )

    } catch (e) {
      await m.reply(`╔══════════════════╗\n║      ERROR       ║\n╠══════════════════╣\n║ Comando : ${usedPrefix + command}\n║ Motivo  : ${e.message}\n╚══════════════════╝`)
    }
  }
}