import axios from 'axios'
import { ytDownload, ytSearch } from '../../lib/scrapers/youtube.js'

const newsletterJid = '120363402960178567@newsletter'
const newsletterName = '🌹 GokuBot-MD ~ Jxmpier207 💖'

export default {
  command: ['play2', 'mp4', 'ytmp4', 'ytvideo', 'playvideo'],
  category: 'downloader',

  run: async (client, m, args, usedPrefix, command) => {

    if (!args[0]) {
      return m.reply(`╔══════════════════╗\n║  YOUTUBE VIDEO   ║\n╠══════════════════╣\n║ Ingrese video o enlace\n╚══════════════════╝`)
    }

    try {
      await client.sendMessage(m.chat, { react: { text: '🔍', key: m.key } })

      let url = args.join(' ')
      let searchData = null

      if (!url.includes('youtu')) {
        const search = await ytSearch(url)
        if (!search) throw new Error('No encontré resultados.')
        url = search.url
        searchData = search
      }

      let data = null
      const qualities = ['360p', '480p', '720p', 'auto']
      
      for (let q of qualities) {
        try {
          data = await ytDownload(url, 'video', q)
          if (data && data.url) break
        } catch (e) {
          continue
        }
      }

      if (!data || !data.url) throw new Error('Sin formatos disponibles')

      const caption = `╔══════════════════╗
║  YOUTUBE VIDEO   ║
╠══════════════════╣
║ Titulo   : ${data.title || searchData?.title || 'Desconocido'}
║ Canal    : ${data.author || searchData?.author || 'Desconocido'}
║ Calidad  : ${data.quality || '360p'}
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
        image: { url: data.thumb || searchData?.thumbnail || '' }, 
        caption 
      }, { quoted: m, contextInfo })

      await client.sendMessage(m.chat, { react: { text: '✅', key: m.key } })

      await client.sendMessage(m.chat, { 
        video: { url: data.url }, 
        mimetype: 'video/mp4',
        fileName: `${data.title || 'video'}.mp4`,
        caption: `🎥 ${data.title || ''}`
      }, { quoted: m, contextInfo })

    } catch (e) {
      await client.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
      await m.reply(`╔══════════════════╗\n║      ERROR       ║\n╠══════════════════╣\n║ Motivo: ${e.message}\n╚══════════════════╝`)
    }
  }
}
