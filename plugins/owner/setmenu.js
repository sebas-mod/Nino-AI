import fs from "fs";
import config from "../../config.js";
import { getDatabase } from "../../src/lib/ourin-database.js";
const pluginConfig = {
  name: "setmenu",
  alias: ["menuvariant", "menustyle"],
  category: "owner",
  description: "Mengatur variant tampilan menu",
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
    desc: "Image biasa tanpa contextInfo",
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
    desc: "Swipeable cards per kategori (modern)",
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
    desc: "NativeFlow alternatif",
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
    name: "Menu Versi 12",
    desc: "Layout khusus versi 12",
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
    name: "Menu Versi 14",
    desc: "Layout khusus versi 14",
    emoji: "🔢",
  },
  v15: {
    id: 15,
    name: "Menu Versi 15",
    desc: "Layout khusus versi 15",
    emoji: "🔢",
  },
  v16: {
    id: 16,
    name: "Menu Versi 16",
    desc: "Layout khusus versi 16",
    emoji: "🔢",
  },
};

async function handler(m, { sock, db }) {
  const args = m.args || [];
  const variant = args[0]?.toLowerCase();

  if (variant) {
    const selected = VARIANTS[variant];
    if (!selected) {
      await m.reply(`❌ *VARIANT TIDAK VALID*\n\nUsa: *v1* s/d *v16*`);
      return;
    }

    db.setting("menuVariant", selected.id);
    await db.save();

    await m.reply(
      `✅ *MENU VARIANT DIUBAH*\n\n` +
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
        title: "🎨 Pilih Variant Menu",
        sections: [{ title: "Daftar Variant Menu", rows }],
      }),
    },
  ];

  const bodyText =
    `🎨🖼️ *MENU VARIANT*\n\n` +
    `Atur tampilan menu utama bot ketika user mengetik perintah menu 📋✨\n` +
    `Variant aktif saat ini: *V${current} — ${VARIANTS[`v${current}`]?.name || "Desconocido"}* 🎯\n\n` +
    `*PENJELASAN VARIANT:*\n\n` +
    `- *V1 Simple* 🖼️ — Mengirim gambar menu biasa tanpa contextInfo, tampilan paling ringan\n\n` +
    `- *V2 Standard* ✅ — Imagen menu + full contextInfo dengan label newsletter, ini default bawaan\n\n` +
    `- *V3 Document* 📄 — Menu dikirim sebagai file document dengan thumbnail kecil dan verified quoted reply\n\n` +
    `- *V4 Video* 🎬 — Menu dikirim sebagai video dengan contextInfo dan centang biru\n\n` +
    `- *V5 Button* 🔘 — Imagen menu + tombol interaktif single_select dan quick_reply untuk navigasi kategori\n\n` +
    `- *V6 Document Premium* 💎 — Document dengan thumbnail besar 1280x450 + full contextInfo, tampilan premium\n\n` +
    `- *V7 Carousel* 🃏 — Swipeable cards per kategori, tampilan modern yang bisa digeser\n\n` +
    `- *V8 Minimalist* 🍃 — Imagen + ftroli quoted, desain bersih dan segar\n\n` +
    `- *V9 NativeFlow* ⚡ — Interactive message dengan limited_time_offer, bottom sheet, dan single_select\n\n` +
    `- *V10 NativeFlow V2* ⚡ — Versi alternatif NativeFlow dengan layout berbeda\n\n` +
    `- *V11 Document Interactive* 📑 — Document + nativeFlowMessage + limited_time_offer + CTA buttons\n\n` +
    `- *V12-V16* 🔢🧪 — Layout khusus versi eksperimental, bisa dikembangkan lebih lanjut\n\n` +
    `> Pilih variant menu dari tombol di bawah 👇`;

  await sock.sendButton(
    m.chat,
    fs.readFileSync("./assets/images/ourin.jpg"),
    bodyText,
    m,
    { buttons },
  );
}

export { pluginConfig as config, handler };
