import fs from "fs";
import config from "../../config.js";
import { getDatabase } from "../../src/lib/ourin-database.js";
const pluginConfig = {
  name: "setmenu",
  alias: ["menuvariant", "menustyle"],
  category: "owner",
  description: "Configurar variante visual del menu",
  usage: ".setmenu <v1-v16>",
  example: ".setmenu v8",
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
    name: "Simple",
    desc: "Imagen normal sin contextInfo",
    emoji: "🖼️",
  },
  v2: {
    id: 2,
    name: "Standard",
    desc: "Image + full contextInfo (default)",
    emoji: "✅",
  },
  v3: {
    id: 3,
    name: "Document",
    desc: "Document + jpegThumbnail + verified quoted",
    emoji: "📄",
  },
  v4: {
    id: 4,
    name: "Video",
    desc: "Video + contextInfo + verified quoted",
    emoji: "🎬",
  },
  v5: {
    id: 5,
    name: "Button",
    desc: "Image + buttons (single_select & quick_reply)",
    emoji: "🔘",
  },
  v6: {
    id: 6,
    name: "Document Premium",
    desc: "Document + jpegThumbnail 1280x450 + full contextInfo",
    emoji: "💎",
  },
  v7: {
    id: 7,
    name: "Carousel",
    desc: "Tarjetas deslizables por categoria (moderno)",
    emoji: "🃏",
  },
  v8: {
    id: 8,
    name: "Minimalist",
    desc: "Image + ftroli quoted + fresh design",
    emoji: "🍃",
  },
  v9: {
    id: 9,
    name: "NativeFlow",
    desc: "Interactive + limited_time_offer + bottom_sheet + single_select",
    emoji: "⚡",
  },
  v10: {
    id: 10,
    name: "NativeFlow V2",
    desc: "NativeFlow alternativo",
    emoji: "⚡",
  },
  v11: {
    id: 11,
    name: "Document Interactive",
    desc: "Document + nativeFlowMessage + limited_time_offer + cta buttons",
    emoji: "📑",
  },
  v12: {
    id: 12,
    name: "Menu version 12",
    desc: "Layout especial version 12",
    emoji: "🔢",
  },
  v13: {
    id: 13,
    name: "Canvas Thumbnail",
    desc: "Document style V6 + Canvas Banner Thumbnail",
    emoji: "🎨",
  },
  v14: {
    id: 14,
    name: "Menu version 14",
    desc: "Layout especial version 14",
    emoji: "🔢",
  },
  v15: {
    id: 15,
    name: "Menu version 15",
    desc: "Layout especial version 15",
    emoji: "🔢",
  },
  v16: {
    id: 16,
    name: "Menu version 16",
    desc: "Layout especial version 16",
    emoji: "🔢",
  },
};

async function handler(m, { sock, db }) {
  const args = m.args || [];
  const variant = args[0]?.toLowerCase();

  if (variant) {
    const selected = VARIANTS[variant];
    if (!selected) {
      await m.reply(`❌ *VARIANTE NO VALIDA*\n\nUsa: *v1* hasta *v16*`);
      return;
    }

    db.setting("menuVariant", selected.id);
    await db.save();

    await m.reply(
      `✅ *MENU VARIANTE CAMBIADA*\n\n` +
        `${selected.emoji} *V${selected.id} — ${selected.name}*\n` +
        `_${selected.desc}_`,
    );
    return;
  }

  const current = db.setting("menuVariant") || config.ui?.menuVariant || 2;

  const rows = [];
  for (const [key, val] of Object.entries(VARIANTS)) {
    const mark = val.id === current ? " ✓" : "";
    rows.push({
      title: `${val.emoji} ${key.toUpperCase()}${mark} — ${val.name}`,
      description: val.desc,
      id: `${m.prefix}setmenu ${key}`,
    });
  }
  const buttons = [
    {
      name: "single_select",
      buttonParamsJson: JSON.stringify({
        title: "🎨 Elegir variante de Menu",
        sections: [{ title: "Lista de variantes de Menu", rows }],
      }),
    },
  ];

  const bodyText =
    `🎨🖼️ *MENU VARIANT*\n\n` +
    `Configura la vista del menu principal del bot cuando el usuario escribe el comando menu 📋✨\n` +
    `Variante activa actual: *V${current} — ${VARIANTS[`v${current}`]?.name || "Desconocido"}* 🎯\n\n` +
    `*EXPLICACION DE VARIANTES:*\n\n` +
    `- *V1 Simple* 🖼️ — Envia una imagen de menu normal sin contextInfo; la vista mas ligera\n\n` +
    `- *V2 Standard* ✅ — Imagen de menu + contextInfo completo con etiqueta de newsletter; es el valor por defecto\n\n` +
    `- *V3 Document* 📄 — El menu se envia como documento con miniatura pequena y respuesta citada verificada\n\n` +
    `- *V4 Video* 🎬 — El menu se envia como video con contextInfo y marca azul\n\n` +
    `- *V5 Button* 🔘 — Imagen de menu + botones interactivos single_select y quick_reply para navegar categorias\n\n` +
    `- *V6 Document Premium* 💎 — Documento con miniatura grande 1280x450 + contextInfo completo; vista premium\n\n` +
    `- *V7 Carousel* 🃏 — Tarjetas deslizables por categoria; vista moderna\n\n` +
    `- *V8 Minimalist* 🍃 — Imagen + ftroli quoted; diseno limpio y fresco\n\n` +
    `- *V9 NativeFlow* ⚡ — Mensaje interactivo con limited_time_offer, bottom sheet y single_select\n\n` +
    `- *V10 NativeFlow V2* ⚡ — Version alternativa de NativeFlow con layout diferente\n\n` +
    `- *V11 Document Interactive* 📑 — Document + nativeFlowMessage + limited_time_offer + CTA buttons\n\n` +
    `- *V12-V16* 🔢🧪 — Layout especial de version experimental, puede desarrollarse mas\n\n` +
    `> Elige la variante de menu desde el boton de abajo 👇`;

  await sock.sendButton(
    m.chat,
    fs.readFileSync("./assets/images/ourin.jpg"),
    bodyText,
    m,
    { buttons },
  );
}

export { pluginConfig as config, handler };
