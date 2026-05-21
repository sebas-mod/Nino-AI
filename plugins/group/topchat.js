import { getDatabase } from "../../src/lib/ourin-database.js";
const pluginConfig = {
  name: "topchat",
  alias: ["chatstat", "chatstats", "totalchat", "leaderboard"],
  category: "group",
  description: "Muestra estadisticas de chat de miembros del grupo",
  usage: ".topchat",
  example: ".topchat",
  isOwner: false,
  isPremium: false,
  isGroup: true,
  isPrivate: false,
  cooldown: 10,
  energi: 0,
  isEnabled: true,
};

async function handler(m, { sock }) {
  const db = getDatabase();
  const group = db.getGroup(m.chat) || {};
  const chatStats = group.chatStats || {};
  const sorted = Object.entries(chatStats)
    .map(([jid, data]) => ({
      jid,
      count: data.count || 0,
      lastChat: data.lastChat || 0,
    }))
    .sort((a, b) => b.count - a.count);
  if (sorted.length === 0) {
    return m.reply(
      `📊 *ᴄʜᴀᴛ sᴛᴀᴛɪsᴛɪᴄs*\n\n` +
        `> Aun no ada data chat di grupo ini.\n` +
        `> Data se va a tercatat otomatis setelah miembro activo chat.`,
    );
  }
  let txt = `📊 *TOTAL CHAT*\nBerikut ini adalah jumlah mensaje yang dikirim oleh miembro di grupo ini:\n\n`;
  for (let i = 0; i < sorted.length; i++) {
    const { jid, count } = sorted[i];
    const name = jid.split("@")[0];
  }
  txt += `\n*Total Mensaje: ${sorted.reduce((a, b) => a + b.count, 0).toLocaleString("id-ID")}*`;
  const mentions = sorted.map((u) => u.jid);
  await m.reply(txt, { mentions });
}
function incrementChatCount(chatId, senderJid, db, pushName) {
  if (!chatId || !senderJid) return;
  const group = db.getGroup(chatId) || {};
  if (!group.chatStats) group.chatStats = {};
  if (!group.chatStats[senderJid]) {
    group.chatStats[senderJid] = {
      count: 0,
      lastChat: 0,
      name: pushName || null,
    };
  }

  group.chatStats[senderJid].count++;
  group.chatStats[senderJid].lastChat = Date.now();
  if (pushName) group.chatStats[senderJid].name = pushName;

  db.setGroup(chatId, group);
}

export { pluginConfig as config, handler, incrementChatCount };
