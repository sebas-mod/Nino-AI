import fs from "fs";
import config from "../../config.js";
import { getDatabase } from "../../src/lib/ourin-database.js";
const pluginConfig = {
  name: "setgoodbyetype",
  alias: ["goodbyetype", "goodbyevariant", "goodbyestyle"],
  category: "owner",
  description: "Configurar variante visual del mensaje de despedida",
  usage: ".setgoodbyetype",
  example: ".setgoodbyetype",
  isOwner: true,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 3,
  energi: 0,
  isEnabled: true,
};
const VARIANTS = {
  1: {
    name: "Canvas Image",
    desc: "Imagen canvas con foto de perfil",
    emoji: "🎨",
  },
  2: {
    name: "Carousel Cards",
    desc: "Tarjeta carousel interactiva con botones",
    emoji: "🃏",
  },
  3: {
    name: "Text Only",
    desc: "Mensaje de texto minimalista sin imagen",
    emoji: "📝",
  },
  4: { name: "Group", desc: "ContextInfo group style", emoji: "👥" },
  5: { name: "Simple", desc: "Mensaje de texto simple + foto de perfil", emoji: "✨" },
};
async function handler(m, { sock, db }) {
  const args = m.args || [];
  const variant = args[0]?.toLowerCase();
  const current = db.setting("goodbyeType") || 1;
  if (variant && /^v?[1-5]$/.test(variant)) {
    const id = parseInt(variant.replace("v", ""));
    db.setting("goodbyeType", id);
    await db.save();
    await m.reply(
      `✅ *GOODBYE TIPO CAMBIADO*\n\n` +
        `${VARIANTS[id].emoji} *V${id} — ${VARIANTS[id].name}*\n` +
        `_${VARIANTS[id].desc}_`,
    );
    return;
  }
  const rows = [];
  for (const [id, val] of Object.entries(VARIANTS)) {
    const mark = parseInt(id) === current ? " ✓" : "";
    rows.push({
      title: `${val.emoji} V${id}${mark} — ${val.name}`,
      description: val.desc,
      id: `${m.prefix}setgoodbyetype v${id}`,
    });
  }
  const buttons = [
    {
      name: "single_select",
      buttonParamsJson: JSON.stringify({
        title: "👋 Elegir tipo de despedida",
        sections: [{ title: "Lista de tipos de despedida", rows }],
      }),
    },
  ];
  const bodyText =
    `👋🚪 *GOODBYE TYPE*\n\n` +
    `Configura la vista mensaje goodbye saat member salir del grupo 🚶💨\n` +
    `Tipe activo saat ini: *V${current} — ${VARIANTS[current].name}* 🎯\n\n` +
    `*PENJELASAN TIPE:*\n\n` +
    `- *V1 Canvas Image* 🎨 — El bot crea automaticamente una imagen canvas con la foto de perfil y el nombre del miembro que salio, luego la envia como imagen\n\n` +
    `- *V2 Carousel Cards* 🃏 — Muestra tarjetas carousel interactivas deslizable con botones de accion; ideal para una vista moderna\n\n` +
    `- *V3 Text Only* 📝 — Mensaje de texto normal sin imagen, ligero y minimalista\n\n` +
    `- *V4 Group* 👥 — Usa contextInfo estilo grupo reenviado, vista ordenada con etiqueta de newsletter\n\n` +
    `- *V5 Simple* ✨ — Mensaje de texto simple con foto de perfil del miembro que salio; discreto pero informativo\n\n` +
    `> Elige el tipo de despedida desde el boton de abajo 👇`;
  await sock.sendButton(
    m.chat,
    fs.readFileSync("./assets/images/ourin.jpg"),
    bodyText,
    m,
    { buttons },
  );
}
export { pluginConfig as config, handler };
