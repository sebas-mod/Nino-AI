import _sharp from 'sharp'
import { upload, get } from "../../src/scraper/hd.js";
import axios from "axios";
import config from "../../config.js";

function getSharp() {
  return _sharp;
}
import FormData from "form-data";
import path from "path";
import fs from "fs";
import te from "../../src/lib/ourin-error.js";
const pluginConfig = {
  name: "hd2",
  alias: ["enhance2", "upscale2", "aienhancer"],
  category: "tools",
  description: "Mejora una imagen a HD con IA (V3)",
  usage: ".hd2 (responde a una imagen)",
  example: ".hd2",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 30,
  energi: 2,
  isEnabled: true,
};
async function handler(m, { sock }) {
  const isImage = m.isImage || (m.quoted && m.quoted.type === "imageMessage");
  if (!isImage) {
    return m.reply(
      `✨ *ʜᴅ ᴇɴʜᴀɴᴄᴇ ᴠ2*\n\n> Envía o responde a una imagen para mejorarla\n\n\`${m.prefix}hd2\`\n\n> 🕕 El proceso tarda ±1 minuto`,
    );
  }
  m.react("🕕");
  try {
    let buffer;
    if (m.quoted && m.quoted.isMedia) {
      buffer = await m.quoted.download();
    } else if (m.isMedia) {
      buffer = await m.download();
    }
    if (!buffer) {
      m.react("❌");
      return m.reply(`❌ No se pudo descargar la imagen`);
    }
    await m.reply(
      `🕕 *ᴍᴇᴍᴘʀᴏsᴇs ɢᴀᴍʙᴀʀ...*\n\n> Tiempo estimado: ±1 minuto\n> Por favor espera...`,
    );
    const temp = path.join(process.cwd(), "temp", "hd.jpg");
    fs.writeFileSync(temp, buffer);
    const codes = await upload(temp);
    fs.unlinkSync(temp);
    const uplot = codes.code;
    await new Promise((resolve) => setTimeout(resolve, 10000));
    let result = await get(uplot);
    while (result.status === "waiting") {
      await new Promise((resolve) => setTimeout(resolve, 6000));
      result = await get(uplot);
    }
    if (!result) {
      m.react("❌");
      return m.reply(`❌ No se pudo mejorar la imagen. Intenta de nuevo más tarde.`);
    }
    m.react("✅");
    await sock.sendMessage(
      m.chat,
      {
        document: { url: result.downloadUrls[0] },
        mimetype: "image/png",
        jpegThumbnail: await (
          await getSharp()
        )(
          await axios
            .get(result.downloadUrls[0], { responseType: "arraybuffer" })
            .then((res) => Buffer.from(res.data)),
        )
          .resize(50, 50)
          .jpeg({ quality: 30 })
          .toBuffer(),
        fileLength: 99999999999999,
        fileName: `CONVERTED BY ${config.bot.name}`,
      },
      { quoted: m },
    );
  } catch (error) {
    m.react("☢");
    m.reply(te(m.prefix, m.command, m.pushName));
  }
}
export { pluginConfig as config, handler };
