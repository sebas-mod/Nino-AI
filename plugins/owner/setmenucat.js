import fs from "fs";
import config from "../../config.js";
import { getDatabase } from "../../src/lib/ourin-database.js";
const pluginConfig = {
  name: "setmenucat",
  alias: ["menucatvariant", "menucatstyle"],
  category: "owner",
  description: "Configurar variante visual del menucat",
  usage: ".setmenucat <v1-v4>",
  example: ".setmenucat v2",
  isOwner: true,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 3,
  energi: 0,
  isEnabled: true,
};

const VARIANTS = {
  v1: {
    id: 1,
    name: "Simple Text",
    desc: "Text biasa tanpa contextInfo",
    emoji: "📝",
  },
  v2: {
    id: 2,
    name: "Context + Newsletter",
    desc: "Text + contextInfo + forwardedNewsletter",
    emoji: "�",
  },
  v3: {
    id: 3,
    name: "Image + Caption",
    desc: "Image + caption + contextInfo + forwardedNewsletter",
    emoji: "📸",
  },
  v4: {
    id: 4,
    name: "Interactive Button",
    desc: "Interactive message + single_select comandos + quick_reply back",
    emoji: "🔘",
  },
};

async function handler(m, { sock, db }) {
  const args = m.args || [];
  const variant = args[0]?.toLowerCase();

  if (variant) {
    const selected = VARIANTS[variant];
    if (!selected) {
      await m.reply(`❌ *VARIANTE NO VALIDA*\n\nUsa: *v1* hasta *v4*`);
      return;
    }

    db.setting("menucatVariant", selected.id);
    await db.save();

    await m.reply(
      `✅ *MENUCAT VARIANTE CAMBIADA*\n\n` +
        `${selected.emoji} *V${selected.id} — ${selected.name}*\n` +
        `_${selected.desc}_`,
    );
    return;
  }

  const current =
    db.setting("menucatVariant") || config.ui?.menucatVariant || 2;

  const rows = [];
  for (const [key, val] of Object.entries(VARIANTS)) {
    const mark = val.id === current ? " ✓" : "";
    rows.push({
      title: `${val.emoji} ${key.toUpperCase()}${mark} — ${val.name}`,
      description: val.desc,
      id: `${m.prefix}setmenucat ${key}`,
    });
  }
  const buttons = [
    {
      name: "single_select",
      buttonParamsJson: JSON.stringify({
        title: "📂 Elegir variante de Menucat",
        sections: [{ title: "Lista de variantes de Menucat", rows }],
      }),
    },
  ];

  const bodyText =
    `📂🗂️ *MENUCAT VARIANT*\n\n` +
    `Configura la vista del menu por categoria cuando el usuario elige una categoria desde el menu principal 📋✨\n` +
    `Variante activa actual: *V${current} — ${VARIANTS[`v${current}`]?.name || "Desconocido"}* 🎯\n\n` +
    `*EXPLICACION DE VARIANTES:*\n\n` +
    `- *V1 Simple Text* 📝 — La lista de comandos por categoria se muestra como texto normal sin contextInfo; es la mas ligera y rapida\n\n` +
    `- *V2 Context + Newsletter* 📨 — Texto + contextInfo con etiqueta de newsletter reenviada; parece un mensaje reenviado desde el canal del bot\n\n` +
    `- *V3 Image + Caption* 📸 — Imagen de cabecera de categoria + caption con lista de comandos + contextInfo + etiqueta de newsletter; vista visual e informativa\n\n` +
    `- *V4 Interactive Button* 🔘 — Mensaje interactivo con boton single_select para elegir comandos y quick_reply para volver al menu principal; vista moderna y facil de navegar\n\n` +
    `> Elige la variante de menucat desde el boton de abajo 👇`;

  await sock.sendButton(
    m.chat,
    fs.readFileSync("./assets/images/ourin.jpg"),
    bodyText,
    m,
    { buttons },
  );
}

export { pluginConfig as config, handler };
