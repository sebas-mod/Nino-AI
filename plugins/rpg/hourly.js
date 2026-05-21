import { getDatabase } from "../../src/lib/ourin-database.js";
import { addExpWithLevelCheck } from "../../src/lib/ourin-level.js";
import config from "../../config.js";

const pluginConfig = {
  name: "hourly",
  alias: ["jam", "perjam"],
  category: "rpg",
  description: "Klaim haenah per jam",
  usage: ".hourly",
  example: ".hourly",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 0,
  energi: 0,
  isEnabled: true,
};

function msToTime(duration) {
  const minutes = Math.floor((duration / (1000 * 60)) % 60);
  const seconds = Math.floor((duration / 1000) % 60);
  return `${minutes} minutos ${seconds} detik`;
}

async function handler(m, { sock }) {
  const db = getDatabase();
  const user = db.getUser(m.sender);
  const isPremium = config.isPremium?.(m.sender) || false;

  if (!user.rpg) user.rpg = {};

  const COOLDOWN = 3600000;
  const lastClaim = user.rpg.lastHourly || 0;
  const now = Date.now();

  if (now - lastClaim < COOLDOWN) {
    const remaining = COOLDOWN - (now - lastClaim);
    return m.reply(`Espera, buru-buru amat ! 😂\n\nJatah jam esto ya tu ambil, tunggu *${msToTime(remaining)}* otra vez  baru balik a sesto! 🏃💨`);
  }

  const expReward = isPremium ? 1000 : 200;
  const moneyReward = isPremium ? 5000 : 1000;

  user.rpg.lastHourly = now;
  user.koin = (user.koin || 0) + moneyReward;

  const levelResult = await addExpWithLevelCheck(sock, m, db, user, expReward);
  db.save();

  await m.react("⏰");

  let txt = `WAKTUNYA GAJIAN JAM-JAMAN! ⏰✨\n\n`;
  txt += `Ini ena jatah tu:\n`;
  txt += `💸 Koin: *+Rp ${moneyReward.toLocaleString("id-ID")}*\n`;
  txt += `📈 EXP: *+${expReward.toLocaleString("id-ID")}*\n\n`;
  txt += `Balik otra vez 1 jam amuenan  ! 😘`;

  m.reply(txt);
}

export { pluginConfig as config, handler };
