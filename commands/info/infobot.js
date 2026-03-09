import os from 'os';

function rTime(seconds) {
  seconds = Number(seconds)
  const d = Math.floor(seconds / (3600 * 24))
  const h = Math.floor((seconds % (3600 * 24)) / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = Math.floor(seconds % 60)
  const dDisplay = d > 0 ? d + (d === 1 ? " día, " : " días, ") : ""
  const hDisplay = h > 0 ? h + (h === 1 ? " hora, " : " horas, ") : ""
  const mDisplay = m > 0 ? m + (m === 1 ? " minuto, " : " minutos, ") : ""
  const sDisplay = s > 0 ? s + (s === 1 ? " segundo" : " segundos") : ""
  return dDisplay + hDisplay + mDisplay + sDisplay
}

export default {
  command: ['infobot', 'infosocket', 'info'],
  category: 'info',
  run: async (client, m) => {

    const botId = client.user.id.split(':')[0] + "@s.whatsapp.net"
    const botSettings = global.db.data.settings[botId] || {}

    const botname = botSettings.namebot || 'Ai Surus'
    const botname2 = botSettings.namebot2 || 'Surus'
    const monedas = botSettings.currency || 'BitCoins'
    const banner = botSettings.banner
    const prefijo = botSettings.prefijo
    const owner = botSettings.owner
    const canal = botSettings.canal
    const comando = botSettings.commandsejecut

    const platform = os.type()
    const nodeVersion = process.version

    const now = new Date()
    const colombianTime = new Date(now.toLocaleString('en-US', { timeZone: 'America/Bogota' }))
    const uptime = process.uptime()
    const uptimeDate = new Date(colombianTime.getTime() - uptime * 1000)

    const formattedUptimeDate = uptimeDate.toLocaleString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).replace(/^./, m => m.toUpperCase())

    const botType = 'Sistema Activo'

    try {

    const message = `
╔══════════════════════╗
║      🍧 ${botname2}
╚══════════════════════╝

🛡️  INFORMACIÓN GENERAL
────────────────────────
▸ Nombre Completo : ${botname}
▸ Moneda Sistema  : ${monedas}
▸ Prefijos        : ${prefijo}
▸ Cmd Ejecutados  : ${comando?.toLocaleString() || 0}

⚙️  SISTEMA
────────────────────────
▸ Tipo            : ${botType}
▸ Plataforma      : ${platform}
▸ NodeJS          : ${nodeVersion}
▸ Activo Desde    : ${formattedUptimeDate}

🌐  CANAL OFICIAL
────────────────────────
${canal || 'https://whatsapp.com/channel/0029VbBs7WlFCCoWhD6bjJ0Z'}
────────────────────────`.trim()

    await client.sendMessage(m.chat, {
      text: message,
      contextInfo: {
        externalAdReply: {
          renderLargerThumbnail: true,
          title: ` ${botname}`,
          body: `${botname} • ¡Un WaBot Confiable!`,
          mediaType: 1,
          thumbnailUrl: banner,
          sourceUrl: canal,
        }
      }
    }, { quoted: m })

    } catch (e) {
      m.reply(msgglobal)
    }
  }
};
