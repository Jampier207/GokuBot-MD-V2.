import { getBuffer } from '../../lib/message.js'
import fetch from 'node-fetch'

async function getVideoInfo(query) {
  try {
    const endpoint = `${global.api.url}/dl/youtubeplay?query=${encodeURIComponent(query)}&key=${global.api.key}`
    const res = await fetch(endpoint).then(r => r.json())
    if (!res?.status || !res.data) return null
    return res.data
  } catch {
    return null
  }
}

export default {
  command: ['play', 'mp3', 'ytmp3', 'ytaudio', 'playaudio'],
  category: 'downloader',
  run: async (client, m, args) => {
    try {
      if (!args[0]) {
        return m.reply('╭━━━〔 🎧 𝐘𝐓 𝐏𝐋𝐀𝐘 〕━━━⬣\n┃ ✧ Ingresa el nombre o URL del video\n╰━━━━━━━━━━━━━━━━⬣')
      }

      const text = args.join(' ')
      const videoInfo = await getVideoInfo(text)
      if (!videoInfo) {
        return m.reply('╭━━━〔 𝐒𝐢𝐧 𝐑𝐞𝐬𝐮𝐥𝐭𝐚𝐝𝐨𝐬 〕━━━⬣\n┃ ✧ No se encontró información del video\n╰━━━━━━━━━━━━━━━━⬣')
      }

      const { title, author, duration, views, url, image, dl } = videoInfo
      const vistas = (views || 0).toLocaleString()
      const canal = author?.name || author || 'Desconocido'
      const thumbBuffer = await getBuffer(image)

      const caption = `╭━━━〔 🎵 𝐃𝐞𝐬𝐜𝐚𝐫𝐠𝐚 𝐞𝐧 𝐏𝐫𝐨𝐜𝐞𝐬𝐨 〕━━━⬣

┃ ❖ 𝑻𝒊𝒕𝒖𝒍𝒐 › ${title}
┃ ❖ 𝑪𝒂𝒏𝒂𝒍 › ${canal}
┃ ❖ 𝑫𝒖𝒓𝒂𝒄𝒊𝒐𝒏 › ${duration || 'Desconocido'}
┃ ❖ 𝑽𝒊𝒔𝒕𝒂𝒔 › ${vistas}
┃ ❖ 𝑳𝒊𝒏𝒌 › ${url}

┣━━━━━━━━━━━━━━━━⬣
┃ ⏳ Procesando audio, espera un momento...
╰━━━━━━━━━━━━━━━━⬣`

      await client.sendMessage(m.chat, { image: thumbBuffer, caption }, { quoted: m })

      if (!dl) {
        return m.reply('╭━━━〔 𝐄𝐫𝐫𝐨𝐫 〕━━━⬣\n┃ ✧ No se pudo descargar el audio\n╰━━━━━━━━━━━━━━━━⬣')
      }

      const audioBuffer = await getBuffer(dl)

      const mensaje = {
        audio: audioBuffer,
        fileName: `${title || 'audio'}.mp3`,
        mimetype: 'audio/mpeg'
      }

      await client.sendMessage(m.chat, mensaje, { quoted: m })
    } catch (e) {
      await m.reply(msgglobal)
    }
  }
}