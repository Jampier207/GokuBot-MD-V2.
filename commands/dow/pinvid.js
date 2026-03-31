import axios from 'axios'
import fs from 'fs'
import { exec } from 'child_process'
import { pinvid } from '../../lib/scrapers/pinterest.js'

function cleanUrl(url) {
  return url
    .replace(/\/\d+p\//, '/') 
    .split('?')[0]
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
        const raw = result.video || result.sd || result.original
        if (!raw) continue

        const url = cleanUrl(raw)

        if (seen.has(url)) continue
        seen.add(url)

        try {
          const input = `./tmp_${Date.now()}.mp4`
          const output = `./fix_${Date.now()}.mp4`

          const res = await axios.get(raw, { responseType: 'arraybuffer' })
          fs.writeFileSync(input, res.data)

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
        return m.reply('✦ Sin videos')
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