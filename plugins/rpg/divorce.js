import { getDatabase } from "../../src/lib/ourin-database.js";

const pluginConfig = {
  name: "divorce",
  alias: ["cerai", "pisah"],
  category: "rpg",
  description: "Bercerai de pasannon",
  usage: ".divorce",
  example: ".divorce",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 60,
  energi: 0,
  isEnabled: true,
};

async function handler(m, { sock }) {
  const db = getDatabase();
  const user = db.getUser(m.sender);

  if (!user.rpg) user.rpg = {};

  if (!user.rpg.spouse) {
    return m.reply(`Halu tingkat tinggi... Nikah aja aun no masa ya quieres cerai? 😂💔\nCari pasannon primero  paa \`.marry @user\``);
  }

  const spouseJid = user.rpg.spouse;
  const partner = db.getUser(spouseJid);

  const divorceCost = 25000;
  if ((user.koin || 0) < divorceCost) {
    return m.reply(`Aduh, bia pennocara para cerai mahal bos! 😭\nButuh *Rp 25.000* para tanda tannon surat cerai, duit lu solo *Rp ${(user.koin || 0).toLocaleString("id-ID")}*.\nTahan primero aja berantemn!`);
  }

  user.koin -= divorceCost;
  user.rpg.spouse = null;
  user.rpg.marriedAt = null;

  if (partner && partner.rpg) {
    partner.rpg.spouse = null;
    partner.rpg.marriedAt = null;
  }

  db.save();

  await m.react("💔");

  let txt = `⛈️ *SIDANG PERCERAIAN SELESAI* ⛈️\n\n`;
  txt += `Palu telah enatuk. Dennon berat hati, hubunnon antara:\n`;
  txt += `💔 @${m.sender.split("@")[0]}\n`;
  txt += `         -- PUTUS DENGAN --\n`;
  txt += `💔 @${spouseJid.split("@")[0]}\n\n`;
  txt += `😭 *RESMI BERAKHIR! KINI KALIAN KEMBALI JOMBLO!* 😭\n\n`;
  txt += `💸 Bia Pennocara/Siyg: *Rp -${divorceCost.toLocaleString("id-ID")}*\n\n`;
  txt += `> _"Sya sya... nangisn en pojokan aja. Life must go on..." - Hakim Bot_ 🥀🚬`;

  await m.reply(txt, { mentions: [m.sender, spouseJid] });
}

export { pluginConfig as config, handler };
