export default function registerGroupEvents(conn) {
  conn.ev.on('group-participants.update', async (anu) => {
    const chat = anu.id
    const rawUser = anu.participants[0]
    const jid = typeof rawUser === 'string' ? rawUser : rawUser?.id || rawUser?.jid
    if (!jid) return

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

      const caption = `╔═════════════ ✦ ═════════════╗
║          BIENVENIDO(A)         ║
║                                ║
║  Usuario  › @${phone}          
║  Grupo    › ${metadata.subject}
║  ───────────────────────────── ║
║  Disfruta tu estadía           
║  Usa /menu para ver comandos   
║  Miembros en el grupo › ${members}
╚═════════════ ✦ ═════════════╝`

      await conn.sendMessage(chat, {
        image: { url: pp },
        caption,
        mentions: [jid]
      })

      if (chat === '120363406602664742@g.us') {
        setTimeout(async () => {
          const presentacion = (phone, groupName) =>
`╔════════════════════╗
║    BIENVENIDO(A)    ║
║      ${groupName}      ║
╚════════════════════╝

Hola, @${phone}, por favor preséntese:

Nombre:
Edad:
País:\n\n> ¡Porfavor Lea Las Reglas De Cada Grupo Para Evitar Sanciones!`

          await conn.sendMessage(chat, {
            text: presentacion(phone, metadata.subject),
            mentions: [jid]
          })
        }, 2500)
      }
    }

    if ((anu.action === 'remove' || anu.action === 'leave') && chatData.welcome !== false) {
      const caption = `╔═════════════ ✦ ═════════════╗
║           HASTA PRONTO         ║
║                                ║
║  Usuario  › @${phone}          
║                                ║
║  ───────────────────────────── ║
║  Gracias por tu tiempo en el grupo 
║  Miembros restantes › ${members}
╚═════════════ ✦ ═════════════╝`

      await conn.sendMessage(chat, {
        image: { url: pp },
        caption,
        mentions: [jid]
      })
    }

    if (anu.action === 'promote' || anu.action === 'demote') {
      const actor = anu.author
      if (!actor) return

      const actorName = actor.split('@')[0]
      const targetName = phone

      const text =
        anu.action === 'promote'
          ? `╔═════════ ✦ ═════════╗\n║  @${targetName} fue promovido a administrador por @${actorName}  ║\n╚═════════ ✦ ═════════╝`
          : `╔═════════ ✦ ═════════╗\n║  @${targetName} fue degradado de administrador por @${actorName}  ║\n╚═════════ ✦ ═════════╝`

      await conn.sendMessage(chat, {
        text,
        mentions: [jid, actor]
      })
    }

  })
}