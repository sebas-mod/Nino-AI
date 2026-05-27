import { GPT5 } from "../../src/scraper/gpt5.js";
import { saluranCtx } from "../../src/lib/ourin-context.js";
import te from "../../src/lib/ourin-error.js";

const pluginConfig = {
  name: "gpt5",
  alias: ["gpt5nano", "gpt41"],
  category: "ai",
  description: "Chat con GPT-4.1 Nano vía OverChat",
  usage: ".gpt5 <pregunta>",
  example: ".gpt5 ¿Qué es la computación cuántica?",
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
      `🤖 *GPT-4.1 Nano*\n\n` +
        `Pregúntale cualquier cosa a la IA y responderá con el modelo GPT-4.1 Nano.\n\n` +
        `*USO:*\n` +
        `> *${m.prefix}gpt5 <pregunta>*\n\n` +
        `*EJEMPLO:*\n` +
        `> *${m.prefix}gpt5 ¿Qué es la computación cuántica?*\n` +
        `> *${m.prefix}gpt5 Crea un poema sobre Indonesia*\n\n` +
        `_La respuesta puede tardar un poco, ten paciencia_`,
    );
  }

  await m.react("🕕");

  try {
    const result = await GPT5(text);

    if (!result.status) {
      await m.react("☢");
      return m.reply(
        `❌ *GPT-5 falló*\n\n> ${result.error || "No se pudo obtener respuesta"}`,
      );
    }

    await m.react("✅");

    const reply = `${result.answer}`;

    await m.reply(reply.length > 4096 ? reply.slice(0, 4096) + "..." : reply, {
      contextInfo: saluranCtx(),
    });
  } catch (e) {
    console.error(e);
    await m.react("☢");
    m.reply(te(m.prefix, m.command, m.pushName));
  }
}

export { pluginConfig as config, handler };
