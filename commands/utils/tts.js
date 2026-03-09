import gtts from 'node-gtts'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export default {
  command: ['tts', 'gtts'],
  category: 'utils',

  run: async (client, m, usedPrefix, text) => {
    try {

      const defaultLang = 'es'

      if (!text) {
        return m.reply(`🍃 Uso correcto:\n${usedPrefix}tts es Hola mundo`)
      }

      const parts = text.trim().split(' ')
      let lang = parts[0]
      let message = parts.slice(1).join(' ')

      if (lang.length !== 2) {
        lang = defaultLang
        message = text
      }

      if (!message && m.quoted?.text) {
        message = m.quoted.text
      }

      if (!message) {
        return m.reply(`🌱 Escribe el texto a convertir.`)
      }

      const audioBuffer = await tts(message, lang)

      await client.sendMessage(
        m.chat,
        {
          audio: audioBuffer,
          mimetype: 'audio/ogg; codecs=opus',
          ptt: true
        },
        { quoted: m }
      )

    } catch (err) {
      console.error(err)
      m.reply('🌱 Error al generar el audio.')
    }
  }
}

function tts(text, lang = 'es') {
  return new Promise((resolve, reject) => {
    try {
      const speech = gtts(lang)
      const tmpDir = path.join(__dirname, '../tmp')

      if (!fs.existsSync(tmpDir)) {
        fs.mkdirSync(tmpDir)
      }

      const filePath = path.join(tmpDir, `${Date.now()}.wav`)

      speech.save(filePath, text, () => {
        const buffer = fs.readFileSync(filePath)
        fs.unlinkSync(filePath)
        resolve(buffer)
      })

    } catch (e) {
      reject(e)
    }
  })
}