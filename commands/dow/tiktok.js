import fetch from 'node-fetch';

export default {
  command: ['tiktok', 'tt'],
  category: 'downloader',

  run: async (client, m, args) => {

    if (!args.length) {
      return m.reply(
`╔═━━〔 𝙏𝙄𝙆𝙏𝙊𝙆 〕━━═╗
║ ◈ Ingresa un término o enlace
║ ◈ Ejemplo:
║   .tt https://vt.tiktok.com/xxxx
║   .tt gatos virales
╚═════════════════════╝`)
    }

    const urls = args.filter(arg => arg.includes("tiktok.com"))

    if (urls.length) {

      if (urls.length > 1) {

        const medias = []

        for (const url of urls.slice(0, 10)) {
          try {
            const apiUrl = `${api.url}/dl/tiktok?url=${url}&key=${api.key}`
            const res = await fetch(apiUrl)
            if (!res.ok) continue

            const json = await res.json()
            const data = json.data
            if (!data) continue

            const {
              title = 'Sin título',
              dl,
              duration,
              author = {},
              stats = {},
              music = {},
            } = data

            const caption =
`╔═━━〔 𝙏𝙄𝙆𝙏𝙊𝙆 𝘿𝙇 〕━━═╗
║ ◈ Título      : ${title}
║ ◈ Autor       : ${author.nickname || author.unique_id || 'Desconocido'}
║ ◈ Duración    : ${duration || 'N/A'}
║ ◈ Likes       : ${(stats.likes || 0).toLocaleString()}
║ ◈ Comentarios : ${(stats.comments || 0).toLocaleString()}
║ ◈ Vistas      : ${(stats.views || stats.plays || 0).toLocaleString()}
║ ◈ Compartidos : ${(stats.shares || 0).toLocaleString()}
║ ◈ Audio       : ${music.title ? music.title + ' - ' : ''}${music.author || 'Desconocido'}
╚═════════════════════╝`

            medias.push({
              type: 'video',
              data: { url: dl },
              caption
            })

          } catch {}
        }

        if (medias.length) {
          await client.sendAlbumMessage(m.chat, medias, { quoted: m })
        } else {
          await m.reply(
`╔═━━〔 ERROR 〕━━═╗
║ No se pudieron procesar
║ los enlaces enviados.
╚════════════════╝`)
        }

      } else {

        const url = urls[0]

        try {
          const apiUrl = `${api.url}/dl/tiktok?url=${url}&key=${api.key}`
          const res = await fetch(apiUrl)
          if (!res.ok) throw new Error()

          const json = await res.json()
          const data = json.data
          if (!data) {
            return m.reply(
`╔═━━〔 ERROR 〕━━═╗
║ No se encontraron datos
║ para el enlace enviado.
╚════════════════╝`)
          }

          const {
            title = 'Sin título',
            dl,
            duration,
            author = {},
            stats = {},
            music = {},
          } = data

          const caption =
`╔═━━〔 𝙏𝙄𝙆𝙏𝙊𝙆 𝘿𝙇 〕━━═╗
║ ◈ Título      : ${title}
║ ◈ Autor       : ${author.nickname || author.unique_id || 'Desconocido'}
║ ◈ Duración    : ${duration || 'N/A'}
║ ◈ Likes       : ${(stats.likes || 0).toLocaleString()}
║ ◈ Comentarios : ${(stats.comments || 0).toLocaleString()}
║ ◈ Vistas      : ${(stats.views || stats.plays || 0).toLocaleString()}
║ ◈ Compartidos : ${(stats.shares || 0).toLocaleString()}
║ ◈ Audio       : ${music.title ? music.title + ' - ' : ''}${music.author || 'Desconocido'}
╚═════════════════════╝`

          await client.sendMessage(
            m.chat,
            { video: { url: dl }, caption },
            { quoted: m }
          )

        } catch {
          m.reply(msgglobal)
        }
      }

    } else {

      const query = args.join(" ")

      try {
        const apiUrl = `${api.url}/search/tiktok?query=${encodeURIComponent(query)}&key=${api.key}`
        const res = await fetch(apiUrl)
        if (!res.ok) throw new Error()

        const json = await res.json()
        const results = json.data

        if (!results || results.length === 0) {
          return m.reply(
`╔═━━〔 𝙎𝙀𝘼𝙍𝘾𝙃 〕━━═╗
║ No se encontraron
║ resultados para:
║ ${query}
╚══════════════════╝`)
        }

        const data = results[0]

        const {
          title = 'Sin título',
          dl,
          duration,
          author = {},
          stats = {},
          music = {},
        } = data

        const caption =
`╔═━━〔 𝙏𝙄𝙆𝙏𝙊𝙆 𝙎𝙀𝘼𝙍𝘾𝙃 〕━━═╗
║ ◈ Título      : ${title}
║ ◈ Autor       : ${author.nickname || author.unique_id || 'Desconocido'}
║ ◈ Duración    : ${duration || 'N/A'}
║ ◈ Likes       : ${(stats.likes || 0).toLocaleString()}
║ ◈ Comentarios : ${(stats.comments || 0).toLocaleString()}
║ ◈ Vistas      : ${(stats.views || stats.plays || 0).toLocaleString()}
║ ◈ Compartidos : ${(stats.shares || 0).toLocaleString()}
║ ◈ Audio       : ${music.title ? music.title + ' - ' : ''}${music.author || 'Desconocido'}
╚════════════════════════╝`

        await client.sendMessage(
          m.chat,
          { video: { url: dl }, caption },
          { quoted: m }
        )

      } catch {
        m.reply(msgglobal)
      }
    }
  }
};