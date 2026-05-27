import { Img2Img } from "../../src/scraper/img2img.js";
import { saluranCtx } from "../../src/lib/ourin-context.js";
import te from "../../src/lib/ourin-error.js";

const pluginConfig = {
  name: "img2img",
  alias: ["editimg", "nanobanana", "nano", "imgedit"],
  category: "ai",
  description: "Edita imágenes con IA usando un prompt",
  usage: ".img2img <prompt> (responde a una imagen)",
  example: ".img2img hazlo estilo anime",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 30,
  energi: 2,
  isEnabled: true,
};

async function handler(m, { sock }) {
  const prompt = m.text;
  if (!prompt) {
    m.react("❌");
    return m.reply(
      `🎨 *Image to Image*\n\n` +
        `Edita imágenes con IA — tinggal responde a una imagen + kasih prompt.\n\n` +
        `*USO:*\n` +
        `> *${m.prefix}img2img <prompt>* (responde a una imagen)\n\n` +
        `*EJEMPLO:*\n` +
        `> *${m.prefix}img2img hazlo estilo anime*\n` +
        `> *${m.prefix}img2img ubah jadi lukisan cat minyak*\n\n` +
        `_Responde primero a una imagen y luego escribe el comando + prompt_`
    );
  }

  const isImage = m.isImage || (m.quoted && m.quoted.isImage);
  if (!isImage) {
    m.react("❌");
    return m.reply(`🎨 *Image to Image*\n\n> Responde primero a una imagen y luego escribe el comando + prompt`);
  }

  m.react("🕕");

  try {
    let mediaBuffer;
    if (m.isImage && m.download) {
      mediaBuffer = await m.download();
    } else if (m.quoted && m.quoted.isImage && m.quoted.download) {
      mediaBuffer = await m.quoted.download();
    }

    if (!mediaBuffer || !Buffer.isBuffer(mediaBuffer)) {
      m.react("☢");
      return m.reply(`❌ *Falló*\n\n> No se pudo descargar la imagen`);
    }

    const result = await Img2Img(prompt, mediaBuffer, `upload_${Date.now()}.png`);

    if (!result.status) {
      m.react("☢");
      return m.reply(`❌ *La edición falló*\n\n> ${result.error}`);
    }

    await sock.sendMedia(m.chat, result.result?.url || result.result, `🎨 *Image to Image*\n\n> Prompt: *${prompt}*`, m, {
      type: "image",
    });

    m.react("✅");
  } catch (e) {
    console.error(e);
    m.react("☢");
    m.reply(te(m.prefix, m.command, m.pushName));
  }
}

export { pluginConfig as config, handler };
