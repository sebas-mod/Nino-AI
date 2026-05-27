import * as _canvas from '@napi-rs/canvas'
import axios from "axios";


import config from "../../config.js";
import te from "../../src/lib/ourin-error.js";
const pluginConfig = {
  name: "colongpp",
  alias: ["stealpp", "malingpp", "ambilpp"],
  category: "owner",
  description: "Tomar y usar la foto de perfil del objetivo como foto del bot",
  usage: ".colongpp (responde a un mensaje target)",
  example: ".colongpp",
  isOwner: true,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 10,
  energi: 0,
  isEnabled: true,
};
const FALLBACK_PP = "https://telegra.ph/file/1ecdb5a0aee62ef17d7fc.jpg";
const PP_SIZE = 640;
async function resizeForPP(buffer) {
  const { createCanvas, loadImage } = _canvas;
  const img = await loadImage(buffer);
  const canvas = createCanvas(PP_SIZE, PP_SIZE);
  const ctx = canvas.getContext("2d");
  ctx.drawImage(img, 0, 0, PP_SIZE, PP_SIZE);
  return canvas.toBuffer("image/jpeg");
}
async function handler(m, { sock }) {
  const targetJid = m.quoted?.sender || m.mentions?.[0];
  console.log(targetJid);
  if (!targetJid) {
    return m.reply(
      `🕵️ *ᴄᴏʟᴏɴɢ ᴘᴘ*\n\n` +
        `> Responde el mensaje de alguien para tomar su foto de perfil\n\n` +
        `*ᴄᴀʀᴀ:*\n` +
        `> Reply mensaje target → \`${m.prefix}colongpp\``,
    );
  }
  await m.react("🕵️");
  try {
    let ppBuffer;
    let source = "profil";
    try {
      const ppUrl = await sock.profilePictureUrl(targetJid, "image");
      const res = await axios.get(ppUrl, {
        responseType: "arraybuffer",
        timeout: 15000,
      });
      ppBuffer = Buffer.from(res.data);
    } catch {
      const res = await axios.get(FALLBACK_PP, {
        responseType: "arraybuffer",
        timeout: 15000,
      });
      ppBuffer = Buffer.from(res.data);
      source = "default (el objetivo no tiene foto de perfil)";
    }
    const processed = await resizeForPP(ppBuffer);
    const botJid = sock.user?.id;
    await sock.updateProfilePicture(botJid, processed);
    const targetNumber = targetJid.split("@")[0];
    await m.react("✅");
    return m.reply(
      `✅ *ᴘᴘ ʙᴇʀʜᴀsɪʟ ᴅɪᴄᴏʟᴏɴɢ!*\n\n` +
        `> 🎯 Objetivo: @${targetNumber}\n` +
        `> 📸 Sumber: ${source}`,
      { mentions: [targetJid] },
    );
  } catch (err) {
    console.error("[ColongPP] Error:", err.message);
    await m.react("☢");
    return m.reply(te(m.prefix, m.command, m.pushName));
  }
}
export { pluginConfig as config, handler };
