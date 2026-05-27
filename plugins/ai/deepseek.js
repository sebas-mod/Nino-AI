import { DeepSeekThinking } from "../../src/scraper/deepseek.js";
import { saluranCtx } from "../../src/lib/ourin-context.js";
import te from "../../src/lib/ourin-error.js";

const pluginConfig = {
  name: "deepseek",
  alias: ["ds", "dsv4", "deepthink"],
  category: "ai",
  description: "Chat con DeepSeek V4 (razonamiento)",
  usage: ".deepseek <pregunta>",
  example: ".deepseek Explica los agujeros negros",
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
      `🧠 *DeepSeek V4*\n\n` +
        `IA que razona antes de responder — ideal para preguntas que requieren razonamiento.\n\n` +
        `*USO:*\n` +
        `> *${m.prefix}deepseek <pregunta>*\n\n` +
        `*EJEMPLO:*\n` +
        `> *${m.prefix}deepseek Jelaskan black hole*\n` +
        `> *${m.prefix}deepseek Crea código de un algoritmo de ordenamiento*\n\n` +
        `_El bot pensará primero y luego responderá — puede tardar un poco_`,
    );
  }

  await m.react("🕕");

  try {
    const result = await DeepSeekThinking(text);

    if (!result.success) {
      await m.react("☢");
      return m.reply(`❌ *DeepSeek falló*\n\n> No se pudo obtener respuesta`);
    }

    await m.react("✅");

    let reply = ``;

    if (result.reasoning) {
      const reasoningPreview =
        result.reasoning.length > 800
          ? result.reasoning.slice(0, 800) + "..."
          : result.reasoning;
      reply += `💭 *Proceso de razonamiento:*\n${reasoningPreview.replace(/\n/g, "\n> ")}\n\n`;
    }

    if (result.answer) {
      reply += `${result.answer}`;
    }

    if (reply.length > 4096) {
      reply = reply.slice(0, 4096) + "\n\n... (recortado)";
    }

    await m.reply(reply);
  } catch (e) {
    console.error(e);
    await m.react("☢");
    m.reply(te(m.prefix, m.command, m.pushName));
  }
}

export { pluginConfig as config, handler };
