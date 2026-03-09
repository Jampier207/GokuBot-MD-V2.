import fs from 'fs'

function obtenerCharacterValue(name) {
  const path = './lib/characters.json'
  if (!fs.existsSync(path)) return 'No disponible'

  const data = JSON.parse(fs.readFileSync(path, 'utf-8'))
  const char = data.find(c => c.name === name)

  return char?.value
    ? char.value.toLocaleString()
    : 'No disponible'
}

function obtenerTiempoRestante(expira) {
  const ahora = Date.now()
  const diff = expira - ahora

  if (diff <= 0) return 'Expirado'

  const s = Math.floor((diff / 1000) % 60)
  const m = Math.floor((diff / (1000 * 60)) % 60)
  const h = Math.floor((diff / (1000 * 60 * 60)) % 24)
  const d = Math.floor(diff / (1000 * 60 * 60 * 24))

  const partes = []
  if (d) partes.push(`${d}d`)
  if (h) partes.push(`${h}h`)
  if (m) partes.push(`${m}m`)
  if (s || !partes.length) partes.push(`${s}s`)

  return partes.join(' ')
}

export default {
  command: ['haremshop', 'tiendawaifus', 'wshop'],
  category: 'gacha',
  run: async (client, m, args) => {
    if (!m || !m.chat) return

    const db = global.db.data
    const chatId = m.chat
    const botId = client.user.id.split(':')[0] + '@s.whatsapp.net'
    const chatData = db.chats?.[chatId]

    if (!chatData)
      return m.reply(
        '▢ Chat no inicializado.\n' +
        '▢ Usa cualquier comando primero.'
      )

    if (chatData.adminonly || !chatData.gacha)
      return m.reply(
        '▣ La tienda está desactivada.\n' +
        '▣ Consulta a un administrador.'
      )

    const moneda = db.settings?.[botId]?.currency || 'monedas'

    const enVenta = Object.entries(chatData.users || {}).flatMap(([uid, user]) =>
      (user.personajesEnVenta || []).map(p => ({
        nombre: p.name,
        precio: p.precio,
        expira: p.expira,
        vendedor: uid
      }))
    )

    if (!enVenta.length)
      return m.reply(
        '◇ Tienda vacía.\n' +
        '◇ No hay personajes en venta.'
      )

    const page = Math.max(1, Number(args[0]) || 1)
    const perPage = 10
    const pages = Math.ceil(enVenta.length / perPage)

    if (page > pages)
      return m.reply(
        '▸ Página inválida.\n' +
        `▸ Total disponible: ${pages}`
      )

    const start = (page - 1) * perPage
    const list = enVenta.slice(start, start + perPage)

    let text =
      '╭─ 🏪 HAREM SHOP\n' +
      '│\n' +
      '│ ❖ Personajes disponibles\n' +
      '│\n'

    list.forEach((p, i) => {
      const vendedor =
        db.users?.[p.vendedor]?.name ||
        p.vendedor.split('@')[0]

      const valor = obtenerCharacterValue(p.nombre)
      const tiempo = obtenerTiempoRestante(
        new Date(p.expira).getTime()
      )

      text +=
        `│ ${start + i + 1} ⟡ ${p.nombre}\n` +
        `│   ✦ Valor estimado\n` +
        `│     ${valor}\n` +
        `│   ✧ Precio\n` +
        `│     ${p.precio.toLocaleString()} ${moneda}\n` +
        `│   ❖ Vendedor\n` +
        `│     ${vendedor}\n` +
        `│   ⧗ Expira en\n` +
        `│     ${tiempo}\n` +
        '│\n'
    })

    text +=
      `│ ⌂ Página ${page} de ${pages}\n` +
      '╰───────────────'

    try {
      await client.sendMessage(chatId, { text }, { quoted: m })
    } catch {
      await m.reply(msgglobal)
    }
  }
}