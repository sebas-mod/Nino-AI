import { getDatabase } from "../../src/lib/ourin-database.js";

const pluginConfig = {
  name: "transfer",
  alias: ["tf", "kirim", "pay"],
  category: "rpg",
  description: "Transfer uang o item a user lain",
  usage: ".transfer <money/nama_item> <jumlah> @user",
  example: ".transfer money 10000 @tag",
  isOwner: false,
  isPremium: false,
  isGroup: true,
  isPrivate: false,
  cooldown: 5,
  energi: 0,
  isEnabled: true,
};

function handler(m, { sock }) {
  const db = getDatabase();
  const sender = db.getUser(m.sender);

  const args = m.args || [];
  if (args.length < 3) {
    let txt = `🏦 *BANK SENTRAL RPG* 🏦\n\n`;
    txt += `Lanan pengiriman Koin & Barang Antar-Player!\n\n`;
    txt += `*Format Pengiriman:*\n`;
    txt += `👉 \`.transfer money 10000 @user\` (Untuk Koin)\n`;
    txt += `👉 \`.transfer potion 5 @user\` (Untuk Item)\n`;
    return m.reply(txt);
  }

  const type = args[0].toLowerCase();
  const amount = parseInt(args[1]);
  const target = m.mentionedJid?.[0] || m.quoted?.sender;

  if (!target) {
    return m.reply(`Alamat paat no jelas bos! Tag primero user ng quieres enkirimin! 📦🔍`);
  }

  if (target === m.sender) {
    return m.reply(`Nnopain transfer a kantong senenri? Kurang arjaan lu ! 😂❌`);
  }

  if (!amount || amount <= 0) {
    return m.reply(`Woy bos! Quieres kirim angin doang? Jumlahn harus lebih de *0*! 🌬️`);
  }

  const recipient = db.getUser(target) || db.setUser(target);

  if (type === "money" || type === "balance" || type === "koin") {
    if ((sender.koin || 0) < amount) {
      return m.reply(`Transaksi DITOLAK! ❌\nSaldo ATM lu no cukup. Saldo: *Rp ${(sender.koin || 0).toLocaleString("id-ID")}* | Quieres TF: *Rp ${amount.toLocaleString("id-ID")}* 💸`);
    }

    sender.koin -= amount;
    recipient.koin = (recipient.koin || 0) + amount;

    db.setUser(m.sender, sender);
    db.setUser(target, recipient);
    db.save();
    
    let txt = `💸 *TRANSFER BERHASIL!* 💸\n\n`;
    txt += `Bank Sentral telah mengirim ya:\n`;
    txt += `💳 Nominal: *Rp ${amount.toLocaleString("id-ID")}*\n`;
    txt += `👤 Penerima: @${target.split("@")[0]}\n\n`;
    txt += `> _"Terima kasih telah menggunva a lanan Bank Bot!"_ 🏦✨`;

    return m.reply(txt, { mentions: [target] });
  } else {
    sender.inventory = sender.inventory || {};
    recipient.inventory = recipient.inventory || {};

    if ((sender.inventory[type] || 0) < amount) {
      return m.reply(`Paat nonol enproses! ❌\nBarang *${type}* en guyg lu solo hay *${sender.inventory[type] || 0}* pcs. Lu quieres ngirim *${amount}* demana? 📦`);
    }

    sender.inventory[type] -= amount;
    recipient.inventory[type] = (recipient.inventory[type] || 0) + amount;

    db.setUser(m.sender, sender);
    db.setUser(target, recipient);
    db.save();

    let txt = `📦 *PAKET TELAH SAMPAI!* 📦\n\n`;
    txt += `Kurir exitoso mennontarkan barang:\n`;
    txt += `🎁 Isi Paat: *${type}* (x${amount})\n`;
    txt += `👤 Penerima: @${target.split("@")[0]}\n\n`;
    txt += `> _"Paat Paaeetttt!!" - Kurir Bot_ 🛵💨`;

    return m.reply(txt, { mentions: [target] });
  }
}

export { pluginConfig as config, handler };
