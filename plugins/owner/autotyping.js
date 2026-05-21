import { getDatabase } from "../../src/lib/ourin-database.js";
import { saluranCtx } from "../../src/lib/ourin-context.js";
import config from "../../config.js";

const pluginConfig = {
  name: "autotyping",
  alias: ["typing", "autoketik"],
  category: "owner",
  description: "Auto typing indicator saat menerima pesan",
  usage: ".autotyping on/off",
  example: ".autotyping on",
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
    const current = db.setting("autoTyping") ?? config.features?.autoTyping ?? true;
    return m.reply(
      `⌨️ *Auto Typing*\n\n` +
        `> Estado: *${current ? "Activo ✅" : "Inactivo ❌"}*\n\n` +
        `*PENGGUNAAN:*\n` +
        `> *${m.prefix}autotyping on* — Activokan\n` +
        `> *${m.prefix}autotyping off* — Inactivokan\n\n` +
        `_Bot akan menampilkan indikator typing saat menerima pesan_`
    );
  }

  if (option === "on") {
    db.setting("autoTyping", true);
    const ctx = saluranCtx();
    return m.reply(
      `⌨️ *Auto Typing Activo*\n\n` +
        `> Bot akan menampilkan indikator typing`,
      { contextInfo: ctx }
    );
  }

  if (option === "off") {
    db.setting("autoTyping", false);
    return m.reply(
      `⌨️ *Auto Typing Inactivo*\n\n` +
        `> Bot tidak akan menampilkan indikator typing`
    );
  }

  return m.reply(
    `❌ *Opcion no valida*\n\n> Usa *${m.prefix}autotyping on* o *${m.prefix}autotyping off*`
  );
}

export { pluginConfig as config, handler };
