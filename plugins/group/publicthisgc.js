import { getDatabase } from "../../src/lib/ourin-database.js";
import te from "../../src/lib/ourin-error.js";
import config from "../../config.js";

const pluginConfig = {
  name: "publicthisgc",
  alias: ["publicgc", "publicgroup", "publicthisgroup"],
  category: "group",
  description: "Activa el modo publico solo en este grupo",
  usage: ".publicthisgc",
  example: ".publicthisgc",
  isOwner: true,
  isPremium: false,
  isGroup: true,
  isPrivate: false,
  cooldown: 3,
  energi: 0,
  isEnabled: true,
};

async function handler(m, { sock }) {
  const db = getDatabase();
  const selfGroups = db.setting("selfGroups") || [];
  const publicGroups = db.setting("publicGroups") || [];

  const isSelfGroup = selfGroups.includes(m.chat);
  const isPublicGroup = publicGroups.includes(m.chat);

  if (isPublicGroup && !isSelfGroup) {
    return m.reply(
      `ℹ️ *ɢʀᴜᴘ ɪɴɪ sᴜᴅᴀʜ ᴍᴏᴅᴇ ᴘᴜʙʟɪᴄ*\n\n` +
        `> Bot merespon semua miembro di grupo ini\n\n` +
        `_Usa ${m.prefix}selfthisgc para menutup akses_`,
    );
  }

  const updatedSelf = selfGroups.filter((id) => id !== m.chat);
  db.setting("selfGroups", updatedSelf);

  if (!publicGroups.includes(m.chat)) {
    db.setting("publicGroups", [...publicGroups, m.chat]);
  }

  m.react("🌐");
  return m.reply(
    `🌐 *ᴍᴏᴅᴇ ᴘᴜʙʟɪᴄ ᴅɪᴀᴋᴛɪꜰᴋᴀsɪ*\n\n` +
      `> Bot sekarang merespon semua miembro di grupo ini\n` +
      `> Override mode global activo para grupo ini\n\n` +
      `📋 *Grupo lain tidak terpengaruh*\n\n` +
      `_Usa ${m.prefix}selfthisgc para menutup akses lagi_`,
  );
}

export { pluginConfig as config, handler };
