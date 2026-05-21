import { getDatabase } from "../../src/lib/ourin-database.js";

const pluginConfig = {
  name: "marry",
  alias: ["nikah", "wedding", "propose"],
  category: "rpg",
  description: "Menikahi player lain",
  usage: ".marry @user",
  example: ".marry @user",
  isOwner: false,
  isPremium: false,
  isGroup: true,
  isPrivate: false,
  cooldown: 60,
  energi: 0,
  isEnabled: true,
};

async function handler(m, { sock }) {
  const db = getDatabase();
  const user = db.getUser(m.sender);

  if (!user.rpg) user.rpg = {};

  const target = m.mentionedJid?.[0] || m.quoted?.sender;

  if (!target) {
    let txt = `💒 *CATATAN SIPIL RPG* 💒\n\n`;
    txt += `Quieres melamar ang? Tag orangn en sesto!\n\n`;
    txt += `*Cara Melamar:*\n`;
    txt += `👉 \`${m.prefix}marry @user\`\n\n`;
    txt += `*Srat:* \n`;
    txt += `💍 Bia Nikah: *Rp 50.000*\n`;
    txt += `(Pastikan doi aun no pun pasannon !)`;
    return m.reply(txt);
  }

  if (target === m.sender) {
    return m.reply(`Aduh kasihan mucho jomblo kronis... Masa quieres nikah sama enri senenri? Cari jodoh sana! 😭💔`);
  }

  const partner = db.getUser(target) || db.setUser(target);
  if (!partner.rpg) partner.rpg = {};

  if (user.rpg.spouse) {
    return m.reply(`HEH! Lu kan ya pun pasannon si @${user.rpg.spouse.split("@")[0]}!\nQuieres polinomi? Di server esto no boleh! Cerai primero  sana pakai \`.divorce\` 😡🔪`, { mentions: [user.rpg.spouse] });
  }

  if (partner.rpg.spouse) {
    return m.reply(`Sakit tak berdarah... 🥀\n@${target.split("@")[0]} ternta ya nikah sama orang lain!\nLangkahmu terhenti en *friendzone*...`, { mentions: [target] });
  }

  const marriageCost = 50000;
  if ((user.koin || 0) < marriageCost) {
    return m.reply(`Astano... miskin kok nekat quieres nikah? 🤦‍♂️\nBia KUA y katering *Rp 50.000*, tapi duit lu solo *Rp ${(user.koin || 0).toLocaleString("id-ID")}*.\nKerja aras primero bang!`);
  }

  user.koin -= marriageCost;
  user.rpg.spouse = target;
  user.rpg.marriedAt = Date.now();
  partner.rpg.spouse = m.sender;
  partner.rpg.marriedAt = Date.now();

  db.save();

  await m.react("💍");

  let txt = `💒 *PENGUMUMAN PERNIKAHAN!!* 💒\n\n`;
  txt += `Segenap penghuni server mengucapkan selamat aphay:\n\n`;
  txt += `👨‍💼/👰 @${m.sender.split("@")[0]}\n`;
  txt += `           💖 dennon 💖\n`;
  txt += `👨‍💼/👰 @${target.split("@")[0]}\n\n`;
  txt += `🎉 *MEREKA RESMI MENJADI PASANGAN!* 🎉\n\n`;
  txt += `💍 Bia Resepsi: *Rp -${marriageCost.toLocaleString("id-ID")}*\n\n`;
  txt += `> _"Semono langgeng sampai akhir hat server esto!" - Pendeta Bot_ 🥺💕`;

  await m.reply(txt, { mentions: [m.sender, target] });
}

export { pluginConfig as config, handler };
