import { getDatabase } from "../../src/lib/ourin-database.js";
import { addExpWithLevelCheck } from "../../src/lib/ourin-level.js";

const pluginConfig = {
  name: "adventure",
  alias: ["adv", "petualangan"],
  category: "rpg",
  description: "Aventurarse para obtener EXP y recompensas",
  usage: ".adventure",
  example: ".adventure",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 120,
  energi: 1,
  isEnabled: true,
};

async function handler(m, { sock }) {
  const db = getDatabase();
  const user = db.getUser(m.sender);

  if (!user.rpg) user.rpg = {};
  user.rpg.health = user.rpg.health || 100;

  if (user.rpg.health < 30) {
    return m.reply(`Ay, tu HP esta critico ! 😭💔\n\nMestomal necesita *30 HP* para berpetualang para que no morir en el camino.\nSekarang HP tu solo restante *${user.rpg.health} HP*. Curate primero! 💉✨`);
  }

  const locations = ["🌲 Hutan Gelap", "🏔️ Gunung Es Abaen", "🏜️ Payg Pasir Kematian", "🌋 Gunung Berapi", "🏰 Kastil Tua Berhantu", "🌊 Pantai Misterius"];
  const location = locations[Math.floor(Math.random() * locations.length)];

  await m.react("🗺️");
  await m.reply(`Mengepak ransel y menlva a obor... Entrando a *${location}*... ⚔️🗺️\nTen cuidado  , auran luman mencekam!`);
  await new Promise((r) => setTimeout(r, 2500));

  const isWin = Math.random() < 0.6;

  if (isWin) {
    const expGain = Math.floor(Math.random() * 2000) + 500;
    const moneyGain = Math.floor(Math.random() * 10000) + 2000;

    user.koin = (user.koin || 0) + moneyGain;
    const levelResult = await addExpWithLevelCheck(sock, m, db, user, expGain);

    db.save();

    let txt = `🗡️ *AVENTURA EXITOSA!!* 🗡️\n\n`;
    txt += `📍 Ubicacion: *${location}*\n\n`;
    txt += `Genial hebat ! Tu exitoso nnolahin monster penjano y nemuin peti harta karun!\n`;
    txt += `💰 Koin: *+Rp ${moneyGain.toLocaleString("id-ID")}*\n`;
    txt += `📈 EXP: *+${expGain.toLocaleString("id-ID")}*\n\n`;
    txt += `Kembali dennon selamat! Sigue la aventura despues  ! 🚀✨`;

    await m.reply(txt);
  } else {
    const healthLoss = Math.floor(Math.random() * 30) + 10;
    user.rpg.health = Math.max(0, user.rpg.health - healthLoss);

    let msg = `☠️ *EMBOSCADA DE MONSTRUOS!!* ☠️\n\n`;
    msg += `📍 Ubicacion: *${location}*\n\n`;
    msg += `Ay! Langkah tu atahuan, sealompok monster nyerang bertubi-tubi!\n`;
    msg += `❤️ HP reducido: *-${healthLoss} HP* (Restante: ${user.rpg.health})\n\n`;

    if (user.rpg.health <= 0) {
      user.rpg.health = 0;
      user.exp = Math.floor((user.exp || 0) / 2);
      msg += `💀 *MORISTE!*\nYaampun ... Ca?ste en el lugar. EXP tu ana penalti 50% . 💔🥀`;
    } else {
      msg += `Por suerte alcanzaste a escapar ! Menenng istirahat primero para ngeheal ! 🏃💨`;
    }

    db.save();
    await m.reply(msg);
  }
}

export { pluginConfig as config, handler };
