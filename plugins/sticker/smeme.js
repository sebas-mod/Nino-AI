import FormData from 'form-data'
import _sharp from 'sharp'
import axios from "axios";

function getSharp() {
  return _sharp;
}
import fs from "fs";
import path from "path";
import { config } from "../../config.js";
import te from "../../src/lib/ourin-error.js";
const pluginConfig = {
  name: "smeme",
  alias: ["memesticker", "memes"],
  category: "sticker",
  description: "Crea un sticker meme desde una imagen",
  usage: ".smeme <top>|<bottom>",
  example: ".smeme Cuando|Te Olvidas",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 10,
  energi: 1,
  isEnabled: true,
};
async function handler(m, { sock }) {
  const isImage = m.isImage || (m.quoted && m.quoted.isImage);
  const isSticker =
    m.isSticker ||
    (m.quoted && (m.quoted.isSticker || m.quoted.type === "stickerMessage"));
  if (!isImage && !isSticker) {
    return m.reply(
      `😂 *ᴍᴇᴍᴇ sᴛɪᴄᴋᴇʀ*\n\n> Responde o envia una imagen/sticker con el caption\n\n\`Ejemplo: ${m.prefix}smeme Arriba|Abajo\``,
    );
  }
  const input = m.args.join(" ");
  if (!input || !input.includes("|")) {
    return m.reply(
      `😂 *ᴍᴇᴍᴇ sᴛɪᴄᴋᴇʀ*\n\n> Formato: arriba|abajo\n\n\`Ejemplo: ${m.prefix}smeme Cuando|Te Olvidas\``,
    );
  }
  const [top, bottom] = input.split("|").map((s) => s.trim());
  m.react("🕕");
  try {
    let mediaBuffer;
    if (m.quoted) {
      mediaBuffer = await m.quoted.download();
    } else if (m.download) {
      mediaBuffer = await m.download();
    }
    if (!mediaBuffer) {
      m.react("❌");
      return m.reply(`❌ *ɢᴀɢᴀʟ*\n\n> No se pudo descargar el medio`);
    }
    let imageBuffer;
    try {
      imageBuffer = await (
        await getSharp()
      )(mediaBuffer)
        .resize(512, 512, {
          fit: "contain",
          background: { r: 0, g: 0, b: 0, alpha: 0 },
        })
        .png()
        .toBuffer();
    } catch (e) {
      console.log("[SMEME] Sharp resize failed:", e.message);
      imageBuffer = mediaBuffer;
    }
    const form = new FormData();
    form.append('file', imageBuffer, {
      filename: "meme.png",
      contentType: "image/png",
    });
    let imageUrl;
    try {
      const uploadRes = await axios.post(
        "https://c.termai.cc/api/upload?key=AIzaBj7z2z3xBjsk",
        form,
        {
          headers: form.getHeaders(),
          timeout: 30000,
        },
      );
      if (uploadRes.data?.status && uploadRes.data?.path) {
        imageUrl = uploadRes.data.path;
      }
    } catch (e) {
      console.log("[SMEME] Termai failed:", e.response?.data || e.message, "Trying telegraph...");
    }
    if (!imageUrl) {
      try {
        const form2 = new FormData();
        form2.append('file', imageBuffer, {
          filename: "meme.png",
          contentType: "image/png",
        });
        const telegraphRes = await axios.post(
          "https://telegra.ph/upload",
          form2,
          {
            headers: form2.getHeaders(),
            timeout: 30000,
          },
        );
        if (telegraphRes.data?.[0]?.src) {
          imageUrl = "https://telegra.ph" + telegraphRes.data[0].src;
        }
      } catch (e) {
        console.log("[SMEME] Telegraph failed:", e.message);
      }
    }
    if (!imageUrl) {
      m.react("❌");
      return m.reply(`❌ *ɢᴀɢᴀʟ*\n\n> No se pudo subir la imagen, intenta de nuevo mas tarde`);
    }
    console.log("[SMEME] Image uploaded:", imageUrl);
    const encodeText = (text) => {
      if (!text) return "_";
      return encodeURIComponent(text)
        .replace(/-/g, "--")
        .replace(/_/g, "__")
        .replace(/%20/g, "_");
    };
    const topEncoded = encodeText(top);
    const bottomEncoded = encodeText(bottom);
    const memeUrl = `https://api.memegen.link/images/custom/${topEncoded}/${bottomEncoded}.png?background=${encodeURIComponent(imageUrl)}`;
    const response = await axios.get(memeUrl, {
      responseType: "arraybuffer",
      timeout: 30000,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
    });
    const buffer = Buffer.from(response.data);
    await sock.sendImageAsSticker(m.chat, buffer, m, {
      packname: config.sticker?.packname || "Ourin-AI",
      author: config.sticker?.author || "Bot",
    });
    m.react("✅");
  } catch (error) {
    console.log("[SMEME] Error:", error.message);
    m.react("☢");
    m.reply(te(m.prefix, m.command, m.pushName));
  }
}
export { pluginConfig as config, handler };
