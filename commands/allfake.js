export async function before(m, { client }) {
let bot = global.db.data.settings[client.user.id.split(':')[0] + "@s.whatsapp.net"]
let botname = bot.namebot
let botname2 = bot.namebot2
let icon = bot.icon

var canal = 'https://whatsapp.com/channel/0029VbBs7WlFCCoWhD6bjJ0Z'
var canal2 = 'https://whatsapp.com/channel/0029Vb75ETv5vKA3XsmyNo0x'
var gpo = "https://chat.whatsapp.com/Irhd8M5D9yGLhVAhenbzgY"
var gp2 = "https://chat.whatsapp.com/IfTp6XrwPr25sYkr823zxx"

global.redes = [canal, canal2, gpo, gpo2][Math.floor(Math.random() * 3)]

global.rcanal = {contextInfo: {forwardingScore: 2026, isForwarded: true, externalAdReply: {title: botname, body: dev, sourceUrl: redes, thumbnailUrl: icon}}}
}
 
