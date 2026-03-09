import { promises as fs } from 'fs'

const charactersFilePath = './lib/characters.json'
const cooldownTime = 60 * 60 * 1000
const characterVotes = new Map()

async function loadCharacters() {
  const data = await fs.readFile(charactersFilePath, 'utf-8')
  return JSON.parse(data)
}

async function saveCharacters(characters) {
  await fs.writeFile(
    charactersFilePath,
    JSON.stringify(characters, null, 2)
  )
}

function msToTime(ms) {
  const s = Math.floor((ms / 1000) % 60)
  const m = Math.floor((ms / (1000 * 60)) % 60)
  const h = Math.floor((ms / (1000 * 60 * 60)) % 24)

  if (h === 0 && m === 0) return `${s} segundo${s !== 1 ? 's' : ''}`
  if (h === 0) return `${m} minuto${m !== 1 ? 's' : ''} y ${s} segundo${s !== 1 ? 's' : ''}`
  return `${h} hora${h !== 1 ? 's' : ''} y ${m} minuto${m !== 1 ? 's' : ''}`
}

export default {
  command: ['vote', 'votar'],
  category: 'gacha',

  run: async (client, m, args, command) => {
    const db = global.db.data
    const chatId = m.chat
    const userId = m.sender

    const botId = client.user.id.split(':')[0] + '@s.whatsapp.net'
    const settings = db.settings?.[botId] || {}

    const isOficial = botId === global.client.user.id.split(':')[0] + '@s.whatsapp.net'
    const isPremium = settings.botprem === true
    const isMod = settings.botmod === true

    if (!isOficial && !isPremium && !isMod)
      return m.reply(
        `🚫 Este comando no está disponible en Sub-Bots.`
      )

    const chatData = db.chats?.[chatId]
    const user = db.users?.[userId]

    if (!chatData || chatData.adminonly || !chatData.gacha)
      return m.reply('🌿 El sistema gacha está desactivado aquí.')

    if (!user.voteCooldown) user.voteCooldown = 0

    const remaining = user.voteCooldown - Date.now()
    if (remaining > 0)
      return m.reply(
        `⏳ Debes esperar:\n` +
        `› *${msToTime(remaining)}*\n\n` +
        `antes de volver a votar.`
      )

    if (!args.length)
      return m.reply(
        `📘 Uso correcto:\n` +
        `› *${command} Nombre del personaje*`
      )

    try {
      const characterName = args.join(' ').toLowerCase().trim()
      const characters = await loadCharacters()

      const character = characters.find(
        c => c.name?.toLowerCase() === characterName
      )

      if (!character)
        return m.reply(
          `❌ Personaje no encontrado:\n` +
          `› *${characterName}*`
        )

      if ((character.votes || 0) >= 10)
        return m.reply(
          `🏆 *${character.name}* ya alcanzó el máximo de votos.`
        )

      if (characterVotes.has(characterName)) {
        const wait = characterVotes.get(characterName) - Date.now()
        if (wait > 0)
          return m.reply(
            `⏱ Este personaje fue votado recientemente.\n\n` +
            `› Espera *${msToTime(wait)}*`
          )
      }

      const increment = Math.floor(Math.random() * 100) + 1

      character.value = (Number(character.value) || 0) + increment
      character.votes = (character.votes || 0) + 1
      character.lastVoteTime = Date.now()

      await saveCharacters(characters)

      user.voteCooldown = Date.now() + 90 * 60 * 1000
      characterVotes.set(characterName, Date.now() + cooldownTime)

      const message =
        `╭───〔 ⭐ 𝑽𝒐𝒕𝒆 〕───╮\n` +
        `│\n` +
        `│ 🎴 Personaje:\n` +
        `│ ${character.name}\n` +
        `│\n` +
        `│ ⛁ Aumento:\n` +
        `│ +${increment.toLocaleString()}\n` +
        `│\n` +
        `│ 💎 Valor total:\n` +
        `│ ${character.value.toLocaleString()}\n` +
        `│\n` +
        `│ 🗳️ Votos:\n` +
        `│ ${character.votes}/10\n` +
        `│\n` +
        `╰───────────────╯`

      await client.sendMessage(
        chatId,
        { text: message },
        { quoted: m }
      )

    } catch {
      await m.reply(msgglobal)
    }
  }
}