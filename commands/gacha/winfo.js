import { promises as fs } from 'fs'

const charactersFilePath = './lib/characters.json'

async function loadCharacters() {
  const data = await fs.readFile(charactersFilePath, 'utf-8')
  return JSON.parse(data)
}

function msToTime(duration) {
  const seconds = Math.floor((duration / 1000) % 60)
  const minutes = Math.floor((duration / (1000 * 60)) % 60)
  const hours = Math.floor((duration / (1000 * 60 * 60)) % 24)
  const days = Math.floor(duration / (1000 * 60 * 60 * 24))
  let result = ''
  if (days > 0) result += `${days}d `
  if (hours > 0) result += `${hours}h `
  if (minutes > 0) result += `${minutes}m `
  if (seconds > 0 || result === '') result += `${seconds}s`
  return result.trim()
}

function findSimilarCharacter(name, characters) {
  name = name.toLowerCase().trim()
  return (
    characters.find(c => c.name.toLowerCase() === name) ||
    characters.find(c => c.name.toLowerCase().includes(name)) ||
    characters.find(c => name.includes(c.name.toLowerCase()))
  )
}

export default {
  command: ['winfo', 'charinfo', 'cinfo'],
  category: 'gacha',
  use: '<nombre del personaje>',

  run: async (client, m, args, { usedPrefix }) => {
    const db = global.db.data
    const chatId = m.chat
    const chatData = db.chats?.[chatId]

    if (!chatData || chatData.adminonly || !chatData.gacha)
      return m.reply('Sistema Gacha desactivado en este grupo.')

    const characterName = args.join(' ').trim()
    if (!characterName)
      return m.reply(`Uso: ${usedPrefix}winfo <nombre del personaje>`)

    const characters = await loadCharacters()
    const character = findSimilarCharacter(characterName, characters)
    if (!character)
      return m.reply(`No se encontró el personaje: ${characterName}`)

    const sortedByValue = [...characters].sort((a, b) => (b.value || 0) - (a.value || 0))
    const rank = sortedByValue.findIndex(c => c.name.toLowerCase() === character.name.toLowerCase()) + 1

    const timeAgo = character.lastVoteTime ? msToTime(Date.now() - character.lastVoteTime) : 'Nunca votado'

    const reservado = chatData.personajesReservados?.find(p => p.name === character.name)
    const usuarioPoseedor = Object.entries(chatData.users || {}).find(
      ([_, u]) => u.characters?.some(c => c.name.toLowerCase() === character.name.toLowerCase())
    )

    const ownerId = usuarioPoseedor?.[0]
    const ownerName = ownerId ? db.users?.[ownerId]?.name || ownerId.split('@')[0] : null
    let estado = 'LIBRE'
    if (usuarioPoseedor) estado = `RECLAMADO\nPor: ${ownerName}`
    else if (reservado) estado = `RESERVADO\nPor: ${db.users?.[reservado.userId]?.name || reservado.userId.split('@')[0]}`

    const message =
`─── INFO DEL PERSONAJE ───
Nombre   : ${character.name}
Género   : ${character.gender || 'Desconocido'}
Valor    : ${character.value?.toLocaleString() || 0}
Fuente   : ${character.source || 'Desconocida'}

Votos    : ${character.votes || 0}
Ranking  : #${rank}
Último voto: ${timeAgo}

Estado   : ${estado.replace(/\n/g, '\n           ')}
────────────────────────────`

    await client.sendMessage(chatId, { text: message }, { quoted: m })
  }
}