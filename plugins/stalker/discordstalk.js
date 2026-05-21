import axios from 'axios'
import config from '../../config.js'
import * as timeHelper from '../../src/lib/ourin-time.js'
import te from '../../src/lib/ourin-error.js'
const NEOXR_APIKEY = config.APIkey?.neoxr || "Milik-Bot-OurinMD";

const pluginConfig = {
  name: "discordstalk",
  alias: ["dcstalk", "dsstalk", "stalkdc", "stalkdiscord"],
  category: "stalker",
  description: "Buscar cuenta de Discord por ID de usuario",
  usage: ".discordstalk <userid>",
  example: ".discordstalk 297574907510784000",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 10,
  energi: 1,
  isEnabled: true,
};

async function handler(m, { sock }) {
  const userId = m.args[0]?.trim();

  if (!userId) {
    return m.reply(
      `🎮 *ᴅɪsᴄᴏʀᴅ sᴛᴀʟᴋ*\n\n` +
        `> Ingresa el ID de usuario de Discord\n\n` +
        `\`Ejemplo: ${m.prefix}discordstalk 297574907510784000\``,
    );
  }

  if (!/^\d+$/.test(userId)) {
    return m.reply(`❌ El ID de usuario debe ser numerico. Ejemplo: 297574907510784000`);
  }

  m.react("🔍");

  try {
    const res = await axios.get(
      `https://api.neoxr.eu/api/dcstalk?id=${userId}&apikey=${NEOXR_APIKEY}`,
      {
        timeout: 30000,
      },
    );

    if (!res.data?.status || !res.data?.data) {
      m.react("❌");
      return m.reply(`❌ ID de usuario *${userId}* no encontrado`);
    }

    const d = res.data.data;

    const createdDate = d.created_at
      ? timeHelper.fromTimestamp(d.created_at, "D MMMM YYYY")
      : "-";

    const caption =
      `🎮 *ᴅɪsᴄᴏʀᴅ sᴛᴀʟᴋ*\n\n` +
      `👤 *Usuario:* ${d.username || "-"}\n` +
      `📛 *Nombre visible:* ${d.global_name || "-"}\n` +
      `🔢 *Discriminator:* #${d.discriminator || "0"}\n` +
      `🆔 *ID de usuario:* ${d.id}\n\n` +
      `📅 *Creado:* ${createdDate}\n\n` +
      `> _Busqueda de usuario de Discord_`;

    m.react("✅");

    if (d.avatar_url) {
      await sock.sendMessage(
        m.chat,
        {
          image: { url: d.avatar_url },
          caption,
        },
        { quoted: m },
      );
    } else {
      await m.reply(caption);
    }
  } catch (error) {
    m.react('☢');
    m.reply(te(m.prefix, m.command, m.pushName));
  }
}

export { pluginConfig as config, handler }
