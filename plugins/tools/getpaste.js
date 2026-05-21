import axios from 'axios'
import * as timeHelper from '../../src/lib/ourin-time.js'
import te from '../../src/lib/ourin-error.js'
const pluginConfig = {
  name: "getpaste",
  alias: ["pastebin", "getpb"],
  category: "tools",
  description: "Obtiene contenido desde Pastebin",
  usage: ".getpaste <link pastebin>",
  example: ".getpaste https://pastebin.com/Gu8RZaqv",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 5,
  energi: 1,
  isEnabled: true,
};

async function handler(m, { sock }) {
  const text = m.text?.trim();

  if (!text || !text.includes("pastebin.com")) {
    return m.reply(
      `📋 *ɢᴇᴛ ᴘᴀsᴛᴇʙɪɴ*\n\n` +
        `> Ingresa un enlace válido de Pastebin\n\n` +
        `> Ejemplo: \`${m.prefix}getpaste https://pastebin.com/Gu8RZaqv\``,
    );
  }

  m.react("📋");

  try {
    const apiUrl = `https://zelapioffciall.koyeb.app/tools/pastebin?url=${encodeURIComponent(text)}`;
    const { data } = await axios.get(apiUrl, { timeout: 15000 });

    if (!data.status || !data.content) {
      throw new Error("No se pudo obtener el contenido de ese enlace.");
    }

    const lineCount = data.content.split("\n").length;
    const timestamp = timeHelper.formatDateTime("DD MMMM YYYY HH:mm:ss");

    const caption =
      `📋 *ᴋᴏɴᴛᴇɴ ᴘᴀsᴛᴇʙɪɴ*\n\n` +
      `> 🕹 ID: ${data.paste_id || "Desconocido"}\n` +
      `> 📆 Waktu: ${timestamp}\n` +
      `> 📝 Jumlah Baris: ${lineCount}\n\n` +
      `\`\`\`\n${data.content.substring(0, 3000)}${data.content.length > 3000 ? "\n... (terpotong)" : ""}\n\`\`\``;

    await m.reply(caption);
    m.react("✅");
  } catch (err) {
    m.react('☢');
    m.reply(te(m.prefix, m.command, m.pushName))
  }
}

export { pluginConfig as config, handler }