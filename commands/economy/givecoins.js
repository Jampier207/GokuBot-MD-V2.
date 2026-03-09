import { resolveLidToRealJid } from "../../lib/utils.js"

export default {
  command: ['givecoins', 'pay', 'coinsgive'],
  category: 'rpg',
  run: async (client, m, args, command, text, usedPrefix) => {
    if (!m?.sender) return

    const db = global.db.data
    const chatId = m.chat
    const chatData = db.chats[chatId]

    if (chatData.adminonly || !chatData.rpg) {
      return m.reply(
        `🚫 *Economía desactivada en este grupo*\n\n` +
        `Un administrador puede activarla con:\n` +
        `› *${usedPrefix}economia enable*`
      )
    }

    const botId = client.user.id.split(':')[0] + '@s.whatsapp.net'
    const monedas = db.settings?.[botId]?.currency || 'Coins'

    const senderData = chatData.users?.[m.sender]
    if (!senderData) return m.reply('❌ No estás registrado en la economía.')

    const mentioned = m.mentionedJid || []
    const targetRaw = mentioned[0]

    if (!targetRaw) {
      return m.reply(
        `👤 *Transferencia de monedas*\n\n` +
        `Debes mencionar a un usuario.\n\n` +
        `📌 Ejemplo:\n` +
        `› *${usedPrefix + command} 500 @usuario*`
      )
    }

    const target = await resolveLidToRealJid(targetRaw, client, chatId)
    if (!target || target === m.sender) {
      return m.reply('❌ No puedes transferirte monedas a ti mismo.')
    }

    const targetData = chatData.users?.[target]
    if (!targetData) {
      return m.reply('❌ El usuario mencionado no está registrado en el bot.')
    }

    const cantidadRaw = args[0]?.toLowerCase()
    if (!cantidadRaw) {
      return m.reply(
        `💰 Debes indicar una cantidad a transferir.\n\n` +
        `Ejemplo:\n` +
        `› *${usedPrefix + command} 300 @usuario*\n` +
        `› *${usedPrefix + command} all @usuario*`
      )
    }

    const cantidad =
      cantidadRaw === 'all'
        ? senderData.coins
        : parseInt(cantidadRaw)

    if (isNaN(cantidad) || cantidad <= 0) {
      return m.reply(`❌ Ingresa una cantidad válida de *${monedas}*.`)
    }

    if (senderData.coins < cantidad) {
      return m.reply(
        `💸 No tienes suficientes *${monedas}*.\n` +
        `Disponible: *${senderData.coins.toLocaleString()}*`
      )
    }

    senderData.coins -= cantidad
    targetData.coins += cantidad

    const cantidadFmt = cantidad.toLocaleString()

    await client.sendMessage(
      chatId,
      {
        text:
          `💸 *Transferencia exitosa*\n` +
          `━━━━━━━━━━━━━━\n` +
          `👤 De: *@${m.sender.split('@')[0]}*\n` +
          `🎯 Para: *@${target.split('@')[0]}*\n` +
          `💰 Cantidad: *${cantidadFmt} ${monedas}*`,
        mentions: [m.sender, target]
      },
      { quoted: m }
    )
  }
}