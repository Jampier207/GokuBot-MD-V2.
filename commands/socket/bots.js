import fs from 'fs';
import path from 'path';
import ws from 'ws';
import { fileURLToPath } from 'url';

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

export default {
  command: ['bots', 'sockets'],
  category: 'socket',
  run: async (client, m) => {
    if (!m || !m.key) return;

    const botId = client.user.id.split(':')[0] + '@s.whatsapp.net';
    const bot = global.db.data.settings[botId];
    const botname = bot?.namebot || 'Bot';
    const botname2 = bot?.namebot2 || 'Bot';
    const banner = bot?.icon || '';

    const from = m.key.remoteJid;
    const groupMetadata = m.isGroup ? await client.groupMetadata(from).catch(() => {}) : '';
    const groupParticipants = groupMetadata?.participants?.map((p) => p.phoneNumber || p.jid || p.lid || p.id) || [];

    const mainBotJid = client.user.id.split(':')[0] + '@s.whatsapp.net';
    const isMainBotInGroup = groupParticipants.includes(mainBotJid);

    const basePath = path.join(dirname, '../../Sessions');
    const folders = { Subs: 'Subs' };

    const getBotsFromFolder = (folderName) => {
      const folderPath = path.join(basePath, folderName);
      if (!fs.existsSync(folderPath)) return [];
      return fs
        .readdirSync(folderPath)
        .filter((dir) => fs.existsSync(path.join(folderPath, dir, 'creds.json')))
        .map((id) => id.replace(/\D/g, ''));
    };

    const subs = getBotsFromFolder(folders.Subs);

    const categorizedBots = { Owner: [], Sub: [] };
    const mentionedJid = [];

    const formatBot = (number, label) => {
      const jid = number + '@s.whatsapp.net';
      if (!groupParticipants.includes(jid)) return null;
      mentionedJid.push(jid);
      const data = global.db.data.settings[jid];
      const name = data?.namebot2 || 'Bot';
      const handle = `@${number}`;
      return `╭─[ ${label} ${name} ]\n│ ID: ${handle}\n╰──────────`;
    };

    if (global.db.data.settings[mainBotJid] && isMainBotInGroup) {
      const name = global.db.data.settings[mainBotJid].namebot2 || 'Bot';
      const handle = `@${mainBotJid.split('@')[0]}`;
      categorizedBots.Owner.push(`╭─[ Owner ${name} ]\n│ ID: ${handle}\n╰──────────`);
      mentionedJid.push(mainBotJid);
    }

    subs.forEach((num) => {
      const line = formatBot(num, 'Sub');
      if (line) categorizedBots.Sub.push(line);
    });

    const totalInGroup = categorizedBots.Owner.length + categorizedBots.Sub.length;

    let message = '';
    message += '═─⊹ SOCKETS ACTIVOS ⊹─═\n\n';
    message += `Total en el grupo: ${totalInGroup}\n\n`;

    if (categorizedBots.Owner.length) message += '⫸ Owner:\n' + categorizedBots.Owner.join('\n') + '\n\n';
    if (categorizedBots.Sub.length) message += '⫸ Sub:\n' + categorizedBots.Sub.join('\n') + '\n\n';

    message += `─ ${botname2} ─`;

    if (m.chat) {
      await client.sendContextInfoIndex(m.chat, message, {}, m, true, mentionedJid);
    }
  },
}; 
