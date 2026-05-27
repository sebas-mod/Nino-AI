import fs from "fs";
import config from "../../config.js";
import { getDatabase } from "../../src/lib/ourin-database.js";
const pluginConfig = {
  name: "setreply",
  alias: ["replyvariant", "replystyle"],
  category: "owner",
  description: "Configurar variante visual de respuesta",
  usage: ".setreply <v1-v11>",
  example: ".setreply v5",
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
    desc: "Respuesta de texto normal sin estilos",
    emoji: "📝",
  },
  v2: {
    id: 2,
    name: "Context",
    desc: "Respuesta con contextInfo (miniatura pequena)",
    emoji: "🖼️",
  },
  v3: {
    id: 3,
    name: "Forward",
    desc: "Full contextInfo + forwardedNewsletter",
    emoji: "📨",
  },
  v4: {
    id: 4,
    name: "Qkontak",
    desc: "V3 + fake quoted reply (centang biru)",
    emoji: "✅",
  },
  v5: {
    id: 5,
    name: "FakeTroli",
    desc: "V3 + faketroli quoted + large thumbnail",
    emoji: "🛒",
  },
  v6: { id: 6, name: "Hehe", desc: "Centang biru + document", emoji: "📄" },
  v7: { id: 7, name: "Andalan ku", desc: "Centang biru + gambar", emoji: "�️" },
  v8: {
    id: 8,
    name: "Imagen Panjang",
    desc: "Imagen larga, sin marca azul",
    emoji: "�",
  },
  v9: {
    id: 9,
    name: "Video GIF",
    desc: "Video GIF, sin marca azul",
    emoji: "🎬",
  },
  v10: {
    id: 10,
    name: "LinkPreview",
    desc: "sendPreview + fake quoted (centang biru)",
    emoji: "🔗",
  },
  v11: {
    id: 11,
    name: "LinkPreview Mini",
    desc: "sendPreview thumbnail kecil",
    emoji: "�",
  },
};

async function handler(m, { sock, db }) {
  const args = m.args || [];
  const variant = args[0]?.toLowerCase();

  if (variant) {
    const selected = VARIANTS[variant];
    if (!selected) {
      await m.reply(`❌ *VARIANTE NO VALIDA*\n\nUsa: *v1* hasta *v11*`);
      return;
    }

    db.setting("replyVariant", selected.id);
    await db.save();

    await m.reply(
      `✅ *REPLY VARIANTE CAMBIADA*\n\n` +
        `${selected.emoji} *V${selected.id} — ${selected.name}*\n` +
        `_${selected.desc}_`,
    );
    return;
  }

  const current = db.setting("replyVariant") || config.ui?.replyVariant || 1;

  const rows = [];
  for (const [key, val] of Object.entries(VARIANTS)) {
    const mark = val.id === current ? " ✓" : "";
    rows.push({
      title: `${val.emoji} ${key.toUpperCase()}${mark} — ${val.name}`,
      description: val.desc,
      id: `${m.prefix}setreply ${key}`,
    });
  }
  const buttons = [
    {
      name: "single_select",
      buttonParamsJson: JSON.stringify({
        title: "💬 Elegir variante de respuesta",
        sections: [{ title: "Lista de variantes de respuesta", rows }],
      }),
    },
  ];

  const bodyText =
    `💬📨 *REPLY VARIANT*\n\n` +
    `Configura la vista de las respuestas del bot cuando responde mensajes del usuario 💬✨\n` +
    `Variante activa actual: *V${current} — ${VARIANTS[`v${current}`]?.name || "Desconocido"}* 🎯\n\n` +
    `*EXPLICACION DE VARIANTES:*\n\n` +
    `- *V1 Simple* 📝 — Respuesta de texto normal sin ningun estilo, la mas ligera y rapida\n\n` +
    `- *V2 Context* 🖼️ — Respuesta con contextInfo de miniatura pequena al lado izquierdo del mensaje\n\n` +
    `- *V3 Forward* 📨 — ContextInfo completo + etiqueta de newsletter reenviada; parece mensaje reenviado desde el canal\n\n` +
    `- *V4 Qkontak* ✅ — Igual que V3, pero agrega respuesta citada falsa de contacto y aparece marca azul\n\n` +
    `- *V5 FakeTroli* 🛒 — Igual que V3, pero agrega faketroli quoted con miniatura grande; vista tipo mensaje troli\n\n` +
    `- *V6 Hehe* 📄 — Marca azul + enviado como documento; ideal para mensajes formales\n\n` +
    `- *V7 Andalan ku* 🖼️ — Marca azul + enviado como imagen; vista atractiva y profesional\n\n` +
    `- *V8 Imagen Panjang* 📏 — Imagen larga sin marca azul; ideal para previews grandes\n\n` +
    `- *V9 Video GIF* 🎬 — Enviado como video GIF sin marca azul; efecto animado atractivo\n\n` +
    `- *V10 LinkPreview* 🔗 — Usa sendPreview con fake quoted de marca azul y preview de link\n\n` +
    `- *V11 LinkPreview Mini* 📎 — Usa sendPreview con miniatura pequena a la izquierda; simple y ordenado\n\n` +
    `> Elige la variante de respuesta desde el boton de abajo 👇`;

  await sock.sendButton(
    m.chat,
    fs.readFileSync("./assets/images/ourin.jpg"),
    bodyText,
    m,
    { buttons },
  );
}

export { pluginConfig as config, handler };
