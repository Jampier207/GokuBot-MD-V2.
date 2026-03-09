import { promises as fs } from 'fs'
import fetch from 'node-fetch'

const obtenerImagen = async (keyword, name) => {
  const ext = /\.(jpg|jpeg|png)$/i

  try {
    const url = `https://api.delirius.store/search/gelbooru?query=${encodeURIComponent(keyword)}`
    const res = await fetch(url)
    const json = await res.json()
    const imgs = json?.data?.filter(v => typeof v?.image === 'string' && ext.test(v.image))
    if (imgs?.length) return imgs[Math.floor(Math.random() * imgs.length)].image
  } catch {}

  try {
    const url = `${api.url}/search/pinterest?query=${encodeURIComponent(name + ' anime')}&key=${api.key}`
    const res = await fetch(url)
    const json = await res.json()
    const imgs = json?.data?.filter(v => typeof v?.hd === 'string' && ext.test(v.hd))
    if (imgs?.length) return imgs[Math.floor(Math.random() * imgs.length)].hd
  } catch {}

  return null
}

const charactersFilePath = './lib/characters.json'

const loadCharacters = async () => {
  const data = await fs.readFile(charactersFilePath, 'utf-8')
  return JSON.parse(data)
}

const findSimilarCharacter = (name, characters) => {
  name = name.toLowerCase().trim()
  return (
    characters.find(c => c.name.toLowerCase() === name) ||
    characters.find(c => c.name.toLowerCase().includes(name)) ||
    characters.find(c => name.includes(c.name.toLowerCase()))
  )
}

export default {
  command: ['charimage', 'wimage', 'cimage'],
  category: 'gacha',
  run: async (client, m, args) => {

    if (!m || !m.chat) return

    const db = global.db?.data
    if (!db) return

    const chatId = m.chat
    const chatData = db.chats?.[chatId]
    if (!chatData) return m.reply('No hay datos del chat.')

    if (chatData.adminonly || !chatData.gacha)
      return m.reply('Estos comandos están desactivados en este grupo.')

    if (!args?.length)
      return m.reply('Escribe el nombre de un personaje.')

    try {
      const characterName = args.join(' ')
      const characters = await loadCharacters()
      const character = findSimilarCharacter(characterName, characters)

      if (!character)
        return m.reply(`No se encontró el personaje: ${characterName}`)

      const imagen = await obtenerImagen(character.keyword, character.name)
      if (!imagen)
        return m.reply(`No se pudo obtener imagen de: ${character.name}`)

      const caption = `
╔═══〔 ${character.name} 〕═══╗
║
║ ⮞ Género : ${character.gender}
║ ⮞ Valor  : ${character.value.toLocaleString()}
║ ⮞ Fuente : ${character.source}
║
╚═════════════════╝
${dev}
`.trim()

      await client.sendMessage(
        chatId,
        { image: { url: imagen }, caption },
        { quoted: m }
      )

    } catch (e) {
      await m.reply(msgglobal)
    }
  }
}