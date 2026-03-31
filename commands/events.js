export default function registerGroupEvents(conn) {
  conn.ev.on('group-participants.update', async (anu) => {
    const chat = anu.id
    const rawUser = anu.participants[0]
    const jid = typeof rawUser === 'string' ? rawUser : rawUser?.id || rawUser?.jid
    if (!jid) return

    const newsletterJid = "120363402960178567@newsletter"

    const phone = jid.split('@')[0]
    const chatData = global.db.data.chats[chat] || {}

    let metadata
    try {
      metadata = await conn.groupMetadata(chat)
    } catch {
      return
    }

    const members = metadata.participants.length

    let pp
    try {
      pp = await conn.profilePictureUrl(jid, 'image')
    } catch {
      pp = 'https://cdn.sockywa.xyz/files/1755559736781.jpeg'
    }

    if (anu.action === 'add' && chatData.welcome !== false) {

      const caption = `➤ @${phone}
❖ ${metadata.subject}
※ ${members} miembros
✦ usa /menu`

      await conn.sendMessage(chat, {
        image: { url: pp },
        caption,
        mentions: [jid],
        contextInfo: {
          forwardingScore: 999,
          isForwarded: true,
          forwardedNewsletterMessageInfo: {
            newsletterJid,
            newsletterName: "🌹 GokuBot-MD ~ Jxmpier207 💖",
            serverMessageId: 143
          }
        }
      })
    }

    if ((anu.action === 'remove' || anu.action === 'leave') && chatData.welcome !== false) {
      const caption = `➤ @${phone}
※ salió del grupo
❖ ${members} restantes`

      await conn.sendMessage(chat, {
        image: { url: pp },
        caption,
        mentions: [jid],
        contextInfo: {
          forwardingScore: 999,
          isForwarded: true,
          forwardedNewsletterMessageInfo: {
            newsletterJid,
            newsletterName: "🌹 GokuBot-MD ~ Jxmpier207 💖",
            serverMessageId: 143
          }
        }
      })
    }

    if (anu.action === 'promote' || anu.action === 'demote') {
      const actor = anu.author
      if (!actor) return

      const actorName = actor.split('@')[0]
      const targetName = phone

      const text =
        anu.action === 'promote'
          ? `✦ @${targetName} Fué Promovidx Por (${actorName})`
          : `✎ @${targetName} Fué Removidx Por (${actorName})`

      await conn.sendMessage(chat, {
        text,
        mentions: [jid, actor],
        contextInfo: {
          forwardingScore: 999,
          isForwarded: true,
          forwardedNewsletterMessageInfo: {
            newsletterJid,
            newsletterName: "🌹 GokuBot-MD ~ Jxmpier207 💖",
            serverMessageId: 143
          }
        }
      })
    }

  })
}