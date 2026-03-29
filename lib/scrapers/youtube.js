// Parchado y modificado por AxelDev09
// scraper creado por FG-ERROR

import axios from 'axios'

const delay = ms => new Promise(r => setTimeout(r, ms))

function parseFileSize(size) {
  if (!size) return 0
  const units = { B: 1, KB: 1024, MB: 1024 ** 2, GB: 1024 ** 3, TB: 1024 ** 4 }
  const match = size.toString().trim().match(/([\d.]+)\s*(B|KB|MB|GB|TB)/i)
  if (!match) return 0
  return Math.round(parseFloat(match[1]) * (units[match[2].toUpperCase()] || 1))
}

function normalizeYT(url) {
  try {
    const u = new URL(url)
    if (u.hostname.includes('youtu.be')) return url
    if (u.hostname.includes('youtube.com')) {
      if (u.pathname.includes('/watch')) return `https://youtu.be/${u.searchParams.get('v')}`
      if (u.pathname.includes('/shorts/')) return `https://youtu.be/${u.pathname.split('/shorts/')[1]}`
      if (u.pathname.includes('/embed/')) return `https://youtu.be/${u.pathname.split('/embed/')[1]}`
    }
    return url
  } catch { return url }
}

async function waitForDownload(mediaUrl) {
  let last = ''
  for (let i = 0; i < 30; i++) {
    try {
      const { data } = await axios.get(mediaUrl, { timeout: 15000 })
      if (
        data?.fileUrl &&
        data.fileUrl !== last &&
        !data.fileUrl.includes('Processing') &&
        data.percent === 'Completed'
      ) return data.fileUrl
      last = data?.fileUrl || ''
    } catch {}
    await delay(3000)
  }
  throw new Error('Timeout al generar descarga')
}

async function fetchYtdownto(url) {
  const { data } = await axios.post(
    'https://app.ytdown.to/proxy.php',
    new URLSearchParams({ url }).toString(),
    {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      timeout: 20000,
    }
  )

  const api = data?.api
  if (!api) throw new Error('No se pudo obtener info')
  if (api.status === 'ERROR') throw new Error(api.message)

  const qualities = (api.mediaItems || []).map(v => {
    const match = v?.mediaUrl?.match(/(\d+)p|(\d+)k/)
    const res = match ? match[0] : v.mediaQuality
    return {
      type: v.type,
      quality: res,
      size: v.mediaFileSize,
      sizeB: parseFileSize(v.mediaFileSize),
      mediaUrl: v.mediaUrl,
      duration: v.mediaDuration,
      label: `${v.mediaExtension} ${v.mediaQuality}`
    }
  })

  return { api, qualities }
}

export async function ytDownload(url, type = 'video', quality = '360p') {
  url = normalizeYT(url)

  const { api, qualities } = await fetchYtdownto(url)

  const isAudio = type === 'mp3' || type === 'audio'
  const targetQ = quality.toLowerCase()

  const filtered = isAudio
    ? qualities.filter(v => v.type === 'audio' || v.quality?.includes('k'))
    : qualities.filter(v => v.type === 'video' || v.quality?.includes('p'))

  if (!filtered.length) throw new Error('Sin formatos disponibles')

  let selected

  if (isAudio) {
    const mp3s = filtered.filter(v => v.label?.toLowerCase().includes('mp3'))
    const pool = mp3s.length ? mp3s : filtered
    selected =
      pool.find(v => v.quality?.toLowerCase() === targetQ) ||
      pool.sort((a, b) => (b.sizeB || 0) - (a.sizeB || 0))[0]
  } else {
    const sorted = filtered.sort((a, b) => {
      const qa = parseInt(a.quality) || 0
      const qb = parseInt(b.quality) || 0
      return qa - qb
    })
    selected =
      sorted.find(v => v.quality?.toLowerCase() === targetQ) ||
      sorted[0]
  }

  const dlUrl = await waitForDownload(selected.mediaUrl)

  return {
    title: api.title,
    uploader: api.userInfo?.name || '',
    thumb: api.imagePreviewUrl || '',
    type: isAudio ? 'audio' : 'video',
    quality: selected.quality,
    size: selected.size,
    duration: selected.duration,
    url: dlUrl
  }
}

export async function ytSearch(query, limit = 5) {
  const { data } = await axios.get(`https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`)
  const ids = [...data.matchAll(/"videoId":"(.*?)"/g)].map(v => v[1])

  const results = ids.slice(0, limit).map(id => ({
    url: `https://youtu.be/${id}`
  }))

  if (!results.length) throw new Error('Sin resultados')
  return results
}