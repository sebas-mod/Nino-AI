import { getDatabase } from "../../src/lib/ourin-database.js";

import {
  getOrCreateMCUser,
  getRandomOre,
  formatMoney,
  addPickExp,
  addPlayerExp,
  getUpgradedStats,
  doGachaPull,
  getStreakBonus,
  doCombat,
  doSmelt,
  doCraft,
  doJackpotPull,
  applyJackpotReward,
  getAvailableMobs,
  healPlayer,
  JACKPOT_POOLS,
} from "../../src/lib/ourin-minecraft.js";

import {
  biomes,
  travelRequirements,
  pickaxes,
  pickEnchants,
  mobData,
  RARITY_EMOJI,
  UPGRADES,
  DAILY_REWARDS,
  TOKEN_SHOP,
  GACHA_COST_COINS,
  GACHA_PITY_LIMIT,
  SMELT_RECIPES,
  CRAFT_RECIPES,
} from "../../src/lib/ourin-minecraft-data.js";

import config from "../../config.js";
import path from "path";
import fs from "fs";

const MC = 15;

const rc = (r) => RARITY_EMOJI[r] || "⬜";

const encCost = (r) =>
  ({
    common: 60000,
    rare: 600000,
    epic: 6e6,
    legendary: 6e7,
    mythic: 6e8,
    godly: 6e9,
    secret: 6e10,
  })[r] || 60000;

let thumbMC = null;

try {
  const p = path.join(
    process.cwd(),
    "assets",
    "images",
    "ourin-minecraft.jpg",
  );

  if (fs.existsSync(p)) {
    thumbMC = fs.readFileSync(p);
  }
} catch (e) {}

function ctx() {
  const sId =
    config.saluran?.id || "120363400911374213@newsletter";

  const sName =
    config.saluran?.name ||
    config.bot?.name ||
    "Nino AI";

  return {
    forwardingScore: 9999,
    isForwarded: true,
    forwardedNewsletterMessageInfo: {
      newsletterJid: sId,
      newsletterName: sName,
      serverMessageId: 127,
    },
  };
}

function send(sock, m, text) {
  const msgId = sock.sendPreview(
    m.chat,
    {
      caption: `${config.info.website} ${text}`,
      url: `${config.info.website}`,
      title: `𝗠𝗜𝗡𝗘𝗖𝗥𝗔𝗙𝗧 𝗚𝗔𝗠𝗘`,
      description:
        `⛏️ mina, 🛠️ craftea y ⚔️ pelea mobs`,
      jpegThumbnail: thumbMC,
      previewType: 0,
    },
    { quoted: m },
  );

  return {
    key: {
      id: msgId,
      remoteJid: m.chat,
      fromMe: true,
    },
  };
}

const pluginConfig = {
  name: "minecraft",
  alias: ["mct"],
  category: "game",
  description: "Minecraft game plugin",
  usage: ".mct help",
  example: ".mct mine",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 3,
  energi: 0,
  isEnabled: true,
};

async function handler(m, { sock }) {
  const db = getDatabase();

  const cmd =
    m.command ||
    m.body?.split(" ")[0]?.slice(1)?.toLowerCase() ||
    "";

  const args =
    m.args ||
    m.body?.split(" ").slice(1) ||
    [];

  const sub = args[0]?.toLowerCase() || "";
  const sa = args.slice(1);

  if (cmd !== "mct" && cmd !== "minecraft") return;

  const user = getOrCreateMCUser(db, m.sender);
  const mc = user.minecraft;

  if (!sub || sub === "help") {
    return send(
      sock,
      m,
      `*🧱 MINECRAFT GAME*

⛏️ .mct mine
📦 .mct collect
💸 .mct sell
👤 .mct me
📊 .mct stats
⚔️ .mct fight
❤️ .mct heal
🎒 .mct inv
🎁 .mct daily
🎰 .mct gacha
👑 .mct prestige
🏆 .mct top`,
    );
  }

  if (sub === "mine") {
    if (
      mc.miningPending &&
      mc.miningPending.length > 0
    ) {
      return m.reply(
        "_📦 Usa `.mct collect` primero_",
      );
    }

    const now = Date.now();

    if (
      mc.lastMineTime &&
      now - mc.lastMineTime < MC * 1000
    ) {
      return m.reply(
        `_⏳ Espera ${Math.ceil(
          (MC * 1000 -
            (now - mc.lastMineTime)) /
            1000,
        )} segundos_`,
      );
    }

    const pk = mc.usedPickaxe || "woodpick";
    const pick = mc.pickaxes[pk];

    if (!pick) {
      return m.reply("_🪓 No tienes pico_");
    }

    const biome = mc.currentBiome || "plains";

    const stats = getUpgradedStats(mc, pick);

    const ore = getRandomOre(
      {
        ...pick,
        luck: stats.luck,
      },
      biome,
    );

    if (!ore) {
      return m.reply("_❌ No encontraste nada_");
    }

    mc.miningPending = [ore];
    mc.lastMineTime = now;

    db.markDirty("users");

    return send(
      sock,
      m,
      `*⛏️ MINANDO...*

Mineral encontrado:
${ore.name}

💰 ${formatMoney(ore.price)}

Usa:
.mct collect`,
    );
  }

  if (sub === "collect") {
    if (
      !mc.miningPending ||
      mc.miningPending.length === 0
    ) {
      return m.reply(
        "_📭 No hay minerales pendientes_",
      );
    }

    const ores = mc.miningPending;

    let total = 0;
    let exp = 0;

    for (const ore of ores) {
      total += ore.price;
      exp += Math.floor(ore.price / 50);
    }

    mc.money = (mc.money || 0) + total;

    mc.inventory.push(...ores);

    addPickExp(
      mc,
      mc.usedPickaxe || "woodpick",
      exp,
    );

    addPlayerExp(mc, exp);

    mc.miningPending = [];

    db.markDirty("users");

    return send(
      sock,
      m,
      `*📦 RECOMPENSAS*

💰 ${formatMoney(total)}
⭐ ${exp} EXP`,
    );
  }

  if (sub === "heal") {
    const result = healPlayer(mc);

    if (result.error) {
      return m.reply(`_${result.error}_`);
    }

    db.markDirty("users");

    return send(
      sock,
      m,
      `*❤️ VIDA RESTAURADA*

HP:
${result.hp}/${mc.maxHp}`,
    );
  }

  if (sub === "me") {
    return send(
      sock,
      m,
      `*👤 PERFIL*

⬆️ Nivel: ${mc.level}
💰 Dinero: ${formatMoney(mc.money)}
❤️ HP: ${mc.hp}/${mc.maxHp}
⚔️ ATK: ${mc.atk}
🧱 Bloques: ${mc.blocksMined}
👑 Prestige: ${mc.prestige || 0}`,
    );
  }

  if (sub === "top") {
    const users = db.db.data.users || {};

    const ranking = [];

    for (const [jid, data] of Object.entries(users)) {
      if (data.minecraft) {
        ranking.push({
          jid,
          blocks: data.minecraft.blocksMined || 0,
        });
      }
    }

    ranking.sort((a, b) => b.blocks - a.blocks);

    let txt = "*🏆 TOP MINEROS*\n\n";

    ranking.slice(0, 10).forEach((u, i) => {
      txt += `${i + 1}. @${u.jid}
🧱 ${u.blocks} bloques\n\n`;
    });

    return send(sock, m, txt);
  }
}

export {
  pluginConfig as config,
  handler,
};
