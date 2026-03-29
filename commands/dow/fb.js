import { fbDownload } from '../../lib/scrapers/facebook.js'

export default {
  command: ['fb', 'facebook'],
  category: 'downloader',
  run: async (client, m, args, usedPrefix, command) => {

    if (!args[0]) {
      return m.reply(
`╭──────────────
│ Ingrese un enlace de Facebook
╰──────────────`)
    }

    if (!args[0].match(/facebook\.com|fb\.watch|fb\.com/)) {
      return m.reply(
`╭──────────────
│ Enlace no válido
╰──────────────`)
    }

    try {
      const data = await fbDownload(args[0])

      const video = data.hd || data.sd
      if (!video) throw new Error('No hay video disponible')

      const caption =
`╭──────────────
│ FACEBOOK DOWNLOAD
├──────────────
│ Titulo     :: ${data.title || '-'}
│ Calidad    :: ${data.hd ? 'HD' : 'SD'}
│ Fuente     :: ${data.source}
├──────────────
│ Link       :: ${args[0]}
╰──────────────`

      await client.sendMessage(
        m.chat,
        {
          video: { url: video },
          caption,
          mimetype: 'video/mp4',
          fileName: 'facebook.mp4'
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