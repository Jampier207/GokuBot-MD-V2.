/*
 * Créditos:
 * © Created by AxelDev09 🔥
 * GitHub: https://github.com/AxelDev09
 * Instagram: @axeldev09
 */

import axios from 'axios';
import * as cheerio from 'cheerio';

const UA       = 'Mozilla/5.0 (Linux; Android 11; Redmi Note 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36';
const AJAX_URL = 'https://igsnapinsta.com/wp-admin/admin-ajax.php';
const BASE_URL = 'https://igsnapinsta.com';

function decodeUrl(encodedUrl) {
  try { return Buffer.from(encodedUrl, 'base64').toString('utf-8'); }
  catch { return encodedUrl; }
}

function parseItems(html) {
  const $ = cheerio.load(html);
  const items = [];
  const seen  = new Set();

  function add(type, url) {
    const clean = url.replace(/&amp;/g, '&').trim();
    if (!clean || seen.has(clean)) return;
    seen.add(clean);
    items.push({ type, url: clean });
  }

  $('source[src]').each((_, el) => {
    const src = $(el).attr('src');
    if (src && !src.includes('kdnsd')) add('video', src);
  });

  $('img[src]').each((_, el) => {
    const src = $(el).attr('src') || '';
    if ((src.includes('cdninstagram') || src.includes('fbcdn')) && !src.includes('kdnsd'))
      add('image', src);
  });

  if (!items.length) {
    $('a[href]').each((_, el) => {
      const href = $(el).attr('href') || '';
      if (!href.includes('kdnsd/v1/download')) return;
      const b64     = href.split('url=')[1] || '';
      const decoded = decodeUrl(decodeURIComponent(b64));
      const type    = decoded.includes('.mp4') ? 'video' : 'image';
      add(type, href.replace(/&amp;/g, '&'));
    });

    $('img[src]').each((_, el) => {
      const src = $(el).attr('src') || '';
      if (src.includes('kdnsd/v1/download')) add('image', src);
    });
  }

  return items;
}

function detectType(url) {
  if (url.includes('/reel/'))    return 'reel';
  if (url.includes('/p/'))       return 'post';
  if (url.includes('/stories/')) return 'story';
  if (url.includes('/tv/'))      return 'video';
  const path = new URL(url).pathname.replace(/\/$/, '');
  if (path.split('/').length === 2) return 'profile';
  return 'post';
}

export async function igDownload(url) {
  if (!url.includes('instagram.com'))
    throw new Error('URL inválida. Debe ser un link de Instagram.');

  // Limpiar URL: quitar parámetros UTM y asegurar trailing slash
  const base = url.split('?')[0].split('#')[0]
  url = base.endsWith('/') ? base : base + '/'



  const { data } = await axios.post(
    AJAX_URL,
    new URLSearchParams({ action: 'kdnsd_get_instagram_video', url }),
    {
      headers: {
        'User-Agent':       UA,
        'Content-Type':     'application/x-www-form-urlencoded',
        'Referer':          `${BASE_URL}/es/`,
        'Origin':           BASE_URL,
        'X-Requested-With': 'XMLHttpRequest',
      },
      timeout: 20000
    }
  );

  if (!data?.success || !data?.data?.html) {
    const html = data?.data?.html || '';
    if (html.includes('private') || html.includes('privado') || data?.data?.message?.includes('private'))
      throw new Error('Perfil privado. Solo se puede descargar contenido de perfiles públicos.');
    throw new Error('No se pudo obtener el contenido. Verificá que el perfil/post sea público.');
  }

  const type  = detectType(url);
  const items = parseItems(data.data.html);

  if (!items.length)
    throw new Error('No se encontró contenido descargable.');

  return { type, items };
}

export async function igReelDownload(url) {
  if (!url.includes('instagram.com') || (!url.includes('/reel/') && !url.includes('/p/')))
    throw new Error('URL inválida. Debe ser un link de reel o post de Instagram.')
  return igDownload(url)
}

export async function igStalk(input) {
  const username = input.replace(/https?:\/\/(www\.)?instagram\.com\/?/, '').replace(/\/$/, '').replace('@', '').split('?')[0].trim()
  if (!username) throw new Error('Usuario inválido.')

  const UAs = [
    'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)',
    'Twitterbot/1.0',
    'WhatsApp/2.23.1 A',
  ]

  for (const ua of UAs) {
    try {
      const { data: html } = await axios.get(`https://www.instagram.com/${username}/`, {
        headers: { 'User-Agent': ua, 'Accept-Language': 'en-US,en;q=0.9' },
        timeout: 12000
      })
      const $      = cheerio.load(html)
      const meta   = $('meta[property="og:description"]').attr('content') || ''
      const name   = $('meta[property="og:title"]').attr('content') || ''
      const avatar = $('meta[property="og:image"]').attr('content') || ''
      if (!name && !meta) continue
      const m = meta.match(/([\d,.KkMm]+)\s*Followers[,\s]+([\d,.KkMm]+)\s*Following[,\s]+([\d,.KkMm]+)\s*Posts?/i)
      const bioRaw = meta.replace(/[\d,.KkMm]+\s*Followers[^-–—]*[-–—]\s*/i, '').trim()
      const bioClean = bioRaw.replace(/^See Instagram photos and videos from .+/i, '').trim()
      const fullNameClean = name
        .replace(/\s*\(@?[^)]*\)\s*/g, '')
        .replace(/\s*[•·]\s*Instagram.*/i, '')
        .trim()
      const isVerified = html.includes('"is_verified":true') || html.includes('"verified":true') || html.includes('aria-label="Verified"')
      const isPrivate  = html.includes('"is_private":true')
      return {
        username,
        fullName:   fullNameClean || username,
        bio:        bioClean || '',
        followers:  m ? m[1] : '?',
        following:  m ? m[2] : '?',
        posts:      m ? m[3] : '?',
        isPrivate,
        isVerified,
        avatar,
        url:        `https://www.instagram.com/${username}/`,
      }
    } catch {}
  }

  throw new Error('No se pudo obtener información del perfil.')
}

export async function igStories(input) {
  const username = input.replace(/https?:\/\/(www\.)?instagram\.com\/?/, '').replace(/\/$/, '').replace('@', '').split('?')[0].trim()
  if (!username) throw new Error('Usuario inválido.')
  for (const base of ['https://storiesig.info', 'https://imginn.com']) {
    try {
      const { data: html } = await axios.get(`${base}/stories/${username}/`, {
        headers: { 'User-Agent': UA },
        timeout: 12000
      })
      const $ = cheerio.load(html)
      const items = []
      $('img[src], source[src], video[src]').each((_, el) => {
        const src = $(el).attr('src') || ''
        if (src && (src.includes('cdninstagram') || src.includes('fbcdn') || src.includes(base))) {
          const type = $(el).is('source, video') ? 'video' : 'image'
          items.push({ type, url: src })
        }
      })
      if (items.length) return { username, items }
    } catch {}
  }
  throw new Error('No se encontraron stories o el perfil es privado.')
}