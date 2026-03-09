import fetch from 'node-fetch'

export default {
  command: ['tiktoksearch', 'ttsearch'],
  category: 'search',

  run: async (client, m, args) => {
    try {

      if (!args.length) {
        return client.reply(
          m.chat,
          '🔎 Ingresa un término para buscar en TikTok.',
          m
        )
      }

      const query = args.join(' ')

      const api = {
        url: 'https://api.stellarwa.xyz',
        key: ''
      }

      const endpoint = `${api.url}/search/tiktok?query=${encodeURIComponent(query)}&key=${api.key}`

      const res = await fetch(endpoint)
      const json = await res.json()

      if (!json?.success || !json?.data?.length) {
        return client.reply(
          m.chat,
          `🌱 No se encontraron resultados para: ${query}`,
          m
        )
      }

      let message = `╭━〔 🔎 TIKTOK SEARCH 〕━⬣\n`
      message += `┃ ✦ Búsqueda: ${query}\n`
      message += `╰━━━━━━━━━━━━━━━━⬣\n\n`

      json.data.forEach((result, index) => {

        const videoId =
          result.video_id ||
          result.id ||
          result.aweme_id

        const username =
          result.author?.unique_id ||
          result.author?.uniqueId ||
          '-'

        const link = videoId
          ? `https://www.tiktok.com/@${username}/video/${videoId}`
          : 'No disponible'

        message += `╭─❖ Resultado ${index + 1}\n`
        message += `│ 🎬 Título: ${result.title || '-'}\n`
        message += `│ 👤 Autor: ${result.author?.nickname || '-'} (@${username})\n`
        message += `│ ▶️ Views: ${result.stats?.views || 0}\n`
        message += `│ ❤️ Likes: ${result.stats?.likes || 0}\n`
        message += `│ 💬 Comentarios: ${result.stats?.comments || 0}\n`
        message += `│ 🔁 Compartidos: ${result.stats?.shares || 0}\n`
        message += `│ ⏱ Duración: ${result.duration || 0}s\n`
        message += `│ 🔗 Link:\n`
        message += `│ ${link}\n`
        message += `╰━━━━━━━━━━━━━━━━⬣\n\n`
      })

      await client.sendMessage(
        m.chat,
        { text: message.trim() },
        { quoted: m }
      )

    } catch (e) {
      console.error(e)
      await client.reply(
        m.chat,
        '🌱 Error al buscar en TikTok.',
        m
      )
    }
  }
}