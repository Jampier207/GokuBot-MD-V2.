import moment from "moment";

export default {
  command: ["ping", "p"],
  category: "info",
  run: async (client, m, args, { prefix }) => {
    const start = Date.now();
    const txct = "🏓 Pong";

    const tempMsg = await client.sendMessage(
      m.key.remoteJid,
      { text: txct },
      { quoted: m }
    );

    const latency = Date.now() - start;

    const up = process.uptime();
    const h = Math.floor(up / 3600);
    const min = Math.floor((up % 3600) / 60);
    const s = Math.floor(up % 60);
    const ram = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2);

    const userTag = m.pushName || "Invitado";

    const msg = `
👋 Hola, ${userTag}

\`ゕ Status. ゕ\`

🏓 \`Pong:\` ${latency} ms
⏱️ \`Uptime:\` ${h}h ${min}m ${s}s
`.trim();

    await client.sendMessage(
      m.key.remoteJid,
      {
        text: msg,
        mentions: [m.sender],
        contextInfo: {
          forwardingScore: 999,
          isForwarded: true,
          forwardedNewsletterMessageInfo: {
            newsletterJid: "120363402960178567@newsletter",
            newsletterName: "🍧 𝐆𝐨𝐤𝐮𝐁𝐨𝐭-𝐌𝐃 ✨",
            serverMessageId: 1
          }
        }
      },
      { quoted: tempMsg }
    );
  }
};