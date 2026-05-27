import * as _canvas from '@napi-rs/canvas'
import axios from "axios";
import path from "path";
import fs from "fs";


import { uploadTo0x0 } from "../../src/lib/ourin-tmpfiles.js";
import te from "../../src/lib/ourin-error.js";
const pluginConfig = {
  name: "fakedev",
  alias: [],
  category: "canvas",
  description: "Crea una tarjeta falsa de perfil de desarrollador",
  usage: ".fakedev <nombre> (responde/envia foto)",
  example: ".fakedev Misaki",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 10,
  energi: 1,
  isEnabled: true,
};
let fontRegistered = false;
async function handler(m, { sock }) {
  const name = m.text?.trim();
  if (!name) {
    return m.reply(
      `🎮 *ꜰᴀᴋᴇ ᴅᴇᴠᴇʟᴏᴘᴇʀ*\n\n` +
        `> Ingresa un nombre para el perfil\n\n` +
        `*ᴄᴀʀᴀ ᴘᴀᴋᴀɪ:*\n` +
        `> 1. Envia foto + leyenda \`${m.prefix}fakedev <nombre>\`\n` +
        `> 2. Responde una foto con \`${m.prefix}fakedev <nombre>\``,
    );
  }
  let buffer = null;
  if (
    m.quoted &&
    (m.quoted.type === "imageMessage" || m.quoted.mtype === "imageMessage")
  ) {
    try {
      buffer = await m.quoted.download();
    } catch (e) {
      m.reply(te(m.prefix, m.command, m.pushName));
    }
  } else if (m.isMedia && m.type === "imageMessage") {
    try {
      buffer = await m.download();
    } catch (e) {
      m.reply(te(m.prefix, m.command, m.pushName));
    }
  } else {
    try {
      let te = await sock.profilePictureUrl(m.sender, "image");
      buffer = Buffer.from(
        (await axios.get(te, { responseType: "arraybuffer" })).data,
      );
    } catch (error) {
      buffer = fs.readFileSync("./assets/images/pp-kosong.jpg");
    }
  }
  if (!buffer) {
    return m.reply(`❌ Envia/responde una imagen para usarla como avatar!`);
  }
  m.react("🕕");
  try {
    const gmbr = await uploadTo0x0(buffer, {
      filename: "image.jpg",
      contentType: "image/jpeg",
    });
    await sock.sendMedia(
      m.chat,
      `https://api.ourin.my.id/api/fake-developer-3?text=${encodeURIComponent(name)}&image=${gmbr.directUrl}&verified=true`,
      null,
      m,
      {
        type: "image",
      },
    );
    m.react("✅");
  } catch (error) {
    m.react("❌");
    m.reply(`Intenta de nuevo`);
  }
}
export { pluginConfig as config, handler };
