import yts from 'yt-search'
import { getBuffer } from '../../lib/message.js'

export default {
  command: ['ytsearch', 'search'],
  category: 'internet',

  run: async (client, m, args) => {
    try {

      if (!args.length) {
        return m.reply('┏━═━━━═━┓\n┃ ✦ Ingresa el título de un video.\n┗━═━━━═━┛')
      }

      const query = args.join(' ')
      const results = await yts(query)

      if (!results?.all?.length) {
        return m.reply('┏━═━━━═━┓\n┃ ✖ No se encontraron resultados.\n┗━═━━━═━┛')
      }

      const data = results.all.slice(0, 5)

      const thumb = data.find(v => v.type === 'video')?.image
      const buffer = thumb ? await getBuffer(thumb) : null

      let teks2 = data.map((v, i) => {

        if (v.type === 'video') {
          return `╔════════════════════╗
║ ✦ VIDEO ${i + 1}
╠════════════════════╣
║ ▸ Título: ${v.title}
║ ▸ Duración: ${v.timestamp}
║ ▸ Publicado: ${v.ago}
║ ▸ Vistas: ${v.views}
║ ▸ Link: ${v.url}
╚════════════════════╝`.trim()
        }

        if (v.type === 'channel') {
          return `╔════════════════════╗
║ ✦ CANAL
╠════════════════════╣
║ ▸ Nombre: ${v.name}
║ ▸ Subscriptores: ${v.subCountLabel || 'No disponible'}
║ ▸ Videos: ${v.videoCount || 'No disponible'}
║ ▸ Link: ${v.url}
╚════════════════════╝`.trim()
        }

      }).filter(Boolean).join('\n\n───── ◈ ─────\n\n')

      await client.sendMessage(
        m.chat,
        {
          image: buffer,
          caption: `╭───────────────╮
│ 🔎 Resultados para: ${query}
╰───────────────╯

${teks2}`
        },
        { quoted: m }
      )

    } catch (e) {
      console.error(e)
      m.reply(`┏━═━━━═━┓\n┃ ✖ Error: ${e.message}\n┗━═━━━═━┛`)
    }
  }
} 
