import axios from 'axios'
import { ytDownload, ytSearch } from '../../lib/scrapers/youtube.js'

export default {
  command: ['play', 'mp3', 'ytmp3', 'ytaudio', 'playaudio'],
  category: 'downloader',

  run: async (client, m, args, usedPrefix, command) => {

    if (!args[0]) {
      return m.reply(`╭──────────────
│ Ingrese canción o enlace
╰──────────────`)
    }

    let url = args[0]

    try {

      if (!url.includes('youtu')) {
        const results = await ytSearch(args.join(' '))
        if (!results[0]) throw new Error('Sin resultados')
        url = results[0].url
      }

      await m.reply('⏳ Descargando audio...')

      const data = await ytDownload(url, 'mp3', '128k')

      if (!data?.url) throw new Error('No se obtuvo audio')

      const res = await axios.get(data.url, {
        responseType: 'arraybuffer',
        timeout: 60000
      })

      const buffer = res.data

      await client.sendMessage(
        m.chat,
        {
          audio: buffer,
          mimetype: 'audio/mpeg'
        },
        { quoted: m }
      )

      await m.reply(`╭──────────────
│ AUDIO LISTO
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