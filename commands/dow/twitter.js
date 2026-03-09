import fetch from 'node-fetch'

export default {
  command: ['twitter', 'x', 'xdl'],
  category: 'downloader',
  run: async (client, m, args) => {
    if (!args[0]) {
      return m.reply('╭──────────────╮\n│ ✦ Ingresa un enlace de Twitter/X.\n╰──────────────╯')
    }

    if (!args[0].match(/(twitter|x)\.com\/\w+\/status\//)) {
      return m.reply('╭──────────────╮\n│ ✖ El enlace no es válido.\n╰──────────────╯')
    }

    try {
      const data = await getTwitterMedia(args[0])
      if (!data) return m.reply('╭──────────────╮\n│ ✖ No se pudo obtener el contenido.\n╰──────────────╯')

      const caption =
        `╔══════════════════╗\n` +
        `║  ✦  X / Twitter Downloader\n` +
        `╚══════════════════╝\n\n` +
        `${data.title ? `• Título: ${data.title}\n` : ''}` +
        `${data.author ? `• Autor: ${data.author}\n` : ''}` +
        `${data.date ? `• Fecha: ${data.date}\n` : ''}` +
        `${data.duration ? `• Duración: ${data.duration}\n` : ''}` +
        `${data.resolution ? `• Resolución: ${data.resolution}\n` : ''}` +
        `${data.views ? `• Vistas: ${data.views}\n` : ''}` +
        `${data.likes ? `• Likes: ${data.likes}\n` : ''}` +
        `${data.comments ? `• Comentarios: ${data.comments}\n` : ''}` +
        `${data.retweets ? `• Retweets: ${data.retweets}\n` : ''}` +
        `• Enlace: ${args[0]}`

      if (data.type === 'video') {
        await client.sendMessage(
          m.chat,
          {
            video: { url: data.url },
            caption,
            mimetype: 'video/mp4',
            fileName: 'twitter.mp4'
          },
          { quoted: m }
        )
      } else if (data.type === 'image') {
        await client.sendMessage(
          m.chat,
          { image: { url: data.url }, caption },
          { quoted: m }
        )
      } else {
        throw new Error('Contenido no soportado.')
      }

    } catch (e) {
      await m.reply(
        `╭──────────────╮\n` +
        `│ ✖ Ocurrió un error.\n` +
        `│ ⚠ ${e.message}\n` +
        `╰──────────────╯`
      )
    }
  }
}

async function getTwitterMedia(url) {
  const apis = [
    {
      endpoint: `${global.api.stellar.url}/dl/twitter?url=${encodeURIComponent(url)}&key=${global.api.stellar.key}`,
      extractor: res => {
        if (!res.status || !res.data?.result?.length) return null
        const media = res.data.result[0]
        return {
          type: res.data.type,
          title: res.data.title || null,
          duration: res.data.duration || null,
          resolution: media.quality || null,
          url: media.url,
          thumbnail: res.data.thumbnail || null
        }
      }
    },
    {
      endpoint: `${global.api.nekolabs.url}/downloader/twitter?url=${encodeURIComponent(url)}`,
      extractor: res => {
        if (!res.success || !res.result?.media?.length) return null
        const media = res.result.media[0]
        const variant = media.variants?.at(-1)
        return {
          type: media.type,
          title: res.result.title || null,
          resolution: variant?.resolution || null,
          url: variant?.url || null,
          thumbnail: media.thumbnail || null
        }
      }
    },
    {
      endpoint: `${global.api.delirius.url}/download/twitterv2?url=${encodeURIComponent(url)}`,
      extractor: res => {
        if (!res.status || !res.data?.media?.length) return null
        const media = res.data.media[0]
        const video = media.videos?.at(-1)
        return {
          type: media.type,
          title: res.data.description || null,
          author: res.data.author?.username || null,
          date: res.data.createdAt || null,
          duration: media.duration || null,
          resolution: video?.quality || null,
          url: video?.url || null,
          thumbnail: media.cover || null,
          views: res.data.view || null,
          likes: res.data.favorite || null,
          comments: res.data.replie || null,
          retweets: res.data.retweet || null
        }
      }
    },
    {
      endpoint: `${global.api.siputzx.url}/api/d/twitter?url=${encodeURIComponent(url)}`,
      extractor: res => {
        if (!res.status || !res.data?.downloadLink) return null
        return {
          type: 'video',
          title: res.data.videoTitle || null,
          url: res.data.downloadLink,
          thumbnail: res.data.imgUrl || null
        }
      }
    }
  ]

  for (const { endpoint, extractor } of apis) {
    try {
      const res = await fetch(endpoint).then(r => r.json())
      const result = extractor(res)
      if (result) return result
    } catch {}
    await new Promise(r => setTimeout(r, 500))
  }

  return null
}
