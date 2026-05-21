import { getDatabase } from "../../src/lib/ourin-database.js";
import { generateWAMessageFromContent } from "ourin";
import config from "../../config.js";
import { saluranCtx } from "../../src/lib/ourin-context.js";

const pluginConfig = {
  name: "tam",
  alias: ["topactive", "topmember"],
  category: "group",
  description: "Muestra los miembros mas activos del grupo",
  usage: ".tam <jumlah>",
  example: ".tam 10",
  isOwner: false,
  isPremium: false,
  isGroup: true,
  isPrivate: false,
  isAdmin: false,
  cooldown: 10,
  energi: 0,
  isEnabled: true,
};

async function handler(m, { sock }) {
  const db = getDatabase();
  const limit = Math.min(Math.max(parseInt(m.text) || 10, 1), 20);
  const group = db.getGroup(m.chat) || {};
  const chatName = group.name || "Grupo";
  const chatStats = group.chatStats || {};

  const sorted = Object.entries(chatStats)
    .map(([jid, d]) => ({ jid, count: d.count || 0, name: d.name || null }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);

  if (!sorted.length) {
    return m.reply(
      `📊 *ᴛᴏᴘ ᴀᴄᴛɪᴠᴇ ᴍᴇᴍʙᴇʀ*\n\n` + `- Aun no ada data aktivitas di grupo ini`,
    );
  }

  const pollVotes = sorted.map((u, i) => {
    const rank = i + 1;
    const user = db.getUser(u.jid);
    const name = u.name || user?.name || u.jid.split("@")[0];
    return {
      optionName: `${rank}. ${name}${i === 0 ? " 🏆" : ""}`,
      optionVoteCount: u.count,
    };
  });

  const content = {
    pollResultSnapshotMessage: {
      name: `top ${limit} miembro active all time!\nat ${chatName}`,
      pollVotes,
      pollType: 0,
      contextInfo: {
        ...saluranCtx(),
      },
    },
  };

  const msg = generateWAMessageFromContent(m.chat, content, {});
  await sock.relayMessage(m.chat, msg.message, { messageId: msg.key.id });
}

export { pluginConfig as config, handler };
