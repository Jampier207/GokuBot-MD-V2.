import yts from 'yt-search'
import fetch from 'node-fetch'

export default {
  name: 'play',
  command: ['play'],
  category: 'descarga',

  async run(ctx) {
    const { sock: conn, m, from, args } = ctx

    try {
      const query = Array.isArray(args) ? args.join(' ').trim() : ''

      if (!query) {
        return await conn.sendMessage(
          from,
          { text: 'Ejemplo:\n.play anuel aa' },
          { quoted: m }
        )
      }

      const res = await yts(query)
      const videos = Array.isArray(res?.videos) ? res.videos.slice(0, 10) : []

      if (!videos.length) {
        return await conn.sendMessage(
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
      } catch {}

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
        await conn.sendMessage(
          from,
          {
            image: thumbBuffer,
            caption:
              `🎵 *GOKUBOT-MD*\n\n` +
              `🔎 Resultado para: *${query}*\n` +
              `📌 Primer resultado: *${videos[0].title}*`
          },
          { quoted: m }
        )
      }

      await conn.sendMessage(
        from,
        {
          text: `Resultados para: ${query}`,
          footer: 'Descargas YouTube',
          title: '🎧 Selecciona formato',
          buttonText: 'Ver opciones',
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
      return await conn.sendMessage(
        from,
        { text: `Error:\n${e?.message || e}` },
        { quoted: m }
      )
    }
  }
}