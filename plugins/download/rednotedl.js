import { RedNoteDL } from "../../src/scraper/rednote.js";

const pluginConfig = {
  name: "rednotedl",
  alias: ["rednote", "xhsdl", "xiaohongshu"],
  category: "download",
  description: "Descargar video/foto de RedNote (XiaoHongShu)",
  usage: ".rednotedl <url>",
  example: ".rednotedl https://www.xiaohongshu.com/xxx",
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
      `📕 *Descargador de RedNote*\n\n` +
        `Descarga video o foto de XiaoHongShu (RedNote).\n\n` +
        `*USO:*\n` +
        `> *${m.prefix}rednotedl <enlace>*\n\n` +
        `*EJEMPLO:*\n` +
        `> *${m.prefix}rednotedl https://www.xiaohongshu.com/xxx*`,
    );
  }

  m.react("🕕");

  try {
    const result = await RedNoteDL(text);

    if (!result.status) {
      m.react("☢");
      return m.reply(`❌ *RedNote fallo*\n\n> ${result.error}`);
    }

    if (result.type === "video" && result.results?.[0]) {
      await sock.sendMedia(m.chat, result.results[0], result.title, m, {
        type: "video",
      });
    } else if (result.results?.length > 0) {
      for (let i = 0; i < Math.min(result.results.length, 5); i++) {
        await sock.sendMedia(m.chat, result.results[i], "", m, {
          type: "image",
        });
      }
      if (result.results.length > 5) {
        await m.reply(
          `_Aun quedan ${result.results.length - 5} fotos mas, maximo 5_`,
        );
      }
    }

    m.react("✅");
  } catch (e) {
    console.error(e);
    m.react("☢");
    m.reply("❌ No se pudieron obtener los datos de RedNote, intenta de nuevo mas tarde");
  }
}

export { pluginConfig as config, handler };
