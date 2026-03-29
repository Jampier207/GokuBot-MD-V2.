import axios from 'axios'
import { ytDownload, ytSearch } from '../../lib/scrapers/youtube.js'

export default {
  command: ['play2', 'mp4', 'ytmp4', 'ytvideo', 'playvideo'],
  category: 'downloader',

  run: async (client, m, args, usedPrefix, command) => {

    if (!args[0]) {
      return m.reply(`╭──────────────
│ Ingrese video o enlace
╰──────────────`)
    }

    let url = args[0]

    try {

      if (!url.includes('youtu')) {
        const results = await ytSearch(args.join(' '))
        if (!results[0]) throw new Error('Sin resultados')
        url = results[0].url
      }

      await m.reply('⏳ Descargando video...')

      const data = await ytDownload(url, 'video', '360p')

      if (!data?.url) throw new Error('No se obtuvo video')

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
        { quoted: m }
      )

      await m.reply(`╭──────────────
│ VIDEO LISTO
├──────────────
│ ${data.title}
╰──────────────`)

    } catch (e) {
      await m.reply(`╭──────────────
│ Error en ${usedPrefix + command}
│ ${e.message}
╰──────────────`)
    }
  }
}