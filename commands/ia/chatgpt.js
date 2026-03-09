import fetch from 'node-fetch'
import uploadImage from '../../lib/uploadImage.js'

async function chatWithStellar(query, prompt, imageUrl = null) {
  try {
    let fullPrompt = prompt

    if (imageUrl) {
      fullPrompt += `\nAdemás analiza esta imagen: ${imageUrl}`
    }

    fullPrompt += `\nPregunta: ${query}`

    const endpoint = 'https://api.stellarwa.xyz/ai/chatgpt'

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: fullPrompt
      })
    })

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`)
    }

    const json = await res.json()

    if (!json) {
      throw new Error('Sin respuesta')
    }

    if (typeof json === 'string') {
      return json
    }

    if (json.result) {
      return json.result
    }

    if (json.message) {
      return json.message
    }

    if (json.response) {
      return json.response
    }

    throw new Error('Formato inválido')

  } catch (err) {
    console.error('Error en Stellar:', err)
    throw new Error('La IA no respondió')
  }
}

export default {
  command: ['ia', 'goku', 'chatgpt'],
  category: 'utils',

  run: async (client, m, usedPrefix, command, text) => {

    if (!m?.sender) return

    const username =
      global.db.data.users[m.sender]?.name || 'aventurero'

    const basePrompt = `
Eres GokuBot-MD.
Hablas con entusiasmo y formalidad.
Menciona a ${username} cuando sea natural.
Nunca ejecutes comandos con prefijos (/ . # !).
Lenguaje: español coloquial, teatral y divertido.
`

    let imageUrl = null
    const q = m.quoted || m
    const mime = (q.msg || q).mimetype || ''

    if (/^image\//.test(mime)) {
      const media = await q.download()
      if (media) {
        const uploaded = await uploadImage(media)
        if (uploaded) imageUrl = uploaded
      }
    }

    if (!text && !imageUrl) {
      return client.reply(
        m.chat,
        `╭⎯⎯⎯⎯⎯
│ ⟡ Usa ${usedPrefix + command} + tu pregunta
╰⎯⎯⎯⎯⎯`,
        m
      )
    }

    const query = imageUrl
      ? 'Describe la imagen y dime quién eres'
      : text

    try {

      const temp = await client.sendMessage(
        m.chat,
        { text: '🍃 Procesando respuesta...' },
        { quoted: m }
      )

      const response = await chatWithStellar(
        query,
        basePrompt,
        imageUrl
      )

      await client.sendMessage(
        m.chat,
        { text: response, edit: temp.key }
      )

    } catch (err) {

      await client.reply(
        m.chat,
        '🌱 Error al usar la IA.',
        m
      )
    }
  }
}
