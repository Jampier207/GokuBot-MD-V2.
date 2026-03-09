import fetch from 'node-fetch'
import FormData from 'form-data'

async function uploadImageStellar(buffer, mime) {
const form = new FormData()

form.append('reqtype', 'fileupload')
form.append('file', buffer, {
  filename: `icon.${mime.split('/')[1] || 'png'}`,
  contentType: mime
})

  const res = await fetch('https://bot.stellarwa.xyz/upload', {
    method: 'POST',
    body: form
  })

  const url = await res.text()

  if (!url.startsWith('https://')) {
    throw new Error('✦ Falló la subida a Stellar: ' + url)
  }

  return url
}

export default {
  command: ['seticon'],
  category: 'socket',
  run: async (client, m, args) => {

    if (!m?.sender) return

    const idBot = client.user.id.split(':')[0] + '@s.whatsapp.net'
    const config = global.db.data.settings[idBot] ||= {}

    const isOwner2 = [idBot, ...global.owner.map(n => n + '@s.whatsapp.net')].includes(m.sender)
    if (!isOwner2) return m.reply('✦ Solo el propietario puede usar este comando.')

    const value = args.join(' ').trim()

    if (!value && !m.quoted && !m.message.imageMessage)
      return m.reply('✦ Debes enviar o citar una imagen para cambiar el icon del bot.')

    if (value.startsWith('http')) {
      config.icon = value
      return m.reply(`✦ Se ha actualizado el icon de *${config.namebot2}*!`)
    }

    const q = m.quoted ? m.quoted : m
    const mime = (q.msg || q).mimetype || q.mediaType || ''

    if (!/image\/(png|jpe?g|gif)/.test(mime))
      return m.reply('✦ Responde a una imagen válida.')

    const media = await q.download()
    if (!media) return m.reply('✦ No se pudo descargar la imagen.')

    const link = await uploadImageStellar(media, mime)

    config.icon = link

    return m.reply(`> ✦ Se ha actualizado el icon de *${config.namebot2}*!`)
  },
}