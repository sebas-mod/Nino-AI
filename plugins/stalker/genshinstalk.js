import te from "../../src/lib/ourin-error.js";
import config from "../../config.js";

const pluginConfig = {
  name: "genshinstalk",
  alias: ["gstalk"],
  category: "stalker",
  description: "Buscar perfil de Genshin Impact por UID",
  usage: ".gstalk <uid>",
  example: ".gstalk 840737446",
  cooldown: 15,
  energi: 1,
  isEnabled: true,
};

const API = "https://api.obscuraworks.org/api/stalk/genshin";
const KEY = config.APIkey.obscura;

async function handler(m, { sock }) {
  const uid = m.text?.trim();
  if (!uid || !/^\d{5,9}$/.test(uid)) {
    return m.reply(
      `⚔️ *ɢᴇɴꜱʜɪɴ ꜱᴛᴀʟᴋᴇʀ*\n\n` +
        `- Ver perfil de Genshin Impact por UID\n` +
        `- Ingresa un UID valido\n\n` +
        `\`${m.prefix}gstalk 840737446\``,
    );
  }

  m.react("🕕");

  try {
    const ac = new AbortController();
    const tid = setTimeout(() => ac.abort(), 120000);
    const r = await fetch(`${API}?uid=${uid}`, {
      headers: {
        Accept: "application/json, image/*, audio/*, video/*",
        Authorization: `Bearer ${KEY}`,
      },
      signal: ac.signal,
    });
    clearTimeout(tid);

    const res = await r.json();
    const d = res?.data;

    if (!res?.status || !d) {
      m.react("❌");
      return m.reply(
        `⚔️ *ᴜɪᴅ ᴛɪᴅᴀᴋ ᴅɪᴛᴇᴍᴜᴋᴀɴ*\n\n` +
          `- Asegurate de que el UID sea correcto y el perfil no sea privado`,
      );
    }

    m.react("✅");

    const chars =
      d.characters
        ?.slice(0, 5)
        .map((c) => `  - ${c.name} Lv.${c.level}`)
        .join("\n") || "  - No hay";

    let msg =
      `⚔️ *ɢᴇɴꜱʜɪɴ ꜱᴛᴀʟᴋᴇʀ*\n\n` +
      `- *Apodo* → ${d.nickname || "-"}\n` +
      `- *UID* → \`${d.uid}\`\n` +
      `- *AR* → ${d.level}\n` +
      `- *WL* → ${d.world_level}\n` +
      `- *Logros* → ${d.achievement}\n` +
      `- *Abyss* → ${d.spiral_abyss || "-"}\n` +
      `- *Firma* → ${d.signature || "-"}\n\n` +
      `🎭 *Personajes*\n${chars}`;

    if (d.image) {
      await sock.sendMedia(m.chat, d.image, msg, m, {
        type: "image",
      });
    } else {
      m.reply(msg);
    }
  } catch (e) {
    console.log(e);
    m.react("☢");
    m.reply(te(m.prefix, m.command, m.pushName));
  }
}

export { pluginConfig as config, handler };
