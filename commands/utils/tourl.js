import fetch from 'node-fetch'
import FormData from 'form-data'

function formatBytes(bytes) {
  if (bytes === 0) return '0 B'
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return `${(bytes / 1024 ** i).toFixed(2)} ${sizes[i]}`
}

export default {
  command: ['tourl'],
  category: 'utils',
  run: async (client, m, args, command, text, prefix) => {
    try {
      const q = m.quoted || m
      const mime = q.mimetype || q.msg?.mimetype || ''

      if (!mime) return m.reply(`✎ Envía una imagen junto al comando *${prefix + command}*`)
      if (!/image\/(png|jpe?g|gif)|video\/mp4/.test(mime)) {
        return m.reply(`✎ Formato *${mime}* no compatible`)
      }

      const buffer = await q.download()
      const url = await uploadToStellar(buffer, mime)

      if (!url) return m.reply('✎ No se pudo subir el archivo')

      const userName = global.db.data.users[m.sender]?.name || 'Usuario'
      const peso = formatBytes(buffer.length)

      const msg = `✎ URL lista
────────────────
• Link › ${url}
• Peso › ${peso}
• Solicitado por › ${userName}`

      return m.reply(msg)
    } catch (err) {
      return m.reply(`✎ Error: ${err.name}\n✎ Mensaje: ${err.message}`)
    }
  },
}

async function uploadToStellar(buffer, mime) {
  const body = new FormData()
  body.append('file', buffer, `file.${mime.split('/')[1]}`)
  const res = await fetch('https://bot.stellarwa.xyz/upload', { method: 'POST', body, headers: body.getHeaders() })
  if (!res.ok) throw new Error(`HTTP ${res.status} - ${res.statusText}`)
  const json = await res.json()
  return json.url
}