import moment from 'moment-timezone'
import os from 'os'
import fetch from 'node-fetch'
import { commands } from '../../lib/commands.js'

export default {
  command: ['menu', 'help'],
  category: 'info',
  run: async (client, m, usedPrefix) => {
    try {

const uptime = process.uptime()
const hours = Math.floor(uptime / 3600)
const minutes = Math.floor((uptime % 3600) / 60)
const seconds = Math.floor(uptime % 60)

const uptimeString = `${hours}h ${minutes}m ${seconds}s`


      const now = moment.tz('America/Bogota')
      const fecha = now.format('DD MMM YYYY')
      const hora = now.format('HH:mm:ss')

      const botId = client.user.id.split(':')[0] + "@s.whatsapp.net"
      const settings = global.db.data.settings[botId] || {}
      const banner = settings.banner || 'https://bot.stellarwa.xyz/files/xQSur.jpg'
      const owner = settings.owner || ''

      const totalUsers = Object.keys(global.db.data.users).length.toLocaleString()
      const totalCmds = commands.length
      const platform = os.platform()

      const categories = {}
      for (const cmd of commands) {
        const cat = cmd.category || 'general'
        if (!categories[cat]) categories[cat] = []
        categories[cat].push(cmd)
      }

      let menu = `
╭──────────────────────⬣
│ ✦ 𝙂𝙊𝙆𝙐𝘽𝙊𝙏 𝙈𝘿 ✦
╰──────────────────────⬣
│ 👤 Usuario : ${m.pushName || 'Invitado'}
│ ⏳ Uptime  : ${uptimeString}
│ 📅 Fecha   : ${fecha}
│ ⏰ Hora    : ${hora}
│ 💻 Sistema : ${platform}
│ 📦 Comandos: ${totalCmds}
│ 👥 Usuarios: ${totalUsers}
╰─────────────────────────⬣
`

      for (const [cat, cmds] of Object.entries(categories)) {
  const title = cat.charAt(0).toUpperCase() + cat.slice(1)

  menu += `\n╭━━━〔 ${title} 〕━━━⬣\n`

  cmds.forEach(cmd => {
    const name = `${usedPrefix}${cmd.alias?.[0] || 'unknown'}`
    const description = cmd.desc || 'Sin descripción'

    menu += `┃ ✦ ${name}\n`
    menu += `┃ ➥ ${description}\n`
    menu += `┃\n`
  })

  menu += `╰━━━━━━━━━━━━━━━━━━⬣\n`
}
      menu += `
╭──────────────────────⬣
│ 👑 Developer : ᴊxᴍᴘɪᴇʀ²⁰⁷™
╰──────────────────────⬣
`


      const res = await fetch('https://bot.stellarwa.xyz/files/xQSur.jpg')
      const arrayBuffer = await res.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)

      await client.sendMessage(
  m.chat,
  {
    image: { url: banner },
    caption: menu.trim(),
          contextInfo: {
            mentionedJid: owner ? [owner] : [],
            forwardingScore: 999,
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
              newsletterJid: "120363402960178567@newsletter",
              newsletterName: "🌹 𝐆𝐨𝐤𝐮𝐁𝐨𝐭-𝐌𝐃 💖",
              serverMessageId: 1
            }
          }
        },
        { quoted: m }
      )

    } catch (e) {
      console.log(e)
      await m.reply("Error al mostrar el menú.\n[TypeError]: " + e.message)
    }
  }
}
