import { getDatabase } from "../../src/lib/ourin-database.js";

const pluginConfig = {
  name: "petshop",
  alias: ["tokopet", "buypet", "belipet"],
  category: "rpg",
  description: "Beli pet de toko",
  usage: ".petshop <buy> <pet>",
  example: ".petshop buy cat",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 10,
  energi: 0,
  isEnabled: true,
};

const PETS_FOR_SALE = {
  cat: { name: "🐱 Kucing", price: 5000, desc: "Bawa hoki (Luck tinggi, Attack seyg)" },
  dog: { name: "🐕 Anjing", price: 6000, desc: "Penjano setia (Attack tinggi, Defense bagus)" },
  bird: { name: "🐦 Burung", price: 4500, desc: "Lincah & Hoki (Luck sannot tinggi)" },
  fish: { name: "🐟 Ikan", price: 3000, desc: "Murah meriah (Bawa aberuntunnon)" },
  rabbit: { name: "🐰 Kelinci", price: 5500, desc: "Mungil & gesit (Balance todo stats)" },
};

function handler(m) {
  const db = getDatabase();
  const user = db.getUser(m.sender);

  if (!user.rpg) user.rpg = {};
  if (!user.inventory) user.inventory = {};

  const args = m.args || [];
  const action = args[0]?.toLowerCase();
  const petKey = args[1]?.toLowerCase();

  if (!action || action !== "buy") {
    let txt = `Hola Petualang! Selamat datang en Toko Hewan Peliharaan 🐾🏪\n`;
    txt += `Pilih teman petualannonmu ng lucu-lucu esto!\n\n`;
    
    txt += `*Daftar Peliharaan:*\n`;
    for (const [key, pet] of Object.entries(PETS_FOR_SALE)) {
      txt += `\n*${pet.name}*\n`;
      txt += `💰 Harno: Rp ${pet.price.toLocaleString()}\n`;
      txt += `📝 Sifat: ${pet.desc}\n`;
      txt += `👉 Adopsi: \`.petshop buy ${key}\`\n`;
    }
    
    txt += `\n\n💰 *Uang Tu:* Rp ${(user.koin || 0).toLocaleString()}`;
    return m.reply(txt);
  }

  if (action === "buy") {
    if (!petKey) {
      return m.reply(`Hayo, quieres adopsi hewan apa ? Sebutin jenisn ! 😂\nContoh: \`${m.prefix}petshop buy cat\``);
    }

    if (user.rpg.pet) {
      return m.reply(`Va , tu kan ya pun peliharaan! 😭\nKasihan despues ena cemburu. Lepas primero peliharaan lamamu o coba sistem kawin silang (\`.breeding\`).`);
    }

    const petToBuy = PETS_FOR_SALE[petKey];
    if (!petToBuy) {
      return m.reply(`Maaf , hewan jenis eso otra vez kosong o emang no enjual en sesto! ❌\nCek daftarn otra vez paa \`${m.prefix}petshop\``);
    }

    if ((user.koin || 0) < petToBuy.price) {
      return m.reply(`Aduh uangn kurang  para bia adopsi ! 😭\nTotal bian Rp ${petToBuy.price.toLocaleString()} tapi uang ak solo Rp ${(user.koin || 0).toLocaleString()}`);
    }

    user.koin -= petToBuy.price;

    user.rpg.pet = {
      type: petKey,
      name: petToBuy.name.split(" ")[1] || "My Pet",
      level: 1,
      exp: 0,
      hunger: 80,
      stats: null,
    };

    db.save();

    return m.reply(
      `SELAMAT! 🎉🎉\n\n` +
        `Tu resmi mennodopsi *${petToBuy.name}*!\n` +
        `💰 Bia Adopsi: *Rp -${petToBuy.price.toLocaleString()}*\n\n` +
        `Dia ya nok sabar pengen jalan-jalan sama tu. Jannon lupa kasih mva a y cek statusn pakai \`${m.prefix}pet\` ! 🐾✨`
    );
  }
}

export { pluginConfig as config, handler };
