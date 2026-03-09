export default {
  command: ['setbotcurrency'],
  category: 'socket',
  run: async (client, m, args, command, text, usedPrefix) => {
    const idBot = client.user.id.split(':')[0] + '@s.whatsapp.net'
    const config = global.db.data.settings[idBot]
    const isOwner2 = [idBot, ...global.owner.map((number) => number + '@s.whatsapp.net')].includes(m.sender)
    if (!isOwner2 && m.sender !== owner) 
      return m.reply('✦ Acceso denegado: solo el propietario puede ejecutar este comando.')

    const value = args.join(' ').trim()
    if (!value) 
      return m.reply(`✦ Debes escribir un nombre de moneda válido.\n> ✦ Ejemplo: ${usedPrefix + command} money`)

    config.currency = value
    return m.reply(`✦ Moneda del bot actualizada correctamente.\n> ✦ Nueva moneda: ${value}`)
  },
};