import { webp2mp4File } from '../../lib/webp2mp4.js'

export default {
  command: ['togif'],
  category: 'sticker',
  run: async (client, m, args, command, text, prefix) => {
    if (!m.quoted || !m.quoted.isAnimatedSticker) 
      return m.reply('✦ Por favor responde a un sticker animado para convertirlo en GIF.')

    const media = await m.quoted.download()
    if (!media) return m.reply('✦ No se pudo descargar el sticker.')

    const gifUrl = await webp2mp4File(media)
    if (!gifUrl) return m.reply('✦ Error al convertir el sticker a GIF.')

    await client.sendMessage(
      m.chat,
      { video: { url: gifUrl }, caption: '✦ Aquí tienes tu GIF', gifPlayback: true },
      { quoted: m }
    )
  }
}