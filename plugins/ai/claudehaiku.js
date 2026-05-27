import { ClaudeHaiku } from "../../src/scraper/claudehaiku.js";
import { saluranCtx } from "../../src/lib/ourin-context.js";
import te from "../../src/lib/ourin-error.js";

const pluginConfig = {
  name: "claudehaiku",
  alias: ["claude", "haiku", "chiku"],
  category: "ai",
  description: "Chat con Claude Haiku 4.5 vía OverChat",
  usage: ".claudehaiku <pregunta>",
  example: ".claudehaiku Explica la teoría de la relatividad",
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
      `🤍 *Claude Haiku 4.5*\n\n` +
        `Pregúntale cualquier cosa a Claude Haiku — rápido y ligero, ideal para preguntas diarias.\n\n` +
        `*USO:*\n` +
        `> *${m.prefix}claudehaiku <pregunta>*\n\n` +
        `*EJEMPLO:*\n` +
        `> *${m.prefix}claudehaiku Explica la teoría de la relatividad*\n` +
        `> *${m.prefix}claudehaiku Consejos para ser productivo*\n\n` +
        `_Respuesta rápida, pero inteligente_`
    );
  }

  await m.react("🕕");

  try {
    const result = await ClaudeHaiku(text);

    if (!result.status) {
      await m.react("☢");
      return m.reply(
        `❌ *Claude Haiku falló*\n\n> ${result.error || "No se pudo obtener respuesta"}`
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
