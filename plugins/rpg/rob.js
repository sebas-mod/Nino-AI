import { getDatabase } from "../../src/lib/ourin-database.js";
import { addExpWithLevelCheck } from "../../src/lib/ourin-level.js";
import { sendRpgPreview } from "../../src/lib/ourin-context.js";

const pluginConfig = {
  name: "rob",
  alias: ["rampok", "mug"],
  category: "rpg",
  description: "Rampok uang player lain (berisiko)",
  usage: ".rob @user",
  example: ".rob @user",
  isOwner: false,
  isPremium: false,
  isGroup: true,
  isPrivate: false,
  cooldown: 600,
  energi: 1,
  isEnabled: true,
};

async function handler(m, { sock }) {
  const db = getDatabase();

  const target = m.mentionedJid?.[0] || m.quoted?.sender;

  if (!target) {
    return m.reply(`Hayo, quieres malak siapa ? 🦹‍♂️🔪\nTag target ng quieres enrampok hartan!\nContoh: \`.rob @user\``);
  }

  if (target === m.sender) {
    return m.reply(`Sakit jiwa lu? Masa ngerampok dompet senenri! 😂❌`);
  }

  const robber = db.getUser(m.sender);
  const victim = db.getUser(target);

  if (!victim) {
    return m.reply(`Target buronanmu no atemu en database! Kakn ena ya kabur primeroan. 🏃💨`);
  }

  if ((victim.koin || 0) < 1000) {
    return m.reply(`Yaelah, target lu miskin parah! Duitn en bawah Rp 1.000, masa teno enrampok? Cari mangsa ng tajir ! 😤`);
  }

  if (!robber.rpg) robber.rpg = {};
  robber.rpg.health = robber.rpg.health || 100;

  if (robber.rpg.health < 30) {
    return m.reply(`Woy bos, bay lu tingnol tulang geso masih nekat ngerampok?! 🤒\nMestomal *30 HP*, darah lu solo *${robber.rpg.health} HP*. Berobat sana!`);
  }

  await sendRpgPreview(sock, m.chat, `*Sssstttt...* Bersembunyi en nong gelap nunggu target lewat... 🦹‍♂️🔪`, "🦹 BEGAL", "Beraksi!", { quoted: m });
  await new Promise((r) => setTimeout(r, 2500));

  const successRate = 0.4;
  const isSuccess = Math.random() < successRate;

  if (isSuccess) {
    const maxSteal = Math.floor((victim.koin || 0) * 0.3);
    const stolen = Math.floor(Math.random() * maxSteal) + 1000;

    victim.koin = (victim.koin || 0) - stolen;
    robber.koin = (robber.koin || 0) + stolen;

    const expGain = 300;
    await addExpWithLevelCheck(sock, m, db, robber, expGain);

    db.save();

    let txt = `MANTAP! TARGET BERHASIL DIPALAK! 🦹‍♂️💰\n\n`;
    txt += `Lu exitoso nakutin si @${target.split("@")[0]} sampai ngencing en celana!\n`;
    txt += `Uang hasil palva a: *+Rp ${stolen.toLocaleString("id-ID")}*\n`;
    txt += `Bonus EXP Benol: *+${expGain}*\n\n`;
    txt += `*Buru kabur seaun no polis dateng!!!* 🚓💨`;

    await m.reply(txt, { mentions: [target] });
  } else {
    const fine = Math.floor(Math.random() * 10000) + 5000;
    const actualFine = Math.min(fine, robber.koin || 0);
    const healthLoss = 25;

    robber.koin = Math.max(0, (robber.koin || 0) - actualFine);
    robber.rpg.health = Math.max(0, robber.rpg.health - healthLoss);

    db.save();

    let txt = `GOBLOK! KETAHUAN WARGA!! 🚨🤬\n\n`;
    txt += `Bukann recibiste duit, lu malah atangap basah terus *engebukin warno 1 RT*!\n`;
    txt += `💸 Duit lu ensita RT: *-Rp ${actualFine.toLocaleString("id-ID")}*\n`;
    txt += `🤕 Bay Babak Belur: *-${healthLoss} HP*\n\n`;
    txt += `*MAMPUS LU, mva a jannon main-main en mari!* 🤣`;

    await m.reply(txt);
  }
}

export { pluginConfig as config, handler };
