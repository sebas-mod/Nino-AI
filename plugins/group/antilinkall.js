import { getDatabase } from "../../src/lib/ourin-database.js";

const pluginConfig = {
  name: "antilinkall",
  alias: ["alall", "antialllink"],
  category: "group",
  description: "Antilink para todo tipo de enlaces (detecta extensiones de dominio)",
  usage: ".antilinkall <on/off/metode> [kick/remove]",
  example: ".antilinkall on",
  isOwner: false,
  isPremium: false,
  isGroup: true,
  isPrivate: false,
  cooldown: 3,
  energi: 0,
  isEnabled: true,
  isAdmin: true,
  isBotAdmin: true,
};

function handler(m, { sock }) {
  const db = getDatabase();
  const option = m.text?.toLowerCase()?.trim();

  if (!option) {
    const groupData = db.getGroup(m.chat) || {};
    const status = groupData.antilinkall || "off";
    const mode = groupData.antilinkallMode || "remove";

    return m.reply(
      `🔗 *Antilink All*\n\n` +
        `> Estado: *${status === "on" ? "Aktif ✅" : "Nonactivo ❌"}*\n` +
        `> Mode: *${mode.toUpperCase()}*\n\n` +
        `*DETEKSI:*\n` +
        `> • https:// / http:// (con protokol)\n` +
        `> • www. (subdomain)\n` +
        `> • Domain extension (.com, .id, .io, .net, dll)\n` +
        `> • Shortlink (bit.ly, t.me, tinyurl, dll)\n\n` +
        `*PENGGUNAAN:*\n` +
        `> *${m.prefix}antilinkall on* — Activar\n` +
        `> *${m.prefix}antilinkall off* — Desactivar\n` +
        `> *${m.prefix}antilinkall metode kick* — Mode kick user\n` +
        `> *${m.prefix}antilinkall metode remove* — Modo eliminar mensaje`
    );
  }

  if (option === "on") {
    db.setGroup(m.chat, { antilinkall: "on" });
    return m.reply(
      `✅ *Antilink All Aktif*\n\n` +
        `> Todos los enlaces se detectaran automaticamente\n> Detecta extensiones de dominio, no solo http/https`
    );
  }

  if (option === "off") {
    db.setGroup(m.chat, { antilinkall: "off" });
    return m.reply(`❌ *Antilink All Nonactivo*\n\n> Los enlaces ya no se filtraran`);
  }

  if (option.startsWith("metode")) {
    const method = m.args?.[1]?.toLowerCase();
    if (method === "kick") {
      db.setGroup(m.chat, { antilinkall: "on", antilinkallMode: "kick" });
      return m.reply(
        `✅ *Antilink All — Mode Kick*\n\n> El usuario que envie un enlace sera expulsado`
      );
    } else if (method === "remove" || method === "delete") {
      db.setGroup(m.chat, { antilinkall: "on", antilinkallMode: "remove" });
      return m.reply(
        `✅ *Antilink All — Mode Delete*\n\n> El mensaje con enlace sera eliminado`
      );
    } else {
      return m.reply(
        `❌ *Metodo no valido*\n\n> Usa *kick* o *remove*\n> Ejemplo: *${m.prefix}antilinkall metode kick*`
      );
    }
  }

  if (option === "kick") {
    db.setGroup(m.chat, { antilinkall: "on", antilinkallMode: "kick" });
    return m.reply(
      `✅ *Antilink All — Mode Kick*\n\n> El usuario que envie un enlace sera expulsado`
    );
  }

  if (option === "remove" || option === "delete") {
    db.setGroup(m.chat, { antilinkall: "on", antilinkallMode: "remove" });
    return m.reply(
      `✅ *Antilink All — Mode Delete*\n\n> El mensaje con enlace sera eliminado`
    );
  }

  return m.reply(
    `❌ *Opcion no valida*\n\n> Usa *on*, *off*, *metode kick*, o *metode remove*`
  );
}

export { pluginConfig as config, handler };
