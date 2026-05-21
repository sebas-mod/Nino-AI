import axios from "axios";
import config from "../../config.js";
import te from "../../src/lib/ourin-error.js";
const pluginConfig = {
  name: "bratpatrick",
  alias: [],
  category: "sticker",
  description: "Crea un sticker brat patrick",
  usage: ".bratpatrick <texto>",
  example: ".bratpatrick Hola a todos",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 10,
  energi: 1,
  isEnabled: true,
};

async function handler(m, { sock }) {
  const text = m.args.join(" ");
  if (!text) {
    return m.reply(
      `🖼️ *BRAT PATRICK*\n\n> Ingresa el texto\n\n\`Ejemplo: ${m.prefix}bratpatrick Hola a todos\``,
    );
  }

  m.react("🕕");

  try {
    const url = `https://api.ourin.my.id/api/bratpatrick?text=${encodeURIComponent(text)}`;
    await sock.sendImageAsSticker(m.chat, url, m, {
      packname: config.sticker.packname,
      author: config.sticker.author,
    });
    m.react("✅");
  } catch (error) {
    m.react("☢");
    m.reply(te(m.prefix, m.command, m.pushName));
  }
}

export { pluginConfig as config, handler };
