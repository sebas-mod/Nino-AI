import { getDatabase } from "../../src/lib/ourin-database.js";
import { saluranCtx } from "../../src/lib/ourin-context.js";

const pluginConfig = {
  name: "mutegc",
  alias: ["mutegrup", "mutebot", "blockbot", "lockbot"],
  category: "group",
  description: "Bloquea comandos del bot para miembros; solo admins/owner pueden usarlos",
  usage: ".mutegc",
  example: ".mutegc",
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

  if (groupData.mutegc) {
    return m.reply(
      `🔇 *Mute GC Ya Aktif*\n\n` +
        `> Miembro no se puede menggunse va a comando bot di grupo ini\n` +
        `> Solo admins grupo dan owner bot yang bisa akses\n\n` +
        `_Escribe *${m.prefix}unmutegc* para membuka_`
    );
  }

  db.setGroup(m.chat, { mutegc: true });
  const ctx = saluranCtx();
  const groupName = m.groupMetadata?.subject || "grupo ini";

  return m.reply(
    `🔇 *Mute GC Aktif*\n\n` +
      `> Grupo: *${groupName}*\n` +
      `> Miembro no se puede menggunse va a comando bot\n` +
      `> Admin grupo dan owner bot tetap bisa akses\n\n` +
      `_Escribe *${m.prefix}unmutegc* para membuka_`,
    { contextInfo: ctx }
  );
}

function isMutegc(groupJid, db) {
  const group = db.getGroup(groupJid) || {};
  return !!group.mutegc;
}

export { pluginConfig as config, handler, isMutegc };
