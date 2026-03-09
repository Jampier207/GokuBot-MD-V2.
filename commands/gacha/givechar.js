import { readFileSync } from 'fs'
import { resolveLidToRealJid } from "../../lib/utils.js"

function formatDate(ts) {
  const d = new Date(ts)
  const dias = ['domingo','lunes','martes','miércoles','jueves','viernes','sábado']
  const meses = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre']
  return `${dias[d.getDay()]}, ${d.getDate()} de ${meses[d.getMonth()]} de ${d.getFullYear()}`
}

export default {
  command: ['givechar', 'givewaifu', 'regalar'],
  category: 'gacha',
  run: async (client, m, args) => {
    if (!m || !m.chat) return

    const db = global.db.data
    const chatId = m.chat
    const senderId = m.sender
    const chatData = db.chats?.[chatId]

    if (!chatData)
      return m.reply(
        '▢ Chat no registrado.\n' +
        '▢ Usa un comando primero.'
      )

    if (chatData.adminonly || !chatData.gacha)
      return m.reply(
        '▣ Sistema Gacha desactivado.\n' +
        '▣ Consulta a un administrador.'
      )

    const senderData = chatData.users?.[senderId]
    if (!senderData?.characters?.length)
      return m.reply(
        '◇ Inventario vacío.\n' +
        '◇ No tienes personajes.'
      )

    const target =
      m.mentionedJid?.[0] ||
      (m.quoted ? m.quoted.sender : null)

    if (!target)
      return m.reply(
        '✦ Acción incompleta.\n' +
        '✦ Menciona o responde a un usuario.'
      )

    const receiverId = await resolveLidToRealJid(target, client, chatId)

    if (!receiverId || receiverId === senderId)
      return m.reply(
        '◆ Acción inválida.\n' +
        '◆ No puedes regalarte personajes.'
      )

    const characterName = args
      .filter(a => !a.includes(receiverId.split('@')[0]))
      .join(' ')
      .toLowerCase()
      .trim()

    if (!characterName)
      return m.reply(
        '▸ Falta información.\n' +
        '▸ Escribe el nombre del personaje.'
      )

    const index = senderData.characters.findIndex(
      c => c.name?.toLowerCase() === characterName
    )

    if (index === -1)
      return m.reply(
        `▸ Personaje no encontrado.\n` +
        `▸ *${characterName}* no está en tu inventario.`
      )

    let baseData
    try {
      baseData = JSON.parse(readFileSync('./lib/characters.json', 'utf8'))
    } catch {
      return m.reply(
        '▣ Error interno.\n' +
        '▣ Base de datos no accesible.'
      )
    }

    const original = baseData.find(
      c => c.name.toLowerCase() === characterName
    )

    if (!original)
      return m.reply(
        '▣ Personaje inválido.\n' +
        '▣ No existe en la base.'
      )

    if (!chatData.users[receiverId]) {
      chatData.users[receiverId] = {
        characters: [],
        characterCount: 0,
        totalRwcoins: 0
      }
    }

    const receiver = chatData.users[receiverId]

    const gifted = {
      name: original.name,
      value: original.value,
      gender: original.gender,
      source: original.source,
      keyword: original.keyword,
      claim: formatDate(Date.now())
    }

    receiver.characters.push(gifted)
    receiver.characterCount++
    receiver.totalRwcoins += gifted.value || 0

    senderData.characters.splice(index, 1)
    senderData.characterCount--
    senderData.totalRwcoins -= gifted.value || 0

    const receiverName =
      db.users?.[receiverId]?.name ||
      receiverId.split('@')[0]

    const message =
      '╭─ 🎁 REGALO REALIZADO\n' +
      `│\n` +
      `│ ✧ Personaje\n` +
      `│   ${gifted.name}\n` +
      `│\n` +
      `│ ➤ Destinatario\n` +
      `│   ${receiverName}\n` +
      `│\n` +
      `│ ❖ Valor\n` +
      `│   ${gifted.value.toLocaleString()}\n` +
      `│\n` +
      `│ ⧗ Fecha\n` +
      `│   ${gifted.claim}\n` +
      '╰───────────────'

    await client.sendMessage(chatId, { text: message }, { quoted: m })
  }
}