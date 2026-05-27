import { execFile } from "child_process";
import { promisify } from "util";
import fs from "fs";
import os from "os";
import path from "path";
import { DailymotionDL } from "../../src/scraper/dailymotion.js";

const exec = promisify(execFile);

const pluginConfig = {
  name: "dailymotiondl",
  alias: ["dailymotion", "dmdl"],
  category: "download",
  description: "Descargar video de Dailymotion",
  usage: ".dailymotiondl <url>",
  example: ".dailymotiondl https://www.dailymotion.com/video/xxx",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 15,
  energi: 2,
  isEnabled: true,
};

async function handler(m, { sock }) {
  const text = m.text?.trim();
  if (!text) {
    m.react("❌");
    return m.reply(
      `🎬 *Descargador de Dailymotion*\n\n` +
        `Descarga videos de Dailymotion y los convierte automaticamente a MP4.\n\n` +
        `*USO:*\n` +
        `> *${m.prefix}dailymotiondl <enlace>*\n\n` +
        `*EJEMPLO:*\n` +
        `> *${m.prefix}dailymotiondl https://www.dailymotion.com/video/xxx*\n\n` +
        `_El proceso de conversion puede tardar un poco_`,
    );
  }

  m.react("🕕");

  try {
    const result = await DailymotionDL(text);

    if (!result.status) {
      m.react("☢");
      return m.reply(`❌ *Dailymotion fallo*\n\n> ${result.error}`);
    }

    let caption =
      `🎬 *Dailymotion*\n\n` +
      `> 📌 ${result.title}\n` +
      `> ⏱️ Duracion: ${result.duration}\n` +
      `> 📺 Calidad: ${result.quality}`;

    if (result.thumbnail) {
      await sock.sendMedia(m.chat, result.thumbnail, caption, m, {
        type: "image",
      });
    }

    if (result.video) {
      const tmpFile = path.join(os.tmpdir(), `dm_${Date.now()}.mp4`);

      await exec(
        "ffmpeg",
        [
          "-y",
          "-i",
          result.video,
          "-c",
          "copy",
          "-bsf:a",
          "aac_adtstoasc",
          tmpFile,
        ],
        { timeout: 120000 },
      );

      const buffer = fs.readFileSync(tmpFile);
      fs.unlinkSync(tmpFile);

      await sock.sendMessage(
        m.chat,
        {
          document: buffer,
          mimetype: "video/mp4",
          fileName:
            (result.title || "video").replace(/[<>:"/\\|?*]/g, "") + ".mp4",
          caption,
        },
        { quoted: m },
      );
    }

    m.react("✅");
  } catch (e) {
    console.error(e);
    m.react("☢");
    m.reply("❌ No se pudieron obtener los datos de Dailymotion, intenta de nuevo mas tarde");
  }
}

export { pluginConfig as config, handler };
