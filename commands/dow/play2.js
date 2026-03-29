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

      let url = args
      if (!url.includes('youtu')) {
        const search = await ytSearch(args.join(' '))
        if (!search || !search) throw new Error('No encontré resultados.')
        url = search.url
      }

      const data = await ytDownload(url, 'video', '360p')
      if (!data || !data.url) throw new Error('No se pudo obtener el enlace de descarga.')

      const caption = `╔══════════════════╗
║  YOUTUBE VIDEO   ║
╠══════════════════╣
║ Titulo   : ${data.title || 'Desconocido'}
║ Canal    : ${data.author || 'Desconocido'}
║ Calidad  : ${data.quality || '360p'}
║ Tamaño   : ${data.size || '---'}
╠══════════════════╣
║ Enlace   : ${url}
╚══════════════════╝`

      const contextInfo = {
        forwardingScore: 999,
        isForwarded: true,
        externalAdReply: {
          showAdAttribution: true,
          title: newsletterName,
          body: 'Descargando video...',
          previewType: 'VIDEO',
          thumbnailUrl: data.thumb,
          sourceUrl: url
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
        fileName: `${data.title}.mp4`
      }, { quoted: m, contextInfo })

    } catch (e) {
      await client.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
      await m.reply(`╔══════════════════╗\n║      ERROR       ║\n╠══════════════════╣\n║ Motivo: ${e.message}\n╚══════════════════╝`)
    }
  }
}
