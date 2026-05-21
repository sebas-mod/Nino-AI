import config from "../../config.js";
import te from "../../src/lib/ourin-error.js";

const pluginConfig = {
  name: "rvo",
  alias: ["readvo", "readviewonce", "readview"],
  category: "tools",
  description: "Lee mensajes de una sola vista (view once)",
  usage: ".rvo (responde a un mensaje view once)",
  example: ".rvo",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 5,
  energi: 1,
  isEnabled: true,
};

async function handler(m, { sock }) {
  const quoted = m.quoted;
  if (!quoted) {
    return m.reply(
      `Responde al mensaje de una sola vista (view once) para abrirlo.\n\n\`Ejemplo: ${m.prefix}rvo\` (responde a un mensaje view once)`,
    );
  }

  if (!quoted.isViewOnce && !quoted.isMedia) {
    return m.reply("❌ Responde al mensaje view once (una sola vista) para abrirlo.");
  }

  m.react("⏱️");

  try {
    let originalCaption = "";
    if (quoted.message?.[quoted.type]?.caption) {
      originalCaption = quoted.message[quoted.type].caption;
    } else if (quoted.body) {
      originalCaption = quoted.body;
    }

    const buffer = await quoted.download();
    if (!buffer) throw new Error("No se pudo descargar el medio");

    const caption = originalCaption ? `\`Mensaje :\`\n> ${originalCaption}` : "";

    if (quoted.isImage) {
      await sock.sendMessage(
        m.chat,
        {
          image: buffer,
          caption,
        },
        { quoted: m },
      );
    } else if (quoted.isVideo) {
      await sock.sendMessage(
        m.chat,
        {
          video: buffer,
          caption,
        },
        { quoted: m },
      );
    } else if (quoted.isAudio) {
      await sock.sendMessage(
        m.chat,
        {
          audio: buffer,
          mimetype: quoted.message?.[quoted.type]?.mimetype || "audio/mpeg",
        },
        { quoted: m },
      );
    } else {
      const ext = quoted.type?.replace("Message", "") || "bin";
      await sock.sendMessage(
        m.chat,
        {
          document: buffer,
          fileName: `rvo_${Date.now()}.${ext}`,
          mimetype:
            quoted.message?.[quoted.type]?.mimetype ||
            "application/octet-stream",
          caption: caption || "📎 View once media",
        },
        { quoted: m },
      );
    }

    m.react("✅");
  } catch (e) {
    m.react("☢");
    m.reply(`❌ No se pudo abrir el view once: ${e.message}`);
  }
}

export { pluginConfig as config, handler };
