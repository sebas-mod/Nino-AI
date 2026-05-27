import axios from "axios";
import te from "../../src/lib/ourin-error.js";
import { saluranCtx } from "../../src/lib/ourin-context.js";
const pluginConfig = {
  name: "spotifydl",
  alias: ["spdl", "spotify-dl", "spotdl"],
  category: "download",
  description: "Descargar cancion de Spotify",
  usage: ".spdl <url>",
  example: ".spdl https://open.spotify.com/track/xxx",
  cooldown: 15,
  energi: 1,
  isEnabled: true,
};

function formatArtists(value) {
  if (Array.isArray(value)) return value.join(", ");
  return value || "Spotify";
}

async function handler(m, { sock }) {
  const url = m.text?.trim();

  if (!url)
    return m.reply(
      `🎵 *sᴘᴏᴛɪꜰʏ ᴅᴏᴡɴʟᴏᴀᴅ*\n\n` +
        `╭┈┈⬡「 📋 *ᴄᴀʀᴀ ᴘᴀᴋᴀɪ* 」\n` +
        `┃ \`${m.prefix}spdl <url>\`\n` +
        `╰┈┈⬡`,
    );

  if (!/open\.spotify\.com\/track/i.test(url))
    return m.reply("❌ URL no valida");

  m.react("🕕");

  try {
    const { data } = await axios.get(
      `https://api.azbry.com/api/download/spotify?url=${encodeURIComponent(url)}`,
      {
        timeout: 30000,
        headers: {
          "user-agent": "Mozilla/5.0",
        },
      },
    );

    if (!data?.status || !data?.downloadLink) {
      throw new Error(data?.message || "No se pudo obtener la cancion de Spotify");
    }

    const artist = formatArtists(data.author);

    await sock.sendMedia(m.chat, data.downloadLink, null, m, {
      type: "audio",
      mimetype: "audio/mpeg",
      fileName: `${artist} - ${data.title}.mp3`,
      contextInfo: saluranCtx(),
    });

    m.react("✅");
  } catch (e) {
    m.react("☢");
    m.reply(te(m.prefix, m.command, m.pushName));
  }
}

export { pluginConfig as config, handler };
