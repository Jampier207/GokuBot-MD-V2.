import moment from 'moment-timezone'
import os from 'os'
import { commands } from '../../lib/commands.js'

export default {
  command: ['menu', 'help'],
  category: 'info',
  run: async (client, m, usedPrefix) => {
    try {
      const uptime = process.uptime()
      const hours = Math.floor(uptime / 3600)
      const minutes = Math.floor((uptime % 3600) / 60)
      const uptimeString = `${hours}h ${minutes}m`

      const now = moment.tz('America/Bogota')
      const fecha = now.format('DD/MM/YY')
      const hora = now.format('HH:mm')

      const botId = client.user.id.split(':')[0] + "@s.whatsapp.net"
      const settings = global.db.data.settings[botId] || {}
      const botName = settings.namebot || '𝐆𝐎𝐊𝐔𝐁𝐎𝐓-𝐌𝐃'
      const banner = 'https://files.catbox.moe/xq54k8.jpeg' // Tu imagen editada

      const totalUsers = Object.keys(global.db.data.users).length
      const categories = {}
      
      commands.forEach(cmd => {
        const cat = cmd.category || 'otros'
        if (!categories[cat]) categories[cat] = []
        categories[cat].push(cmd)
      })

      let menu = `┌────  ${botName}  ────┐\n`
      menu += `│ ⬭ 𝐔𝐬𝐮𝐚𝐫𝐢𝐨 › ${m.pushName || 'Invitado'}\n`
      menu += `│ ⬭ 𝐔𝐩𝐭𝐢𝐦𝐞  › ${uptimeString}\n`
      menu += `│ ⬭ 𝐅𝐞𝐜𝐡𝐚    › ${fecha} | ${hora}\n`
      menu += `│ ⬭ 𝐔𝐬𝐮𝐚𝐫𝐢𝐨𝐬 › ${totalUsers}\n`
      menu += `└────────────────────────┘\n`

      for (const [cat, cmds] of Object.entries(categories)) {
        menu += `\n───  ${cat.toUpperCase()}  ───\n`
        const cmdList = cmds.map(cmd => `› ${usedPrefix}${cmd.command[0]}`).join('\n')
        menu += `${cmdList}\n`
      }

      menu += `\n┌────────────────────────┐\n`
      menu += `│  𝐃𝐞𝐯𝐞𝐥𝐨𝐩𝐞𝐫: ᴊxᴍᴘɪᴇʀ²⁰⁷™\n`
      menu += `└────────────────────────┘`

      await client.sendMessage(m.chat, {
        image: { url: banner },
        caption: menu.trim(),
        contextInfo: {
          forwardingScore: 999,
          isForwarded: true,
          forwardedNewsletterMessageInfo: {
            newsletterJid: "120363402960178567@newsletter",
            newsletterName: "🌹 𝐆𝐨𝐤𝐮𝐁𝐨𝐭-𝐌𝐃 💖",
            serverMessageId: 1
          }
        }
      }, { quoted: m })

    } catch (e) {
      console.log(e)
      await m.reply("Error: " + e.message)
    }
  }
}
