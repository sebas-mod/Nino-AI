import fs from "fs";
import config from "../../config.js";
import { getDatabase } from "../../src/lib/ourin-database.js";
const pluginConfig = {
  name: "setmenucat",
  alias: ["menucatvariant", "menucatstyle"],
  category: "owner",
  description: "Mengatur variant tampilan menucat",
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
    desc: "Interactive message + single_select commands + quick_reply back",
    emoji: "🔘",
  },
};

async function handler(m, { sock, db }) {
  const args = m.args || [];
  const variant = args[0]?.toLowerCase();

  if (variant) {
    const selected = VARIANTS[variant];
    if (!selected) {
      await m.reply(`❌ *VARIANT TIDAK VALID*\n\nUsa: *v1* s/d *v4*`);
      return;
    }

    db.setting("menucatVariant", selected.id);
    await db.save();

    await m.reply(
      `✅ *MENUCAT VARIANT DIUBAH*\n\n` +
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
        title: "📂 Pilih Variant Menucat",
        sections: [{ title: "Daftar Variant Menucat", rows }],
      }),
    },
  ];

  const bodyText =
    `📂🗂️ *MENUCAT VARIANT*\n\n` +
    `Atur tampilan menu per kategori ketika user memilih kategori dari menu utama 📋✨\n` +
    `Variant aktif saat ini: *V${current} — ${VARIANTS[`v${current}`]?.name || "Desconocido"}* 🎯\n\n` +
    `*PENJELASAN VARIANT:*\n\n` +
    `- *V1 Simple Text* 📝 — Daftar perintah per kategori ditampilkan sebagai text biasa tanpa contextInfo, paling ringan dan cepat\n\n` +
    `- *V2 Context + Newsletter* 📨 — Text + contextInfo dengan label forwarded newsletter, terlihat seperti pesan forward dari channel bot\n\n` +
    `- *V3 Image + Caption* 📸 — Imagen header kategori + caption berisi daftar perintah + contextInfo + label newsletter, tampilan visual dan informatif\n\n` +
    `- *V4 Interactive Button* 🔘 — Pesan interaktif dengan tombol single_select untuk memilih perintah dan quick_reply untuk kembali ke menu utama, tampilan modern dan mudah dinavigasi\n\n` +
    `> Pilih variant menucat dari tombol di bawah 👇`;

  await sock.sendButton(
    m.chat,
    fs.readFileSync("./assets/images/ourin.jpg"),
    bodyText,
    m,
    { buttons },
  );
}

export { pluginConfig as config, handler };
