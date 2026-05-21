import { getDatabase } from "../../src/lib/ourin-database.js";
import { saluranCtx } from "../../src/lib/ourin-context.js";

const pluginConfig = {
  name: "unmutegc",
  alias: ["unmutegrup", "unmutebot", "unblockbot", "unlockbot"],
  category: "group",
  description: "Desbloquea comandos del bot para miembros del grupo",
  usage: ".unmutegc",
  example: ".unmutegc",
  isOwner: false,
  isPremium: false,
  isGroup: true,
  isPrivate: false,
  isAdmin: true,
  isBotAdmin: false,
  cooldown: 5,
  energi: 0,
  isEnabled: true,
};

async function handler(m, { sock }) {
  const db = getDatabase();
  const groupData = db.getGroup(m.chat) || {};

  if (!groupData.mutegc) {
    return m.reply(
      `🔊 *Mute GC Tidak Aktif*\n\n` +
        `> Miembro ya bisa menggunse va a comando bot di grupo ini`
    );
  }

  db.setGroup(m.chat, { mutegc: false });
  const ctx = saluranCtx();
  const groupName = m.groupMetadata?.subject || "grupo ini";

  return m.reply(
    `🔊 *Mute GC Nonactivo*\n\n` +
      `> Grupo: *${groupName}*\n` +
      `> Miembro sekarang bisa menggunse va a comando bot lagi\n\n` +
      `_Escribe *${m.prefix}mutegc* para memblokir kembali_`,
    { contextInfo: ctx }
  );
}

export { pluginConfig as config, handler };
