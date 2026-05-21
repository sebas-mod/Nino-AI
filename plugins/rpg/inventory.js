import { getDatabase } from "../../src/lib/ourin-database.js";

const pluginConfig = {
  name: "inventory",
  alias: ["inv", "tas", "bag"],
  category: "rpg",
  description: "Melihat isi inventory RPG",
  usage: ".inventory",
  example: ".inventory",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 5,
  energi: 0,
  isEnabled: true,
};

const ITEMS = {
  common: { emote: "📦", name: "Comun Caja" },
  uncommon: { emote: "🛍️", name: "Poco comun Caja" },
  mythic: { emote: "🎁", name: "Mythic Caja" },
  legendary: { emote: "💎", name: "Legendario Caja" },

  rock: { emote: "🪨", name: "Batu" },
  coal: { emote: "⚫", name: "Batubara" },
  iron: { emote: "⛓️", name: "Besi" },
  gold: { emote: "🥇", name: "Emas" },
  diamond: { emote: "💠", name: "Berlian" },
  emerald: { emote: "💚", name: "Emerald" },

  trash: { emote: "🗑️", name: "Sampah" },
  fish: { emote: "🐟", name: "Ikan" },
  prawn: { emote: "🦐", name: "Uyg" },
  octopus: { emote: "🐙", name: "Gurita" },
  shark: { emote: "🦈", name: "Hiu" },
  whale: { emote: "🐳", name: "Paus" },

  potion: { emote: "🥤", name: "Pocion de Vida" },
  mpotion: { emote: "🧪", name: "Pocion de Mana" },
  stamina: { emote: "⚡", name: "Pocion de Stamina" },
};

async function handler(m, { sock }) {
  const db = getDatabase();
  const user = db.getUser(m.sender);
  if (!user.inventory) user.inventory = {};

  let invText = `🎒 *Isi Tas Tu Nih Kak!* ✨\n\n`;

  invText += `❤️ HP: *${user.rpg?.health || 100}*\n`;
  invText += `💸 Koin: *${(user.koin || 0).toLocaleString("id-ID")}*\n`;
  invText += `📈 EXP: *${(user.exp || 0).toLocaleString("id-ID")}*\n\n`;

  let hasItem = false;
  const categories = {
    "📦 *Koleksi Cajas*": ["common", "uncommon", "mythic", "legendary"],
    "⛏️ *Hasil Tambang*": ["rock", "coal", "iron", "gold", "diamond", "emerald"],
    "🎣 *Hasil Mancing*": ["trash", "fish", "prawn", "octopus", "shark", "whale"],
    "🧪 *Potions & Buffs*": ["potion", "mpotion", "stamina"],
  };

  for (const [catName, items] of Object.entries(categories)) {
    let catText = "";
    for (const itemKey of items) {
      const count = user.inventory[itemKey] || 0;
      if (count > 0) {
        const item = ITEMS[itemKey];
        catText += `${item.emote} ${item.name}: *${count}x*\n`;
        hasItem = true;
      }
    }
    if (catText) {
      invText += `${catName}\n`;
      invText += catText;
      invText += `\n`;
    }
  }

  if (!hasItem) {
    invText += `Loh, tas tu masih kosong melompong ! 🕸️\n`;
    invText += `Yuk main command RPG lain para recibistein item seru! 🚀\n`;
  } else {
    invText += `Escribe *.use <nama item>* para paa barangn ! 🎒💖\n`;
  }

  await m.reply(invText);
}

export { pluginConfig as config, handler };
