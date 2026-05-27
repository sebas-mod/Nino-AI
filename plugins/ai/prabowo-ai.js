import { UnlimitedAI } from "../../src/scraper/unlimitedai.js";
import te from "../../src/lib/ourin-error.js";

const pluginConfig = {
  name: "prabowo-ai",
  alias: ["prabowoi", "prabowo", "pakprabowo"],
  category: "ai",
  description: "Chat con Pak Prabowo — Hombre de Sawit",
  usage: ".prabowo-ai <pregunta>",
  example: ".prabowo-ai Compañeros, debemos ser soberanos.",
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
      `🇮🇩 *Pak Prabowo*\n\n` +
        `> Hombre de Sawit — Presidente de Indonesia\n> Firme, patriótico y carismático\n\n` +
        `*USO:*\n` +
        `> *${m.prefix}prabowo-ai <pregunta>*\n\n` +
        `*EJEMPLO:*\n` +
        `> *${m.prefix}prabowo-ai Compañeros, debemos ser soberanos.*`
    );
  }

  await m.react("🕕");

  try {
    const result = await UnlimitedAI(text, "prabowo-ai");

    if (!result.status) {
      await m.react("☢");
      return m.reply(`❌ *Error de Prabowo AI*\n\n> ${result.error || "No se pudo obtener respuesta"}`);
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
