import { Qwen3 } from "../../src/scraper/qwen3.js";
import { saluranCtx } from "../../src/lib/ourin-context.js";
import te from "../../src/lib/ourin-error.js";

const pluginConfig = {
  name: "qwen3",
  alias: ["qwen", "qw3"],
  category: "ai",
  description: "Chat con Qwen3 80B vía OverChat",
  usage: ".qwen3 <pregunta>",
  example: ".qwen3 ¿Qué es machine learning?",
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
      `🔵 *Qwen3 80B*\n\n` +
        `Pregúntale cualquier cosa a Qwen3 — un modelo grande de Alibaba que domina varios idiomas.\n\n` +
        `*USO:*\n` +
        `> *${m.prefix}qwen3 <pregunta>*\n\n` +
        `*EJEMPLO:*\n` +
        `> *${m.prefix}qwen3 Apa itu machine learning?*\n` +
        `> *${m.prefix}qwen3 Crea una receta de comida indonesia*\n\n` +
        `_Modelo 80B, puede tardar un poco pero responde muy bien_`
    );
  }

  await m.react("🕕");

  try {
    const result = await Qwen3(text);

    if (!result.status) {
      await m.react("☢");
      return m.reply(
        `❌ *Qwen3 falló*\n\n> ${result.error || "No se pudo obtener respuesta"}`
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
