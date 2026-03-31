import axios from 'axios'
import fs from 'fs'
import { exec } from 'child_process'
import crypto from 'crypto'
import { pinvid } from '../../lib/scrapers/pinterest.js'

function getHash(buffer) {
  return crypto.createHash('md5').update(buffer).digest('hex')
}

export default {
  command: ['pinvid'],
  category: 'search',
  run: async (client, m, args) => {
    const newsletterJid = '120363402960178567@newsletter'

    if (!args[0]) return m.reply('※ Ingresa texto o link')

    try {
      const results = await pinvid(args.join(' '), 15)

      const seen = new Set()
      const medias = []

      for (const result of results) {
        const url = result.video || result.sd || result.original
        if (!url) continue

        try {
          const res = await axios.get(url, {
            responseType: 'arraybuffer',
            timeout: 15000
          })

          const buffer = res.data
          const hash = getHash(buffer)

          if (seen.has(hash)) continue
          seen.add(hash)

          const input = `./tmp_${Date.now()}.mp4`
          const output = `./fix_${Date.now()}.mp4`

          fs.writeFileSync(input, buffer)

          await new Promise((resolve) => {
            exec(`ffmpeg -i ${input} -c copy -movflags +faststart ${output}`, () => resolve())
          })

          medias.push({
            type: 'video',
            data: fs.readFileSync(output),
            caption: '➤ Pinterest Video'
          })

          fs.unlinkSync(input)
          fs.unlinkSync(output)

          if (medias.length >= 3) break

        } catch {
          continue
        }
      }

      if (!medias.length) {
        return m.reply('✦ Sin videos únicos')
      }

      await client.sendAlbumMessage(m.chat, medias, {
        quoted: m,
        contextInfo: {
          forwardingScore: 999,
          isForwarded: true,
          forwardedNewsletterMessageInfo: {
            newsletterJid,
            newsletterName: '🌹 GokuBot-MD ~ Jxmpier207 💖'
          }
        }
      })

    } catch {
      m.reply('※ Error al procesar video')
    }
  }
}