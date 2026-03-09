import axios from 'axios';

const comandos = [
  'spank','undress','yuri','sixnine','anal','fuck',
  'cummouth','suckboobs','cumshot','lickpussy',
  'lickdick','lickass','handjob','grope','cum',
  'grabboobs','blowjob','boobjob','fap','footjob'
];

const API_BASE = 'https://api.stellarwa.xyz';
const API_KEY = 'Jampier207';

export default {
  command: comandos,
  category: 'nsfw',
  group: true,

  run: async (client, m, args, command) => {

    if (!m?.sender) return;

    try {

      if (m.isGroup && !global.db.data.chats[m.chat]?.nsfw) {
        return m.reply(
`╔═━━〔 NSFW 〕━━═╗
║ Este grupo no tiene
║ activado el modo NSFW
╚════════════════╝`)
      }

      const url = `${API_BASE}/nsfw/interaction?type=${command}&key=${API_KEY}`;

      const { data } = await axios.get(url);

      if (!data || !data.data) {
        return m.reply(
`╔═━━〔 ERROR 〕━━═╗
║ No se encontraron
║ imágenes disponibles
╚═══════════════╝`)
      }

      const imageUrl = Array.isArray(data.data)
        ? data.data[Math.floor(Math.random() * data.data.length)]
        : data.data;

      await client.sendMessage(
        m.chat,
        {
          image: { url: imageUrl },
          caption:
`╔═━━〔 ${command.toUpperCase()} 〕━━═╗
║ Interacción generada
╚═══════════════════╝`
        },
        { quoted: m }
      );

    } catch (err) {
      console.error(err);
      m.reply(
`╔═━━〔 ERROR API 〕━━═╗
║ Falló la conexión
╚════════════════════╝`)
    }
  }
};