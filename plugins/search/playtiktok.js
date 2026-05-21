import te from "../../src/lib/ourin-error.js";
import { tiktokSearchVideo } from "../../src/scraper/tiktoksearch.js";

const pluginConfig = {
  name: "playtiktok",
  alias: ["ttplay", "tiktokplay"],
  category: "search",
  description: "Buscar y enviar el mejor video de TikTok",
  usage: ".playtiktok <query>",
  example: ".playtiktok cewe tiktok",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 15,
  energi: 1,
  isEnabled: true,
};

function formatNumber(n) {
  const value = Number(n) || 0;
  if (value >= 1000000) return (value / 1000000).toFixed(1) + "M";
  if (value >= 1000) return (value / 1000).toFixed(1) + "K";
  return value.toString();
}

async function handler(m, { sock }) {
  const query = m.args.join(" ")?.trim();

  if (!query) {
    return m.reply(
      `🎵 *PLAY TIKTOK*\n\n> Ejemplo:\n\`${m.prefix}playtiktok cewe tiktok\``,
    );
  }

  m.react("🔍");

  try {
    const videos = await tiktokSearchVideo(query);
    if (!videos || videos.length === 0) {
      m.react("❌");
      return m.reply(`❌ No se encontraron videos para: ${query}`);
    }

    const video = videos[0];
    let caption = "🎵 *PLAY TIKTOK*\n\n";
    caption += `📌 *Título:* ${video.title || "-"}\n`;
    caption += `👤 *Autor:* ${video.author?.nickname || "-"}\n`;
    caption += `👀 *Vistas:* ${formatNumber(video.stats?.plays)}\n`;
    caption += `❤️ *Me gusta:* ${formatNumber(video.stats?.likes)}\n`;
    caption += `💬 *Comentarios:* ${formatNumber(video.stats?.comments)}\n`;
    caption += `🔁 *Compartidos:* ${formatNumber(video.stats?.shares)}\n`;
    caption += `🎧 *Música:* ${video.music || "-"}\n`;
    caption += `🔗 *Enlace:* ${video.link}`;

    await sock.sendMedia(m.chat, video.link, caption, m, {
      type: "video",
      mimetype: "video/mp4",
      contextInfo: {
        forwardingScore: 99,
        isForwarded: true,
      },
    });

    m.react("✅");
  } catch (error) {
    console.log(error);
    m.react("☢");
    m.reply(te(m.prefix, m.command, m.pushName));
  }
}

export { pluginConfig as config, handler };
