import fs from 'fs'
import exif from '../../lib/exif.js'
const { writeExif } = exif

const cleanFFmpegText = (text = '') =>
  text.normalize('NFKD').replace(/[^\x00-\x7F]/g, '').trim()

export default {
  command: ['sticker', 's'],
  category: 'utils',
  run: async (client, m, args) => {
    try {
      const quoted = m.quoted ? m.quoted : m
      const mime = (quoted.msg || quoted).mimetype || ''

      let user = globalThis.db.data.users[m.sender] || {}
      const name = user.name || m.sender.split('@')[0]

      let texto1 = user.metadatos || `🌹 GokuBot-MD 💖`
      let texto2 = user.metadatos2 || `By Jxmpier207`

      let urlArg = null
      let argsWithoutUrl = []

      for (let arg of args) {
        if (isUrl(arg)) urlArg = arg
        else argsWithoutUrl.push(arg)
      }

      let filteredText = argsWithoutUrl.join(' ').trim()
      let marca = filteredText.split(/[\u2022|]/).map(v => v.trim())

      let pack = cleanFFmpegText(marca[0] || texto1)
      let author = cleanFFmpegText(marca[1] || texto2)

      if (/image|webp/.test(mime)) {
        let buffer = await quoted.download()

        const isWebp = /webp/.test(mime)

        if (isWebp) {
          const media = { mimetype: 'webp', data: buffer }
          const metadata = { packname: pack, author: author, categories: [''] }
          const stickerPath = await writeExif(media, metadata)
          await client.sendMessage(m.chat, { sticker: { url: stickerPath } }, { quoted: m })
          await fs.unlinkSync(stickerPath)
        } else {
          const tmpFile = `./tmp-${Date.now()}.webp`
          fs.writeFileSync(tmpFile, buffer)
          await client.sendImageAsSticker(m.chat, tmpFile, m, { packname: pack, author })
          fs.unlinkSync(tmpFile)
        }

      } else if (/video/.test(mime)) {
        if ((quoted.msg || quoted).seconds > 20)
          return m.reply('🦕 El video no puede ser muy largo')

        let buffer = await quoted.download()
        const tmpFile = `./tmp-video-${Date.now()}.mp4`
        fs.writeFileSync(tmpFile, buffer)
        await client.sendVideoAsSticker(m.chat, tmpFile, m, { packname: pack, author })
        fs.unlinkSync(tmpFile)

      } else if (urlArg) {
        const res = await fetch(urlArg)
        const buffer = Buffer.from(await res.arrayBuffer())

        if (urlArg.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
          const tmpFile = `./tmp-url-${Date.now()}.webp`
          fs.writeFileSync(tmpFile, buffer)
          await client.sendImageAsSticker(m.chat, tmpFile, m, { packname: pack, author })
          fs.unlinkSync(tmpFile)
        }

        if (urlArg.match(/\.(mp4|mov|avi|mkv|webm)$/i)) {
          const tmpFile = `./tmp-url-video-${Date.now()}.mp4`
          fs.writeFileSync(tmpFile, buffer)
          await client.sendVideoAsSticker(m.chat, tmpFile, m, { packname: pack, author })
          fs.unlinkSync(tmpFile)
        }

      } else {
        return m.reply('🍒 Por favor, envía una imagen, video o URL válida.')
      }

    } catch (e) {
      console.error(e)
      return m.reply(msgglobal)
    }
  }
}

const isUrl = (text) =>
  /https?:\/\/.+\.(jpg|jpeg|png|gif|webp|mp4|mov|avi|mkv|webm)/i.test(text)