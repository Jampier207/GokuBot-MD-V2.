import axios from 'axios'
import { ytDownload, ytSearch } from '../../lib/scrapers/youtube.js'

const newsletterJid = '120363402960178567@newsletter'
const newsletterName = '🌹 GokuBot-MD ~ Jxmpier207 💖'

export default {
  command: ['play2', 'mp4', 'ytmp4', 'ytvideo', 'playvideo'],
  category: 'downloader',

  run: async (client, m, args, usedPrefix, command) => {

    if (!args) {
      return m.reply(`╔══════════════════╗\n║  YOUTUBE VIDEO   ║\n╠══════════════════╣\n║ Ingrese video o enlace\n╚══════════════════╝`)
    }

    try {
      await client.sendMessage(m.chat, { react: { text: '🔍', key: m.key } })

      let url = args.join(' ')
      if (!url.includes('youtu')) {
        const search = await ytSearch(url)
        if (!search) throw new Error('No encontré resultados.')
        url = search.url
      }

      let data = await ytDownload(url, 'video', '360p').catch(() => null)
      
      if (!data || !data.url) {
        data = await ytDownload(url, 'video', '720p').catch(() => null)
      }
      
      if (!data || !data.url) {
        data = await ytDownload(url, 'video', 'auto').catch(() => null)
      }

      if (!data || !data.url) throw new Error('Sin formatos disponibles.')

      const caption = `╔══════════════════╗
║  YOUTUBE VIDEO   ║
╠══════════════════╣
║ Titulo   : ${data.title || 'Desconocido'}
║ Canal    : ${data.author || 'Desconocido'}
║ Calidad  : ${data.quality || 'Procesando'}
║ Tamaño   : ${data.size || '---'}
╠══════════════════╣
║ Enlace   : ${url}
╚══════════════════╝`

      const contextInfo = {
        forwardingScore: 999,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
          newsletterJid,
          newsletterName,
          serverMessageId: 143
        }
      }

      await client.sendMessage(m.chat, { 
        image: { url: data.thumb }, 
        caption 
      }, { quoted: m, contextInfo })

      await client.sendMessage(m.chat, { react: { text: '✅', key: m.key } })

      await client.sendMessage(m.chat, { 
        video: { url: data.url }, 
        mimetype: 'video/mp4',
        fileName: `${data.title}.mp4`,
        caption: `🎥 ${data.title}`
      }, { quoted: m, contextInfo })

    } catch (e) {
      await client.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
      await m.reply(`╔══════════════════╗\n║      ERROR       ║\n╠══════════════════╣\n║ Motivo: ${e.message}\n╚══════════════════╝`)
    }
  }
}
