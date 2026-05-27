import te from "../../src/lib/ourin-error.js";
import config from "../../config.js";

const pluginConfig = {
  name: "fake-xnxx",
  alias: ["fxnxx", "xnxxfake"],
  category: "canvas",
  description: "Crea un comentario XNXX falso para entretenimiento",
  usage: ".fake-xnxx | nombre | comentario | likes | dislikes",
  example: ".fake-xnxx | John Doe | Este es un comentario de ejemplo | 1.2k | 24",
  cooldown: 15,
  energi: 1,
  isEnabled: true,
};

const API = "https://api.obscuraworks.org/api/maker/fake-xnxx";
const KEY = config.APIkey.obscura;

async function handler(m, { sock }) {
  const raw = m.text?.trim();
  if (!raw || !raw.includes("|")) {
    return m.reply(
      `🔞 *ꜰᴀᴋᴇ xɴxxx*\n\n` +
      `- Crea un comentario falso para entretenimiento 😂\n` +
      `- Separa el formato con |\n\n` +
      `\`${m.prefix}fake-xnxx | Nombre | Comentario | Likes | Dislikes\``
    );
  }

  const parts = raw.split("|").map((s) => s.trim());
  if (parts.length < 3) {
    return m.reply(
      `🔞 *ꜰᴏʀᴍᴀᴛ ᴋᴜʀᴀɴɢ*\n\n` +
      `- Necesitas: Nombre | Comentario | Likes | Dislikes`
    );
  }

  m.react("🕕");

  try {
    const params = new URLSearchParams({
      name: parts[1],
      quote: parts[2],
      likes: parts[3] || "0",
      dislikes: parts[4] || "0",
    });

    const r = await fetch(`${API}?${params}`, {
      headers: {
        Accept: "application/json, image/*, audio/*, video/*",
        Authorization: `Bearer ${KEY}`,
      },
    });

    const buf = Buffer.from(await r.arrayBuffer());

    m.react("✅");
    await sock.sendMedia(m.chat, buf, null, m, { type: "image" });
  } catch (e) {
    console.log(e);
    m.react("☢");
    m.reply(te(m.prefix, m.command, m.pushName));
  }
}

export { pluginConfig as config, handler };
