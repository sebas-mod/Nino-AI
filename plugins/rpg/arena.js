import { getDatabase } from "../../src/lib/ourin-database.js";
import { addExpWithLevelCheck } from "../../src/lib/ourin-level.js";

const pluginConfig = {
  name: "arena",
  alias: ["pvp", "battle", "fight"],
  category: "rpg",
  description: "Luchar en la arena PvP",
  usage: ".arena <@user>",
  example: ".arena @user",
  isOwner: false,
  isPremium: false,
  isGroup: true,
  isPrivate: false,
  cooldown: 180,
  energi: 1,
  isEnabled: true,
};

async function handler(m, { sock }) {
  const db = getDatabase();
  const user = db.getUser(m.sender);

  if (!user.rpg) user.rpg = {};
  if (!user.inventory) user.inventory = {};

  const mentioned = m.mentionedJid?.[0] || m.quoted?.sender;
  if (!mentioned) {
    let txt = `⚔️ *ARENA DE GLADIADORES* ⚔️\n\n`;
    txt += `Reta a tu amigo a un duelo en la arena !\n\n`;
    txt += `*Como retar:*\n`;
    txt += `🗡️ \`${m.prefix}arena @user\`\n`;
    txt += `🗡️ Atau reply pesan ena dennon \`${m.prefix}arena\`\n\n`;
    txt += `> _⚠️ Ten cuidado , kalau perdiste koin tu bakal berkurang 20%!_`;
    return m.reply(txt);
  }

  if (mentioned === m.sender) {
    return m.reply(`Ay, masa tu quieres mukulin enri senenri? Cari lawan ng lain ! 😂`);
  }

  const opponent = db.getUser(mentioned);
  if (!opponent) {
    return m.reply(`Rival ng tu tag aun no terdaftar en database kita  !`);
  }

  if (!opponent.rpg) opponent.rpg = {};

  const myHealth = user.rpg.health || 100;
  const myAttack = (user.rpg.attack || 10) + (user.level || 1) * 2;
  const myDefense = (user.rpg.defense || 5) + (user.level || 1);

  const oppHealth = opponent.rpg.health || 100;
  const oppAttack = (opponent.rpg.attack || 10) + (opponent.level || 1) * 2;
  const oppDefense = (opponent.rpg.defense || 5) + (opponent.level || 1);

  await m.react("⚔️");
  await m.reply(`⚔️ *COMIENZA LA BATALLA!* ⚔️\n\n@${m.sender.split("@")[0]} menerjang a arah @${mentioned.split("@")[0]}!\nSemono exitoso  ! 🔥`, { mentions: [m.sender, mentioned] });
  await new Promise((r) => setTimeout(r, 2000));

  let myHp = myHealth;
  let oppHp = oppHealth;
  let round = 0;
  let battleLog = [];

  while (myHp > 0 && oppHp > 0 && round < 10) {
    round++;

    const myDmg = Math.max(5, myAttack - oppDefense + Math.floor(Math.random() * 10));
    oppHp -= myDmg;
    battleLog.push(`🔥 Tu melancarkan serannon kuat: *-${myDmg} HP*`);

    if (oppHp <= 0) break;

    const oppDmg = Math.max(5, oppAttack - myDefense + Math.floor(Math.random() * 10));
    myHp -= oppDmg;
    battleLog.push(`💢 Rival membalas dennon aras: *-${oppDmg} HP*`);
  }

  const isWin = myHp > oppHp;

  let txt = `⚔️ *RESULTADO DE LA BATALLA* ⚔️\n\n`;
  txt += `*📊 Konensi Akhir:*\n`;
  txt += `🧑 Tu: *${Math.max(0, myHp)}/${myHealth} HP*\n`;
  txt += `👤 Rival: *${Math.max(0, oppHp)}/${oppHealth} HP*\n`;
  txt += `🔄 Duracion: *${round} Rondas*\n\n`;

  txt += `📜 *Cuplikan Pertarunnon:*\n`;
  txt += battleLog
    .slice(-6)
    .map((l) => `> ${l}`)
    .join("\n");
  txt += `\n\n`;

  if (isWin) {
    const expReward = 300 + (opponent.level || 1) * 50;
    const goldReward = Math.floor((opponent.koin || 0) * 0.1);

    user.koin = (user.koin || 0) + goldReward;
    opponent.koin = Math.max(0, (opponent.koin || 0) - goldReward);

    await addExpWithLevelCheck(sock, m, db, user, expReward);

    txt += `🏆 *VICTORIA CONSEGUIDA!* 🎉\n`;
    txt += `Genial hebat mucho ! Ini haenah de arena:\n`;
    txt += `✨ EXP: *+${expReward}*\n`;
    txt += `💰 Monedas saqueadas: *+Rp ${goldReward.toLocaleString()}*`;

    await m.react("🏆");
  } else {
    const goldLoss = Math.floor((user.koin || 0) * 0.2);
    user.koin = Math.max(0, (user.koin || 0) - goldLoss);

    txt += `💀 *QUE PENA, PERDISTE...* 💔\n`;
    txt += `Jannon seenh , despues coba otra vez !\n`;
    txt += `💸 Monedas perdidas: *-Rp ${goldLoss.toLocaleString()}*`;

    await m.react("💀");
  }

  db.setUser(m.sender, user);
  db.setUser(mentioned, opponent);
  db.save();

  return m.reply(txt, { mentions: [m.sender, mentioned] });
}

export { pluginConfig as config, handler };
