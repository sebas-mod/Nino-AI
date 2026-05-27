import {
  renderLatexToPng,
  createMediaUploadFn,
} from "../../src/lib/ourin-latex.js";
import te from "../../src/lib/ourin-error.js";

const pluginConfig = {
  name: "math",
  alias: ["latex", "rumus"],
  category: "canvas",
  description: "Renderiza formulas matematicas (LaTeX) como imagen",
  usage: ".math <latex>",
  example: ".math E = mc^2 | \\frac{a}{b}",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 5,
  energi: 1,
  isEnabled: true,
};

async function handler(m, { sock }) {
  const input = m.text;

  if (!input) {
    return m.reply(
      `*RENDER MATEMATIKA*\n\n` +
        `Ejemplo:\n` +
        `• ${m.prefix}math E = mc^2\n` +
        `• ${m.prefix}math \\frac{a}{b}\n` +
        `• ${m.prefix}math E = mc^2 | \\frac{a}{b}`,
    );
  }

  m.react("🕕");

  try {
    // 🔥 support multi rumus pakai "|"
    const expressions = input
      .split("|")
      .map((v) => v.trim())
      .filter((v) => v.length > 0)
      .map((v) => ({
        latexExpression: v,
      }));

    const uploadFn = await createMediaUploadFn(sock);

    await sock.sendLatexInlineImage(
      m.chat,
      m.quoted,
      {
        text: "📐 " + input,
        expressions,
        headerText: "Formula Matematica",
        footer: "Powered by Nino AI",
      },
      renderLatexToPng,
      uploadFn,
    );

    m.react("✅");
  } catch (error) {
    console.error(error);
    m.react("☢");
    m.reply(te(m.prefix, m.command, m.pushName));
  }
}

export { pluginConfig as config, handler };
