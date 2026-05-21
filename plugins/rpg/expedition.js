import { getDatabase } from "../../src/lib/ourin-database.js";
import { addExpWithLevelCheck } from "../../src/lib/ourin-level.js";

const pluginConfig = {
  name: "expedition",
  alias: ["expedicion", "exp", "explore"],
  category: "rpg",
  description: "Kirim expedicion otomatis para item",
  usage: ".expedition <start/claim/status>",
  example: ".expedition start forest",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 10,
  energi: 0,
  isEnabled: true,
};

const EXPEDITIONS = {
  forest: { name: "🌲 Hutan Laba-laba", duration: 1800000, rewards: ["wood", "herb", "mushroom"], exp: 100, minLevel: 1 },
  cave: { name: "🏔️ Gua Kelelawar", duration: 3600000, rewards: ["iron", "gold", "gem"], exp: 200, minLevel: 5 },
  volcano: { name: "🌋 Gunung Nano", duration: 7200000, rewards: ["lava", "dragonscale", "titancore"], exp: 400, minLevel: 15 },
  ocean: { name: "🌊 Samudra Kraan", duration: 5400000, rewards: ["fish", "pearl", "seagem"], exp: 300, minLevel: 10 },
  ruins: { name: "🏛️ Reruntuhan Kuno", duration: 10800000, rewards: ["ancientcoin", "relic", "mysterybox"], exp: 600, minLevel: 20 },
};

