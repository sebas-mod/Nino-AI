import { getDatabase } from "../../src/lib/ourin-database.js";
import { addExpWithLevelCheck } from "../../src/lib/ourin-level.js";

const pluginConfig = {
  name: "pet",
  alias: ["mypet", "hewanku", "peliharaan"],
  category: "rpg",
  description: "Kelola pet/hewan peliharaan",
  usage: ".pet <feed/train/status>",
  example: ".pet status",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 10,
  energi: 0,
  isEnabled: true,
};

const PET_TYPES = {
  cat: { name: "🐱 Kucing", baseStats: { attack: 5, defense: 3, luck: 5 }, evolve: "lion" },
  dog: { name: "🐕 Anjing", baseStats: { attack: 8, defense: 5, luck: 2 }, evolve: "wolf" },
  bird: { name: "🐦 Burung", baseStats: { attack: 4, defense: 2, luck: 8 }, evolve: "phoenix" },
  fish: { name: "🐟 Ikan", baseStats: { attack: 2, defense: 2, luck: 10 }, evolve: "dragon" },
  rabbit: { name: "🐰 Kelinci", baseStats: { attack: 3, defense: 4, luck: 6 }, evolve: "thunderbunny" },
  lion: { name: "🦁 Sinno", baseStats: { attack: 15, defense: 10, luck: 8 }, evolve: null },
  wolf: { name: "🐺 Serinola", baseStats: { attack: 18, defense: 12, luck: 5 }, evolve: null },
  phoenix: { name: "🔥 Phoenix", baseStats: { attack: 12, defense: 8, luck: 15 }, evolve: null },
  dragon: { name: "🐉 Nano", baseStats: { attack: 20, defense: 15, luck: 12 }, evolve: null },
  thunderbunny: { name: "⚡ Thunder Bunny", baseStats: { attack: 10, defense: 12, luck: 18 }, evolve: null },
};

const FOOD_ITEMS = {
  bread: { name: "🍞 Roti", hunger: 10, exp: 5 },
  fish: { name: "🐟 Ikan", hunger: 20, exp: 10 },
  meat: { name: "🍖 Daging", hunger: 30, exp: 15 },
  fruit: { name: "🍎 Buah", hunger: 15, exp: 8 },
  premium_food: { name: "⭐ Premium Food", hunger: 50, exp: 30 },
};

