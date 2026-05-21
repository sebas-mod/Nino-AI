import te from "../../src/lib/ourin-error.js";
import config from "../../config.js";
import ourinApi from "../../src/lib/ourin-apimanager.js";

const pluginConfig = {
  name: "ffstalk",
  alias: ["freefireid", "stalkff"],
  category: "stalker",
  description: "Buscar ID de Free Fire",
  usage: ".ffstalk <id>",
  example: ".ffstalk 775417067",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 10,
  energi: 1,
  isEnabled: true,
};

async function handler(m, { sock }) {
  const id = m.args[0];

  if (!id) {
    return m.reply(
      `🔥 *ꜰʀᴇᴇ ꜰɪʀᴇ sᴛᴀʟᴋ*\n\n` +
        `> Ingresa el ID de Free Fire\n\n` +
        `\`Ejemplo: ${m.prefix}ffstalk 775417067\``,
    );
  }

  m.react("🔍");

  try {
    const res = await ourinApi.covenant.freefire(id, { timeout: 30000 });

    if (!res?.status || !res?.data) {
      m.react("❌");
      return m.reply(`❌ ID *${id}* no encontrado`);
    }

    const r = res.data;

    const caption =
      `🔥 *ꜰʀᴇᴇ ꜰɪʀᴇ sᴛᴀʟᴋ*\n\n` +
      `🎮 *Juego:* Free Fire\n` +
      `🆔 *ID de usuario:* ${r.uid}\n` +
      `👤 *Apodo:* ${r.name}\n` +
      `📊 *Nivel:* ${r.level}\n` +
      `⭐ *EXP:* ${r.exp}\n` +
      `🌍 *Region:* ${r.region}\n` +
      `❤️ *Me gusta:* ${r.likes ?? "-"}\n\n` +
      `🏆 *Puntos de rango BR:* ${r.br_rank_point}\n` +
      `🥇 *Rango maximo BR:* ${r.br_max_rank}\n` +
      `🎯 *Puntos de rango CS:* ${r.cs_rank_point ?? "-"}\n` +
      `🏅 *Rango maximo CS:* ${r.cs_max_rank}\n\n` +
      `📅 *Creado:* ${r.created_at}\n` +
      `🕒 *Ultimo login:* ${r.last_login}\n` +
      `🆔 *ID de temporada:* ${r.season_id}\n\n` +
      `👥 *Gremio:* ${r.guild_name ?? "-"}\n` +
      `🆔 *ID del gremio:* ${r.guild_id ?? "-"}\n\n` +
      `🐾 *ID de mascota:* ${r.pet_id ?? "-"}\n` +
      `📈 *Nivel de mascota:* ${r.pet_level ?? "-"}\n\n` +
      `🧾 *Biografia:* ${r.signature ?? "-"}\n` +
      `⚧ *Genero:* ${r.gender ?? "-"}\n` +
      `🌐 *Idioma:* ${r.language ?? "-"}\n\n`;

    m.react("✅");

    if (r.banner_image) {
      await sock.sendMedia(m.chat, r.banner_image, null, m, {
        caption,
        type: "image",
      });
    } else {
      await m.reply(caption);
    }
  } catch (error) {
    console.log(error?.response?.data || error.message);
    m.react("☢");
    m.reply(te(m.prefix, m.command, m.pushName));
  }
}

export { pluginConfig as config, handler };
