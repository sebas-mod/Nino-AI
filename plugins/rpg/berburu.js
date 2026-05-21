import { getDatabase } from "../../src/lib/ourin-database.js";
import { addExpWithLevelCheck } from "../../src/lib/ourin-level.js";

const pluginConfig = {
  name: "berburu",
  alias: ["huntanimal", "buru"],
  category: "rpg",
  description: "Berburu hewan para menrecibiste item",
  usage: ".berburu",
  example: ".berburu",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 120,
  energi: 1,
  isEnabled: true,
};

async function handler(m, { sock }) {
  const db = getDatabase();
  const user = db.getUser(m.sender);

  if (!user.rpg) user.rpg = {};
  if (!user.inventory) user.inventory = {};

  const staminaCost = 25;
  user.rpg.stamina = user.rpg.stamina ?? 100;

  if (user.rpg.stamina < staminaCost) {
    return m.reply(`Ay, stamina tu abis ! 😭⚡\n\nBuat berburu necesita *${staminaCost} Stamina*, tapi pun tu restante *${user.rpg.stamina}*.\nIstirahat primero  para que seger otra vez! 🛌💤`);
  }

  user.rpg.stamina -= staminaCost;

  await m.react("🏹");
  await m.reply(`Mengendap-endap masuk a hutan... 🤫🌳\nSiapin panah y bienk dennon teliti! 🏹👀`);
  await new Promise((r) => setTimeout(r, 3000));

  const animals = [
    { name: "🐰 Kelinci", item: "daging_alinci", chance: 80, min: 1, max: 3, exp: 50, money: 500 },
    { name: "🦌 Rusa", item: "daging_rusa", chance: 50, min: 1, max: 2, exp: 100, money: 1500 },
    { name: "🐗 Babi Hutan", item: "daging_babi", chance: 40, min: 1, max: 2, exp: 150, money: 2000 },
    { name: "🦊 Rubah", item: "bulu_rubah", chance: 30, min: 1, max: 1, exp: 200, money: 3000 },
    { name: "🐻 Beruang", item: "cakar_beruang", chance: 15, min: 1, max: 1, exp: 500, money: 10000 },
    { name: "🦁 Sinno", item: "taring_sinno", chance: 5, min: 1, max: 1, exp: 1000, money: 25000 },
  ];

  const caught = animals.filter((a) => Math.random() * 100 <= a.chance);

  if (caught.length === 0) {
    await m.react("😢");
    db.save();
    return m.reply(`Yahh, apes mucho hari esto ! 😭😭\n\nHewann phay lari todo, no recibiste apa-apa .\nPhayhal stamina ya apotong *-${staminaCost}* ⚡. Sabar , coba otra vez despues! 🥺🌿`);
  }

  let results = [];
  let totalExp = 0;
  let totalMoney = 0;

  for (const animal of caught.slice(0, 3)) {
    const qty = Math.floor(Math.random() * (animal.max - animal.min + 1)) + animal.min;
    user.inventory[animal.item] = (user.inventory[animal.item] || 0) + qty;
    totalExp += animal.exp * qty;
    totalMoney += animal.money * qty;
    results.push({ name: animal.name, qty, money: animal.money * qty });
  }

  user.koin = (user.koin || 0) + totalMoney;
  const levelResult = await addExpWithLevelCheck(sock, m, db, user, totalExp);

  db.save();

  await m.react("✅");

  let txt = `CROOT! Kena sasaran ! 🎯🏹\n\nTu pulang bawa hasil buruan :\n`;
  for (const r of results) {
    txt += `• ${r.name}: *+${r.qty} ekor*\n`;
  }
  txt += `\nHasil buruann otomatis ajual ! 🎉\n`;
  txt += `💸 Koin: *+Rp ${totalMoney.toLocaleString("id-ID")}*\n`;
  txt += `📈 EXP: *+${totalEXP}*\n`;
  txt += `⚡ Stamina terpakai: *-${staminaCost}*\n\n`;
  txt += `Mantap mucho, besok-besok berburu otra vez  ! 🔥🥩`;

  m.reply(txt);
}

export { pluginConfig as config, handler };
