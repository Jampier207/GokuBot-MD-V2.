export default {
  command: ['setpasatiempo', 'sethobby'],
  category: 'rpg',
  run: async (client, m, args) => {
    const user = global.db.data.users[m.sender]
    const prefa = global.prefa || '!'
    const input = args.join(' ').trim()

    if (!user.pasatiempos) user.pasatiempos = []

        const pasatiemposDisponibles = [
      '📚 Leer', '✍️ Escribir', '🎤 Cantar', '💃 Bailar', '🎮 Jugar', 
      '🎨 Dibujar', '🍳 Cocinar', '✈️ Viajar', '🏊 Nadar', '📸 Fotografía',
      '🎧 Escuchar música', '🏀 Deportes', '🎬 Ver películas', '🌿 Jardinería',
      '🧵 Manualidades', '🎲 Juegos de mesa', '🏋️‍♂️ Gimnasio', '🚴 Ciclismo',
      '🎯 Tiro con arco', '🍵 Ceremonia del té', '🧘‍♂️ Meditación', '🎪 Malabares',
      '🛠️ Bricolaje', '🎹 Tocar instrumentos', '🐶 Cuidar mascotas', '🌌 Astronomía',
      '♟️ Ajedrez', '🍷 Catación de vinos', '🛍️ Compras', '🏕️ Acampar',
      '🎣 Pescar', '📱 Tecnología', '🎭 Teatro', '🍽️ Gastronomía', '🏺 Coleccionar',
      '✂️ Costura', '🧁 Repostería', '📝 Blogging', '🚗 Automóviles', '🧩 Rompecabezas',
      '🎳 Bolos', '🏄 Surf', '⛷️ Esquí', '🎿 Snowboard', '🤿 Buceo', '🏹 Tiro al blanco',
      '🧭 Orientación', '🏇 Equitación', '🎨 Pintura', '📊 Invertir', '🌡️ Meteorología',
      '🔍 Investigar', '💄 Maquillaje', '💇‍♂️ Peluquería', '🛌 Dormir', '🍺 Cervecería',
      '🪓 Carpintería', '🧪 Experimentos', '📻 Radioafición', '🗺️ Geografía', '💎 Joyería', '💦 Pajero', '🌳 Bugarron', '🍞:･:･ Migajero',
      'Otro 🌟'
    ]

    if (!input) {
      let lista = '🎯 *Elige hasta 2 pasatiempos:*\n\n'
      pasatiemposDisponibles.forEach((p, i) => {
        lista += `${i + 1}) ${p}\n`
      })
      lista += `\n*Ejemplos:*\n${prefa}setpasatiempo 1\n${prefa}setpasatiempo Leer\n${prefa}setpasatiempo 2,5`

      return m.reply(lista)
    }

    const entradas = input.split(',').map(t => t.trim()).slice(0, 2)
    let seleccionados = []

    for (let entrada of entradas) {
      let elegido = ''

      if (/^\d+$/.test(entrada)) {
        const index = parseInt(entrada) - 1
        if (index >= 0 && index < pasatiemposDisponibles.length) {
          elegido = pasatiemposDisponibles[index]
        } else {
          return m.reply(`《✧》 Número inválido: ${entrada}`)
        }
      } else {
        const limpio = entrada.replace(/[^\w\s]/g, '').toLowerCase()
        const encontrado = pasatiemposDisponibles.find(
          p => p.replace(/[^\w\s]/g, '').toLowerCase().includes(limpio)
        )
        if (encontrado) elegido = encontrado
        else return m.reply(`《✧》 Pasatiempo no encontrado: *${entrada}*`)
      }

      if (!seleccionados.includes(elegido)) seleccionados.push(elegido)
    }

    if (user.pasatiempos.length >= 2) {
      user.pasatiempos = []
    }

    user.pasatiempos.push(...seleccionados)
    user.pasatiempos = [...new Set(user.pasatiempos)].slice(0, 2)

    return m.reply(
      `✐ Tus pasatiempos actuales:\n> ${user.pasatiempos.join(' • ')}`
    )
  }
}