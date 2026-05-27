import te from "../../src/lib/ourin-error.js";
import config from "../../config.js";

const pluginConfig = {
  name: "colorize",
  alias: ["warnai"],
  category: "ai",
  description: "Colorea fotos en blanco y negro con IA",
  usage: ".colorize (responde a una imagen)",
  example: ".colorize",
  cooldown: 20,
  energi: 2,
  isEnabled: true,
};

const API = "https://api.obscuraworks.org/api/ai/colorize";
const KEY = config.APIkey.obscura;

async function ul(buf) {
  const f = new FormData();
  f.append("file", new Blob([buf]), "img.jpg");
  const r = await fetch("https://tmpfiles.org/api/v1/upload", {
    method: "POST",
    body: f,
  });
  const j = await r.json();
  return j.data.url.replace("tmpfiles.org/", "tmpfiles.org/dl/");
}

async function handler(m, { sock }) {
  const img =
    m.isImage ||
    (m.quoted && (m.quoted.isImage || m.quoted.type === "imageMessage"));

  if (!img) {
    return m.reply(
      `🎨 *ᴄᴏʟᴏʀɪᴢᴇ*\n\n` +
        `- Convierte fotos en blanco y negro a color 🖼️\n` +
        `- Responde a la imagen que quieres colorear\n\n` +
        `\`${m.prefix}colorize\``,
    );
  }

  m.react("🕕");

  try {
    let b = m.quoted?.isMedia ? await m.quoted.download() : await m.download();

    const u = await ul(b);
    const ac = new AbortController();
    const tid = setTimeout(() => ac.abort(), 120000);
    const r = await fetch(API, {
      method: "POST",
      headers: {
        Accept: "application/json, image/*, audio/*, video/*",
        Authorization: `Bearer ${KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ url: u }),
      signal: ac.signal,
    });
    clearTimeout(tid);

    const result = Buffer.from(await r.arrayBuffer());

    m.react("✅");

    await sock.sendMedia(m.chat, result, null, m, { type: "image" });
  } catch (e) {
    console.log(e);
    m.react("☢");
    m.reply(te(m.prefix, m.command, m.pushName));
  }
}

export { pluginConfig as config, handler };
