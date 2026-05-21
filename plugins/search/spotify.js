import { default as axios } from "axios";
import te from "../../src/lib/ourin-error.js";
import config from "../../config.js";
const pluginConfig = {
  name: "spotify",
  alias: ["spotifysearch", "spsearch"],
  category: "search",
  description: "Buscar canciones en Spotify",
  usage: ".spotify <query>",
  example: ".spotify neffex grateful",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 5,
  energi: 0,
  isEnabled: true,
};

async function handler(m) {
  const query = m.text?.trim();

  if (!query) {
    return m.reply(
      `⚠️ *ᴄᴀʀᴀ ᴘᴀᴋᴀɪ*\n\n` +
        `> \`${m.prefix}spotify <query>\`\n\n` +
        `> Ejemplo:\n` +
        `> \`${m.prefix}spotify neffex grateful\``,
    );
  }

  try {
    const res = await axios.get(
      `https://api.neoxr.eu/api/spotify-search?q=${encodeURIComponent(query)}&apikey=${config.APIkey.neoxr}`,
    );
    const results = res.data;
    if (!results.status) {
      return m.reply(`❌ *ᴇʀʀᴏʀ*\n\n> No se encontraron resultados para *${query}*`);
    }

    const tracks = results.data;

    let txt = `🎵 *sᴘᴏᴛɪꜰʏ sᴇᴀʀᴄʜ*\n\n`;
    txt += `> Búsqueda: *${query}*\n\n`;

    tracks.forEach((t, i) => {
      txt += `*${i + 1}.* ${t.title}\n`;
      txt += `   ├ 🖼️ ${t.popularity}\n`;
      txt += `   ├ ${t.url}\n\n`;
    });

    txt += `> 💡 Descargar: \`${m.prefix}spdl <url>\` o \`${m.prefix}spotplay ${query}\``;

    return m.reply(txt.trim());
  } catch (err) {
    return m.reply(te(m.prefix, m.command, m.pushName));
  }
}

export { pluginConfig as config, handler };
