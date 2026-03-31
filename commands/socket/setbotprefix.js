import GraphemeSplitter from 'grapheme-splitter'

export default {
  command: ['setbotprefix'],
  category: 'socket',
  run: async (client, m, args, command, text, prefix) => {
    const newsletterJid = "120363402960178567@newsletter"
    const newsletterName = "GokuBot-MD ~ Jxmpier207"
    
    const contextInfo = {
      forwardingScore: 999,
      isForwarded: true,
      forwardedNewsletterMessageInfo: {
        newsletterJid,
        newsletterName,
        serverMessageId: 1
      }
    }

    const idBot = client.user.id.split(':')[0] + '@s.whatsapp.net'
    const config = global.db.data.settings[idBot]
    const isOwner = [idBot, ...(config.owner ? [config.owner] : []), ...global.owner.map(num => num + '@s.whatsapp.net')].includes(m.sender)
    
    if (!isOwner) {
      return client.sendMessage(m.chat, { text: '❖ Solo el owner puede cambiar los prefijos.', contextInfo }, { quoted: m })
    }

    const value = args.join(' ').trim()
    const defaultPrefix = ["#", "/"]

    if (!value) {
      const lista = config.prefijo === true 
        ? '`sin prefijos`' 
        : (Array.isArray(config.prefijo) ? config.prefijo : [config.prefijo || '/']).map(p => `\`${p}\``).join(', ')
      
      const menuText = 'CONFIGURACIÓN DE PREFIJOS\n' +
        `  » Multi-Prefix : ${prefix + command} *!/.+-#*\n` +
        `  » Reset        : ${prefix + command} *reset*\n` +
        `  » No-Prefix    : ${prefix + command} *noprefix*\n\n` +
        `― Actualmente en uso : ${lista} ―`

      return client.sendMessage(m.chat, { text: menuText, contextInfo }, { quoted: m })
    }

    if (value.toLowerCase() === 'reset') {
      config.prefijo = defaultPrefix
      return client.sendMessage(m.chat, { 
        text: '❖ Se han restaurado los prefijos: *' + defaultPrefix.join(' ') + '*' , 
        contextInfo 
      }, { quoted: m })
    }

    if (value.toLowerCase() === 'noprefix') {
      config.prefijo = true
      return client.sendMessage(m.chat, { 
        text: '❖ Se activó correctamente el modo sin prefijos.', 
        contextInfo 
      }, { quoted: m })
    }

    const splitter = new GraphemeSplitter()
    const graphemes = splitter.splitGraphemes(value)
    const lista = []

    for (const g of graphemes) {
      if (/^[a-zA-Z0-9]+$/.test(g)) continue
      if (!lista.includes(g)) lista.push(g)
    }

    if (lista.length === 0) {
      return client.sendMessage(m.chat, { 
        text: '❖ No se detectaron prefijos válidos. Usa símbolos o emojis.', 
        contextInfo 
      }, { quoted: m })
    }

    if (lista.length > 6) {
      return client.sendMessage(m.chat, { 
        text: '❖ Máximo 6 prefijos permitidos.', 
        contextInfo 
      }, { quoted: m })
    }

    config.prefijo = lista
    return client.sendMessage(m.chat, { 
      text: '❖ Se cambió el prefijo a: *' + lista.join(' ') + '*', 
      contextInfo 
    }, { quoted: m })
  }
}