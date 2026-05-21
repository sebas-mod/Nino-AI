import { getDatabase } from "../../src/lib/ourin-database.js";

const pluginConfig = {
  name: "onlypc",
  alias: ["onlyprivate", "privateonly"],
  category: "owner",
  description: "Toggle mode bot hanya di private chat",
  usage: ".onlypc on/off",
  example: ".onlypc on",
  isOwner: true,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 5,
  energi: 0,
  isEnabled: true,
};

async function handler(m, { sock }) {
  const db = getDatabase();
  const option = m.text?.toLowerCase()?.trim();

  if (!option) {
    const current = db.setting("onlyPc") || false;
    return m.reply(
      `💬 *Only Private*\n\n` +
        `> Estado: *${current ? "Activo ✅" : "Inactivo ❌"}*\n\n` +
        `*PENGGUNAAN:*\n` +
        `> *${m.prefix}onlypc on* — Bot hanya bisa diakses di private chat\n` +
        `> *${m.prefix}onlypc off* — Bot bisa diakses di mana saja\n\n` +
        `_Jika aktif, mode Only Group akan otomatis nonaktif_`
    );
  }

  if (option === "on") {
    db.setting("onlyPc", true);
    db.setting("onlyGc", false);
    await m.react("✅");
    return m.reply(
      `💬 *Only Private Activo*\n\n` +
        `> Bot hanya bisa diakses di private chat\n` +
        `> Mode Only Group dinonaktifkan`
    );
  }

  if (option === "off") {
    db.setting("onlyPc", false);
    await m.react("❌");
    return m.reply(
      `💬 *Only Private Inactivo*\n\n` +
        `> Bot bisa diakses di mana saja`
    );
  }

  return m.reply(
    `❌ *Opcion no valida*\n\n> Usa *${m.prefix}onlypc on* o *${m.prefix}onlypc off*`
  );
}

export { pluginConfig as config, handler };
