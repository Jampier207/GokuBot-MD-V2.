import fs from 'fs'

export default {
  command: ['wm'],
  category: 'utils',
  run: async (client, m, args, command, text, usedPrefix) => {
    try {
      if (!m) return

      const q = m.quoted
      if (!q)
        return client.sendMessage(
          m.chat,
          { text: '🥮 Responde a un sticker.' },
          { quoted: m }
        )

      const mime = (q.msg || q).mimetype || ''
      if (!/webp/.test(mime))
        return client.sendMessage(
          m.chat,
          { text: '🍩 El mensaje respondido no es un sticker.' },
          { quoted: m }
        )

      if (!args.length)
        return client.sendMessage(
          m.chat,
          { text: `🍭 Usa:\n*${usedPrefix}wm Nombre | Autor (opcional)*` },
          { quoted: m }
        )

      const textInput = args.join(' ')
      let packname = textInput
      let author = m.pushName || 'Sticker'

      if (textInput.includes('|')) {
        const split = textInput.split('|')
        packname = split[0]?.trim()
        author = split[1]?.trim() || author
      }

      if (!packname)
        return client.sendMessage(
          m.chat,
          { text: '🍫 Debes escribir al menos el nombre del pack.' },
          { quoted: m }
        )

      const media = await q.download()

      const enc = await client.sendImageAsSticker(
        m.chat,
        media,
        m,
        {
          packname,
          author
        }
      )

      await fs.unlinkSync(enc)

    } catch (e) {
      await client.sendMessage(
        m.chat,
        { text: '🍄 Error al aplicar watermark\n' + e.message },
        { quoted: m }
      )
    }
  }
} 