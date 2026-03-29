import { ytDownload, ytSearch } from '../../lib/scrapers/youtube.js'

export default {
  command: ['play', 'mp3', 'ytmp3', 'ytaudio', 'playaudio'],
  category: 'downloader',

  run: async (client, m, args, usedPrefix, command) => {

    if (!args[0]) {
      return m.reply(
`╭──────────────
│ Ingrese enlace o búsqueda
╰──────────────`)
    }

    let url = args[0]

    try {

      if (!url.includes('youtu')) {
        const results = await ytSearch(args.join(' '))
        url = results[0].url
      }

      const isAudio = args.includes('--mp3') || args.includes('-a')

      const data = await ytDownload(
        url,
        isAudio ? 'mp3' : 'video',
        isAudio ? '128k' : '360p'
      )

      const caption =
`╭──────────────
│ YOUTUBE DOWNLOAD
├──────────────
│ Titulo   :: ${data.title || '-'}
│ Canal    :: ${data.uploader || '-'}
│ Calidad  :: ${data.quality}
│ Tamaño   :: ${data.size || '-'}
│ Tipo     :: ${data.type}
├──────────────
│ Link     :: ${url}
╰──────────────`

      if (data.type === 'audio') {

        await client.sendMessage(
          m.chat,
          {
            audio: { url: data.url },
            mimetype: 'audio/mpeg',
            fileName: 'youtube.mp3',
            caption
          },
          { quoted: m }
        )

      } else {

        await client.sendMessage(
          m.chat,
          {
            video: { url: data.url },
            mimetype: 'video/mp4',
            fileName: 'youtube.mp4',
            caption
          },
          { quoted: m }
        )

      }

    } catch (e) {
      await m.reply(
`╭──────────────
│ Error en ${usedPrefix + command}
│ ${e.message}
╰──────────────`)
    }
  }
}