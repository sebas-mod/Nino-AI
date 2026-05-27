import te from "../../src/lib/ourin-error.js";
import ourinApi from "../../src/lib/ourin-apimanager.js";
const pluginConfig = {
  name: "gpt4o",
  alias: ["gpt4"],
  category: "ai",
  description: "Chat con GPT-4o",
  usage: ".gpt4o <pregunta>",
  example: ".gpt4o Hola, ¿cómo estás?",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 5,
  energi: 1,
  isEnabled: true,
};

async function handler(m, { sock }) {
  const text = m.args.join(" ");
  if (!text) {
    return m.reply(
      `🧠 *ɢᴘᴛ-4ᴏ*\n\n> Ingresa una pregunta\n\n\`Ejemplo: ${m.prefix}gpt4o Hola, ¿cómo estás?\``,
    );
  }

  m.react("🕕");

  try {
    const data = await ourinApi.covenant.gpt4(text);

    m.react("✅");
    await m.reply(`${data.data.result}`);
  } catch (error) {
    console.log(error);
    m.react("☢");
    m.reply(te(m.prefix, m.command, m.pushName));
  }
}

export { pluginConfig as config, handler };
