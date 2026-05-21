import { getDatabase } from "../../src/lib/ourin-database.js";
import { addExpWithLevelCheck } from "../../src/lib/ourin-level.js";

const pluginConfig = {
  name: "fishing",
  alias: ["rpgfish", "mancing"],
  category: "rpg",
  description: "Memancing para menrecibistekan ikan (RPG)",
  usage: ".fishing",
  example: ".fishing",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 60,
  energi: 1,
  isEnabled: true,
};

async function handler(m, { sock }) {
  const db = getDatabase();
  const user = db.getUser(m.sender);

  if (!user.rpg) user.rpg = {};
  if (!user.inventory) user.inventory = {};

  const staminaCost = 15;
  user.rpg.stamina = user.rpg.stamina || 100;

  if (user.rpg.stamina < staminaCost) {
    return m.reply(`Ay, stamina tu abis ! 😭⚡\n\nBuat mancing necesita *${staminaCost} Stamina*, tapi pun tu restante *${user.rpg.stamina}*.\nIstirahat primero  para que seger otra vez! 🛌💤`);
  }

  user.rpg.stamina -= staminaCost;

  await m.react("🎣");
  await m.reply(`Melempar kail a air ng tenang... 🌊🎣\nSssttt, jannon berisik para que ikann mva a umpan! 🤫👀`);
  await new Promise((r) => setTimeout(r, 4000));

  const drops = [
    { item: "trash", chance: 20, name: "🗑️ Sampah", exp: 10 },
    { item: "fish", chance: 50, name: "🐟 Ikan", exp: 100 },
    { item: "prawn", chance: 30, name: "🦐 Uyg", exp: 150 },
    { item: "octopus", chance: 15, name: "🐙 Gurita", exp: 300 },
    { item: "shark", chance: 5, name: "🦈 Hiu", exp: 800 },
    { item: "whale", chance: 1, name: "🐳 Paus", exp: 2000 },
  ];

  const rand = Math.random() * 100;
  let caught = drops[0];

  for (const drop of drops.sort((a, b) => a.chance - b.chance)) {
    if (rand <= drop.chance) {
      caught = drop;
      break;
    }
  }

  const qty = 1;
  user.inventory[caught.item] = (user.inventory[caught.item] || 0) + qty;

  const expReward = caught.exp;
  const levelResult = await addExpWithLevelCheck(sock, m, db, user, expReward);

  db.save();

  await m.react("✅");

  let txt = `HAPPP! Kailn entarik! 🎣💦\n\nGenial, tu exitoso recibistein:\n`;
  if (caught.item === "trash") {
    txt += `> ${caught.name} 🤢\nYahh recibisten sampah ... Luman lah recibiste *+${expReward} EXP* pennolaman buang sampah phay tempatn! 😂\n\n`;
  } else {
    txt += `> *${caught.name}* 🎉✨\nAsik mucho! Tu juno recibiste *+${expReward} EXP* !\n\n`;
  }
  
  txt += `⚡ Stamina terpakai: *-${staminaCost}*\n`;
  txt += `\nIkan/sampahn ya masuk a tas (\`.inv\`) ! Jannon lupa mancing otra vez despues! 💖🌊`;

  await m.reply(txt);
}

export { pluginConfig as config, handler };
