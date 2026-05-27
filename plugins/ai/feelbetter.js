import { FeelBetter } from "../../src/scraper/feeb.js";
import { saluranCtx } from "../../src/lib/ourin-context.js";
import te from "../../src/lib/ourin-error.js";

const pluginConfig = {
  name: "feelbetter",
  alias: ["fb", "feelbetterbot", "healing"],
  category: "ai",
  description: "Chat con FeelBetterBot — IA lista para escuchar sin juzgar",
  usage: ".feelbetter <desahogo/pregunta>",
  example: ".feelbetter estoy triste",
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
      `💚 *FeelBetterBot*\n\n` +
        `IA lista para escuchar lo que quieras contar — sin juzgar, con calidez y empatía.\n\n` +
        `*USO:*\n` +
        `> *${m.prefix}feelbetter <desahogo>*\n\n` +
        `*EJEMPLO:*\n` +
        `> *${m.prefix}feelbetter lagi sedih nih*\n` +
        `> *${m.prefix}feelbetter últimamente estoy muy cansado*\n\n` +
        `_Este bot no reemplaza a un profesional, pero puede ser un espacio seguro para desahogarte_`
    );
  }

  await m.react("🕕");

  try {
    const result = await FeelBetter(text);

    if (!result.status) {
      await m.react("☢");
      return m.reply(
        `❌ *FeelBetter falló*\n\n> ${result.error || "No se pudo obtener respuesta"}`
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
