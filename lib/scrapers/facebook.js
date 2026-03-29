/*
 * Créditos:
 * © Created by AxelDev09 🔥
 * GitHub: https://github.com/AxelDev09
 * Instagram: @axeldev09
 */

import axios from 'axios'

const HEADERS_DESKTOP = {
  'User-Agent':      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36',
  'Accept':          'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.9',
  'Sec-Fetch-Mode':  'navigate',
}

const HEADERS_MOBILE = {
  'User-Agent':      'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148',
  'Accept':          'text/html,application/xhtml+xml',
  'Accept-Language': 'en-US,en;q=0.9',
}

function cleanUrl(url) {
  try {
    const u = new URL(url)
    if (u.hostname.includes('fb.watch')) return url
    u.search = ''
    return u.toString()
  } catch { return url }
}

async function resolveShortUrl(url) {
  if (!url.includes('fb.watch') && !url.includes('fb.com')) return url
  const res = await axios.get(url, { headers: HEADERS_DESKTOP, maxRedirects: 5, timeout: 10000 })
  return res.request?.res?.responseUrl || url
}

function extractVideoUrls(html) {
  const results = { hd: null, sd: null, thumb: null, title: '' }

  const unescape = s => s
    .replace(/\\u0025/g, '%')
    .replace(/\\u002F/g, '/')
    .replace(/\\\//g, '/')
    .replace(/\\"/g, '"')
    .replace(/\\u0026/g, '&')
    .replace(/\\u003C/g, '<')
    .replace(/\\u003E/g, '>')

  const hdPatterns = [
    /"browser_native_hd_url"\s*:\s*"([^"]+)"/,
    /"hd_src"\s*:\s*"([^"]+)"/,
    /hd_src\s*:\s*"([^"]+)"/,
    /"hdUrl"\s*:\s*"([^"]+)"/,
    /"playable_url_quality_hd"\s*:\s*"([^"]+)"/,
    /"videoUrl"\s*:\s*"([^"]+)"/,
    /sd_src_no_ratelimit\s*:\s*"([^"]+)"/,
  ]
  for (const p of hdPatterns) {
    const m = html.match(p)
    if (m) { results.hd = unescape(m[1]); break }
  }

  const sdPatterns = [
    /"browser_native_sd_url"\s*:\s*"([^"]+)"/,
    /"sd_src"\s*:\s*"([^"]+)"/,
    /sd_src\s*:\s*"([^"]+)"/,
    /"sdUrl"\s*:\s*"([^"]+)"/,
    /"playable_url"\s*:\s*"([^"]+)"/,
    /"progressive_url"\s*:\s*"([^"]+)"/,
  ]
  for (const p of sdPatterns) {
    const m = html.match(p)
    if (m) { results.sd = unescape(m[1]); break }
  }

  const thumbPatterns = [
    /"thumbnailImage"\s*:\s*\{"uri"\s*:\s*"([^"]+)"/,
    /og:image"\s+content="([^"]+)"/,
    /"preferred_thumbnail"\s*:\s*\{"image"\s*:\s*\{"uri"\s*:\s*"([^"]+)"/,
  ]
  for (const p of thumbPatterns) {
    const m = html.match(p)
    if (m) { results.thumb = unescape(m[1]); break }
  }

  const titlePatterns = [
    /<title>([^<]+)<\/title>/,
    /"story_name"\s*:\s*"([^"]+)"/,
    /"title"\s*:\s*\{"text"\s*:\s*"([^"]+)"/,
  ]
  for (const p of titlePatterns) {
    const m = html.match(p)
    if (m) {
      results.title = m[1].replace(/&#039;/g, "'").replace(/&amp;/g, '&')
      break
    }
  }

  return results
}

function extractVideoId(url) {
  const patterns = [
    /\/videos\/(\d+)/,
    /\/video\/(\d+)/,
    /v=(\d+)/,
    /story_fbid=(\d+)/,
    /\/reel\/(\d+)/,
    /\/(\d{10,})/,
  ]
  for (const p of patterns) {
    const m = url.match(p)
    if (m) return m[1]
  }
  return null
}

async function tryMobilePage(url) {
  const murl = url.replace('www.facebook.com', 'm.facebook.com')
  const res  = await axios.get(murl, { headers: HEADERS_MOBILE, timeout: 15000 })
  return extractVideoUrls(res.data)
}

async function tryDesktopPage(url) {
  const res = await axios.get(url, { headers: HEADERS_DESKTOP, timeout: 15000 })
  return extractVideoUrls(res.data)
}

async function tryGraphQL(videoId) {
  const queries = [
    { doc_id: '10154874153461729', vars: { videoID: videoId } },
    { doc_id: '6861055570608956',  vars: { UFICommentID: videoId, UFIFeedbackID: videoId } },
    { doc_id: '2443510449042541',  vars: { videoID: videoId } },
  ]

  for (const q of queries) {
    try {
      const res = await axios.post(
        'https://www.facebook.com/api/graphql/',
        new URLSearchParams({
          variables:         JSON.stringify(q.vars),
          doc_id:            q.doc_id,
          server_timestamps: 'true',
        }),
        {
          headers: {
            ...HEADERS_DESKTOP,
            'Content-Type':      'application/x-www-form-urlencoded',
            'X-FB-Friendly-Name':'VideoPlayerQuery',
          },
          timeout: 15000,
        }
      )
      const d    = res.data
      const node = d?.data?.video || d?.data?.node || d?.data?.mediaset
      const hd   = node?.playable_url_quality_hd || node?.browser_native_hd_url
      const sd   = node?.playable_url            || node?.browser_native_sd_url
      if (hd || sd) return { hd: hd || null, sd: sd || null, thumb: node?.thumbnailImage?.uri || '', title: node?.name || node?.title?.text || '' }
    } catch {}
  }
  return null
}

export async function fbDownload(url) {
  if (!url.includes('facebook.com') && !url.includes('fb.watch') && !url.includes('fb.com'))
    throw new Error('URL de Facebook inválida')

  const resolved = await resolveShortUrl(url)
  const clean    = cleanUrl(resolved)
  const videoId  = extractVideoId(clean)
  const errors   = []

  try {
    const parsed = await tryMobilePage(clean)
    if (parsed.hd || parsed.sd) {
      return { videoId: videoId || '', title: parsed.title, hd: parsed.hd, sd: parsed.sd, thumb: parsed.thumb, source: 'mobile' }
    }
    errors.push('mobile: sin urls')
  } catch (e) { errors.push('mobile: ' + e.message) }

  try {
    const parsed = await tryDesktopPage(clean)
    if (parsed.hd || parsed.sd) {
      return { videoId: videoId || '', title: parsed.title, hd: parsed.hd, sd: parsed.sd, thumb: parsed.thumb, source: 'desktop' }
    }
    errors.push('desktop: sin urls')
  } catch (e) { errors.push('desktop: ' + e.message) }

  if (videoId) {
    try {
      const data = await tryGraphQL(videoId)
      if (data?.hd || data?.sd) {
        return { videoId, title: data.title, hd: data.hd, sd: data.sd, thumb: data.thumb, source: 'graphql' }
      }
      errors.push('graphql: sin urls')
    } catch (e) { errors.push('graphql: ' + e.message) }
  }

  throw new Error('No se pudo descargar. Errores: ' + errors.join(' | '))
}