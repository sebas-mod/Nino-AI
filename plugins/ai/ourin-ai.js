import { UnlimitedAI } from "../../src/scraper/unlimitedai.js";
import te from "../../src/lib/ourin-error.js";

const pluginConfig = {
  name: "nino-ai",
  alias: ["ourinai", "ourin"],
  category: "ai",
  description: "Chat con Nino AI — Asistente inteligente del bot",
  usage: ".nino-ai <pregunta>",
  example: ".nino-ai ¿Qué es Node.js?",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 10,
  energi: 2,
  isEnabled: true,
};

async function handler(m, { sock }) {
  const text = m.args.join(" ");
  if (!text) {
    return m.reply(
      `🤖 *Nino AI*\n\n` +
        `> Asistente inteligente listo para ayudar\n\n` +
        `*USO:*\n` +
        `> *${m.prefix}nino-ai <pregunta>*\n\n` +
        `*EJEMPLO:*\n` +
        `> *${m.prefix}nino-ai ¿Qué es Node.js?*`
    );
  }

  await m.react("🕕");

  try {
    const result = await UnlimitedAI(text, "ourin-ai");

    if (!result.status) {
      await m.react("☢");
      return m.reply(`❌ *Error de Nino AI*\n\n> ${result.error || "No se pudo obtener respuesta"}`);
    }

    await m.react("✅");
    const reply = result.answer;
    await m.reply(reply.length > 4096 ? reply.slice(0, 4096) + "..." : reply);
  } catch (e) {
    console.error(e);
    await m.react("☢");
    m.reply(te(m.prefix, m.command, m.pushName));
  }
}

export { pluginConfig as config, handler };
