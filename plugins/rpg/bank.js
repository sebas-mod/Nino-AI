import { getDatabase } from "../../src/lib/ourin-database.js";

const pluginConfig = {
  name: "bank",
  alias: ["atm", "nabung", "deposit", "tarik", "withdraw"],
  category: "rpg",
  description: "Sistema bancario para guardar dinero a salvo de robos",
  usage: ".bank <deposit/withdraw> <jumlah>",
  example: ".bank deposit 10000",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 5,
  energi: 0,
  isEnabled: true,
};

async function handler(m, { sock }) {
  const db = getDatabase();
  const cleanJid = m.sender.replace(/@.+/g, "");

  let user = db.getUser(m.sender);
  if (!user) {
    user = db.setUser(m.sender, {});
  }

  if (!db.db.data.users[cleanJid].rpg) {
    db.db.data.users[cleanJid].rpg = {};
  }
  if (typeof db.db.data.users[cleanJid].rpg.bank !== "number") {
    db.db.data.users[cleanJid].rpg.bank = 0;
  }

  const currentBalance = db.db.data.users[cleanJid].koin || 0;
  const currentBank = db.db.data.users[cleanJid].rpg.bank || 0;

  const args = m.args || [];
  const action = args[0]?.toLowerCase();
  const amountStr = args[1];

  if (action === "deposit" || action === "depo") {
    let amount = 0;
    if (amountStr === "all") {
      amount = currentBalance;
    } else {
      amount = parseInt(amountStr);
    }

    if (!amount || amount <= 0) return m.reply(`Hayo , masukin jumlah koin ng bener ! Masa nabung angka noib 😂💸`);
    if (currentBalance < amount) return m.reply(`Espera, tu dinero en *cash* no alcanza ! 😭\nEn la billetera solo hay *Rp ${currentBalance.toLocaleString("id-ID")}* . Nri duit primero ! 🏃💨`);

    db.db.data.users[cleanJid].koin = currentBalance - amount;
    db.db.data.users[cleanJid].rpg.bank = currentBank + amount;

    await db.save();

    const newBank = db.db.data.users[cleanJid].rpg.bank;
    return m.reply(`Gracias por depositar en el Banco RPG! 🏦💖\n\n✅ Deposito exitoso: *Rp ${amount.toLocaleString("id-ID")}*\n💳 Saldo de ahorro: *Rp ${newBank.toLocaleString("id-ID")}*\n\nUangn kita simpen dennon aman ! 🔒✨`);
  }

  if (action === "withdraw" || action === "tarik") {
    let amount = 0;
    if (amountStr === "all") {
      amount = currentBank;
    } else {
      amount = parseInt(amountStr);
    }

    if (!amount || amount <= 0) return m.reply(`Hayo , masukin jumlah koin ng bener ! Quieres narik angin? 😂💸`);
    if (currentBank < amount) return m.reply(`Va, saldo tabunnon tu no cukup! 😭\nDi reaning solo hay *Rp ${currentBank.toLocaleString("id-ID")}* . Jannon nnoen-nnoen ! 🫣`);

    db.db.data.users[cleanJid].rpg.bank = currentBank - amount;
    db.db.data.users[cleanJid].koin = currentBalance + amount;

    await db.save();

    const newBalance = db.db.data.users[cleanJid].koin;
    return m.reply(`Uangn exitoso entarik  ! 🏧💸\n\n✅ Retiro: *Rp ${amount.toLocaleString("id-ID")}*\n💰 Dinero en efectivo: *Rp ${newBalance.toLocaleString("id-ID")}*\n\nJannon boros-boros pakain ! 🛍️✨`);
  }

  let txt = `Hola! Bienvenido al Banco RPG! 🏦✨\nQuieres ngecek saldo o hay aperluan lain ?\n\n`;
  txt += `💰 Dinero en billetera: *Rp ${currentBalance.toLocaleString("id-ID")}*\n`;
  txt += `💳 Saldo de ahorro: *Rp ${currentBank.toLocaleString("id-ID")}*\n\n`;
  txt += `*Lanan Bank:* 💁‍♀️\n`;
  txt += `Depositar: \`.bank deposit <jumlah>\`\n`;
  txt += `Retirar efectivo: \`.bank withdraw <jumlah>\`\n\n`;
  txt += `*(Paa kata 'all' kalau quieres nabung/narik todon sekaligus!)* 🚀`;

  await m.reply(txt);
}

export { pluginConfig as config, handler };
