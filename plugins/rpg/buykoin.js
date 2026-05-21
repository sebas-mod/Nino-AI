import { getDatabase } from "../../src/lib/ourin-database.js";
const pluginConfig = {
  name: "buykoin",
  alias: ["belikoin", "belicoin", "exptokoin", "exptocoin"],
  category: "rpg",
  description: "Cambiar EXP por Koin",
  usage: ".buykoin <jumlah>",
  example: ".buykoin 10000",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 5,
  energi: 0,
  isEnabled: true,
};

const EXP_PER_KOIN = 2;

async function handler(m, { sock }) {
  const db = getDatabase();
  const user = db.getUser(m.sender);

  if (!user.rpg) user.rpg = {};

  const args = m.args || [];
  const amountStr = args[0];

  if (!amountStr) {
    let txt = `💱 *Buy Koin*\n\n`;
    txt += `> Cambiar EXP por Koin!\n\n`;
    txt += `*📊 Kurs:*\n`;
    txt += `> 💎 ${EXP_PER_KOIN} EXP = 1 Koin\n\n`;
    txt += `*📋 Saldo:*\n`;
    txt += `> 🚄 EXP: *${(user.exp || 0).toLocaleString("id-ID")}*\n`;
    txt += `> 💰 Koin: *${(user.koin || 0).toLocaleString("id-ID")}*\n\n`;
    txt += `> Contoh: \`.buykoin 10000\`\n`;
    txt += `> Usara ${10000 * EXP_PER_KOIN} EXP para 10.000 Koin`;

    return m.reply(txt);
  }

  let koinAmount = 0;
  if (amountStr === "all" || amountStr === "max") {
    koinAmount = Math.floor((user.exp || 0) / EXP_PER_KOIN);
  } else {
    koinAmount = parseInt(amountStr);
  }

  if (!koinAmount || koinAmount <= 0) {
    return m.reply(`❌ Masukkan jumlah koin ng valid!`);
  }

  const expNeeded = koinAmount * EXP_PER_KOIN;

  if ((user.exp || 0) < expNeeded) {
    const maxPossible = Math.floor((user.exp || 0) / EXP_PER_KOIN);
    return m.reply(
      `❌ *EXP no cukup!*\n\n` +
        `> Necesario: *${expNeeded.toLocaleString("id-ID")} EXP*\n` +
        `> EXP tu: *${(user.exp || 0).toLocaleString("id-ID")} EXP*\n\n` +
        `> Maksimal: *${maxPossible.toLocaleString("id-ID")} Koin*`,
    );
  }

  // Use manual user update instead of updateKoin/updateExp to do batch update
  // But since logic was db.setUser, let's stick to update logic here
  const newEXP = (user.exp || 0) - expNeeded;
  const newKoin = (user.koin || 0) + koinAmount;

  db.setUser(m.sender, {
    exp: newEXP,
    koin: newKoin,
  });

  await m.react("💱");

  let txt = `💱 *Tukar Berhasil!*\n\n`;
  txt += `*📋 Detail:*\n`;
  txt += `> 🚄 EXP: *-${expNeeded.toLocaleString("id-ID")}*\n`;
  txt += `> 💰 Koin: *+${koinAmount.toLocaleString("id-ID")}*\n\n`;
  txt += `*📊 Saldo Sekarang:*\n`;
  txt += `> 🚄 EXP: *${newEXP.toLocaleString("id-ID")}*\n`;
  txt += `> 💰 Koin: *${newKoin.toLocaleString("id-ID")}*`;

  m.reply(txt);
}

export { pluginConfig as config, handler };
