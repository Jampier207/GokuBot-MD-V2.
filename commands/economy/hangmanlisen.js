const words = [
  'estrella','ventana','puerta','computadora','televisor','desenlace','animacion','instruccion','contraseña','bicampeonato',
  'melancolia','desconocido','interrogante','subterraneo','tratamiento','plan','hielo','helado','reencarnacion','resultado',
  'caricatura','desintegrado','graduacion','rechazo','murmullo','escalofrio','condor','universidad','biblioteca','montaña',
  'telefono','elefante','hipopotamo','murcielago','arquitectura','electricidad','fotografia','aguacate','contenedor',
  'tenedor','paralelepipedo','circunferencia','inverosimil','yacimiento','jengibre','bumeran','metafisica','jugabilidad',
  'olvidar','alquimia','silueta','tridente','bicicleta','sombrero','paraguas','manzana','naranja','linterna','brujula',
  'teclado','mochila','espejo','martillo','pincel','reloj','museo','aeropuerto','teatro','catedral','prision','torre',
  'alegria','tristeza','sorpresa','enojo','calma','ansiedad','inodoro','nintendo','twitter','quimera','cosmico','castillo',
  'jirafa','serpiente','tortuga','chocolate','youtube','cama','diccionario','kilometro','valquiria','negro','barcelona',
  'singapur','vasectomia','relampago','oreja','vocero','washington','anomalia','japon','volcan','arrecife','lechuza',
  'cangrejo','cactus','pinguino','delfin','laberinto','pantano','galaxia','cometa','ballena','tiburon','hospital','mercado'
]

const hangmanArt = [
`   ------
   |    |
        |
        |
        |
        |
  =========`,
`   ------
   |    |
   O    |
        |
        |
        |
  =========`,
`   ------
   |    |
   O    |
   |    |
        |
        |
  =========`,
`   ------
   |    |
   O    |
  /|    |
        |
        |
  =========`,
`   ------
   |    |
   O    |
  /|\\   |
        |
        |
  =========`,
`   ------
   |    |
   O    |
  /|\\   |
  /     |
        |
  =========`,
`   ------
   |    |
   O    |
  /|\\   |
  / \\   |
        |
  =========`
]

function msToTime(ms) {
  const s = Math.floor((ms / 1000) % 60)
  const m = Math.floor((ms / 60000) % 60)
  if (m === 0) return `${s} segundo${s !== 1 ? 's' : ''}`
  return `${m} minuto${m !== 1 ? 's' : ''}, ${s} segundo${s !== 1 ? 's' : ''}`
}

const COOLDOWN = 10 * 60 * 1000
const PENALTY_EXP = 100
const PENALTY_COINS = 200

export async function before(m, { client }) {
  if (!global.games) global.games = {}

  const chatId = m.chat
  const games = global.games

  if (!games[chatId]) return
  if (!m.quoted) return
  if (m.sender !== games[chatId].player) return
  if (m.quoted.id !== games[chatId].messageId) return

  if (!global.db.data.chats[chatId]) global.db.data.chats[chatId] = {}
  const chat = global.db.data.chats[chatId]

  if (!chat.users) chat.users = {}
  if (!chat.users[m.sender]) chat.users[m.sender] = { exp: 0, coins: 0 }
  const user = chat.users[m.sender]

  const botId = client.user.id.split(':')[0] + '@s.whatsapp.net'
  const moneda = global.db.data.settings?.[botId]?.currency || 'coins'
  const dev = '*Powered by Night Light ⚡*'

  try {
    const game = games[chatId]
    const guess = m.text.trim().toLowerCase()
    const word = game.word

  if (!/^[a-záéíóúñ]+$/i.test(guess)) {
      await client.reply(chatId, '✧ Usa solo letras.', m)
      return
    }

    if (guess.length === word.length) {
      if (guess === word) {
        user.exp += 500
        user.coins += 1000
        user.ahorcadoCooldown = Date.now() + COOLDOWN
        clearTimeout(game.timeout)
        delete games[chatId]
        await client.reply(chatId,
`➪ *¡Ganaste!*

> Palabra: *${word}*
> +500 exp
> +1000 ${moneda}
> Espera ${msToTime(COOLDOWN)}

${dev}`, m)
      } else {
        game.attemptsLeft--
      }
    } else if (guess.length === 1) {
      if (game.guessedLetters.has(guess)) {
        await client.reply(chatId, `✧ La letra *${guess}* ya fue usada.`, m)
        return
      }

      game.guessedLetters.add(guess)
      let hit = false

      for (let i = 0; i < word.length; i++) {
        if (word[i] === guess) {
          game.hidden[i] = guess
          hit = true
        }
      }

      if (!hit) game.attemptsLeft--
    } else {
      await client.reply(chatId, `✧ La palabra tiene ${word.length} letras.`, m)
      return
    }

    if (game.hidden.join('') === word) {
      user.exp += 500
      user.coins += 1000
      user.ahorcadoCooldown = Date.now() + COOLDOWN
      clearTimeout(game.timeout)
      delete games[chatId]
      await client.reply(chatId,
`➪ *¡Ganaste!*

> Palabra: *${word}*
> +500 exp
> +1000 ${moneda}

${dev}`, m)
      return
    }

    if (game.attemptsLeft <= 0) {
      user.exp = Math.max(0, user.exp - PENALTY_EXP)
      user.coins = Math.max(0, user.coins - PENALTY_COINS)
      user.ahorcadoCooldown = Date.now() + COOLDOWN
      clearTimeout(game.timeout)
      delete games[chatId]
      await client.reply(chatId,
`➪ *Perdiste*

> Palabra: *${word}*
> -${PENALTY_EXP} exp
> -${PENALTY_COINS} ${moneda}
${hangmanArt[6]}`, m)
      return
    }

    const hidden = game.hidden.join(' ')
    const used = [...game.guessedLetters].join(', ') || 'Ninguna'

    const sent = await client.reply(chatId,
`➪ *Ahorcado*

> ${hidden}
> Intentos: ${game.attemptsLeft}
> Letras: ${used}
${hangmanArt[6 - game.attemptsLeft]}

✧ Responde con una letra o la palabra.`, m)

    game.messageId = sent.key.id

  } catch (e) {
    console.error(e)
    if (games[chatId]) {
      clearTimeout(games[chatId].timeout)
      delete games[chatId]
    }
    await client.reply(chatId, '✎ Ocurrió un error inesperado.', m)
  }
}
