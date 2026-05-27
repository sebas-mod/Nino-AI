import { getDatabase } from "../../src/lib/ourin-database.js";
import { saluranCtx } from "../../src/lib/ourin-context.js";
import config from "../../config.js";

const pluginConfig = {
  name: "autoread",
  alias: ["readchat", "autobaca"],
  category: "owner",
  description: "Leer automaticamente mensajes entrantes",
  usage: ".autoread on/off",
  example: ".autoread on",
  isOwner: true,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 3,
  energi: 0,
  isEnabled: true,
};

async function handler(m, { sock }) {
  const db = getDatabase();
  const option = m.text?.toLowerCase()?.trim();

  if (!option) {
    const current = db.setting("autoRead") ?? config.features?.autoRead ?? false;
    return m.reply(
      `📖 *Auto Read*\n\n` +
        `> Estado: *${current ? "Activo ✅" : "Inactivo ❌"}*\n\n` +
        `*PENGGUNAAN:*\n` +
        `> *${m.prefix}autoread on* — Activar\n` +
        `> *${m.prefix}autoread off* — Inactivokan\n\n` +
        `_El bot leera automaticamente los mensajes entrantes_`
    );
  }

  if (option === "on") {
    db.setting("autoRead", true);
    const ctx = saluranCtx();
    return m.reply(
      `📖 *Auto Read Activo*\n\n` +
        `> El bot leera automaticamente los mensajes entrantes`,
      { contextInfo: ctx }
    );
  }

  if (option === "off") {
    db.setting("autoRead", false);
    return m.reply(
      `📖 *Auto Read Inactivo*\n\n` +
        `> El bot no leera mensajes automaticamente`
    );
  }

  return m.reply(
    `❌ *Opcion no valida*\n\n> Usa *${m.prefix}autoread on* o *${m.prefix}autoread off*`
  );
}

export { pluginConfig as config, handler };
