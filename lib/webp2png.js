import { exec } from 'child_process'
import fs from 'fs'
import path from 'path'

export function webp2png(buffer) {
  return new Promise((resolve, reject) => {
    const tmpWebp = path.join('/tmp', `sticker-${Date.now()}.webp`)
    const tmpPng = path.join('/tmp', `image-${Date.now()}.png`)

    fs.writeFileSync(tmpWebp, buffer)

    const cmd = `ffmpeg -y -i ${tmpWebp} -frames:v 1 ${tmpPng}`

    exec(cmd, (err) => {
      if (err) {
        fs.unlinkSync(tmpWebp)
        return reject(err)
      }

      fs.unlinkSync(tmpWebp)
      resolve(tmpPng)
    })
  })
}