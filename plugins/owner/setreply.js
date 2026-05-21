import fs from "fs";
import config from "../../config.js";
import { getDatabase } from "../../src/lib/ourin-database.js";
const pluginConfig = {
  name: "setreply",
  alias: ["replyvariant", "replystyle"],
  category: "owner",
  description: "Mengatur variant tampilan reply",
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
    desc: "Reply text biasa tanpa styling",
    emoji: "📝",
  },
  v2: {
    id: 2,
    name: "Context",
    desc: "Reply dengan contextInfo (thumbnail kecil)",
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
    desc: "Imagen panjang, tanpa centang biru",
    emoji: "�",
  },
  v9: {
    id: 9,
    name: "Video GIF",
    desc: "Video GIF, tanpa centang biru",
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
      await m.reply(`❌ *VARIANT TIDAK VALID*\n\nUsa: *v1* s/d *v11*`);
      return;
    }

    db.setting("replyVariant", selected.id);
    await db.save();

    await m.reply(
      `✅ *REPLY VARIANT DIUBAH*\n\n` +
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
        title: "💬 Pilih Variant Reply",
        sections: [{ title: "Daftar Variant Reply", rows }],
      }),
    },
  ];

  const bodyText =
    `💬📨 *REPLY VARIANT*\n\n` +
    `Atur tampilan balasan bot ketika membalas pesan user 💬✨\n` +
    `Variant aktif saat ini: *V${current} — ${VARIANTS[`v${current}`]?.name || "Desconocido"}* 🎯\n\n` +
    `*PENJELASAN VARIANT:*\n\n` +
    `- *V1 Simple* 📝 — Balasan text biasa tanpa styling apapun, paling ringan dan cepat\n\n` +
    `- *V2 Context* 🖼️ — Balasan dengan contextInfo berupa thumbnail kecil di sisi kiri pesan\n\n` +
    `- *V3 Forward* 📨 — Full contextInfo + label forwarded newsletter, terlihat seperti pesan forward dari channel\n\n` +
    `- *V4 Qkontak* ✅ — Sama seperti V3 tapi ditambah fake quoted reply dari kontak, muncul centang biru\n\n` +
    `- *V5 FakeTroli* 🛒 — Sama seperti V3 tapi ditambah faketroli quoted dengan thumbnail besar, tampilan seperti pesan troli\n\n` +
    `- *V6 Hehe* 📄 — Centang biru + dikirim sebagai document, cocok untuk pesan formal\n\n` +
    `- *V7 Andalan ku* 🖼️ — Centang biru + dikirim sebagai gambar, tampilan menarik dan profesional\n\n` +
    `- *V8 Imagen Panjang* 📏 — Imagen panjang tanpa centang biru, cocok untuk preview besar\n\n` +
    `- *V9 Video GIF* 🎬 — Dikirim sebagai video GIF tanpa centang biru, efek animasi menarik\n\n` +
    `- *V10 LinkPreview* 🔗 — Menggunakan sendPreview dengan fake quoted centang biru, ada preview link\n\n` +
    `- *V11 LinkPreview Mini* 📎 — Menggunakan sendPreview dengan thumbnail kecil di sisi kiri, simpel dan rapi\n\n` +
    `> Pilih variant reply dari tombol di bawah 👇`;

  await sock.sendButton(
    m.chat,
    fs.readFileSync("./assets/images/ourin.jpg"),
    bodyText,
    m,
    { buttons },
  );
}

export { pluginConfig as config, handler };
