import { ytDownload, ytSearch } from '../../lib/scrapers/youtube.js'

export default {
  command: ['play'],
  category: 'downloader',

  run: async (client, m, args, usedPrefix, command) => {

    if (!args[0]) {
      return m.reply(
`╭──────────────
│ Ingrese canción o enlace
╰──────────────`)
    }

    let url = args[0]

    try {

      if (!url.includes('youtu')) {
        const results = await ytSearch(args.join(' '))
        if (!results[0]?.url) throw new Error('No se encontró resultado')
        url = results[0].url
      }

      let data

      try {
        data = await ytDownload(url, 'mp3', '128k')
      } catch {
        data = await ytDownload(url, 'mp3', '64k')
      }

      if (!data || !data.url) {
        throw new Error('No se obtuvo audio')
      }

      const caption =
`╭──────────────
│ YOUTUBE AUDIO
├──────────────
│ Titulo   :: ${data.title || '-'}
│ Canal    :: ${data.uploader || '-'}
│ Calidad  :: ${data.quality}
│ Tamaño   :: ${data.size || '-'}
├──────────────
│ Link     :: ${url}
╰──────────────`

      await client.sendMessage(
        m.chat,
        {
          audio: { url: data.url },
          mimetype: 'audio/mpeg'
        },
        { quoted: m }
      )

      await m.reply(caption)

    } catch (e) {
      await m.reply(
`╭──────────────
│ Error en ${usedPrefix + command}
│ ${e.message}
╰──────────────`)
    }
  }
}