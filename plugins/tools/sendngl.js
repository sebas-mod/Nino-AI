import te from "../../src/lib/ourin-error.js";
import ourinApi from "../../src/lib/ourin-apimanager.js";
const pluginConfig = {
  name: "sendngl",
  alias: [],
  category: "tools",
  description: "Enviar NGL",
  usage: ".sendngl <url> | <text>",
  example: ".sendngl https://ngl.link/xxxx | hai",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 5,
  energi: 0,
  isEnabled: true,
};

async function handler(m, { sock }) {
  const text = m.text?.split("|");
  const [link, kata] = text;
  if (!link)
    return m.reply(
      `*¿DÓNDE ESTÁ EL LINK NGL?*\nEjemplo: \`${m?.prefix}sendngl https://ngl.link/xxxx | hai`,
    );
  if (!kata)
    return m.reply(
      `*¿DÓNDE ESTÁ EL TEXTO?*\n\nEjemplo: \`${m?.prefix}sendngl https://ngl.link/xxxx | hai`,
    );
  m.react("🎴");

  try {
    await ourinApi.cuki.sendNgl(
      {
        link,
        text: kata,
      },
      {
        timeout: 30000,
      },
    );

    m.react("✅");

    await sock.sendMessage(
      m.chat,
      {
        text: `✅ *DONE*\n\nMensaje enviado correctamente!\nObjetivo: ${link}\nMensaje: ${kata}`,
      },
      { quoted: m },
    );
  } catch (error) {
    m.react("☢");
    m.reply(te(m.prefix, m.command, m.pushName));
  }
}

export { pluginConfig as config, handler };
