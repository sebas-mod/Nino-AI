import { getDatabase } from "../../src/lib/ourin-database.js";
import { addExpWithLevelCheck } from "../../src/lib/ourin-level.js";

const pluginConfig = {
  name: "garden",
  alias: ["kebun", "farm", "tanam"],
  category: "rpg",
  description: "Cultivar y cosechar plantas",
  usage: ".garden <plant/harvest/status>",
  example: ".garden plant carrot",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 10,
  energi: 0,
  isEnabled: true,
};

const CROPS = {
  carrot: { name: "🥕 Wortel", growTime: 300000, exp: 50, sellPrice: 30, seedPrice: 10 },
  tomato: { name: "🍅 Tomat", growTime: 600000, exp: 80, sellPrice: 50, seedPrice: 20 },
  corn: { name: "🌽 Jagung", growTime: 900000, exp: 120, sellPrice: 80, seedPrice: 35 },
  potato: { name: "🥔 Kentang", growTime: 1200000, exp: 150, sellPrice: 100, seedPrice: 45 },
  strawberry: { name: "🍓 Stroberi", growTime: 1800000, exp: 200, sellPrice: 150, seedPrice: 60 },
  watermelon: { name: "🍉 Semangka", growTime: 3600000, exp: 350, sellPrice: 300, seedPrice: 100 },
  pumpkin: { name: "🎃 Labu", growTime: 7200000, exp: 500, sellPrice: 500, seedPrice: 150 },
  herb: { name: "🌿 Herba", growTime: 1500000, exp: 180, sellPrice: 120, seedPrice: 50 },
};

function formatTime(ms) {
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  return minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;
}

