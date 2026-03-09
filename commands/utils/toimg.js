import fs from 'fs'
import { webp2png } from '../../lib/webp2png.js'

export default {
  command: ['toimg'],
  category: 'utils',

  run: async (client, m) => {
    try {
      const quoted = m.quoted ? m.quoted : m
      const mime = (quoted.msg || quoted).mimetype || ''

      if (!/webp/.test(mime)) {
        return m.reply('[❗] Responde a un *sticker*')
      }

      await client.sendMessage(m.chat, {
        react: { text: '⏳', key: m.key }
      })

      const buffer = await quoted.download()
      const imgPath = await webp2png(buffer)

      await client.sendMessage(
        m.chat,
        {
          image: fs.readFileSync(imgPath),
          caption: '✅ Sticker convertido a imagen'
        },
        { quoted: m }
      )

      fs.unlinkSync(imgPath)

      await client.sendMessage(m.chat, {
        react: { text: '✅', key: m.key }
      })

    } catch (e) {
      console.error(e)
      m.reply('🍭 Error al ejecutar el comando')
    }
  }
}