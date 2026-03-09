import fetch from 'node-fetch'
import FormData from 'form-data'

export default {
  command: ['tofigure', 'tf'],
  category: 'utils',
  run: async (client, m, args, command, text, usedprefix) => {
    try {
      if (!m || !m.chat) return

      const q = m.quoted ? m.quoted : m
      const mime = q.mimetype || q.msg?.mimetype || ''

      if (!mime) {
        return client.sendMessage(
          m.chat,
          { text: `🍬 Envía una *imagen* junto al *comando* ${usedprefix}tofigure` },
          { quoted: m }
        )
      }

      if (!/image\/(jpe?g|png)/.test(mime)) {
        return client.sendMessage(
          m.chat,
          { text: `🍪 El formato *${mime}* no es compatible` },
          { quoted: m }
        )
      }

      const buffer = await q.download()
      const uploadedUrl = await uploadToUguu(buffer)

      if (!uploadedUrl) {
        return client.sendMessage(
          m.chat,
          { text: '🍭 No se pudo *subir* la imagen' },
          { quoted: m }
        )
      }

      const figureBuffer = await getFigureBuffer(uploadedUrl)
      if (!figureBuffer) {
        return client.sendMessage(
          m.chat,
          { text: '🍫 No se pudo *generar* la figura' },
          { quoted: m }
        )
      }

      await client.sendMessage(
        m.chat,
        { image: figureBuffer },
        { quoted: m }
      )
    } catch (err) {
      await client.sendMessage(
        m.chat,
        { text: msgglobal },
        { quoted: m }
      )
    }
  }
}

async function uploadToUguu(buffer) {
  const body = new FormData()
  body.append('files[]', buffer, 'image.jpg')

  const res = await fetch('https://uguu.se/upload.php', {
    method: 'POST',
    body,
    headers: body.getHeaders()
  })

  const json = await res.json()
  return json.files?.[0]?.url
}

async function getFigureBuffer(url) {
  const res = await fetch(`${api.url}/tools/tofigure?url=${url}&key=${api.key}`)
  if (!res.ok) return null
  return Buffer.from(await res.arrayBuffer())
} 