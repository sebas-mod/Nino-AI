import config from "../../config.js";
import { getDatabase } from "../../src/lib/ourin-database.js";
import { getRole } from "./level.js";
import fs from "fs";

const pluginConfig = {
  name: "profile",
  alias: ["me", "profil", "myprofile", "my", "stats", "status"],
  category: "user",
  description: "Ver perfil de usuario con estadísticas RPG",
  usage: ".profile [@usuario]",
  example: ".profile",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 5,
  energi: 0,
  isEnabled: true,
};

const EXP_PER_LEVEL = 10000;

function formatNumber(num) {
  return num?.toLocaleString("id-ID") || "0";
}

function getLevelBar(current, target) {
  const totalBars = 10;
  const filledBars = Math.min(
    Math.floor((current / target) * totalBars),
    totalBars,
  );
  const emptyBars = totalBars - filledBars;
  return "▰".repeat(filledBars) + "▱".repeat(emptyBars);
}

async function handler(m, { sock }) {
  const db = getDatabase();
  const target = m.mentionedJid?.[0] || m.quoted?.sender || m.sender;

  const user = db.getUser(target) || db.setUser(target);

  if (!user.rpg) user.rpg = {};
  const userExp = user.exp || 0;
  const userLevel = Math.floor(userExp / EXP_PER_LEVEL) + 1;
  user.rpg.level = userLevel;
  user.rpg.health = user.rpg.health || 100;
  user.rpg.maxHealth = 100 + (userLevel - 1) * 10;
  user.rpg.mana = user.rpg.mana || 100;
  user.rpg.maxMana = 100 + (userLevel - 1) * 5;
  user.rpg.stamina = user.rpg.stamina || 100;
  user.rpg.maxStamina = 100 + (userLevel - 1) * 5;

  const currentLevelExp = (userLevel - 1) * EXP_PER_LEVEL;
  const levelUpExp = userLevel * EXP_PER_LEVEL;
  const expInLevel = userExp - currentLevelExp;
  const expNeeded = levelUpExp - currentLevelExp;
  const role = getRole(userLevel);
  const isOwnerUser = config.isOwner(target);
  const isPremiumUser = config.isPremium(target);

  let ppMedia = null;
  try {
    const ppUrl = await sock.profilePictureUrl(target, "image");
    if (ppUrl) {
      ppMedia = { url: ppUrl };
    } else {
      throw new Error("No PP");
    }
  } catch {
    const fallbackPath = "./assets/images/pp-kosong.jpg";
    if (fs.existsSync(fallbackPath)) {
      ppMedia = fs.readFileSync(fallbackPath);
    } else {
      ppMedia = { url: "https://i.imgur.com/TuItj4L.png" };
    }
  }

  let caption = `*〔 👤 PERFIL DE USUARIO 〕*\n\n`;

  caption += `*〔 👤 Nombre 〕* ${user.name || m.pushName || "Usuario"}\n`;
  caption += `*〔 🆔 Tag 〕* @${target.split("@")[0]}\n`;
  caption += `*〔 👑 Estado 〕* ${isOwnerUser ? "Owner" : isPremiumUser ? "Premium" : "Gratis"}\n\n`;

  caption += `*〔 ⚔️ RPG STATS 〕*\n`;
  caption += `*〔 🛡️ Rol 〕* ${role}\n`;
  caption += `*〔 📊 Level 〕* ${user.rpg.level}\n`;
  caption += `*〔 🚄 Exp 〕* ${formatNumber(userExp)}\n`;
  caption += `*〔 📈 Progreso 〕*\n${getLevelBar(expInLevel, expNeeded)}\n`;
  caption += `${formatNumber(expInLevel)} / ${formatNumber(expNeeded)}\n\n`;

  caption += `*〔 ❤️ Salud 〕* ${user.rpg.health} / ${user.rpg.maxHealth}\n`;
  caption += `*〔 💧 Mana 〕* ${user.rpg.mana} / ${user.rpg.maxMana}\n`;
  caption += `*〔 ⚡ Stamina 〕* ${user.rpg.stamina} / ${user.rpg.maxStamina}\n\n`;

  caption += `*〔 💰 RECURSOS 〕*\n`;
  caption += `*〔 🪙 Koin 〕* Rp ${user.koin?.toLocaleString("id-ID") || 0}\n`;
  caption += `*〔 🏦 Bank 〕* Rp ${user.rpg.bank?.toLocaleString("id-ID") || 0}\n`;
  caption += `*〔 ⚡ Energía 〕* ${isOwnerUser || isPremiumUser ? "∞ Ilimitada" : user.energi}\n`;

  if (user.rpg.spouse) {
    caption += `*〔 💑 Pareja 〕* @${user.rpg.spouse.split("@")[0]}\n`;
  }

  const mentions = [target];
  if (user.rpg.spouse) mentions.push(user.rpg.spouse);

  const msgOptions = { caption, mentions };
  if (ppMedia) {
    msgOptions.image = ppMedia;
  }

  await sock.sendMessage(m.chat, msgOptions, { quoted: m });
}

export { pluginConfig as config, handler };
