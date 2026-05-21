import { getDatabase } from "../../src/lib/ourin-database.js";

const pluginConfig = {
  name: "onlygc",
  alias: ["onlygroup", "grouponly"],
  category: "owner",
  description: "Toggle mode bot hanya en el grupo",
  usage: ".onlygc on/off",
  example: ".onlygc on",
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
    const current = db.setting("onlyGc") || false;
    return m.reply(
      `🏘️ *Only Group*\n\n` +
        `> Estado: *${current ? "Activo ✅" : "Inactivo ❌"}*\n\n` +
        `*PENGGUNAAN:*\n` +
        `> *${m.prefix}onlygc on* — Bot hanya bisa diakses en el grupo\n` +
        `> *${m.prefix}onlygc off* — Bot bisa diakses di mana saja\n\n` +
        `_Jika aktif, mode Only Private akan otomatis nonaktif_`
    );
  }

  if (option === "on") {
    db.setting("onlyGc", true);
    db.setting("onlyPc", false);
    await m.react("✅");
    return m.reply(
      `🏘️ *Only Group Activo*\n\n` +
        `> Bot hanya bisa diakses en el grupo\n` +
        `> Mode Only Private dinonaktifkan`
    );
  }

  if (option === "off") {
    db.setting("onlyGc", false);
    await m.react("❌");
    return m.reply(
      `🏘️ *Only Group Inactivo*\n\n` +
        `> Bot bisa diakses di mana saja`
    );
  }

  return m.reply(
    `❌ *Opcion no valida*\n\n> Usa *${m.prefix}onlygc on* o *${m.prefix}onlygc off*`
  );
}

export { pluginConfig as config, handler };
