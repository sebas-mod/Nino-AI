import axios from "axios";
import config from "../../config.js";
import fs from "fs";
import { getDatabase } from "../../src/lib/ourin-database.js";
import te from "../../src/lib/ourin-error.js";
const pluginConfig = {
  name: "android1",
  alias: ["an1"],
  category: "search",
  description: "Buscar y descargar APK MOD desde Android1",
  usage: ".android1 <query>",
  example: ".android1 Subway Surfer",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 10,
  energi: 1,
  isEnabled: true,
};

const NEOXR_APIKEY = config.APIkey?.neoxr || "Milik-Bot-OurinMD";

async function handler(m, { sock }) {
  const db = getDatabase();
  const args = m.args || [];
  const text = m.text?.trim();

  if (!text) {
    return m.reply(
      `📱 *ᴀɴᴅʀᴏɪᴅ1 sᴇᴀʀᴄʜ*\n\n` +
        `╭┈┈⬡「 📋 *ᴄᴀʀᴀ ᴘᴀᴋᴀɪ* 」\n` +
        `┃ 🔍 \`${m.prefix}android1 <query>\` - Buscar APK\n` +
        `╰┈┈⬡\n\n` +
        `> Ejemplo:\n` +
        `\`${m.prefix}android1 Subway Surfer\``,
    );
  }

  m.react("🔍");

  try {
    const { data } = await axios.get(
      `https://api.neoxr.eu/api/an1?q=${encodeURIComponent(text)}&apikey=${NEOXR_APIKEY}`,
      {
        timeout: 30000,
      },
    );

    if (!data?.status || !data?.data?.length) {
      m.react("❌");
      return m.reply(`❌ No se encontraron resultados para: \`${text}\``);
    }

    const apps = data.data.slice(0, 10);

    if (!db.db.data.sessions) db.db.data.sessions = {};
    const sessionKey = `an1_${m.sender}`;
    db.db.data.sessions[sessionKey] = {
      results: apps,
      query: text,
      timestamp: Date.now(),
    };
    db.save();

    const saluranId = config.saluran?.id || "120363400911374213@newsletter";
    const saluranName = config.saluran?.name || config.bot?.name || "Ourin-AI";

    let caption = `📱 Resultados de búsqueda de apk mod *${text}*\n`;
    caption += `*${apps.length}* aplicaciones encontradas\n\n`;

    apps.forEach((app, i) => {
      caption += `*${i + 1}.* ${app.name}\n`;
      caption += `   ├ 👤 ${app.developer}\n`;
      caption += `   └ ⭐ ${app.rating}/5\n\n`;
    });

    caption += `> Elige un número para descargar directamente`;

    const buttons = apps.slice(0, 10).map((app, i) => ({
      title: `${i + 1}. ${app.name.substring(0, 20)}`,
      description: `${app.developer} • ⭐${app.rating}`,
      id: `${m.prefix}android1-get ${app.url}`,
    }));

    m.react("✅");
    await sock.sendButton(
      m.chat,
      fs.readFileSync("./assets/images/ourin.jpg"),
      caption,
      m,
      {
        buttons: [
          {
            name: "single_select",
            buttonParamsJson: JSON.stringify({
              title: "Elegir APK",
              sections: [
                {
                  title: "APK",
                  rows: buttons,
                },
              ],
            }),
          },
        ],
        footer: "📱 Búsqueda Android1",
      },
    );
  } catch (err) {
    m.react("☢");
    return m.reply(te(m.prefix, m.command, m.pushName));
  }
}

export { pluginConfig as config, handler };
