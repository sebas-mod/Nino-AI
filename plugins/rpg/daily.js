import { getDatabase } from "../../src/lib/ourin-database.js";
import { addExpWithLevelCheck } from "../../src/lib/ourin-level.js";
import config from "../../config.js";

const pluginConfig = {
  name: "daily",
  alias: ["harian", "claim"],
  category: "rpg",
  description: "Klaim haenah harian",
  usage: ".daily",
  example: ".daily",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 0,
  energi: 0,
  isEnabled: true,
};

function msToTime(duration) {
  const hours = Math.floor((duration / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((duration / (1000 * 60)) % 60);
  const seconds = Math.floor((duration / 1000) % 60);
  return `${hours} jam ${minutes} minutos ${seconds} detik`;
}

async function handler(m, { sock }) {
  const db = getDatabase();
  const user = db.getUser(m.sender);
  const isPremium = config.isPremium?.(m.sender) || false;

  if (!user.rpg) user.rpg = {};

  const COOLDOWN = 86400000;
  const lastClaim = user.rpg.lastDaily || 0;
  const now = Date.now();

  if (now - lastClaim < COOLDOWN) {
    const remaining = COOLDOWN - (now - lastClaim);
    return m.reply(`Sabar , jatah absen harian tu ya enambil! 😂\n\nTunggu *${msToTime(remaining)}* otra vez  para ambil jatah besok. Jannon serakah! 🏃💨`);
  }

  const expReward = isPremium ? 5000 : 1000;
  const moneyReward = isPremium ? 25000 : 5000;
  const energiReward = isPremium ? 10 : 3;

  user.rpg.lastDaily = now;
  user.koin = (user.koin || 0) + moneyReward;
  user.energi = (user.energi || 0) + energiReward;

  const levelResult = await addExpWithLevelCheck(sock, m, db, user, expReward);
  db.save();

  await m.react("🎁");

  let txt = `ASIKK! Gajian harian ya cair  ! 🎉✨\n\n`;
  txt += `Ini jatah tu para hari esto:\n`;
  txt += `💸 Koin: *+Rp ${moneyReward.toLocaleString("id-ID")}*\n`;
  txt += `📈 EXP: *+${expReward.toLocaleString("id-ID")}*\n`;
  txt += `⚡ Energi: *+${energiReward}*\n\n`;
  
  if (isPremium) {
    txt += `👑 *Wih, bonus member Premium emang beda! Sultan mah bebas!* 😎💸`;
  } else {
    txt += `Quieres bonus lebih gede? Yuk *Upgrade Premium* ! Biar makin ka! 🤑💎`;
  }

  m.reply(txt);
}

export { pluginConfig as config, handler };
