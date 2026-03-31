export default {
  command: ['join', 'unir'],
  category: 'socket',
  run: async (client, m, args) => {

    const idBot = client.user.id.split(':')[0] + '@s.whatsapp.net'
    const config = global.db.data.settings[idBot]

    const isOwner2 = [
      idBot,
      ...(config.owner ? [config.owner] : []),
      ...global.owner.map(num => num + '@s.whatsapp.net')
    ].includes(m.sender)

    if (!isOwner2) return m.reply(
`Solo el mi creador puede usar este comando.`
    )

    if (!args[0]) return m.reply(
`Envíe el enlace del grupo al qué me uniré.`
    )

    const text = args.join(' ')
    const linkRegex = /chat\.whatsapp\.com\/([0-9A-Za-z]{20,24})/i
    const match = text.match(linkRegex)

    if (!match) {
      return m.reply(
`Envie Un Link Válido.`
      )
    }

    const inviteCode = match[1]

    try {

      await client.groupAcceptInvite(inviteCode)

      await m.reply(
`¡Me uní correctamente al grupo!`
      )

    } catch (e) {

      const errMsg = String(e.message || e)

      if (
        errMsg.includes('not-authorized') ||
        errMsg.includes('requires-admin')
      ) {

        await m.reply(
` El grupo tiene la aprobación de admin activada, envié solicitud para unirme, espere que un admin la acepte.`
        )

      } else {

        await m.reply(
`No pude unirme al grupo, verifique el link.`
        )

      }
    }
  }
}