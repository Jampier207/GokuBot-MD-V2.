export default {
  command: ['setbotname', 'setname'],
  category: 'socket',
  run: async (client, m, args, usedPrefix) => {
    const command = m?.body?.split(' ')[0]?.slice(usedPrefix.length) || 'setbotname'
    if (!m?.sender) return
    const idBot = client.user.id.split(':')[0] + '@s.whatsapp.net'
    const config = global.db.data.settings[idBot]
    const isOwner2 = [idBot, ...global.owner.map(n => n + '@s.whatsapp.net')].includes(m.sender)
    if (!isOwner2 && m.sender !== owner) return m.reply('✦ Acceso denegado. Solo el propietario puede usar este comando.')

    const value = args.join(' ').trim()
    if (!value) return m.reply(
      `✦ Debes escribir un nombre corto y un nombre largo válido.\n` +
      `> Ejemplo: *${usedPrefix + command}* Goku / GokuBot-MD`
    )

    const formatted = value.replace(/\s*\/\s*/g, '/')
    let [short, long] = formatted.includes('/') ? formatted.split('/') : [value, value]
    if (!short || !long) return m.reply('✦ Usa el formato: Nombre Corto / Nombre Largo')
    if (/\s/.test(short)) return m.reply('✦ El nombre corto no puede contener espacios.')

    config.namebot2 = short.trim()
    config.namebot = long.trim()

    return m.reply(
      `╔═━⊷ NOMBRE DEL BOT ACTUALIZADO ⊶━═╗\n` +
      `> Nombre corto: *${short.trim()}*\n` +
      `> Nombre largo: *${long.trim()}*\n` +
      `╚═══════════════════════════════╝`
    )
  },
};