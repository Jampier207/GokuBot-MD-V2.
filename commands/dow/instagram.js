import { igDownload } from '../../lib/scrapers/instagram.js'

export default {
  command: ['instagram', 'ig', 'reel'],
  category: 'downloader',

  run: async (client, m, args) => {

    if (!args.length) {
      return m.reply(
        '┌─[ Instagram ]\n' +
        '│ Ingresa un enlace\n' +
        '└────────────'
      )
    }

    const urls = args.filter(v =>
      /https?:\/\/(www\.)?instagram\.com\/(p|reel|tv|share)\//.test(v)
    )

    if (!urls.length) {
      return m.reply(
        '┌─[ Error ]\n' +
        '│ Enlace inválido\n' +
        '└────────────'
      )
    }

    try {
      if (urls.length > 1) {
        const medias = []

        for (const url of urls.slice(0, 10)) {
          try {
            const res = await igDownload(url)

            for (const media of res.items.slice(0, 10)) {
              medias.push({
                type: media.type === 'video' ? 'video' : 'image',
                data: { url: media.url }
              })
            }
          } catch {}
        }

        if (!medias.length) {
          return m.reply(
            '┌─[ Fallo ]\n' +
            '│ No se pudo obtener contenido\n' +
            '└────────────'
          )
        }

        await client.sendAlbumMessage(m.chat, medias, { quoted: m })

      } else {
        const res = await igDownload(urls[0])

        if (!res || !res.items.length) {
          return m.reply(
            '┌─[ Fallo ]\n' +
            '│ Sin contenido\n' +
            '└────────────'
          )
        }

        if (res.items.length === 1 && res.items[0].type === 'video') {
          await client.sendMessage(
            m.chat,
            {
              video: { url: res.items[0].url },
              mimetype: 'video/mp4'
            },
            { quoted: m }
          )
        } else {
          const medias = res.items.slice(0, 10).map(media => ({
            type: media.type === 'video' ? 'video' : 'image',
            data: { url: media.url }
          }))

          await client.sendAlbumMessage(m.chat, medias, { quoted: m })
        }
      }

    } catch (e) {
      m.reply(
        '┌─[ Error ]\n' +
        '│ ' + e.message + '\n' +
        '└────────────'
      )
    }
  }
}