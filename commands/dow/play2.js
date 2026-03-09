import yts from 'yt-search'
import fetch from 'node-fetch'
import { getBuffer } from '../../lib/message.js'

export default {
  command: ['play2', 'mp4', 'ytmp4', 'ytvideo', 'playvideo'],
  category: 'downloader',
  run: async (client, m, args) => {
    try {
      if (!args[0]) {
        return m.reply(
          '╭━━━〔 🎬 𝐏𝐋𝐀𝐘2 〕━━━╮\n' +
          '┃ ✧ Ingresa el nombre o URL del video\n' +
          '╰━━━━━━━━━━━━━━━━━━╯'
        )
      }

      const text = args.join(' ')
      const videoMatch = text.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/|live\/|v\/))([a-zA-Z0-9_-]{11})/)
      const query = videoMatch ? 'https://youtu.be/' + videoMatch[1] : text

      const search = await yts(query)
      const videoInfo = videoMatch
        ? search.videos.find(v => v.videoId === videoMatch[1]) || search.all[0]
        : search.all[0]

      if (!videoInfo) {
        return m.reply(
          '╭━━━〔 𝐒𝐈𝐍 𝐑𝐄𝐒𝐔𝐋𝐓𝐀𝐃𝐎𝐒 〕━━━╮\n' +
          '┃ ✧ No se encontró información del video\n' +
          '╰━━━━━━━━━━━━━━━━━━━━╯'
        )
      }

      const url = videoInfo.url
      const title = videoInfo.title
      const vistas = (videoInfo.views || 0).toLocaleString()
      const canal = videoInfo.author?.name || 'Desconocido'
      const thumbBuffer = await getBuffer(videoInfo.image)

      const caption =
        `╭━━━〔 🎥 𝐕𝐈𝐃𝐄𝐎 𝐃𝐎𝐖𝐍𝐋𝐎𝐀𝐃 〕━━━╮\n\n` +
        `┃ ▸ 🎞️ 𝐓𝐢𝐭𝐮𝐥𝐨 : ${title}\n` +
        `┃ ▸ 👤 𝐂𝐚𝐧𝐚𝐥 : ${canal}\n` +
        `┃ ▸ ⏳ 𝐃𝐮𝐫𝐚𝐜𝐢𝐨𝐧 : ${videoInfo.timestamp || 'Desconocido'}\n` +
        `┃ ▸ 👁️ 𝐕𝐢𝐬𝐭𝐚𝐬 : ${vistas}\n` +
        `┃ ▸ 📅 𝐏𝐮𝐛𝐥𝐢𝐜𝐚𝐝𝐨 : ${videoInfo.ago || 'Desconocido'}\n` +
        `┃ ▸ 🔗 𝐋𝐢𝐧𝐤 : ${url}\n\n` +
        `┣━━━━━━━━━━━━━━━━━━━━╯\n` +
        `┃ 📦 Enviando el video, espera un momento...\n` +
        `╰━━━━━━━━━━━━━━━━━━━━╯`

      await client.sendMessage(
        m.chat,
        { image: thumbBuffer, caption },
        { quoted: m }
      )

      const endpoint = `${api.url}/dl/youtube?url=${encodeURIComponent(url)}&key=${api.key}`
      const res = await fetch(endpoint).then(r => r.json())

      if (!res?.success || !res.results) {
        return m.reply('╭━━━〔 𝐄𝐑𝐑𝐎𝐑 〕━━━╮\n┃ ✧ No se pudo descargar el video\n╰━━━━━━━━━━━━━━╯')
      }

      const videoFormat = res.results.formats.find(f => f.type === 'video' && f.quality === '360p') || res.results.formats.find(f => f.type === 'video')
      if (!videoFormat?.url) {
        return m.reply('╭━━━〔 𝐅𝐎𝐑𝐌𝐀𝐓𝐎 𝐍𝐎 𝐕𝐀𝐋𝐈𝐃𝐎 〕━━━╮\n┃ ✧ No se encontró un formato válido\n╰━━━━━━━━━━━━━━━━━━╯')
      }

      const videoBuffer = await getBuffer(videoFormat.url)

      const mensaje = {
        video: videoBuffer,
        fileName: `${title || 'video'}.mp4`,
        mimetype: 'video/mp4'
      }

      await client.sendMessage(m.chat, mensaje, { quoted: m })

    } catch (e) {
      await m.reply(msgglobal)
    }
  }
}