import axios from "axios";
import config from "../../config.js";
import fs from "fs";
import te from "../../src/lib/ourin-error.js";
const NEOXR_APIKEY = config.APIkey?.neoxr || "Milik-Bot-OurinMD";

const pluginConfig = {
  name: "film",
  alias: ["movie", "nonton", "lk21"],
  category: "search",
  description: "Buscar películas y ver online",
  usage: ".film <título>",
  example: ".film civil war",
  cooldown: 10,
  energi: 1,
  isEnabled: true,
};

const filmSessions = new Map();

async function handler(m, { sock }) {
  const args = m.args || [];
  const query = args.join(" ").trim();

  if (!query) {
    return m.reply(
      `🎬 *ꜰɪʟᴍ sᴇᴀʀᴄʜ*\n\n` +
        `> Buscar y ver películas online\n\n` +
        `*Format:*\n` +
        `> \`${m.prefix}film <judul>\`\n\n` +
        `*Ejemplo:*\n` +
        `> \`${m.prefix}film civil war\``,
    );
  }

  m.react("🎬");

  try {
    const apiUrl = `https://api.neoxr.eu/api/film?q=${encodeURIComponent(query)}&apikey=${NEOXR_APIKEY}`;
    const { data } = await axios.get(apiUrl, { timeout: 30000 });

    if (!data?.status || !data?.data?.length) {
      m.react("❌");
      return m.reply(
        `❌ *ɴᴏ ᴇɴᴄᴏɴᴛʀᴀᴅᴏ*\n\n> No se encontró la película "${query}"`,
      );
    }

    const films = data.data.slice(0, 10);

    filmSessions.set(m.sender, {
      films,
      timestamp: Date.now(),
    });

    setTimeout(() => {
      filmSessions.delete(m.sender);
    }, 300000);

    let text = `🎬 *ʜᴀsɪʟ ᴘᴇɴᴄᴀʀɪᴀɴ*\n\n`;
    text += `> Se encontraron *${films.length}* películas para "${query}"\n\n`;

    films.forEach((f, i) => {
      text += `*${i + 1}. ${f.title}*\n`;
      text += `> ⭐ ${f.rating} | 📺 ${f.quality} | 📅 ${f.release}\n\n`;
    });

    text += `> _Elige una película de la lista de abajo_`;

    const listItems = films.map((f, i) => ({
      header: "",
      title: f.title,
      description: `⭐ ${f.rating} | ${f.quality} | ${f.release}`,
      id: `${m.prefix}filmget ${f.url}`,
    }));

    await sock.sendButton(
      m.chat,
      fs.readFileSync("./assets/images/ourin.jpg"),
      text,
      m,
      {
        buttons: [
          {
            name: "single_select",
            buttonParamsJson: JSON.stringify({
              title: "🎬 Elegir película",
              sections: [
                {
                  title: "Resultados de búsqueda",
                  rows: listItems,
                },
              ],
            }),
          },
        ],
        footer: "🎬 Búsqueda de películas",
      },
    );

    m.react("✅");
  } catch (error) {
    m.react("☢");
    m.reply(te(m.prefix, m.command, m.pushName));
  }
}

export { pluginConfig as config, handler };
