import { DouyinDL } from "../../src/scraper/douyin.js";

const pluginConfig = {
  name: "douyindl",
  alias: ["douyin", "dydl"],
  category: "download",
  description: "Descargar video/audio de Douyin (TikTok China)",
  usage: ".douyindl <url>",
  example: ".douyindl https://v.douyin.com/xxx",
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
      `🎵 *Descargador de Douyin*\n\n` +
        `Descarga video o audio de Douyin (TikTok China).\n\n` +
        `*USO:*\n` +
        `> *${m.prefix}douyindl <enlace>*\n\n` +
        `*EJEMPLO:*\n` +
        `> *${m.prefix}douyindl https://v.douyin.com/xxx*`,
    );
  }

  m.react("🕕");

  try {
    const result = await DouyinDL(text);

    if (!result.status) {
      m.react("☢");
      return m.reply(`❌ *Douyin fallo*\n\n> ${result.error}`);
    }

    let caption = `🎵 *${result.platform}*\n\n${result.title}`;

    if (result.video) {
      await sock.sendMedia(m.chat, result.video, caption, m, {
        type: "video",
      });
    }

    if (result.audio) {
      await sock.sendMedia(m.chat, result.audio, caption, m, {
        type: "audio",
      });
    }

    m.react("✅");
  } catch (e) {
    console.error(e);
    m.react("☢");
    m.reply("❌ No se pudieron obtener los datos de Douyin, intenta de nuevo mas tarde");
  }
}

export { pluginConfig as config, handler };
