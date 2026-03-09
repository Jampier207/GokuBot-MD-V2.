import fetch from 'node-fetch'

export default {
  command: ['instagram', 'ig', 'reel'],
  category: 'downloader',
  run: async (client, m, args, command) => {
    const botId = client.user.id.split(':')[0] + '@s.whatsapp.net'

    if (!args.length) {
      return m.reply('╭─❍ 「 📸 𝙄𝙣𝙨𝙩𝙖𝙜𝙧𝙖𝙢 」\n│ ✦ Ingresa un enlace de *Instagram*.\n╰───────────────❍')
    }

    const urls = args.filter(arg => arg.match(/instagram\.com\/(p|reel|share|tv)\//))
    if (!urls.length) {
      return m.reply('╭─❍ 「 ⚠️ Enlace inválido 」\n│ ✦ No es un enlace válido de *Instagram*.\n│ ✦ Verifica que sea un link correcto.\n╰───────────────❍')
    }

    try {
      if (urls.length > 1) {
        const medias = []
        for (const url of urls.slice(0, 10)) {
          try {
            const res = await fetch(`${api.url}/dl/instagram?url=${encodeURIComponent(url)}&key=${api.key}`)
            const json = await res.json()
            if (!json.status || !json.data) continue

            if (json.data.length === 1) {
              const media = json.data[0]
              medias.push({ type: 'video', data: { url: media.url } })
            } else {
              for (const media of json.data.slice(0, 10)) {
                medias.push({ type: 'image', data: { url: media.url || media.thumbnail } })
              }
            }
          } catch (e) {
            continue
          }
        }
        if (medias.length) {
          await client.sendAlbumMessage(m.chat, medias, { quoted: m })
        } else {
          await m.reply('╭─❍ 「 ❌ Error 」\n│ ✦ No se pudo procesar el enlace.\n╰───────────────❍')
        }
      } else {
        const url = urls[0]
        const res = await fetch(`${api.url}/dl/instagram?url=${encodeURIComponent(url)}&key=${api.key}`)
        const json = await res.json()
        if (!json.status || !json.data) {
          return client.reply(
            m.chat,
            '╭─❍ 「 ❌ Fallo en descarga 」\n│ ✦ No se pudo obtener el contenido.\n╰───────────────❍',
            m
          )
        }

        if (json.data.length === 1) {
          const media = json.data[0]
          await client.sendMessage(
            m.chat,
            { video: { url: media.url }, mimetype: 'video/mp4', fileName: 'instagram.mp4' },
            { quoted: m }
          )
        } else {
          const medias = []
          for (const media of json.data.slice(0, 10)) {
            medias.push({ type: 'image', data: { url: media.url || media.thumbnail } })
          }
          await client.sendAlbumMessage(m.chat, medias, { quoted: m })
        }
      }
    } catch (e) {
      await client.reply(
        m.chat,
        '╭─❍ 「 ⚡ Error inesperado 」\n│ ✦ Ocurrió un problema al ejecutar el comando.\n│ ✦ Intenta nuevamente más tarde.\n╰───────────────❍',
        m
      )
    }
  }
}
