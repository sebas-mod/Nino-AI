import { RedditDL } from "../../src/scraper/reddit.js";

const pluginConfig = {
  name: "redditdl",
  alias: ["reddit", "reddl"],
  category: "download",
  description: "Descargar video/imagen de Reddit",
  usage: ".redditdl <url>",
  example: ".redditdl https://www.reddit.com/r/xxx/comments/xxx",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 10,
  energi: 1,
  isEnabled: true,
};

async function handler(m, { sock }) {
  const text = m.text?.trim();
  if (!text) {
    m.react("❌");
    return m.reply(
      `📱 *Descargador de Reddit*\n\n` +
        `Descarga videos o imagenes de Reddit.\n\n` +
        `*USO:*\n` +
        `> *${m.prefix}redditdl <enlace>*\n\n` +
        `*EJEMPLO:*\n` +
        `> *${m.prefix}redditdl https://www.reddit.com/r/xxx/comments/xxx*`,
    );
  }

  m.react("🕕");

  try {
    const result = await RedditDL(text);

    if (!result.status) {
      m.react("☢");
      return m.reply(`❌ *Reddit fallo*\n\n> ${result.error}`);
    }

    let caption =
      `📱 *Reddit*\n\n` +
      `> 📌 ${result.title}\n` +
      `> 📁 ${result.results.length} contenidos encontrados`;

    if (result.results.length === 0) {
      m.react("☢");
      return m.reply("❌ No hay contenido que se pueda descargar de esa publicacion");
    }

    for (const media of result.results) {
      if (media.type === "video") {
        await sock.sendMedia(m.chat, media.download_url, caption, m, {
          type: "video",
        });
      } else {
        await sock.sendMedia(m.chat, media.download_url, caption, m, {
          type: "image",
        });
      }
    }

    m.react("✅");
  } catch (e) {
    console.error(e);
    m.react("☢");
    m.reply("❌ No se pudieron obtener los datos de Reddit, intenta de nuevo mas tarde");
  }
}

export { pluginConfig as config, handler };