async function handler(m, { sock }) {
  const db = getDatabase();
  const user = db.getUser(m.sender);

  if (!user.rpg) user.rpg = {};
  if (!user.inventory) user.inventory = {};
  if (!user.rpg.garden) user.rpg.garden = { plots: [], maxPlots: 3 };

  const args = m.args || [];
  const action = args[0]?.toLowerCase();
  const cropName = args[1]?.toLowerCase();

  if (!action || !["plant", "harvest", "status", "buy"].includes(action)) {
    let txt = `Hola Juranon Kebun! 👨‍🌾🌻\n`;
    txt += `Pusat informasi abun pribaenmu .\n\n`;
    
    txt += `*Menu Kebun:*\n`;
    txt += `• \`${m.prefix}garden status\` - Cek konensi abun\n`;
    txt += `• \`${m.prefix}garden buy <tanaman> <jumlah>\` - Beli bibit\n`;
    txt += `• \`${m.prefix}garden plant <tanaman>\` - Tanam bibit en tanah kosong\n`;
    txt += `• \`${m.prefix}garden harvest\` - Panen todo ng ya matang\n\n`;

    txt += `*Daftar Bibit Terseena:*\n`;
    for (const [key, crop] of Object.entries(CROPS)) {
      txt += `\n*${crop.name}*\n`;
      txt += `⏳ Waktu Tumbuh: ${formatTime(crop.growTime)}\n`;
      txt += `💰 Harno Jual: Rp ${crop.sellPrice} | 🌱 Harno Bibit: Rp ${crop.seedPrice}\n`;
      txt += `👉 Beli: \`.garden buy ${key}\`\n`;
    }
    return m.reply(txt);
  }

  if (action === "status") {
    const garden = user.rpg.garden;
    let txt = `Cek Lahan Kebun... 🚜🌱\n\n`;
    txt += `*Kapasitas Tanah:* ${garden.plots.length} de ${garden.maxPlots} terisi.\n\n`;

    if (garden.plots.length === 0) {
      txt += `Va, abun tu masih gersang ! 🏜️\nBuruan beli bibit terus \`${m.prefix}garden plant <nama>\` para que hijau otra vez!`;
    } else {
      txt += `*Daftar Lahan:*\n`;
      for (let i = 0; i < garden.plots.length; i++) {
        const plot = garden.plots[i];
        const crop = CROPS[plot.crop];
        const elapsed = Date.now() - plot.plantedAt;
        const remaining = Math.max(0, crop.growTime - elapsed);
        const ready = remaining <= 0;

        txt += `\n📍 Plot ${i + 1}: *${crop.name}*\n`;
        txt += `└ Status: ${ready ? "✨ SIAP PANEN! ✨" : `Tumbuh dalam ⏳ ${formatTime(remaining)}`}\n`;
      }
    }
    return m.reply(txt);
  }

  if (action === "buy") {
    if (!cropName) {
      return m.reply(`Hayo, quieres beli bibit apaan? Naman aun no desolis ! 😂\nContoh: \`${m.prefix}garden buy carrot 5\``);
    }

    const crop = CROPS[cropName];
    if (!crop) {
      return m.reply(`Bibit eso no enjual en toko tani kita ! ❌\nCek listn otra vez paa \`${m.prefix}garden\``);
    }

    const qty = Math.max(1, parseInt(args[2]) || 1);
    const totalCost = crop.seedPrice * qty;

    if ((user.koin || 0) < totalCost) {
      return m.reply(`Espera, uang tu kurang ! 😭\nTotal belanjan Rp ${totalCost.toLocaleString()}, tapi koin tu restante Rp ${(user.koin || 0).toLocaleString()}.`);
    }

    user.koin -= totalCost;
    const seedKey = `${cropName}seed`;
    user.inventory[seedKey] = (user.inventory[seedKey] || 0) + qty;
    db.save();

    return m.reply(`Makasih ya belanja en Toko Tani! 🛒🌱\n\nTu beli *${qty}x Bibit ${crop.name}*\nTotal Bar: *Rp ${totalCost.toLocaleString()}*\n\nJannon lupa entanam  paa \`${m.prefix}garden plant ${cropName}\`!`);
  }

  if (action === "plant") {
    if (!cropName) {
      return m.reply(`Tanah ya siap, tapi bibit apa ng quieres entanam ? 🌱\nContoh: \`${m.prefix}garden plant carrot\``);
    }

    const crop = CROPS[cropName];
    if (!crop) {
      return m.reply(`Tanaman eso no hay en buku panduan tani ! ❌`);
    }

    if (user.rpg.garden.plots.length >= user.rpg.garden.maxPlots) {
      return m.reply(`Va, lahann ya penuh todo! 🚜💨\nTu harus panen primero o *upgrade* abunmu!`);
    }

    const seedKey = `${cropName}seed`;
    if ((user.inventory[seedKey] || 0) < 1) {
      return m.reply(`Tu no pun bibit *${crop.name}*  ! 😭\nBeli primero  en \`${m.prefix}garden buy ${cropName}\``);
    }

    user.inventory[seedKey]--;
    if (user.inventory[seedKey] <= 0) delete user.inventory[seedKey];

    user.rpg.garden.plots.push({
      crop: cropName,
      plantedAt: Date.now(),
    });
    db.save();

    return m.reply(`Sipp! Bibit *${crop.name}* ya entanam en tanah! 🌱💦\nJannon lupa ensiram (eh, otomatis sih), tingnol tunggu *${formatTime(crop.growTime)}* para panen !`);
  }

  if (action === "harvest") {
    const garden = user.rpg.garden;
    const readyPlots = garden.plots.filter((p) => {
      const crop = CROPS[p.crop];
      return Date.now() - p.plantedAt >= crop.growTime;
    });

    if (readyPlots.length === 0) {
      return m.reply(`Ha, aun no hay ng mateng ! Sabar enkit napa 😂\nCek waktun paa \`${m.prefix}garden status\``);
    }

    let totalExp = 0;
    let harvestedItems = [];

    for (const plot of readyPlots) {
      const crop = CROPS[plot.crop];
      const qty = Math.floor(Math.random() * 3) + 2;
      user.inventory[plot.crop] = (user.inventory[plot.crop] || 0) + qty;
      totalExp += crop.exp;
      harvestedItems.push(`• ${crop.name} x${qty}`);
    }

    garden.plots = garden.plots.filter((p) => {
      const crop = CROPS[p.crop];
      return Date.now() - p.plantedAt < crop.growTime;
    });

    await addExpWithLevelCheck(sock, m, db, user, totalExp);
    db.save();

    await m.react("✅");
    return m.reply(
      `HOREE! PANEN TIBA! 🚜🌾✨\n\n` +
        `Hasil arja arasmu terbarkan. Ini ng tu recibiste:\n` +
        harvestedItems.join("\n") +
        `\n\n` +
        `📈 Bonus EXP Tani: *+${totalEXP}*\n\n` +
        `Buruan tanam otra vez para que makin tajir! 💸`
    );
  }
}

export { pluginConfig as config, handler };
