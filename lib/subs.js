import {
  Browsers,
  makeWASocket,
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  makeCacheableSignalKeyStore,
  DisconnectReason,
  jidDecode
} from '@whiskeysockets/baileys';
import qrcode from "qrcode";
import NodeCache from 'node-cache';
import handler from '../handler.js';
import events from '../commands/events.js';
import pino from 'pino';
import fs from 'fs';
import chalk from 'chalk';
import { smsg } from './message.js';

if (!global.conns) global.conns = [];
const msgRetryCounterCache = new NodeCache({ stdTTL: 0, checkperiod: 0 });
const userDevicesCache = new NodeCache({ stdTTL: 0, checkperiod: 0 });
const groupCache = new NodeCache({ stdTTL: 3600, checkperiod: 300 });

const cleanJid = (jid = '') => jid.replace(/:\d+/, '').split('@')[0];

export async function startSubBot(
  m,
  client,
  caption = '',
  isCode = false,
  phone = '',
  chatId = '',
  commandFlags = {},
  isCommand = false
) {
  const id = phone || (m?.sender || '').split('@')[0];
  const sessionFolder = `./Sessions/Subs/${id}`;
  const senderId = m?.sender;

  const { state, saveCreds } = await useMultiFileAuthState(sessionFolder);
  const { version } = await fetchLatestBaileysVersion();

  const sock = makeWASocket({
    logger: pino({ level: 'silent' }),
    printQRInTerminal: false,
    browser: Browsers.macOS('Chrome'),
    auth: state,
    markOnlineOnConnect: true,
    generateHighQualityLinkPreview: true,
    syncFullHistory: false,
    getMessage: async () => '',
    msgRetryCounterCache,
    userDevicesCache,
    cachedGroupMetadata: async (jid) => groupCache.get(jid),
    version,
    keepAliveIntervalMs: 60_000,
    maxIdleTimeMs: 120_000
  });

  sock.isInit = false;
  sock.hasSentInitMsg = false;
  sock.ev.on('creds.update', saveCreds);

  sock.decodeJid = (jid) => {
    if (!jid) return jid;
    if (/:\d+@/gi.test(jid)) {
      let decode = jidDecode(jid) || {};
      return (decode.user && decode.server && decode.user + '@' + decode.server) || jid;
    } else return jid;
  };

  sock.ev.on('connection.update', async ({ connection, lastDisconnect, isNewLogin, qr }) => {
    if (isNewLogin) sock.isInit = false;

    if (connection === 'open') {
      sock.uptime = Date.now();
      sock.isInit = true;
      sock.userId = cleanJid(sock.user?.id?.split('@')[0]);
      const botDir = sock.userId + '@s.whatsapp.net';

      if (!globalThis.db.data.settings[botDir]) globalThis.db.data.settings[botDir] = {};
      globalThis.db.data.settings[botDir].botmod = false;
      globalThis.db.data.settings[botDir].botprem = false;
      globalThis.db.data.settings[botDir].type = 'Sub';

      if (!global.conns.find((c) => c.userId === sock.userId)) global.conns.push(sock);

      if (chatId && client && !sock.hasSentInitMsg) {
        const texto =
`╔═══════════════╗
     GOKUBOT - MD
╚═══════════════╝

Sub-Bot conectado correctamente

Número  : ${sock.userId}
Tipo    : Sub-Bot
Método  : Código de 8 dígitos
Estado  : Activo
Versión : 2.0.0

Si deseas desconectarte puedes usar G/logout.

Ver canal`;

        await client.sendMessage(chatId, {
          text: texto,
          contextInfo: {
            forwardingScore: 999,
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
              newsletterJid: "120363402960178567@newsletter",
              newsletterName: "GOKUBOT-MD • CANAL OFICIAL",
              serverMessageId: 1
            }
          }
        });

        sock.hasSentInitMsg = true;
      }

      console.log(chalk.gray(`[SUB-BOT] Conectado: ${sock.userId}`));
    }

    if (connection === 'close') {
      const reason = lastDisconnect?.error?.output?.statusCode;

      if (reason === DisconnectReason.loggedOut) {
        console.log('Sub-Bot deslogueado, eliminando sesión...');
        try { fs.rmSync(sessionFolder, { recursive: true, force: true }); } catch {}
        return;
      }

      console.log('Sub-Bot reconectando...');
      setTimeout(() => { sock.ws.close(); }, 5000);
    }

    if (qr && isCode && phone && client && commandFlags[senderId]) {
      try {
        let codeGen = await sock.requestPairingCode(phone, 'GOKUBOT2');
        codeGen = codeGen.match(/.{1,4}/g)?.join("-") || codeGen;
        await m.reply(caption);
        await m.reply(codeGen);
        delete commandFlags[senderId];
      } catch (err) {
        console.error("[Código Error]", err);
      }
    }
  });

  sock.ev.on('messages.upsert', async ({ messages, type }) => {
    if (type !== 'notify') return;
    for (let raw of messages) {
      if (!raw.message) continue;
      let msg = await smsg(sock, raw);
      try { handler(sock, msg, messages); } catch (err) { console.log(chalk.gray(`[SUB-BOT] ${err}`)); }
    }
  });

  try { await events(sock, m); } catch (err) { console.log(chalk.gray(`[SUB-BOT] ${err}`)); }

  process.on('uncaughtException', console.error);
  return sock;
}