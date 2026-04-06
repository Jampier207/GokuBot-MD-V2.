import yts from 'yt-search'
import fetch from 'node-fetch'

export default {
  command: ['play'],
  category: 'descarga',

  run: async (client, m, args) => {
    try {
      const from = m.chat
      const query = args.join(' ').trim()

      if (!query) {
        return client.sendMessage(
          from,
          { text: 'Ejemplo:\n.play anuel aa' },
          { quoted: m }
        )
      }

      const res = await yts(query)
      const videos = Array.isArray(res?.videos) ? res.videos.slice(0, 10) : []

      if (!videos.length) {
        return client.sendMessage(
          from,
          { text: 'No encontré resultados.' },
          { quoted: m }
        )
      }

      let thumbBuffer = null
      try {
        if (videos[0]?.thumbnail) {
          const response = await fetch(videos[0].thumbnail)
          const arrayBuffer = await response.arrayBuffer()
          thumbBuffer = Buffer.from(arrayBuffer)
        }
      } catch (e) {}

      const mp3Rows = videos.map((v, i) => ({
        title: String(v.title || 'Sin título').slice(0, 72),
        description: `🎵 MP3 | ⏱ ${v.timestamp || '??:??'} | 👤 ${v.author?.name || 'Desconocido'}`.slice(0, 72),
        rowId: `.ytmp3 ${v.url}`
      }))

      const mp4Rows = videos.map((v, i) => ({
        title: String(v.title || 'Sin título').slice(0, 72),
        description: `🎬 MP4 | ⏱ ${v.timestamp || '??:??'} | 👤 ${v.author?.name || 'Desconocido'}`.slice(0, 72),
        rowId: `.ytmp4 ${v.url}`
      }))

      if (thumbBuffer) {
        await client.sendMessage(
          from,
          {
            image: thumbBuffer,
            caption:
              `🎵 *GokuBot-MD*\n\n` +
              `🔎 Resultado para: *${query}*\n` +
              `📌 Primer resultado: *${videos[0].title}*\n\n` +
              `Selecciona una opción abajo`
          },
          { quoted: m }
        )
      } else {
        await client.sendMessage(
          from,
          {
            text:
              `🎵 *GokuBot-MD*\n\n` +
              `🔎 Resultado para: *${query}*\n\n` +
              `Selecciona una opción abajo`
          },
          { quoted: m }
        )
      }

      await client.sendMessage(
  from,
  {
    text: `Resultados para: ${query}`,
    footer: 'GokuBot-MD',
    title: '🎧 Descargas YouTube',
    buttonText: 'Seleccionar',
    sections: [
      {
        title: '🎵 Descargar MP3',
        rows: mp3Rows
      },
      {
        title: '🎬 Descargar MP4',
        rows: mp4Rows
      }
    ]
  },
  { quoted: m }
)
    } catch (e) {
      console.error(e)
      return m.reply(`Error:\n${e?.message || e}`)
    }
  }
}