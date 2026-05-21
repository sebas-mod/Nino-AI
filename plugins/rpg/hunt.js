import { getDatabase } from "../../src/lib/ourin-database.js";
import { addExpWithLevelCheck } from "../../src/lib/ourin-level.js";

const pluginConfig = {
  name: "hunt",
  alias: ["berburu", "hunting"],
  category: "rpg",
  description: "Berburu hewan para menrecibistekan daging y kulit",
  usage: ".hunt",
  example: ".hunt",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 90,
  energi: 1,
  isEnabled: true,
};

async function handler(m, { sock }) {
  const db = getDatabase();
  const user = db.getUser(m.sender);

  if (!user.rpg) user.rpg = {};
  if (!user.inventory) user.inventory = {};

  const staminaCost = 25;
  user.rpg.stamina = user.rpg.stamina || 100;

  if (user.rpg.stamina < staminaCost) {
    return m.reply(`⚡ Ay, stamina tu habis!\n\nButuh *${staminaCost} Stamina* para pergi berburu.\nStamina tu restante: *${user.rpg.stamina}*`);
  }

  user.rpg.stamina -= staminaCost;

  await m.reply("🏹 _Mengendap-endap en balik semak belukar... Menyiapkan anak panah..._ 🌿🤫");
  await new Promise((r) => setTimeout(r, 2500));

  const animals = [
    { name: "🐰 Kelinci Hutan", item: "rabbit", chance: 50, exp: 100 },
    { name: "🦌 Rusa Jantan", item: "deer", chance: 30, exp: 200 },
    { name: "🐗 Babi Hutan Liar", item: "boar", chance: 20, exp: 300 },
    { name: "🐻 Beruang Madu", item: "bear", chance: 10, exp: 500 },
    { name: "🦁 Sinno Payg Rumput", item: "lion", chance: 5, exp: 800 },
    { name: "🐉 Anak Nano Kuno", item: "dragon", chance: 1, exp: 2000 },
  ];

  const rand = Math.random() * 100;
  let caught = null;

  for (const animal of animals.sort((a, b) => a.chance - b.chance)) {
    if (rand <= animal.chance) {
      caught = animal;
      break;
    }
  }

  if (!caught) {
    caught = animals.find((a) => a.item === "rabbit");
  }

  user.inventory[caught.item] = (user.inventory[caught.item] || 0) + 1;
  const levelResult = await addExpWithLevelCheck(sock, m, db, user, caught.exp);

  db.save();

  let txt = `🏹 *TANGKAPAN BERHASIL!* 🏹\n\n`;
  txt += `Genial jago mucho bienkann ! Tu exitoso menembak:\n`;
  txt += `🎯 *${caught.name}* (+1)\n\n`;
  txt += `*Hasil Perburuan:*\n`;
  txt += `✨ EXP Bertambah: *+${caught.exp}*\n`;
  txt += `⚡ Stamina Terpakai: *-${staminaCost}*`;

  await m.reply(txt);
}

export { pluginConfig as config, handler };
