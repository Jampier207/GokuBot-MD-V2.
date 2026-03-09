export default {
  command: ['setbirth'],
  category: 'profile',
  run: async (client, m, args) => {
    if (!m?.sender) return

    const user = global.db.data.users[m.sender]
    const currentYear = new Date().getFullYear()
    const prefix = m.usedPrefix || '/'

    if (!user) return

    if (user.birth)
      return m.reply(
        `✦ Ya tienes una fecha establecida.\nUsa *${prefix}delbirth* para eliminarla.`
      )

    const input = args.join(' ').trim()
    if (!input)
      return m.reply(
        `✦ Debes ingresar una fecha válida.\n\nEjemplos:\n${prefix}setbirth 01/01/2000\n${prefix}setbirth 01/01`
      )

    const birth = validarFechaNacimiento(input, currentYear)
    if (!birth)
      return m.reply(
        `✦ Fecha inválida.\nUsa por ejemplo:\n${prefix}setbirth 01/01/2000`
      )

    user.birth = birth
    return m.reply(`✎ Fecha de nacimiento guardada:\n*${birth}*`)
  }
}

function validarFechaNacimiento(text, currentYear) {
  let dia, mes, año

  if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(text)) {
    ;[dia, mes, año] = text.split('/').map(Number)
  } else if (/^\d{1,2}\/\d{1,2}$/.test(text)) {
    ;[dia, mes] = text.split('/').map(Number)
    año = currentYear
  } else {
    return null
  }

  if (año > currentYear) return null
  if (mes < 1 || mes > 12) return null

  const diasPorMes = [
    31,
    (año % 4 === 0 && año % 100 !== 0) || año % 400 === 0 ? 29 : 28,
    31, 30, 31, 30, 31, 31, 30, 31, 30, 31
  ]

  if (dia < 1 || dia > diasPorMes[mes - 1]) return null

  const meses = [
    'enero','febrero','marzo','abril','mayo','junio',
    'julio','agosto','septiembre','octubre','noviembre','diciembre'
  ]

  const diasSemana = [
    'domingo','lunes','martes','miércoles','jueves','viernes','sábado'
  ]

  const fecha = new Date(`${año}-${String(mes).padStart(2,'0')}-${String(dia).padStart(2,'0')}`)
  const diaSemana = diasSemana[fecha.getUTCDay()]

  return `${diaSemana}, ${dia} de ${meses[mes - 1]}`
}