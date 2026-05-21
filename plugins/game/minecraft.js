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
  doSmelt,
  doCraft,
  getAvailableMobs,
  healPlayer,
  JACKPOT_POOLS,
} from "../../src/lib/ourin-minecraft.js";

import {
  biomes,
  pickaxes,
  mobData,
  RARITY_EMOJI,
  GACHA_COST_COINS,
} from "../../src/lib/ourin-minecraft-data.js";

import config from "../../config.js";
import path from "path";
import fs from "fs";

const MC = 15;

const rc = (r) => RARITY_EMOJI?.[r] || "⬜";

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
  return sock.sendMessage(
    m.chat,
    {
      image: thumbMC,
      caption: text,
    },
    { quoted: m },
  );
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

    const pick =
      mc.pickaxes[
        mc.usedPickaxe || "woodpick"
      ];

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
        luck: stats?.luck || 0,
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
        "_📭 No hay minerales pendientes_",
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

    if (addPickExp) {
      addPickExp(
        mc,
        mc.usedPickaxe,
        exp,
      );
    }

    if (addPlayerExp) {
      addPlayerExp(mc, exp);
    }

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
    if (!healPlayer) {
      return m.reply(
        "_❌ healPlayer no existe en la librería_",
      );
    }

    const result = healPlayer(mc);

    if (result?.error) {
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
${mc.hp}/${mc.maxHp}`,
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

    db.markDirty("users");

    return send(
      sock,
      m,
      `*🎁 DAILY*

💰 +5,000`,
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
      doGachaPull?.(mc);

    db.markDirty("users");

    return send(
      sock,
      m,
      `*🎰 GACHA*

🎁 ${
        result?.item?.label ||
        "Premio obtenido"
      }`,
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

⭐ EXP:
${mc.exp}/${mc.expToNextLevel}

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
