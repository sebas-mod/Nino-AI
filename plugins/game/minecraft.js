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
  CRAFT_RECIPES,
} from "../../src/lib/ourin-minecraft-data.js";

import config from "../../config.js";
import path from "path";
import fs from "fs";

const MC = 15;

const rc = (r) => RARITY_EMOJI[r] || "⬜";

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
} catch {}

function send(sock, m, text) {
  const msgId = sock.sendPreview(
    m.chat,
    {
      caption: `${config.info.website}\n\n${text}`,
      url: config.info.website,
      title: "𝗠𝗜𝗡𝗘𝗖𝗥𝗔𝗙𝗧",
      description:
        "⛏️ Mina, 🛠️ craftea y ⚔️ pelea mobs",
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
  description: "Minecraft RPG",
  usage: ".mct help",
  example: ".mct mine",
  cooldown: 3,
  energi: 0,
  isEnabled: true,
};

async function handler(m, { sock }) {
  const db = getDatabase();

  const cmd =
    m.command ||
    m.body?.split(" ")[0]
      ?.slice(1)
      ?.toLowerCase() ||
    "";

  const args =
    m.args ||
    m.body?.split(" ").slice(1) ||
    [];

  const sub = args[0]?.toLowerCase() || "";
  const sa = args.slice(1);

  if (cmd !== "mct" && cmd !== "minecraft") return;

  const user = getOrCreateMCUser(
    db,
    m.sender,
  );

  if (!user.minecraft) {
    user.minecraft = {
      level: 1,
      exp: 0,
      expToNextLevel: 100,
      money: 0,
      hp: 100,
      maxHp: 100,
      atk: 5,
      blocksMined: 0,
      prestige: 0,
      gachaTickets: 0,
      currentBiome: "plains",
      usedPickaxe: "woodpick",
      miningPending: [],
      inventory: [],
      pickaxes: {
        woodpick: {
          ...pickaxes.woodpick,
        },
      },
    };
  }

  const mc = user.minecraft;

  if (!sub || sub === "help") {
    return send(
      sock,
      m,
      `*🧱 MINECRAFT MENU*

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
🏆 .mct top`,
    );
  }

  if (sub === "mine") {
    if (
      mc.miningPending &&
      mc.miningPending.length > 0
    ) {
      return m.reply(
        "_📦 Usa .mct collect primero_",
      );
    }

    const now = Date.now();

    if (
      mc.lastMineTime &&
      now - mc.lastMineTime <
        MC * 1000
    ) {
      return m.reply(
        `_⏳ Espera ${Math.ceil(
          (MC * 1000 -
            (now - mc.lastMineTime)) /
            1000,
        )} segundos_`,
      );
    }

    const pk =
      mc.usedPickaxe || "woodpick";

    const pick = mc.pickaxes[pk];

    if (!pick) {
      return m.reply(
        "_🪓 No tienes pico_",
      );
    }

    const biome =
      mc.currentBiome || "plains";

    const stats =
      getUpgradedStats(mc, pick);

    const ore = getRandomOre(
      {
        ...pick,
        luck: stats.luck,
      },
      biome,
    );

    if (!ore) {
      return m.reply(
        "_❌ No encontraste minerales_",
      );
    }

    mc.miningPending = [ore];
    mc.lastMineTime = now;

    db.markDirty("users");

    return send(
      sock,
      m,
      `*⛏️ MINANDO...*

Mineral:
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
        "_📭 No hay minerales_",
      );
    }

    const ores = mc.miningPending;

    let total = 0;
    let exp = 0;

    for (const ore of ores) {
      total += ore.price || 0;
      exp += Math.floor(
        (ore.price || 0) / 50,
      );
    }

    mc.money += total;

    mc.inventory.push(...ores);

    addPickExp(
      mc,
      mc.usedPickaxe,
      exp,
    );

    addPlayerExp(mc, exp);

    mc.miningPending = [];

    db.markDirty("users");

    return send(
      sock,
      m,
      `*📦 RECOLECTADO*

💰 ${formatMoney(total)}
⭐ ${exp} EXP`,
    );
  }

  if (sub === "sell") {
    if (
      !mc.inventory ||
      mc.inventory.length === 0
    ) {
      return m.reply(
        "_🎒 Inventario vacío_",
      );
    }

    let total = 0;

    for (const item of mc.inventory) {
      total += item.price || 0;
    }

    mc.money += total;
    mc.inventory = [];

    db.markDirty("users");

    return send(
      sock,
      m,
      `*💸 VENTA COMPLETA*

💰 ${formatMoney(total)}

🏦 Balance:
${formatMoney(mc.money)}`,
    );
  }

  if (sub === "heal") {
    const result = healPlayer(mc);

    if (result.error) {
      return m.reply(
        `_${result.error}_`,
      );
    }

    db.markDirty("users");

    return send(
      sock,
      m,
      `*❤️ CURADO*

❤️ HP:
${result.hp}/${mc.maxHp}`,
    );
  }

  if (sub === "fight") {
    if (!sa[0]) {
      const mobs =
        getAvailableMobs(mc);

      let txt =
        "*👹 MOBS DISPONIBLES*\n\n";

      for (const mob of mobs) {
        txt += `⚔️ ${mob.name}
❤️ ${mob.hp}
💥 ${mob.atk}

`;
      }

      return send(sock, m, txt);
    }

    const mob =
      sa[0].toLowerCase();

    if (!mobData[mob]) {
      return m.reply(
        "_👹 Mob no existe_",
      );
    }

    const result = doCombat(
      mc,
      mob,
    );

    if (result.error) {
      return m.reply(
        `_${result.error}_`,
      );
    }

    db.markDirty("users");

    return send(
      sock,
      m,
      result.won
        ? `*🏆 GANASTE*

⚔️ ${result.mobName}
⭐ +${result.expGain} EXP`
        : `*💀 PERDISTE*

⚔️ ${result.mobName}`,
    );
  }

  if (sub === "daily") {
    const now = Date.now();

    if (
      mc.lastDaily &&
      now - mc.lastDaily <
        86400000
    ) {
      return m.reply(
        "_🎁 Ya reclamaste hoy_",
      );
    }

    mc.lastDaily = now;

    mc.money += 5000;
    mc.gachaTickets += 1;

    db.markDirty("users");

    return send(
      sock,
      m,
      `*🎁 DAILY*

💰 +5,000
🎟️ +1 Ticket`,
    );
  }

  if (sub === "gacha") {
    if (
      mc.money <
      GACHA_COST_COINS
    ) {
      return m.reply(
        "_💸 Dinero insuficiente_",
      );
    }

    mc.money -= GACHA_COST_COINS;

    const result =
      doGachaPull(mc);

    db.markDirty("users");

    return send(
      sock,
      m,
      `*🎰 GACHA*

🎁 ${result.item.label}`,
    );
  }

  if (sub === "top") {
    const users =
      db.db.data.users || {};

    const ranking = [];

    for (const [
      jid,
      data,
    ] of Object.entries(users)) {
      if (data.minecraft) {
        ranking.push({
          jid,
          blocks:
            data.minecraft
              .blocksMined || 0,
        });
      }
    }

    ranking.sort(
      (a, b) =>
        b.blocks - a.blocks,
    );

    let txt =
      "*🏆 TOP MINEROS*\n\n";

    ranking
      .slice(0, 10)
      .forEach((u, i) => {
        txt += `${i + 1}. @${
          u.jid
        }

🧱 ${u.blocks} bloques

`;
      });

    return send(sock, m, txt);
  }

  if (sub === "me") {
    return send(
      sock,
      m,
      `*👤 PERFIL*

⬆️ Nivel: ${mc.level}
⭐ EXP: ${mc.exp}/${mc.expToNextLevel}

💰 Dinero:
${formatMoney(mc.money)}

❤️ HP:
${mc.hp}/${mc.maxHp}

⚔️ ATK:
${mc.atk}

🧱 Bloques:
${mc.blocksMined}

👑 Prestige:
${mc.prestige}`,
    );
  }
}

export {
  pluginConfig as config,
  handler,
};
