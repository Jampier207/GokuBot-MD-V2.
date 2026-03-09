import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { exec } from 'child_process'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

async function reloadCommands(dir = path.join(__dirname, '..')) {
  const commandsMap = new Map()

  async function readCommands(folder) {
    const files = fs.readdirSync(folder)
    for (const file of files) {
      const fullPath = path.join(folder, file)
      if (fs.lstatSync(fullPath).isDirectory()) {
        await readCommands(fullPath)
      } else if (file.endsWith('.js')) {
        try {
          const { default: cmd } = await import(fullPath + '?update=' + Date.now())
          if (cmd?.command) {
            cmd.command.forEach(c => {
              commandsMap.set(c.toLowerCase(), cmd)
            })
          }
        } catch (err) {
          console.error(`Error recargando comando ${file}:`, err)
        }
      }
    }
  }

  await readCommands(dir)
  global.comandos = commandsMap
}

export default {
  command: ['fix', 'update'],
  category: 'owner',
  run: async (client, m) => {
    if (!m?.sender) return

    const sender = m.sender.split('@')[0]
    if (!global.owner.includes(sender)) {
      return m.reply('⛔ Este comando es solo para mi *Owner*.')
    }

    exec('git pull', async (error, stdout) => {
      await reloadCommands(path.join(__dirname, '..'))

      let msg
      if (stdout?.includes('Already up to date')) {
        msg = '🌿 Estado: Todo está actualizado'
      } else {
        msg = `✅ Actualización completada\n\n${stdout}`
      }

      await client.sendMessage(
        m.chat,
        { text: msg },
        { quoted: m }
      )
    })
  }
}