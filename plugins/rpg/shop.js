import { getDatabase } from "../../src/lib/ourin-database.js";

const pluginConfig = {
  name: "shop",
  alias: ["beli", "jual", "toko", "store", "buy", "sell"],
  category: "rpg",
  description: "Beli y jual item RPG",
  usage: ".shop <buy/sell> <item> <jumlah>",
  example: ".shop buy potion 1",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 3,
  energi: 0,
  isEnabled: true,
};

const ITEMS = {
  potion: { price: 500, type: "buyable", name: "🥤 Pocion de Vida" },
  mpotion: { price: 500, type: "buyable", name: "🧪 Pocion de Mana" },
  stamina: { price: 1000, type: "buyable", name: "⚡ Pocion de Stamina" },

  common: { price: 2000, type: "buyable", name: "📦 Comun Caja" },
  uncommon: { price: 10000, type: "buyable", name: "🛍️ Poco comun Caja" },
  mythic: { price: 50000, type: "buyable", name: "🎁 Mythic Caja" },
  legendary: { price: 200000, type: "buyable", name: "💎 Legendario Caja" },

  wheat: { price: 50, type: "buyable", name: "🌾 Gandum" },
  rice: { price: 50, type: "buyable", name: "🍚 Beras" },
  egg: { price: 100, type: "buyable", name: "🥚 Telur" },
  meat: { price: 300, type: "buyable", name: "🥩 Daging" },
  herb: { price: 150, type: "buyable", name: "🌿 Herba" },
  carrot: { price: 50, type: "buyable", name: "🥕 Wortel" },
  potato: { price: 50, type: "buyable", name: "🥔 Kentang" },
  strawberry: { price: 80, type: "buyable", name: "🍓 Stroberi" },
  watermelon: { price: 100, type: "buyable", name: "🍉 Semangka" },
  apple: { price: 50, type: "buyable", name: "🍎 Apel" },

  rock: { price: 20, type: "sellable", name: "🪨 Batu" },
  coal: { price: 50, type: "sellable", name: "⚫ Batubara" },
  iron: { price: 200, type: "sellable", name: "⛓️ Besi" },
  gold: { price: 1000, type: "sellable", name: "🥇 Emas" },
  diamond: { price: 5000, type: "sellable", name: "💠 Berlian" },
  emerald: { price: 10000, type: "sellable", name: "💚 Emerald" },

  trash: { price: 10, type: "sellable", name: "🗑️ Sampah" },
  fish: { price: 100, type: "sellable", name: "🐟 Ikan" },
  prawn: { price: 200, type: "sellable", name: "🦐 Uyg" },
  octopus: { price: 500, type: "sellable", name: "🐙 Gurita" },
  shark: { price: 2000, type: "sellable", name: "🦈 Hiu" },
  whale: { price: 10000, type: "sellable", name: "🐳 Paus" },
};

async function handler(m, { sock }) {
  const db = getDatabase();
  const user = db.getUser(m.sender);
  const args = m.args || [];

  const action = args[0]?.toLowerCase();

  if (!action || (action !== "buy" && action !== "sell")) {
    let txt = `🏪 *Toko Kelontong RPG* ✨\n\n`;
    txt += `Hola! Selamat datang en toko alontong.\nQuieres beli potion o jual barang rongsokan ? 😂\n\n`;
    
    txt += `*Cara Transaksi:* 💸\n`;
    txt += `Escribe \`.shop buy <nama> <jumlah>\` para beli.\n`;
    txt += `Escribe \`.shop sell <nama> <jumlah>\` para jual.\n\n`;

    txt += `*🛍️ Barang ng Dijual (BUY):*\n`;
    for (const [key, item] of Object.entries(ITEMS)) {
      if (item.type === "buble") {
        txt += `${item.name}: *Rp ${item.price.toLocaleString("id-ID")}*\n`;
      }
    }
    txt += `\n`;

    txt += `*💰 Barang ng Diterima (SELL):*\n`;
    for (const [key, item] of Object.entries(ITEMS)) {
      if (item.type === "sellable") {
        txt += `${item.name}: *Rp ${item.price.toLocaleString("id-ID")}*\n`;
      }
    }

    return m.reply(txt);
  }

  const itemKey = args[1]?.toLowerCase();
  const amount = parseInt(args[2]) || 1;

  if (!itemKey || !ITEMS[itemKey]) {
    return m.reply(`Ay, barang *${args[1] || "eso"}* no hay en daftar! 😭❌\nCoba cek otra vez list barangn atik \`.shop\` .`);
  }

  const item = ITEMS[itemKey];

  if (action === "buy") {
    if (item.type !== "buble") {
      return m.reply(`Hayo lho , barang *${item.name}* esto khusus para enjual, no puede enbeli! 🫣❌`);
    }

    const totalCost = item.price * amount;
    if ((user.koin || 0) < totalCost) {
      return m.reply(`Yahh, koin tu kurang   para beli *${amount}x ${item.name}*! 😭😭\nKoin tu: *Rp ${(user.koin || 0).toLocaleString("id-ID")}*\nKurang *Rp ${(totalCost - (user.koin || 0)).toLocaleString("id-ID")}* otra vez. Nri duit primero ! 💸🏃💨`);
    }

    const cleanJid = m.sender.split("@")[0];
    if (!db.db.data.users[cleanJid]) {
      db.setUser(m.sender);
    }
    if (!db.db.data.users[cleanJid].inventory) {
      db.db.data.users[cleanJid].inventory = {};
    }

    db.db.data.users[cleanJid].koin = (db.db.data.users[cleanJid].koin || 0) - totalCost;
    db.db.data.users[cleanJid].inventory[itemKey] = (db.db.data.users[cleanJid].inventory[itemKey] || 0) + amount;

    await db.save();
    return m.reply(`MAKASIH BANYAK KAK! 🎉✨\n\nTu exitoso borong:\n🛒 Item: *${amount}x ${item.name}*\n💸 Total Bar: *Rp ${totalCost.toLocaleString("id-ID")}*\n\nDesonggu adatannonn otra vez ! 💖🛍️`);
  }

  if (action === "sell") {
    if (item.type !== "sellable") {
      return m.reply(`Maaf , toko kita no nerima barang *${item.name}* esto! Ngnok laku enjual otra vez soaln 😂❌`);
    }

    const cleanJid = m.sender.split("@")[0];
    if (!db.db.data.users[cleanJid]) {
      db.setUser(m.sender);
    }

    const userInventory = db.db.data.users[cleanJid].inventory || {};
    const userStock = userInventory[itemKey] || 0;

    if (userStock < amount) {
      return m.reply(`Loh , barangn kurang ! 🫣\nTu solo pun *${userStock}x ${item.name}*, masa quieres jual *${amount}*? Jannon ngibul ! 😂❌`);
    }

    const totalProfit = item.price * amount;

    if (!db.db.data.users[cleanJid].inventory) {
      db.db.data.users[cleanJid].inventory = {};
    }
    db.db.data.users[cleanJid].inventory[itemKey] = userStock - amount;
    db.db.data.users[cleanJid].koin = (db.db.data.users[cleanJid].koin || 0) + totalProfit;

    await db.save();
    return m.reply(`CINGG! UANG MASUK! 💰✨\n\nTu exitoso ngejual:\n📦 Item: *${amount}x ${item.name}*\n🤑 Total Recibido: *Rp ${totalProfit.toLocaleString("id-ID")}*\n\nMakasih  ya cuci guyg en sesto! 🎉💖`);
  }
}

export { pluginConfig as config, handler };
