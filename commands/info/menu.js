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
      const settings = global.db.data?.settings?.[botId] || {}
      const botName = settings.namebot || '𝐆𝐎𝐊𝐔𝐁𝐎𝐓-𝐌𝐃'
      const banner = 'https://files.catbox.moe'
      const owner = settings.owner || ''

      const totalUsers = Object.keys(global.db.data?.users || {}).length.toLocaleString()
      const totalCmds = commands.length
      const platform = os.platform()

      const categories = {}
      for (const cmd of commands) {
        const cat = cmd.category || 'general'
        if (!categories[cat]) categories[cat] = []
        categories[cat].push(cmd)
      }

      let menu = `┌────  ${botName}  ────┐\n`
      menu += `│ ⬭ 𝐔𝐬𝐮𝐚𝐫𝐢𝐨 › ${m.pushName || 'Invitado'}\n`
      menu += `│ ⬭ 𝐔𝐩𝐭𝐢𝐦𝐞  › ${uptimeString}\n`
      menu += `│ ⬭ 𝐅𝐞𝐜𝐡𝐚    › ${fecha}\n`
      menu += `│ ⬭ 𝐇𝐨𝐫𝐚     › ${hora}\n`
      menu += `│ ⬭ 𝐒𝐢𝐬𝐭𝐞𝐦𝐚  › ${platform}\n`
      menu += `│ ⬭ 𝐂𝐨𝐦𝐚𝐧𝐝𝐨𝐬 › ${totalCmds}\n`
      menu += `│ ⬭ 𝐔𝐬𝐮𝐚𝐫𝐢𝐨𝐬 › ${totalUsers}\n`
      menu += `└────────────────────────┘\n`

      const sortedCategories = Object.keys(categories).sort()

      for (const cat of sortedCategories) {
        menu += `\n───  ${cat.toUpperCase()}  ───\n`
        
        categories[cat].forEach(cmd => {
          const name = Array.isArray(cmd.command) ? cmd.command[0] : cmd.command
          if (name) {
            menu += `› ${usedPrefix}${name}\n`
          }
        })
      }

      menu += `\n┌────────────────────────┐\n`
      menu += `│  𝐃𝐞𝐯𝐞𝐥𝐨𝐩𝐞𝐫: ᴊxᴍᴘɪᴇʀ²⁰⁷\n`
      menu += `└────────────────────────┘`

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
      await m.reply("Error: " + e.message)
    }
  }
}
