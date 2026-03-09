export default {
  command: ['cf', 'flip', 'coinflip'],
  category: 'rpg',
  run: async (client, m, args, command, text, prefix) => {

    const chat = global.db.data.chats[m.chat]
    const user = chat.users[m.sender]
    const botId = client.user.id.split(':')[0] + '@s.whatsapp.net'
    const botSettings = global.db.data.settings[botId]
    const monedas = botSettings.currency

    if (chat.adminonly || !chat.rpg)
      return m.reply(mess.comandooff)

    const cantidad = parseInt(args[0])
    const eleccion = args[1]?.toLowerCase()

    if (!eleccion || isNaN(cantidad)) {
      return m.reply(
        `◬ Elige Cara o Cruz y la cantidad.\n\n` +
        `Ejemplo:\n` +
        `> ${prefix + command} 2000 cara`
      )
    }

    if (!['cara', 'cruz'].includes(eleccion)) {
      return m.reply(`◭ Opción inválida. Usa cara o cruz.`)
    }

    if (cantidad <= 199) {
      return m.reply(`▵ Mínimo 200 ${monedas}.`)
    }

    if (user.coins < cantidad) {
      return m.reply(`▿ No tienes suficientes ${monedas}.`)
    }

    user.coins -= cantidad

    const resultado = Math.random() < 0.5 ? 'cara' : 'cruz'
    const cantidadFormatted = cantidad.toLocaleString()
    let mensaje = `◩ Resultado: ${resultado}\n`

    if (resultado === eleccion) {
      const ganancia = cantidad * 2
      user.coins += ganancia
      mensaje += `◮ Ganaste +${ganancia.toLocaleString()} ${monedas}`
    } else {
      mensaje += `◪ Perdiste -${cantidadFormatted} ${monedas}`
    }

    await client.reply(m.chat, mensaje, m)
  },
}