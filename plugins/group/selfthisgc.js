import { getDatabase } from "../../src/lib/ourin-database.js";
import te from "../../src/lib/ourin-error.js";
import config from "../../config.js";

const pluginConfig = {
  name: "selfthisgc",
  alias: ["selfgc", "selfgroup", "selfthisgroup"],
  category: "group",
  description: "Activa el modo self solo en este grupo",
  usage: ".selfthisgc",
  example: ".selfthisgc",
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

  if (isSelfGroup) {
    return m.reply(
      `ℹ️ *ɢʀᴜᴘ ɪɴɪ sᴜᴅᴀʜ ᴍᴏᴅᴇ sᴇʟꜰ*\n\n` +
        `> Bot solo merespon owner & bot sendiri\n\n` +
        `_Usa ${m.prefix}publicthisgc para membuka akses_`,
    );
  }

  if (!selfGroups.includes(m.chat)) {
    db.setting("selfGroups", [...selfGroups, m.chat]);
  }

  const updatedPublic = publicGroups.filter((id) => id !== m.chat);
  db.setting("publicGroups", updatedPublic);

  m.react("🔒");
  return m.reply(
    `🔒 *ᴍᴏᴅᴇ sᴇʟꜰ ᴀᴋᴛɪꜰ*\n\n` +
      `> Bot di grupo ini sekarang solo merespon:\n` +
      `> • Owner bot\n` +
      `> • Bot sendiri (fromMe)\n\n` +
      `📋 *Grupo lain tidak terpengaruh*\n\n` +
      `_Usa ${m.prefix}publicthisgc para membuka akses_`,
  );
}

export { pluginConfig as config, handler };
