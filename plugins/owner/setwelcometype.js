import fs from "fs";
import config from "../../config.js";
import { getDatabase } from "../../src/lib/ourin-database.js";
const pluginConfig = {
  name: "setwelcometype",
  alias: ["welcometype", "welcomevariant", "welcomestyle"],
  category: "owner",
  description: "Configurar variante visual del mensaje de bienvenida",
  usage: ".setwelcometype",
  example: ".setwelcometype",
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
  const current = db.setting("welcomeType") || 1;
  if (variant && /^v?[1-5]$/.test(variant)) {
    const id = parseInt(variant.replace("v", ""));
    db.setting("welcomeType", id);
    await db.save();
    await m.reply(
      `✅ *WELCOME TIPO CAMBIADO*\n\n` +
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
      id: `${m.prefix}setwelcometype v${id}`,
    });
  }
  const buttons = [
    {
      name: "single_select",
      buttonParamsJson: JSON.stringify({
        title: "👋 Elegir tipo de bienvenida",
        sections: [{ title: "Lista de tipos de bienvenida", rows }],
      }),
    },
  ];
  const bodyText =
    `👋🎨 *WELCOME TYPE*\n\n` +
    `Configura la vista mensaje welcome saat member baru masuk grupos 🚪✨\n` +
    `Tipe activo saat ini: *V${current} — ${VARIANTS[current].name}* 🎯\n\n` +
    `*PENJELASAN TIPE:*\n\n` +
    `- *V1 Canvas Image* 🎨 — El bot crea automaticamente una imagen canvas con foto de perfil y nombre del nuevo miembro, luego la envia como imagen\n\n` +
    `- *V2 Carousel Cards* 🃏 — Menampilkan kartu carousel interactivo yang bisa di-swipe lengkap dengan tombol action, ideal para grupos que quieren una vista moderna\n\n` +
    `- *V3 Text Only* 📝 — Mensaje de texto normal sin imagen, ligero y minimalista\n\n` +
    `- *V4 Group* 👥 — Usa contextInfo estilo grupo reenviado, vista ordenada con etiqueta de newsletter\n\n` +
    `- *V5 Simple* ✨ — Mensaje de texto simple con foto de perfil del miembro que entra; discreto pero informativo\n\n` +
    `> Elige el tipo de bienvenida desde el boton de abajo 👇`;
  await sock.sendButton(
    m.chat,
    fs.readFileSync("./assets/images/ourin.jpg"),
    bodyText,
    m,
    { buttons },
  );
}
export { pluginConfig as config, handler };
