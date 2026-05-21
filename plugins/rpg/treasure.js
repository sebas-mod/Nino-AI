import { getDatabase } from "../../src/lib/ourin-database.js";
import { addExpWithLevelCheck } from "../../src/lib/ourin-level.js";

const pluginConfig = {
  name: "treasure",
  alias: ["chest", "peti", "openbox"],
  category: "rpg",
  description: "Abrir cofres del tesoro para recompensas aleatorias",
  usage: ".treasure",
  example: ".treasure",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 30,
  energi: 1,
  isEnabled: true,
};

const CHEST_TYPES = {
  woodenchest: { name: "📦 Cofre de Madera", minGold: 50, maxGold: 200, expRange: [30, 80], rarity: "common" },
  ironchest: { name: "🗃️ Cofre de Hierro", minGold: 150, maxGold: 500, expRange: [80, 150], rarity: "uncommon" },
  goldchest: { name: "🎁 Cofre de Oro", minGold: 400, maxGold: 1200, expRange: [150, 300], rarity: "rare" },
  diamondchest: { name: "💎 Cofre de Diamante", minGold: 1000, maxGold: 3000, expRange: [300, 600], rarity: "epic" },
  mysterybox: { name: "🎲 Caja Misteriosa", minGold: 500, maxGold: 5000, expRange: [200, 800], rarity: "legendary" },
};

const LOOT_TABLE = {
  common: [
    { item: "wood", qty: [3, 8], chance: 40 },
    { item: "iron", qty: [1, 4], chance: 30 },
    { item: "herb", qty: [2, 5], chance: 25 },
    { item: "potion", qty: [1, 2], chance: 20 },
  ],
  uncommon: [
    { item: "iron", qty: [3, 7], chance: 40 },
    { item: "gold", qty: [1, 3], chance: 25 },
    { item: "leather", qty: [2, 5], chance: 30 },
    { item: "potion", qty: [2, 4], chance: 35 },
  ],
  rare: [
    { item: "gold", qty: [2, 5], chance: 45 },
    { item: "diamond", qty: [1, 2], chance: 20 },
    { item: "manapotion", qty: [1, 3], chance: 30 },
    { item: "strengthpotion", qty: [1, 1], chance: 15 },
  ],
  epic: [
    { item: "diamond", qty: [2, 4], chance: 40 },
    { item: "gold", qty: [5, 10], chance: 50 },
    { item: "elixir", qty: [1, 1], chance: 15 },
    { item: "dragonscale", qty: [1, 2], chance: 10 },
  ],
  legendary: [
    { item: "diamond", qty: [3, 8], chance: 50 },
    { item: "titancore", qty: [1, 2], chance: 20 },
    { item: "divinecore", qty: [1, 1], chance: 10 },
    { item: "elixir", qty: [1, 3], chance: 25 },
    { item: "goldsword", qty: [1, 1], chance: 5 },
  ],
};

async function handler(m, { sock }) {
  const db = getDatabase();
  const user = db.getUser(m.sender);

  if (!user.inventory) user.inventory = {};
  if (!user.rpg) user.rpg = {};

  const args = m.args || [];
  const chestType = args[0]?.toLowerCase();

  const availableChests = Object.entries(CHEST_TYPES).filter(([key]) => (user.inventory[key] || 0) > 0);

  if (!chestType) {
    let txt = `🎁 *GUDANG HARTA KARUN* 🎁\n\n`;

    if (availableChests.length === 0) {
      txt += `Va, tu aun no pun peti harta satupun ... 😭\n\n`;
      txt += `💡 *Consejo recibiste peti:*\n`;
      txt += `> ⚔️ Eksplorasi \`.adventure\` / Dungeon\n`;
      txt += `> 👹 Bunuh Boss\n`;
      txt += `> 🗓️ Selesaikan \`.daily\` / \`.weekly\`\n`;
      txt += `> 🛒 Beli en \`.shop\``;
    } else {
      txt += `Genial peti tu hay bank ! Quieres buka ng mana ?\n\n`;
      for (const [key, chest] of availableChests) {
        txt += `📦 ${chest.name}: *${user.inventory[key]} pcs*\n`;
        txt += `   └ Buka: \`${m.prefix}treasure ${key}\`\n\n`;
      }
    }
    return m.reply(txt);
  }

  const chest = CHEST_TYPES[chestType];
  if (!chest) {
    return m.reply(`Peti *${chestType}* no hay en database !`);
  }

  if ((user.inventory[chestType] || 0) < 1) {
    return m.reply(`Peti *${chest.name}* tu otra vez kosong ! 😅`);
  }

  user.inventory[chestType]--;
  if (user.inventory[chestType] <= 0) delete user.inventory[chestType];

  await m.react("🎁");
  await m.reply(`🔓 Mengutak-atik kunci... \nMembuka *${chest.name.toUpperCase()}* secara perlahan... ✨`);
  await new Promise((r) => setTimeout(r, 2500));

  const goldReward = Math.floor(Math.random() * (chest.maxGold - chest.minGold)) + chest.minGold;
  const expReward = Math.floor(Math.random() * (chest.expRange[1] - chest.expRange[0])) + chest.expRange[0];

  user.koin = (user.koin || 0) + goldReward;

  const droppedItems = [];
  const lootPool = LOOT_TABLE[chest.rarity] || LOOT_TABLE.common;

  for (const loot of lootPool) {
    if (Math.random() * 100 < loot.chance) {
      const qty = Math.floor(Math.random() * (loot.qty[1] - loot.qty[0] + 1)) + loot.qty[0];
      user.inventory[loot.item] = (user.inventory[loot.item] || 0) + qty;
      droppedItems.push(`${loot.item} (x${qty})`);
    }
  }

  await addExpWithLevelCheck(sock, m, db, user, expReward);
  db.save();

  await m.react("✅");

  let txt = `💥 *CRAAASH!! PETI TERBUKA!!* 💥\n\n`;
  txt += `Genial hebat ! Tu recibiste harta de *${chest.name}*:\n\n`;
  txt += `💰 Emas: *+Rp ${goldReward.toLocaleString()}*\n`;
  txt += `✨ EXP: *+${expReward}*\n`;
  if (droppedItems.length > 0) {
    txt += `🎒 *Loot Tambahan:*\n`;
    for (const item of droppedItems) {
      txt += `  • ${item}\n`;
    }
  } else {
    txt += `🎒 *Loot Tambahan:* _Aduh sang mucho no recibiste item tambahan..._\n`;
  }

  if (chest.rarity === "legendary" || chest.rarity === "epic") {
    txt += `\n> _"HOKI BANGET KAK!"_ 🌟🔥`;
  }

  return m.reply(txt);
}

export { pluginConfig as config, handler };
