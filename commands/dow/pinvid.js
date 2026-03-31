import axios from 'axios'
import fs from 'fs'
import { exec } from 'child_process'
import { pinvid } from '../../lib/scrapers/pinterest.js'

export default {
  command: ['pinvid'],
  category: 'search',
  run: async (client, m, args) => {
    if (!args[0]) return m.reply('※ Ingresa texto o link')

    try {
      const results = await pinvid(args.join(' '), 2)

      for (const result of results) {
        const url = result.video
        if (!url) continue

        const input = `./tmp_${Date.now()}.mp4`
        const output = `./fix_${Date.now()}.mp4`

        const res = await axios.get(url, { responseType: 'arraybuffer' })
        fs.writeFileSync(input, res.data)

        await new Promise((resolve) => {
          exec(`ffmpeg -i ${input} -c copy -movflags +faststart ${output}`, () => resolve())
        })

        await client.sendMessage(m.chat, {
          video: fs.readFileSync(output),
          caption: '➤ Pinterest Video'
        }, { quoted: m })

        fs.unlinkSync(input)
        fs.unlinkSync(output)
      }

    } catch {
      m.reply('※ Error al procesar video')
    }
  }
}