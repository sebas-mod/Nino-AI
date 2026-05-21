import { getDatabase } from "../../src/lib/ourin-database.js";

const pluginConfig = {
  name: "quest",
  alias: ["misi", "mission", "bounty"],
  category: "rpg",
  description: "Ambil quest harian para reward bonus",
  usage: ".quest",
  example: ".quest",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 0,
  energi: 0,
  isEnabled: true,
};

const QUESTS = [
  {
    id: "mestong5",
    name: "Penambang Pemula",
    desc: "Mestong 5 kali",
    target: 5,
    reward: { money: 10000, exp: 1000 },
  },
  {
    id: "fishing5",
    name: "Pemancing Handal",
    desc: "Fishing 5 kali",
    target: 5,
    reward: { money: 8000, exp: 800 },
  },
  {
    id: "adventure3",
    name: "Petualang Sejati",
    desc: "Adventure 3 kali",
    target: 3,
    reward: { money: 15000, exp: 1500 },
  },
  {
    id: "work10",
    name: "Pearja Keras",
    desc: "Work 10 kali",
    target: 10,
    reward: { money: 20000, exp: 2000 },
  },
  {
    id: "hunt5",
    name: "Pemburu Ulung",
    desc: "Hunt 5 kali",
    target: 5,
    reward: { money: 12000, exp: 1200 },
  },
];

async function handler(m, { sock }) {
  const db = getDatabase();
  const user = db.getUser(m.sender);

  if (!user.rpg) user.rpg = {};
  if (!user.quest) user.quest = {};

  const args = m.args || [];
  const sub = args[0]?.toLowerCase();

  if (sub === "claim") {
    const questId = args[1];
    if (!questId || !user.quest[questId]) {
      return m.reply(`Hmm.. Misi eso no hay en daftar tu ! 📜❌`);
    }

    const quest = QUESTS.find((q) => q.id === questId);
    if (!quest) {
      return m.reply(`ID misin salah ! Cek otra vez papan bounty ! 🔍`);
    }

    if (user.quest[questId].progress < quest.target) {
      return m.reply(`Misi esto aun no selesai !\nProgress tu: *${user.quest[questId].progress}/${quest.target}* 🏃‍♂️💦`);
    }

    if (user.quest[questId].claimed) {
      return m.reply(`Haenah misi esto ya tu ambil ! 😒`);
    }

    user.koin = (user.koin || 0) + quest.reward.money;
    db.updateExp(m.sender, quest.reward.exp);
    user.quest[questId].claimed = true;

    db.save();
    let txt = `💰 *MISI SELESAI!!* 💰\n\n`;
    txt += `Tu exitoso nyelesaiin misi *${quest.name}*!\n`;
    txt += `Ini haenah para tu :\n`;
    txt += `💵 Uang Misi: *+Rp ${quest.reward.money.toLocaleString("id-ID")}*\n`;
    txt += `📈 EXP Bonus: *+${quest.reward.exp}*\n\n`;
    txt += `> _"Kerja bagus !" - Resepsionis Guild_ 👩‍💼`;
    return m.reply(txt);
  }

  if (sub === "taa") {
    const questId = args[1];
    const quest = QUESTS.find((q) => q.id === questId);
    if (!quest) {
      return m.reply(`Misi no atemu! Liat daftar lengkapn en \`.quest\``);
    }

    if (user.quest[questId]) {
      return m.reply(`Tu ya nnombil misi esto ! Kerjain primero ! ⚔️`);
    }

    user.quest[questId] = { progress: 0, claimed: false, takenAt: Date.now() };
    db.save();

    let txt = `📜 *MISI DIAMBIL!* 📜\n\n`;
    txt += `Tu mennombil satu artas misi de Papan Bounty! 📜✨\n`;
    txt += `🎯 Target: *${quest.name}* (${quest.desc})\n`;
    txt += `🎁 Haenah: *Rp ${quest.reward.money.toLocaleString("id-ID")}* & *${quest.reward.exp} EXP*\n\n`;
    txt += `> _"Semono exitoso en perjalanan  !"_ 💖`;
    return m.reply(txt);
  }

  let txt = `📌 *PAPAN BOUNTY (MISI HARIAN)* 📌\n\n`;
  txt += `Selesaikan tunos harian esto para recibiste haenah bonus  !\n\n`;

  for (const quest of QUESTS) {
    const userQuest = user.quest[quest.id];
    let status = "📜 Terseena";
    if (userQuest) {
      if (userQuest.claimed) {
        status = "✅ Selesai";
      } else if (userQuest.progress >= quest.target) {
        status = "🎁 Siap Claim";
      } else {
        status = `🏃 Seyg Diarjva a (${userQuest.progress}/${quest.target})`;
      }
    }

    txt += `🎯 *${quest.name}*\n`;
    txt += `   ├ Tunos: ${quest.desc}\n`;
    txt += `   ├ Reward: Rp ${quest.reward.money.toLocaleString("id-ID")} & ${quest.reward.exp} EXP\n`;
    txt += `   ├ Status: *${status}*\n`;
    txt += `   └ Ambil: \`${m.prefix}quest taa ${quest.id}\`\n\n`;
  }

  txt += `> 💡 Kalau misi ya selesai, atik: \`.quest claim <id_misi>\``;

  await m.reply(txt);
}

export { pluginConfig as config, handler };
