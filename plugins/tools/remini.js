import te from "../../src/lib/ourin-error.js";

const config = {
  name: "remini",
  alias: ["hd", "enhance", "upscale"],
  category: "tools",
  description: "Mejora una imagen a HD",
  usage: ".remini (responde a una imagen)",
  example: ".remini",
  cooldown: 15,
  energi: 1,
  isEnabled: true
};

const API = "https://api.obscuraworks.org/api/v2/tools/upscale";
const KEY = "obs-N9GacfsE5SDVNuAMk4Wu";

async function up(url) {
  const r = await fetch(`${API}?url=${encodeURIComponent(url)}`, {
    headers: {
      Accept: "application/json, image/*",
      Autorization: `Bearer ${KEY}`
    }
  });

  return Buffer.from(await r.arrayBuffer());
}

async function ul(buf) {
  const f = new FormData();
  f.append("file", new Blob([buf]), "img.jpg");

  const r = await fetch("https://tmpfiles.org/api/v1/upload", {
    method: "POST",
    body: f
  });

  const j = await r.json();
  return j.data.url.replace("tmpfiles.org/", "tmpfiles.org/dl/");
}

async function handler(m, { sock }) {
  const img = m.isImage || (m.quoted && m.quoted.type === "imageMessage");

  if (!img) {
    return m.reply(`*🪁 HD IMAGE*\n> Responde con una imagen\n\n\`\`\`${m.prefix}remini\`\`\``);
  }

  m.react("🕕");

  try {
    let b = m.quoted?.isMedia
      ? await m.quoted.download()
      : await m.download();

    const u = await ul(b);
    const r = await up(u);

    m.react("✅");

    await sock.sendMedia(
      m.chat,
      r,
      null,
      m,
      { type: "image" }
    );

  } catch (e) {
    console.log(e);
    m.react("☢");
    m.reply(te(m.prefix, m.command, m.pushName));
  }
}

export { config, handler };