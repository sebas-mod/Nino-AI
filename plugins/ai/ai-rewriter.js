import config from "../../config.js";
import te from "../../src/lib/ourin-error.js";
import ourinApi from "../../src/lib/ourin-apimanager.js";

const pluginConfig = {
  name: "ai-rewriter",
  alias: ["airewriter", "rewriteai"],
  category: "ai",
  description: "Reescribe texto con un tono específico",
  usage: ".ai-rewriter <texto> | <tono>",
  example: ".ai-rewriter hola a todos | profesional",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 5,
  energi: 1,
  isEnabled: true,
};

function parseRewriteInput(input) {
  const value = String(input || "").trim();
  if (!value) return { text: "", tone: "professional" };

  const parts = value
    .split("|")
    .map((item) => item.trim())
    .filter(Boolean);
  if (parts.length === 0) return { text: "", tone: "professional" };
  if (parts.length === 1) return { text: parts[0], tone: "professional" };

  return {
    text: parts[0],
    tone: parts.slice(1).join(" | ") || "professional",
  };
}

async function handler(m) {
  const parsed = parseRewriteInput(m.text);

  if (!parsed.text) {
    return m.reply(
      `✍️ *AI REWRITER*\n\n` +
        `> Reescribe texto con un tono específico\n\n` +
        `\`Ejemplo: ${m.prefix}ai-rewriter Hola a todos | profesional\``,
    );
  }

  if (!config.APIkey?.covenant) {
    return m.reply("❌ La API key de covenant no está configurada.");
  }

  m.react("🕕");

  try {
    const data = await ourinApi.covenant.rewrite(
      {
        text: parsed.text,
        tone: parsed.tone,
      },
      {
        timeout: 30000,
      },
    );

    if (!data?.status || !data?.data?.result) {
      throw new Error(data?.message || "No se pudo reescribir el texto");
    }

    m.react("✅");
    await m.reply(
      `✍️ *AI REWRITER*\n\n` +
        `> Tono: ${parsed.tone}\n` +
        `> Costo: ${data?.usage?.cost ?? "-"}\n` +
        `> Créditos restantes: ${data?.usage?.remaining ?? "-"}\n\n` +
        `${data.data.result}`,
    );
  } catch (error) {
    m.react("☢");
    const message = error?.response?.data?.message || error?.message;
    if (message) {
      return m.reply(`❌ ${message}`);
    }
    m.reply(te(m.prefix, m.command, m.pushName));
  }
}

export { pluginConfig as config, handler };
