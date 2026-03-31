import fs from 'fs';
import path from 'path';
import { jidDecode } from '@whiskeysockets/baileys';

export default {
  command: ['logout'],
  category: 'socket',
  run: async (client, m, usedPrefix, msgglobal = 'Error: ocurrió un problema') => {
    if (!m?.sender) return;
    if (!m || !m.chat) return console.log('Error: no se recibió el mensaje correctamente');

    const rawId = client.user?.id || '';
    const decoded = jidDecode(rawId);
    const cleanId = decoded?.user || rawId.split('@')[0];

    const sessionTypes = ['Subs'];
    const basePath = 'Sessions';
    const sessionPath = sessionTypes
      .map((type) => path.join(basePath, type, cleanId))
      .find((p) => fs.existsSync(p));

    if (!sessionPath) {
      return m.reply?.(
        '➤ Este comando solo puede ser usado desde una instancia de Sub-Bot'
      ) ?? client.sendMessage(m.chat, { text: '➤ Este comando solo puede ser usado desde una instancia de Sub-Bot' });
    }

    try {
      await (m.reply?.('➤ Cerrando sesión del Socket...') ?? client.sendMessage(m.chat, { text: '➤ Cerrando sesión del Socket...' }));

      await client.logout();

      setTimeout(() => {
        if (fs.existsSync(sessionPath)) {
          fs.rmSync(sessionPath, { recursive: true, force: true });
          console.log(`❖ Sesión de ${cleanId} eliminada de ${sessionPath}`);
        }
      }, 2000);

      setTimeout(() => {
        const msg = `➤ La sesión se cerró correctamente.\n│ Puedes reconectarte usando: ${usedPrefix}code`;
        m.reply?.(msg) ?? client.sendMessage(m.chat, { text: msg });
      }, 3000);
    } catch (err) {
      await (m.reply?.(`➤ ${msgglobal}`) ?? client.sendMessage(m.chat, { text: `➤ ${msgglobal}` }));
    }
  },
};