import fs from "fs";
import config from "../../config.js";
import { getDatabase } from "../../src/lib/ourin-database.js";
const pluginConfig = {
  name: "setallmenu",
  alias: ["allmenuvariant", "allmenustyle"],
  category: "owner",
  description: "Configurar variante visual de allmenu",
  usage: ".setallmenu <v1-v5>",
  example: ".setallmenu v2",
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
    desc: "Texto normal sin imagen/contextInfo",
    emoji: "📝",
  },
  v2: {
    id: 2,
    name: "Image + Context",
    desc: "Image + full contextInfo + forwardedNewsletter",
    emoji: "🖼️",
  },
  v3: {
    id: 3,
    name: "Document",
    desc: "Document + jpegThumbnail + contextInfo + verified quoted",
    emoji: "📄",
  },
  v4: {
    id: 4,
    name: "Interactive Button",
    desc: "Mensaje interactivo + single_select de categoria + quick_reply",
    emoji: "🔘",
  },
  v5: {
    id: 5,
    name: "NativeFlow",
    desc: "NativeFlow + limited_time_offer + interactive buttons",
    emoji: "✨",
  },
};

async function handler(m, { sock, db }) {
  const args = m.args || [];
  const variant = args[0]?.toLowerCase();

  if (variant) {
    const selected = VARIANTS[variant];
    if (!selected) {
      await m.reply(`❌ *VARIANTE NO VALIDA*\n\nUsa: *v1* hasta *v5*`);
      return;
    }

    db.setting("allmenuVariant", selected.id);
    await db.save();

    await m.reply(
      `✅ *ALLMENU VARIANTE CAMBIADA*\n\n` +
        `${selected.emoji} *V${selected.id} — ${selected.name}*\n` +
        `_${selected.desc}_`,
    );
    return;
  }

  const current =
    db.setting("allmenuVariant") || config.ui?.allmenuVariant || 2;

  const rows = [];
  for (const [key, val] of Object.entries(VARIANTS)) {
    const mark = val.id === current ? " ✓" : "";
    rows.push({
      title: `${val.emoji} ${key.toUpperCase()}${mark} — ${val.name}`,
      description: val.desc,
      id: `${m.prefix}setallmenu ${key}`,
    });
  }
  const buttons = [
    {
      name: "single_select",
      buttonParamsJson: JSON.stringify({
        title: "📋 Elegir variante de Allmenu",
        sections: [{ title: "Lista de variantes de Allmenu", rows }],
      }),
    },
  ];

  const bodyText =
    `📋📑 *ALLMENU VARIANT*\n\n` +
    `Configura la vista allmenu que muestra toda la lista de comandos del bot en una pagina 📖✨\n` +
    `Variante activa actual: *V${current} — ${VARIANTS[`v${current}`]?.name || "Desconocido"}* 🎯\n\n` +
    `*EXPLICACION DE VARIANTES:*\n\n` +
    `- *V1 Simple Text* 📝 — La lista de comandos se muestra como texto normal sin imagen ni contextInfo; es la mas ligera y rapida\n\n` +
    `- *V2 Image + Context* 🖼️ — Imagen de cabecera allmenu + contextInfo completo con etiqueta de newsletter reenviada; vista estandar e informativa\n\n` +
    `- *V3 Document* 📄 — Allmenu se envia como documento con miniatura pequena y respuesta citada verificada; parece un archivo oficial\n\n` +
    `- *V4 Interactive Button* 🔘 — Mensaje interactivo con boton single_select para elegir categoria y quick_reply para navegar; vista moderna\n\n` +
    `- *V5 NativeFlow* ✨ — Mensaje NativeFlow con badge limited_time_offer y botones interactivos; vista mas premium y llamativa\n\n` +
    `> Elige la variante de allmenu desde el boton de abajo 👇`;

  await sock.sendButton(
    m.chat,
    fs.readFileSync("./assets/images/ourin.jpg"),
    bodyText,
    m,
    { buttons },
  );
}

export { pluginConfig as config, handler };
