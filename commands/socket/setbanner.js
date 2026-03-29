import fetch from 'node-fetch'
import FormData from 'form-data'

async function uploadToCatbox(buffer, mime) {
  const form = new FormData()
  form.append('reqtype', 'fileupload')
  form.append('fileToUpload', buffer, {
    filename: `banner.${mime.split('/')[1] || 'bin'}`,
    contentType: mime
  })

  const res = await fetch('https://catbox.moe/user/api.php', {
    method: 'POST',
    body: form
  })

  const url = await res.text()

  if (!url.startsWith('https://')) {
    throw new Error('✦ La subida a Catbox falló: ' + url)
  }

  return url
}

export default {
  command: ['setbanner', 'setmenubanner'],
  category: 'socket',
  run: async (client, m, args) => {
    if (!m?.sender) return
    const idBot = client.user.id.split(':')[0] + '@s.whatsapp.net'
    const config = global.db.data.settings[idBot]
    const isOwner = [idBot, ...global.owner.map(num => num + '@s.whatsapp.net')].includes(m.sender)
    if (!isOwner && m.sender !== owner) return m.reply(
      '╔══════════════╗\n║   PERMISO    ║\n╚══════════════╝\nNo puedes cambiar el banner del bot.'
    )

    const value = args.join(' ').trim()

    if (!value && !m.quoted && !m.message.imageMessage && !m.message.videoMessage)
      return m.reply(
        '╔════════════════════════╗\n║     BANNER NUEVO       ║\n╚════════════════════════╝\nEnvía o cita una imagen o video para actualizar el banner.'
      )

    if (value.startsWith('http')) {
      config.banner = value
      return m.reply(
        '╔════════════════════════╗\n║      BANNER ACTUALIZADO       ║\n╚════════════════════════╝\nEl banner del bot se ha actualizado correctamente.'
      )
    }

    const q = m.quoted ? m.quoted : m.message.imageMessage ? m : m
    const mime = (q.msg || q).mimetype || q.mediaType || ''

    if (!/image\/(png|jpe?g|gif)|video\/mp4/.test(mime))
      return m.reply(
        '╔════════════════════════╗\n║     FORMATO INVÁLIDO    ║\n╚════════════════════════╝\nResponde a una imagen o video válido (png, jpg, gif, mp4).'
      )

    const media = await q.download()
    if (!media) return m.reply(
      '╔════════════════════╗\n║   ERROR AL DESCARGAR  ║\n╚════════════════════╝\nNo se pudo descargar el archivo, intenta de nuevo.'
    )

    const link = await uploadToCatbox(media, mime)
    config.banner = link

    return m.reply(
      '╔════════════════════════╗\n║     BANNER ACTUALIZADO       ║\n╚════════════════════════╝\nEl banner del bot se ha cambiado correctamente.\nPuedes verlo usando el comando de menú.'
    )
  }
}