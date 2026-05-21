import te from "../../src/lib/ourin-error.js";
import config from "../../config.js";

const pluginConfig = {
  name: "am-data",
  alias: ["alightmotion-data"],
  category: "tools",
  description: "Ver datos del proyecto de Alight Motion desde un enlace compartido",
  usage: ".am-data <url>",
  example: ".am-data https://alightcreative.com/am/share/...",
  cooldown: 15,
  energi: 1,
  isEnabled: true,
};

const API = "https://api.obscuraworks.org/api/tools/amdata";
const KEY = config.APIkey.obscura;

function fmtSize(b) {
  if (!b) return "-";
  if (b < 1024) return b + " B";
  if (b < 1048576) return (b / 1024).toFixed(1) + " KB";
  return (b / 1048576).toFixed(1) + " MB";
}

function fmtDate(ts) {
  if (!ts?._seconds) return "-";
  return new Date(ts._seconds * 1000).toLocaleDateString("id-ID", {
    dateStyle: "long",
  });
}

async function handler(m, { sock }) {
  const url = m.text?.trim();
  if (!url || !url.includes("alightcreative.com")) {
    return m.reply(
      `📱 *ᴀʟɪɢʜᴛ ᴍᴏᴛɪᴏɴ ᴅᴀᴛᴀ*\n\n` +
        `- Ver información del proyecto AM desde un enlace compartido\n` +
        `- Ingresa la URL compartida de Alight Motion\n\n` +
        `\`${m.prefix}am-data <url>\``,
    );
  }

  m.react("🕕");

  try {
    const r = await fetch(API, {
      method: "POST",
      headers: {
        Accept: "application/json, image/*, audio/*, video/*",
        Autorization: `Bearer ${KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ url }),
    });

    const res = await r.json();
    const d = res?.data;
    const info = d?.info;

    if (!res?.status || !info) {
      m.react("❌");
      return m.reply(
        `📱 *ɢᴀɢᴀʟ ᴍᴇᴍʙᴀᴄᴀ ᴅᴀᴛᴀ*\n\n` + `- Asegúrate de que la URL compartida sea válida`,
      );
    }

    m.react("✅");

    const projects =
      info.projects
        ?.map((p) => `  - *${p.title}* (${p.type}, ${fmtSize(p.size)})`)
        .join("\n") || "  - No hay";

    const effects = info.requiredEfectos?.length
      ? info.requiredEfectos.slice(0, 8).join(", ") +
        (info.requiredEfectos.length > 8
          ? `, +${info.requiredEfectos.length - 8} más`
          : "")
      : "-";

    let msg =
      `📱 *ᴀʟɪɢʜᴛ ᴍᴏᴛɪᴏɴ ᴅᴀᴛᴀ*\n\n` +
      `- *Título* → ${info.title || "-"}\n` +
      `- *Tamaño* → ${fmtSize(info.size)}\n` +
      `- *Descargas* → ${info.downloads ?? 0}x\n` +
      `- *Me gusta* → ${info.likes ?? 0}\n` +
      `- *Versión* → \`${info.amVersionString || "-"}\`\n` +
      `- *Platform* → ${info.amPlatform || "-"}\n` +
      `- *Max FF* → v${info.maxFFVer || "-"}\n` +
      `- *Fecha* → ${fmtDate(info.shareDate)}\n\n` +
      `🎬 *Proyecto*\n${projects}\n\n` +
      `✨ *Efectos* → ${effects}`;

    if (info.largeThumbUrl) {
      await sock.sendMedia(m.chat, info.largeThumbUrl, null, m, {
        type: "image",
        caption: msg,
      });
    } else {
      m.reply(msg);
    }
  } catch (e) {
    console.log(e);
    m.react("☢");
    m.reply(te(m.prefix, m.command, m.pushName));
  }
}

export { pluginConfig as config, handler };
