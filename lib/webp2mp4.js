import fetch from 'node-fetch'
import fs from 'fs'
import { join } from 'path'

export async function webp2mp4File(buffer) {
  const form = new FormData()
  form.append('file', buffer, 'sticker.webp')
  const res = await fetch('https://api.neoxr.xyz/webp2mp4', { method: 'POST', body: form })
  const json = await res.json()
  if (!json || !json.result) throw new Error('Error en la conversión')
  return json.result
}