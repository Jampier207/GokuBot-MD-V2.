const words = [
  'estrella','ventana','puerta','computadora','televisor','animacion',
  'instruccion','bicampeonato','melancolia','universidad','biblioteca',
  'montaña','elefante','arquitectura','electricidad','fotografia',
  'bicicleta','sombrero','paraguas','linterna','brujula','teclado',
  'espejo','martillo','reloj','aeropuerto','teatro','catedral',
  'castillo','jirafa','serpiente','tortuga','chocolate','diccionario',
  'galaxia','cometa','ballena','hospital','mercado','volcan','arrecife',
  'cactus','pinguino','laberinto'
]

const hangmanArt = [
` ------
 |    |
      |
      |
      |
      |
=========`,
` ------
 |    |
 O    |
      |
      |
      |
=========`,
` ------
 |    |
 O    |
 |    |
      |
      |
=========`,
` ------
 |    |
 O    |
/|    |
      |
      |
=========`,
` ------
 |    |
 O    |
/|\\   |
      |
      |
=========`,
` ------
 |    |
 O    |
/|\\   |
/     |
      |
=========`,
` ------
 |    |
 O    |
/|\\   |
/ \\   |
      |
=========`
]

global.games = global.games || {}
const games = global.games

const TIME_LIMIT = 5 * 60 * 1000
const COOLDOWN = 10 * 60 * 1000
const REWARD_EXP = 500
const REWARD_COINS = 1000
const PENALTY_EXP = 100
const PENALTY_COINS = 200

function msToTime(ms) {
  const m = Math.floor(ms / 60000)
  const s = Math.floor((ms % 60000) / 1000)
  return m > 0 ? `${m} min ${s}s` : `${s}s`
}

export default {
  command: ['ahorcado','hangman'],
  category: 'game',

  run: async (client, m, args, command, text, usedPrefix) => {
    if (!m?.sender) return

    const chatId = m.chat
    const chat = global.db.data.chats[chatId]

    if (!chat.users[m.sender]) {
      chat.users[m.sender] = { exp: 0, coins: 0, ahorcadoCooldown: 0 }
    }

    const user = chat.users[m.sender]

    const botId = client.user.id.split(':')[0] + '@s.whatsapp.net'
    const monedas = global.db.data.settings?.[botId]?.currency || 'coins'

    if (text === 'cancel' && games[chatId]) {
      if (games[chatId].player !== m.sender) return
      clearTimeout(games[chatId].timeout)
      delete games[chatId]
      user.ahorcadoCooldown = Date.now() + COOLDOWN
      return m.reply(`∎ Juego cancelado\n⌛ Cooldown: ${msToTime(COOLDOWN)}`)
    }

    if (games[chatId]) {
      const game = games[chatId]
      if (game.player !== m.sender) return

      const guess = text.toLowerCase()
      if (!guess) return

      if (guess.length > 1) {
        if (guess === game.word) {
          clearTimeout(game.timeout)
          user.exp += REWARD_EXP
          user.coins += REWARD_COINS
          delete games[chatId]
          return m.reply(`◆ Ganaste\n\n▣ Palabra: *${game.word}*\n▲ +${REWARD_EXP} exp\n◈ +${REWARD_COINS} ${monedas}`)
        } else {
          game.attemptsLeft--
        }
      } else {
        if (game.guessedLetters.has(guess)) return
        game.guessedLetters.add(guess)

        if (game.word.includes(guess)) {
          [...game.word].forEach((l,i)=>{
            if (l === guess) game.hidden[i] = l
          })
        } else {
          game.attemptsLeft--
        }
      }

      if (game.attemptsLeft <= 0) {
        clearTimeout(game.timeout)
        user.exp = Math.max(0, user.exp - PENALTY_EXP)
        user.coins = Math.max(0, user.coins - PENALTY_COINS)
        user.ahorcadoCooldown = Date.now() + COOLDOWN
        delete games[chatId]
        return m.reply(`■ Perdiste\n\n▣ Palabra: *${game.word}*\n▼ -${PENALTY_EXP} exp\n▼ -${PENALTY_COINS} ${monedas}`)
      }

      if (!game.hidden.includes('_')) {
        clearTimeout(game.timeout)
        user.exp += REWARD_EXP
        user.coins += REWARD_COINS
        delete games[chatId]
        return m.reply(`◆ Ganaste\n\n▣ Palabra: *${game.word}*`)
      }

      return m.reply(
        `◇ AHORCADO\n\n` +
        `▣ ${game.hidden.join(' ')}\n` +
        `◉ Intentos: ${game.attemptsLeft}\n` +
        `◌ Letras: ${[...game.guessedLetters].join(', ')}\n` +
        `${hangmanArt[6 - game.attemptsLeft]}`
      )
    }

    if (user.ahorcadoCooldown > Date.now()) {
      return m.reply(`⌛ Espera ${msToTime(user.ahorcadoCooldown - Date.now())}`)
    }

    const word = words[Math.floor(Math.random()*words.length)]
    const hidden = Array(word.length).fill('_')

    games[chatId] = {
      word,
      hidden,
      attemptsLeft: 6,
      guessedLetters: new Set(),
      player: m.sender,
      timeout: setTimeout(()=>{
        delete games[chatId]
      }, TIME_LIMIT)
    }

    return m.reply(
      `◈ AHORCADO\n\n` +
      `▣ ${hidden.join(' ')}\n` +
      `◉ Intentos: 6\n\n` +
      `✦ Escribe una letra o la palabra\n` +
      `∎ *${usedPrefix + command} cancel*`
    )
  }
}