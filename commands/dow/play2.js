import { ytDownload, ytSearch } from '../../lib/scrapers/youtube.js'

export default {
  command: ['play2', 'mp4', 'ytmp4', 'ytvideo', 'playvideo'],
  category: 'downloader',

  run: async (client, m, args, usedPrefix, command) => {

    if (!args[0]) {
      return m.reply(
`╭──────────────
│ Ingrese video o enlace
╰──────────────`)
    }

    let url = args[0]

    try {

      if (!url.includes('youtu')) {
        const results = await ytSearch(args.join(' '))
        url = results[0].url
      }

      let data

      try {
        data = await ytDownload(url, 'video', '360p')
      } catch {
        try {
          data = await ytDownload(url, 'video', '240p')
        } catch {
          data = await ytDownload(url, 'video', '144p')
        }
      }

      const caption =
`╭──────────────
│ YOUTUBE VIDEO
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
          video: { url: data.url },
          mimetype: 'video/mp4',
          fileName: 'video.mp4',
          caption
        },
        { quoted: m }
      )

    } catch (e) {
      await m.reply(
`╭──────────────
│ Error en ${usedPrefix + command}
│ ${e.message}
╰──────────────`)
    }
  }
}