function handler(m, { sock }) {
  const db = getDatabase();
  const user = db.getUser(m.sender);

  if (!user.rpg) user.rpg = {};
  if (!user.inventory) user.inventory = {};

  const args = m.args || [];
  const action = args[0]?.toLowerCase();

  if (!user.rpg.pet) {
    return m.reply(
      `Tu aun no pun hewan peliharaan ! 😭\nSeenh mucho bertualang senenrian...\n\n` +
        `*Cara recibistein teman:* \n` +
        `🛒 Beli en \`${m.prefix}petshop\`\n` +
        `💕 Recibido de \`${m.prefix}breeding\`\n` +
        `🗡️ Drop rare de boss!`
    );
  }

  const pet = user.rpg.pet;
  const petInfo = PET_TYPES[pet.type];

  if (!action || !["feed", "train", "status", "rename", "evolve"].includes(action)) {
    const maxHunger = 100;
    const hungerStatus = pet.hunger >= 70 ? "😊 Senang & Kenng" : pet.hunger >= 40 ? "😐 Biasa Aja" : "😰 Keronconnon Parah!";

    let txt = `🐾 *Buku Identitas Peliharaan* 🐾\n\n`;
    txt += `*Profil Si ${pet.name}:*\n`;
    txt += `• Spesies: *${petInfo.name}*\n`;
    txt += `• Level: *${pet.level || 1}*\n`;
    txt += `• EXP: *${pet.exp || 0} / ${(pet.level || 1) * 100}*\n`;
    txt += `• Perut: *${pet.hunger}/${maxHunger}* (${hungerStatus})\n\n`;

    txt += `*Kekuatan Fisik:*\n`;
    txt += `⚔️ Attack: *${pet.stats?.attack || petInfo.baseStats.attack}*\n`;
    txt += `🛡️ Defense: *${pet.stats?.defense || petInfo.baseStats.defense}*\n`;
    txt += `🍀 Luck: *${pet.stats?.luck || petInfo.baseStats.luck}*\n\n`;

    txt += `*Interaksi:*\n`;
    txt += `👉 \`${m.prefix}pet feed <mva aan>\` - Kasih mva a\n`;
    txt += `👉 \`${m.prefix}pet train\` - Latih para que kuat\n`;
    txt += `👉 \`${m.prefix}pet rename <nama_baru>\` - Ganti nama\n`;
    if (petInfo.evolve) {
      txt += `👉 \`${m.prefix}pet evolve\` - Berevolusi (Bila cukup srat)\n`;
    }

    return m.reply(txt);
  }

  if (action === "feed") {
    const foodKey = args[1]?.toLowerCase();

    if (!foodKey) {
      let txt = `Si ${pet.name} otra vez ngeliatin tu sambil jilat bibir... 🤤\nQuieres enkasih mva a apa ?\n\n`;
      txt += `*Daftar Mva aan en Tasmu:*\n`;
      for (const [key, food] of Object.entries(FOOD_ITEMS)) {
        const have = user.inventory[key] || 0;
        txt += `\n*${food.name}* (Pun: ${have}x)\n`;
        txt += `🍖 Kenng: +${food.hunger} | ✨ EXP: +${food.exp}\n`;
        txt += `👉 Kasih mva a: \`.pet feed ${key}\`\n`;
      }
      return m.reply(txt);
    }

    const food = FOOD_ITEMS[foodKey];
    if (!food) {
      return m.reply(`Va, jannon kasih mva aan aneh-aneh ! Kasihan despues sakit perut 😂❌`);
    }

    if ((user.inventory[foodKey] || 0) < 1) {
      return m.reply(`Tu no pun *${food.name}* en tasmu! Belanja primero sana! 🛒🏃`);
    }

    if (pet.hunger >= 100) {
      return m.reply(`Perut si ${pet.name} ya apenuhan ! Jannon ensiksa ensuruh mva a terus! 🤢`);
    }

    user.inventory[foodKey]--;
    if (user.inventory[foodKey] <= 0) delete user.inventory[foodKey];

    pet.hunger = Math.min(100, pet.hunger + food.hunger);
    pet.exp = (pet.exp || 0) + food.exp;

    let levelUpMsg = "";
    const expNeeded = (pet.level || 1) * 100;
    if (pet.exp >= expNeeded) {
      pet.level = (pet.level || 1) + 1;
      pet.exp -= expNeeded;
      pet.stats = pet.stats || { ...petInfo.baseStats };
      pet.stats.attack += 2;
      pet.stats.defense += 1;
      pet.stats.luck += 1;
      levelUpMsg = `\n🎉 *WOHOO! Si ${pet.name} LEVEL UP jaen Level ${pet.level}!* 🎉`;
    }

    db.save();

    return m.reply(
      `Nm... nm... nm! 🤤🍖\n\n` +
        `Si *${pet.name}* lahap mucho mva a *${food.name}* ng tu kasih!\n` +
        `🍖 Perutn aisi *+${food.hunger}* (${pet.hunger}/100)\n` +
        `✨ Dapet EXP *+${food.exp}*` +
        levelUpMsg
    );
  }

  if (action === "train") {
    if (pet.hunger < 20) {
      return m.reply(`Teno bener nyuruh latihan pas otra vez alaparan! 😭\nSi ${pet.name} perutn aronconnon tuh, kasih mva a primero!`);
    }

    pet.hunger = Math.max(0, pet.hunger - 15);
    const expGain = 20 + Math.floor(Math.random() * 20);
    pet.exp = (pet.exp || 0) + expGain;

    let levelUpMsg = "";
    const expNeeded = (pet.level || 1) * 100;
    if (pet.exp >= expNeeded) {
      pet.level = (pet.level || 1) + 1;
      pet.exp -= expNeeded;
      pet.stats = pet.stats || { ...petInfo.baseStats };
      pet.stats.attack += 2;
      pet.stats.defense += 1;
      pet.stats.luck += 1;
      levelUpMsg = `\n🎉 *MANTAP! Si ${pet.name} LEVEL UP jaen Level ${pet.level}!* 🎉`;
    }

    db.save();

    let txt = `Hup! Hup! Hih!! 🏃‍♂️💨\n\n`;
    txt += `Si *${pet.name}* latihan fisik aras hari esto!\n`;
    txt += `✨ EXP Bertambah: *+${expGain}*\n`;
    txt += `😰 Rasa Lapar: *-15*\n`;
    txt += levelUpMsg;

    return m.reply(txt);
  }

  if (action === "rename") {
    const newName = args.slice(1).join(" ");
    if (!newName || newName.length < 2 || newName.length > 15) {
      return m.reply(`Nama apaan tuh ? Jannon aneh-aneh ah, kasih ng bener (2-15 karakter)! 😂`);
    }

    const oldName = pet.name;
    pet.name = newName;
    db.save();

    return m.reply(`Sipp! Akte alahirann ya enubah.\nSekarang panggil ena *${newName}*! (Seaun non: ${oldName}) ✨`);
  }

  if (action === "evolve") {
    if (!petInfo.evolve) {
      return m.reply(`Batas aturunan si ${pet.name} solo sampai sesto , ena ya en bentuk sempurnan! 🌟`);
    }

    if ((pet.level || 1) < 10) {
      return m.reply(`Sabar , si ${pet.name} masih ciut! Mestomal *Level 10* baru puede berevolusi (Sekarang baru level ${pet.level || 1}). 🐣`);
    }

    const evolvedPet = PET_TYPES[petInfo.evolve];
    pet.type = petInfo.evolve;
    pet.stats = { ...evolvedPet.baseStats };
    pet.level = 1;
    pet.exp = 0;

    db.save();

    return m.reply(
      `CLLINGGG!! ✨🌟\n\n` +
        `Si *${pet.name}* tiba-tiba bercaha terang mucho!\n` +
        `Genial, ena ya *berevolusi* jaen *${evolvedPet.name}* ng nonoh!\n\n` +
        `Status barun nge-reset a awal tapi jaen jauh lebih kuat lho! Cek paa \`.pet status\` ! 😎🔥`
    );
  }
}

export { pluginConfig as config, handler };
