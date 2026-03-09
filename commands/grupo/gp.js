import ws from 'ws';
import fs from 'fs';

export default {
  command: ['gp', 'groupinfo'],
  category: 'grupo',
  run: async (client, m, args, usedPrefix, command) => {
    const from = m.chat;
    const groupMetadata = m.isGroup ? await client.groupMetadata(from).catch(() => {}) : '';
    const groupName = groupMetadata.subject;
    const groupBanner = await client.profilePictureUrl(m.chat, 'image').catch(() => 'https://cdn.yuki-wabot.my.id/files/2PVh.jpeg');
    const groupCreator = groupMetadata.owner ? '@' + groupMetadata.owner.split('@')[0] : 'Desconocido';
    const groupAdmins = groupMetadata?.participants.filter(p => (p.admin === 'admin' || p.admin === 'superadmin')) || [];
    const totalParticipants = groupMetadata.participants.length;
    const chatId = m.chat;
    const chat = global.db.data.chats[chatId] || {};
    const chatUsers = chat.users || {};
    const botId = client.user.id.split(':')[0] + "@s.whatsapp.net";
    const botSettings = global.db.data.settings[botId];
    const botname = botSettings.botname;
    const monedas = botSettings.currency;

    let totalCoins = 0;
    let registeredUsersInGroup = 0;

    const resolvedUsers = await Promise.all(
      groupMetadata.participants.map(async (participant) => {
        return { ...participant, phoneNumber: participant.phoneNumber, jid: participant.jid };
      })
    );

    resolvedUsers.forEach((participant) => {
      const fullId = participant.phoneNumber || participant.jid || participant.id;
      const user = chatUsers[fullId];
      if (user) {
        registeredUsersInGroup++;
        totalCoins += Number(user.coins) || 0;
      }
    });

    const charactersFilePath = './lib/characters.json';
    const data = await fs.promises.readFile(charactersFilePath, 'utf-8');
    const structure = JSON.parse(data);
    const allCharacters = Object.values(structure).flatMap(s => Array.isArray(s.characters) ? s.characters : []);
    const totalCharacters = allCharacters.length;

    const claimedIDs = Object.entries(global.db.data.chats[m.chat]?.characters || {})
      .filter(([, c]) => c.user)
      .map(([id]) => id);

    const claimedCount = claimedIDs.length;
    const claimRate = totalCharacters > 0 ? ((claimedCount / totalCharacters) * 100).toFixed(2) : '0.00';

    const rawPrimary = typeof chat.primaryBot === 'string' ? chat.primaryBot : '';
    const botprimary = rawPrimary.endsWith('@s.whatsapp.net') ? `@${rawPrimary.split('@')[0]}` : 'Aleatorio';

    const settings = {
      bot: chat.isBanned ? 'OFF' : 'ON',
      antilinks: chat.antilinks ? 'ON' : 'OFF',
      welcome: chat.welcome ? 'ON' : 'OFF',
      goodbye: chat.goodbye ? 'ON' : 'OFF',
      alerts: chat.alerts ? 'ON' : 'OFF',
      gacha: chat.gacha ? 'ON' : 'OFF',
      economy: chat.economy ? 'ON' : 'OFF',
      nsfw: chat.nsfw ? 'ON' : 'OFF',
      adminmode: chat.adminonly ? 'ON' : 'OFF',
      botprimary: botprimary
    };

    try {
      let message = `╔══════════════════════════════╗\n`;
      message += `║        INFORMACIÓN DEL GRUPO        ║\n`;
      message += `╚══════════════════════════════╝\n\n`;

      message += `┌─ Datos Generales ──────────────\n`;
      message += `│ Grupo        : ${groupName}\n`;
      message += `│ Creador      : ${groupCreator}\n`;
      message += `│ Bot Principal: ${settings.botprimary}\n`;
      message += `└───────────────────────────────\n\n`;

      message += `┌─ Estadísticas ────────────────\n`;
      message += `│ Administradores : ${groupAdmins.length}\n`;
      message += `│ Usuarios        : ${totalParticipants}\n`;
      message += `│ Registrados     : ${registeredUsersInGroup}\n`;
      message += `│ Personajes      : ${totalCharacters}\n`;
      message += `│ Claims          : ${claimedCount} (${claimRate}%)\n`;
      message += `│ Dinero Total    : ${totalCoins.toLocaleString()} ${monedas}\n`;
      message += `└───────────────────────────────\n\n`;

      message += `┌─ Configuraciones ─────────────\n`;
      message += `│ Bot           : ${settings.bot}\n`;
      message += `│ AntiLinks     : ${settings.antilinks}\n`;
      message += `│ Bienvenida    : ${settings.welcome}\n`;
      message += `│ Despedida     : ${settings.goodbye}\n`;
      message += `│ Alertas       : ${settings.alerts}\n`;
      message += `│ Gacha         : ${settings.gacha}\n`;
      message += `│ Economía      : ${settings.economy}\n`;
      message += `│ NSFW          : ${settings.nsfw}\n`;
      message += `│ Modo Admin    : ${settings.adminmode}\n`;
      message += `└───────────────────────────────\n`;

      const mentionOw = groupMetadata.owner ? groupMetadata.owner : '';
      const mentions = [rawPrimary, mentionOw].filter(Boolean);

      await client.sendContextInfoIndex(
        m.chat,
        message.trim(),
        {},
        null,
        false,
        mentions,
        {
          banner: groupBanner,
          title: groupName,
          body: 'Información del grupo',
          redes: global.db.data.settings[botId].link
        }
      );

    } catch (e) {
      await m.reply(
`───────────────────────────────
> Error inesperado en *${usedPrefix + command}*
> [Error: *${e.message}*]
───────────────────────────────`
      );
    }
  }
};