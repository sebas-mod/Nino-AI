import { getDatabase } from "../../src/lib/ourin-database.js";
import { saluranCtx } from "../../src/lib/ourin-context.js";
import config from "../../config.js";

const pluginConfig = {
  name: "anticall",
  alias: ["antitelpon", "antitelp", "rejectcall"],
  category: "owner",
  description: "Rechazar llamadas entrantes automaticamente",
  usage: ".anticall on/off",
  example: ".anticall on",
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
    const current = db.setting("antiCall") ?? config.features?.antiCall ?? true;
    return m.reply(
      `📞 *Anti Call*\n\n` +
        `> Estado: *${current ? "Activo ✅" : "Inactivo ❌"}*\n\n` +
        `*PENGGUNAAN:*\n` +
        `> *${m.prefix}anticall on* — Activar\n` +
        `> *${m.prefix}anticall off* — Inactivokan\n\n` +
        `_El bot rechazara automaticamente las llamadas entrantes_`
    );
  }

  if (option === "on") {
    db.setting("antiCall", true);
    const ctx = saluranCtx();
    return m.reply(
      `📞 *Anti Call Activo*\n\n` +
        `> El bot rechazara automaticamente las llamadas entrantes`,
      { contextInfo: ctx }
    );
  }

  if (option === "off") {
    db.setting("antiCall", false);
    return m.reply(
      `📞 *Anti Call Inactivo*\n\n` +
        `> El bot no rechazara llamadas entrantes`
    );
  }

  return m.reply(
    `❌ *Opcion no valida*\n\n> Usa *${m.prefix}anticall on* o *${m.prefix}anticall off*`
  );
}

export { pluginConfig as config, handler };
