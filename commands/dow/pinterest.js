import fetch from 'node-fetch'

export default {
  command: ['pinterest', 'pin'],
  category: 'search',
  run: async (client, m, args, from) => {
    const text = args.join(' ')
    const isPinterestUrl = /^https?:\/\//.test(text)

global.api = {
  url: 'https://api.stellarwa.xyz',
  key: '' 
}
    if (!text) {
      return m.reply(
        `╭─❍ 「 📌 𝙋𝙞𝙣𝙩𝙚𝙧𝙚𝙨𝙩 」\n` +
        `│ ✦ Ingresa un término de búsqueda\n` +
        `│ ✦ O envía un enlace válido de Pinterest.\n` +
        `╰───────────────❍`
      )
    }

    try {
      if (isPinterestUrl) {
        const pinterestUrl = `${api.url}/search/pinterest?url=${encodeURIComponent(text)}&key=${api.key}`
        const ress = await fetch(pinterestUrl)
        if (!ress.ok) throw new Error(`La API devolvió un código de error: ${ress.status}`)

        const { data: result } = await ress.json()
        const mediaType = ['image', 'video'].includes(result.type) ? result.type : 'document'

        await client.sendMessage(
          m.chat,
          { [mediaType]: { url: result.dl }, caption: null },
          { quoted: m },
        )
      } else {
        const pinterestAPI = `${api.url}/search/pinterest?query=${encodeURIComponent(text)}&key=${api.key}`
        const res = await fetch(pinterestAPI)
        if (!res.ok) throw new Error(`La API devolvió un código de error: ${res.status}`)

        const jsons = await res.json()
        const json = jsons.data

        if (!json || json.length === 0) {
          return m.reply(
            `╭─❍ 「 🔎 Sin resultados 」\n` +
            `│ ✦ No se encontraron resultados para:\n` +
            `│ ➜ *${text}*\n` +
            `╰───────────────❍`
          )
        }

        const result = json[Math.floor(Math.random() * json.length)]
        const message =
          `╭─❍ 「 📌 𝙋𝙞𝙣𝙩𝙚𝙧𝙚𝙨𝙩 𝙎𝙚𝙖𝙧𝙘𝙝 」\n\n` +
          `${result.title ? `│ ✦ 🏷️ Título › *${result.title}*\n` : ''}` +
          `${result.description ? `│ ✦ 📝 Descripción › *${result.description}*\n` : ''}` +
          `${result.full_name ? `│ ✦ 👤 Autor › *${result.full_name}*\n` : ''}` +
          `${result.likes ? `│ ✦ ❤️ Likes › *${result.likes}*\n` : ''}` +
          `${result.created ? `│ ✦ 📅 Publicado › *${result.created}*\n` : ''}` +
          `╰───────────────❍`

        await client.sendMessage(
          m.chat,
          { image: { url: result.hd || result.url }, caption: message },
          { quoted: m },
        )
      }
    } catch (error) {
      await client.reply(
        m.chat,
        `╭─❍ 「 ⚡ Error inesperado 」\n` +
        `│ ✦ Ocurrió un problema al ejecutar el comando.\n` +
        `│ *Error:* ${error.message} .\n` +
        `╰───────────────❍`,
        m
      )
    }
  },
}
