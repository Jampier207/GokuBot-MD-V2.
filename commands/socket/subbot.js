import { startSubBot } from '../../lib/subs.js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

let commandFlags = {}

export default {
  command: ['code'],
  category: 'socket',
  run: async (client, m, args, command) => {

    const subsPath = path.join(dirname, '../../Sessions/Subs')

    const subsCount = fs.existsSync(subsPath)
      ? fs.readdirSync(subsPath).filter((dir) => {
          const credsPath = path.join(subsPath, dir, 'creds.json')
          return fs.existsSync(credsPath)
        }).length
      : 0

    const maxSubs = 20

    if (subsCount >= maxSubs) {
      return client.reply(
        m.chat,
        '✎ No se han encontrado espacios disponibles para registrar un `Sub-Bot`.',
        m
      )
    }

    commandFlags[m.sender] = true

    const caption = '`❖` Vincula tu *cuenta* usando el *codigo.*\n\n> ➤ Sigue las *instrucciones*\n\n*›* Click en los *3 puntos*\n*›* Toque *dispositivos vinculados*\n*›* Vincular *nuevo dispositivo*\n*›* Selecciona *Vincular con el número de teléfono*\n\n※ *`Importante`*\n> ₊·( ❖ ) ➭ Este *Código* solo funciona en el *número que lo solicito*'

    const phone = args[0]
      ? args[0].replace(/\D/g, '')
      : m.sender.split('@')[0]

    await startSubBot(
      m,
      client,
      caption,
      true,
      phone,
      m.chat,
      commandFlags,
      true
    )
  }
}