function formatTime(ms) {
  const hours = Math.floor(ms / 3600000);
  const minutes = Math.floor((ms % 3600000) / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  if (hours > 0) return `${hours}h ${minutes}m`;
  return minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;
}

async function handler(m, { sock }) {
  const db = getDatabase();
  const user = db.getUser(m.sender);

  if (!user.inventory) user.inventory = {};
  if (!user.rpg) user.rpg = {};
  if (!user.rpg.expeditions) user.rpg.expeditions = [];

  const args = m.args || [];
  const action = args[0]?.toLowerCase();
  const expType = args[1]?.toLowerCase();

  const maxExpeditions = Math.min(5, 1 + Math.floor((user.level || 1) / 10));

  if (!action || !["start", "claim", "status", "list"].includes(action)) {
    let txt = `🗺️ *MARKAS EKSPEDISI* 🗺️\n\n`;
    txt += `Kirim rombonnon expedicion para nri barang-barang langka seotra vez tu istirahat !\n\n`;
    txt += `*Daftar Perintah:*\n`;
    txt += `📜 \`${m.prefix}expedition list\` (Cek Area)\n`;
    txt += `🚀 \`${m.prefix}expedition start <area>\` (Mulai Expedicion)\n`;
    txt += `⏳ \`${m.prefix}expedition status\` (Cek Timer)\n`;
    txt += `💰 \`${m.prefix}expedition claim\` (Tarik Hasil)\n\n`;
    txt += `📊 Kapasitas Expedicion Tu: *${user.rpg.expeditions.length}/${maxExpeditions} Rombonnon*`;
    return m.reply(txt);
  }

  if (action === "list") {
    let txt = `📜 *PETA EKSPLORASI DUNIA* 📜\n\n`;

    for (const [key, exp] of Object.entries(EXPEDITIONS)) {
      const canGo = (user.level || 1) >= exp.minLevel;
      txt += `📍 ${exp.name} ${canGo ? "🔓" : "🔒"}\n`;
      txt += `   ├ ⏳ Waktu: ${formatTime(exp.duration)}\n`;
      txt += `   ├ 🎁 Potensi Loot: ${exp.rewards.join(", ")}\n`;
      txt += `   ├ 📈 EXP: ${exp.exp} (Min Lv. ${exp.minLevel})\n`;
      txt += `   └ 🚀 Kode Area: \`${key}\`\n\n`;
    }
    return m.reply(txt);
  }

  if (action === "start") {
    if (user.rpg.expeditions.length >= maxExpeditions) {
      return m.reply(`Duh , kapasitas expedicion tu ya full! (${user.rpg.expeditions.length}/${maxExpeditions})\nTunggu rombonnon ng lain balik primero !`);
    }

    if (!expType) {
      return m.reply(`Pilih area tujuan expedicionn !\nContoh: \`${m.prefix}expedition start forest\``);
    }

    const exp = EXPEDITIONS[expType];
    if (!exp) {
      return m.reply(`Maaf , area *${expType}* no hay en peta!`);
    }

    if ((user.level || 1) < exp.minLevel) {
      return m.reply(`Ay, level tu masih kurang . Butuh *Level ${exp.minLevel}* para expedicion a sana!`);
    }

    user.rpg.expeditions.push({
      type: expType,
      startedAt: Date.now(),
      duration: exp.duration,
    });
    db.save();

    let txt = `🚀 *EKSPEDISI DIBERANGKATKAN!* 🚀\n\n`;
    txt += `Rombonnon expedicion tu sya berangkat menuju tujuan!\n`;
    txt += `📍 Tujuan: *${exp.name}*\n`;
    txt += `⏱️ Estimasi Waktu: *${formatTime(exp.duration)}*\n\n`;
    txt += `> Silva a santai primero , despues ambil hasiln pakai perintah \`${m.prefix}expedition claim\`!`;

    return m.reply(txt);
  }

  if (action === "status") {
    if (user.rpg.expeditions.length === 0) {
      return m.reply(`Belum hay expedicion ng jalan  . Kirim ahora ! 🏕️`);
    }

    let txt = `⏳ *RADAR EKSPEDISI* ⏳\n\n`;

    for (let i = 0; i < user.rpg.expeditions.length; i++) {
      const exp = user.rpg.expeditions[i];
      const expInfo = EXPEDITIONS[exp.type];
      const elapsed = Date.now() - exp.startedAt;
      const remaining = Math.max(0, exp.duration - elapsed);
      const done = remaining <= 0;

      txt += `🗺️ *Rombonnon ${i + 1}* -> ${expInfo.name}\n`;
      txt += `   └ Status: ${done ? "✅ SELESAI! (Siap Claim)" : `🕒 Sisa ${formatTime(remaining)}`}\n\n`;
    }
    return m.reply(txt);
  }

  if (action === "claim") {
    const completedExps = user.rpg.expeditions.filter((e) => {
      return Date.now() - e.startedAt >= e.duration;
    });

    if (completedExps.length === 0) {
      return m.reply(`Belum hay expedicion ng selesai ! Cek primero pakai \`${m.prefix}expedition status\` !`);
    }

    let totalExp = 0;
    let allRewards = [];

    for (const exp of completedExps) {
      const expInfo = EXPEDITIONS[exp.type];
      totalExp += expInfo.exp;

      for (const rewardItem of expInfo.rewards) {
        if (Math.random() > 0.4) {
          const qty = Math.floor(Math.random() * 5) + 1;
          user.inventory[rewardItem] = (user.inventory[rewardItem] || 0) + qty;
          allRewards.push(`${rewardItem} x${qty}`);
        }
      }
    }

    user.rpg.expeditions = user.rpg.expeditions.filter((e) => {
      return Date.now() - e.startedAt < e.duration;
    });

    await addExpWithLevelCheck(sock, m, db, user, totalExp);
    db.save();

    await m.react("✅");

    let txt = `🎉 *EKSPEDISI SELESAI!* 🎉\n\n`;
    txt += `Rombonnon ambali y membawa hasil de *${completedExps.length} expedicion*!\n\n`;
    txt += `*🎁 HASIL PENCARIAN:*\n`;
    txt += `✨ EXP: *+${totalEXP}*\n`;
    if (allRewards.length > 0) {
      txt += `📦 Items:\n`;
      for (const r of allRewards) {
        txt += `  • ${r}\n`;
      }
    } else {
      txt += `📦 Items: *Aduh sang sekali, kali esto no recibiste apa-apa...* 😭\n`;
    }

    return m.reply(txt);
  }
}

export { pluginConfig as config, handler };
