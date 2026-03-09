import axios from 'axios'
import path from 'path'
import { lookup } from 'mime-types'
import cheerio from 'cheerio'

export default {
  command: ['mediafire', 'mf'],
  category: 'downloader',
  run: async (client, m, args, usedPrefix, command) => {

    const text = args.join(' ').trim()

    if (!text) {
      return m.reply(`╭──────────────╮
│ ✦ Ingresa un enlace o palabra clave.
╰──────────────╯`)
    }

    try {

      const isUrl = /^https?:\/\/(www\.)?mediafire\.com\/.+/i.test(text)

      if (!isUr) {

        const res = await axios.get(
          `${global.api.stellar.url}/search/mediafire?query=${encodeURIComponent(text)}&key=${global.api.stellar.key}`
        )

        const data = res.data

        if (!data?.status || !data.results?.length) {
          return m.reply(`╭──────────────╮
│ ✖ No se encontraron resultados.
╰──────────────╯`)
        }

        let caption = `
╔══════════════════╗
║   ✦ MediaFire Search
╚══════════════════╝

• Resultados: ${data.results.length}

`.trim() + '\n\n'

        data.results.forEach((r, i) => {
          caption += `(${i + 1}) Nombre: ${r.filename}\n`
          caption += `(${i + 1}) Peso: ${r.filesize}\n`
          caption += `(${i + 1}) Enlace: ${r.url}\n`
          caption += `(${i + 1}) Fuente: ${r.source_title}\n\n`
        })

        return m.reply(caption)
      }

      const scraped = await mediafireDl(text)

      if (!scraped?.downloadLink) {
        return m.reply(`╭──────────────╮
│ ✖ Enlace inválido.
╰──────────────╯`)
      }

      const title = (scraped.filename || 'archivo').trim()
      const ext = path.extname(title) || (scraped.type ? `.${scraped.type}` : '')
      const tipo = lookup((ext || '').toLowerCase()) || 'application/octet-stream'

      const info = `
╔══════════════════╗
║   ✦ MediaFire Download
╚══════════════════╝

• Nombre: ${title}
• Tipo: ${tipo}
${scraped.size ? `• Peso: ${scraped.size}\n` : ''}${scraped.uploaded ? `• Subido: ${scraped.uploaded}\n` : ''}
`.trim()

      await client.sendContextInfoIndex(
        m.chat,
        info,
        {},
        m,
        true,
        null,
        {
          banner: 'https://bot.stellarwa.xyz/files/jY5BT.png',
          title: 'MediaFire',
          body: 'Descarga directa',
          redes: global.db.data.settings[client.user.id.split(':')[0] + '@s.whatsapp.net'].link
        }
      )

      await client.sendMessage(
        m.chat,
        {
          document: { url: scraped.downloadLink },
          mimetype: tipo,
          fileName: title
        },
        { quoted: m }
      )

    } catch (e) {

      return m.reply(
        `╭──────────────╮\n` +
        `│ ✖ Ocurrió un error.\n` +
        `│ ⚠ ${e.message}\n` +
        `╰──────────────╯`
      )
    }
  }
}
