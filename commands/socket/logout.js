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
        '┌─[ ERROR ]\n│ Este comando solo puede ser usado desde una instancia de Sub-Bot\n└──────────'
      ) ?? client.sendMessage(m.chat, { text: '┌─[ ERROR ]\n│ Este comando solo puede ser usado desde una instancia de Sub-Bot\n└──────────' });
    }

    try {
      await (m.reply?.('┌─[ INFO ]\n│ Cerrando sesión del Socket...\n└──────────') ?? client.sendMessage(m.chat, { text: '┌─[ INFO ]\n│ Cerrando sesión del Socket...\n└──────────' }));

      await client.logout();

      setTimeout(() => {
        if (fs.existsSync(sessionPath)) {
          fs.rmSync(sessionPath, { recursive: true, force: true });
          console.log(`┌─[ INFO ]\n│ Sesión de ${cleanId} eliminada de ${sessionPath}\n└──────────`);
        }
      }, 2000);

      setTimeout(() => {
        const msg = `┌─[ SESIÓN FINALIZADA ]\n│ La sesión se cerró correctamente.\n│ Puedes reconectarte usando: ${usedPrefix}code\n└──────────`;
        m.reply?.(msg) ?? client.sendMessage(m.chat, { text: msg });
      }, 3000);
    } catch (err) {
      await (m.reply?.(`┌─[ ERROR ]\n│ ${msgglobal}\n└──────────`) ?? client.sendMessage(m.chat, { text: `┌─[ ERROR ]\n│ ${msgglobal}\n└──────────` }));
    }
  },
};