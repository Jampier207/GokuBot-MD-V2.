export default {
  command: ['report', 'reporte', 'sug', 'suggest'],
  category: 'info',

  run: async (client, m, args, command) => {
    if (!m || !m.sender) return

    const db = global.db.data

    if (!db.users[m.sender]) db.users[m.sender] = {}
    if (!db.system) db.system = {}
    if (!db.system.ticketCounter) db.system.ticketCounter = 0

    const userDB = db.users[m.sender]
    const now = Date.now()

    const isOwner = global.owner
      .map(v => v.toString())
      .includes((m.sender || '').split('@')[0])

    const cooldown = userDB.sugCooldown || 0
    const restante = cooldown - now

    if (!isOwner && restante > 0)
      return m.reply(
        `Debes esperar ${msToTime(restante)} antes de enviar otro mensaje.`
      )

    const texto = args.join(' ').trim()

    if (!texto)
      return m.reply('Escribe el mensaje que deseas enviar.')

    if (texto.length < 10)
      return m.reply(
        'El mensaje es demasiado corto. Intenta explicar mejor la situación.'
      )

    db.system.ticketCounter += 1
    const ticketNumber = db.system.ticketCounter
    const reportID = `T-${String(ticketNumber).padStart(4, '0')}`

    if (!userDB.totalReports) userDB.totalReports = 0
    userDB.totalReports += 1

    const fecha = new Date().toLocaleString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })

    const esReporte =
      command === 'report' || command === 'reporte'

    const tipoTexto =
      esReporte ? 'REPORTE' : 'SUGERENCIA'

    const nombre = m.pushName || 'Usuario'
    const numero = (m.sender || '')
      .toString()
      .split('@')[0] || 'Desconocido'

    let pp = null
    try {
      pp = await client.profilePictureUrl(m.sender, 'image')
    } catch {}

    let contexto = ''
    if (m.quoted?.text) {
      contexto =
`\n--------------------------------

Mensaje relacionado:

${m.quoted.text}

--------------------------------`
    }

    const mensaje =
`--------------------------------
${tipoTexto}

Ticket   : ${reportID}
Usuario  : ${nombre}
Número   : wa.me/${numero}
Fecha    : ${fecha}
Total enviados por usuario : ${userDB.totalReports}

--------------------------------

${texto}
${contexto}

--------------------------------`

    for (const owner of global.owner) {
      const ownerJid = owner + '@s.whatsapp.net'

      const opciones = { text: mensaje }

      if (pp && typeof pp === 'string' && pp.startsWith('http')) {
        opciones.image = { url: pp }
        opciones.caption = mensaje
        delete opciones.text
      }

      await client.sendMessage(ownerJid, opciones)
    }

    if (!isOwner) {
      userDB.sugCooldown = now + 24 * 60 * 60 * 1000
    }

    return m.reply(
      esReporte
        ? `Tu reporte fue enviado correctamente. Ticket asignado: ${reportID}.`
        : `Tu sugerencia fue enviada correctamente. Ticket asignado: ${reportID}.`
    )
  }
}

function msToTime(ms) {
  const s = Math.floor(ms / 1000) % 60
  const m = Math.floor(ms / (1000 * 60)) % 60
  const h = Math.floor(ms / (1000 * 60 * 60)) % 24
  const d = Math.floor(ms / (1000 * 60 * 60 * 24))

  const r = []
  if (d) r.push(`${d}d`)
  if (h) r.push(`${h}h`)
  if (m) r.push(`${m}m`)
  r.push(`${s}s`)
  return r.join(' ')
}