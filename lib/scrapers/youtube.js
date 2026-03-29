// Parchado y modificado por AxelDev09
// scraper creado por FG-ERROR

import axios from 'axios'

const delay = ms => new Promise(r => setTimeout(r, ms))

function normalizeYT(url) {
  try {
    const u = new URL(url)
    if (u.hostname.includes('youtu.be')) return url
    if (u.hostname.includes('youtube.com')) {
      if (u.pathname.includes('/watch')) return `https://youtu.be/${u.searchParams.get('v')}`
      if (u.pathname.includes('/shorts/')) return `https://youtu.be/${u.pathname.split('/shorts/')[1]}`
    }
    return url
  } catch {
    return url
  }
}

async function fallbackAPI(url, type) {
  const { data } = await axios.get(`https://api.vevioz.com/api/button/${type}/${encodeURIComponent(url)}`)
  const match = data.match(/href="(https:[^"]+)"/)
  if (!match) throw new Error('Fallback sin resultado')
  return match[1]
}

async function mainAPI(url, type) {
  const { data } = await axios.post(
    'https://app.ytdown.to/proxy.php',
    new URLSearchParams({ url }).toString(),
    { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
  )

  const api = data?.api
  if (!api || api.status === 'ERROR') throw new Error('API principal falló')

  const media = (api.mediaItems || []).find(v =>
    type === 'mp3'
      ? v.mediaExtension === 'mp3'
      : v.mediaExtension === 'mp4'
  )

  if (!media) throw new Error('Sin media')

  let last = ''

  for (let i = 0; i < 10; i++) {
    const { data: d } = await axios.get(media.mediaUrl)
    if (d?.fileUrl && d.fileUrl !== last && d.percent === 'Completed') {
      return d.fileUrl
    }
    last = d?.fileUrl || ''
    await delay(2000)
  }

  throw new Error('Timeout')
}

export async function ytDownload(url, type = 'mp3') {
  url = normalizeYT(url)

  try {
    const dl = await mainAPI(url, type)
    return { url: dl }
  } catch {
    const dl = await fallbackAPI(url, type === 'mp3' ? 'mp3' : 'videos')
    return { url: dl }
  }
} 