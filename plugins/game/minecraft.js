import { getDatabase } from "../../src/lib/ourin-database.js";

import {
  getOrCreateMCUser,
  getRandomOre,
  formatMoney,
  addPickExp,
  addPlayerExp,
  getUpgradedStats,
  getStreakBonus,
} from "../../src/lib/ourin-minecraft.js";

import {
  biomes,
  pickaxes,
  RARITY_EMOJI,
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
🎒 .mct inv
🎁 .mct daily
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

    const streak =
      getStreakBonus(
        mc.streak || 0,
      );

    const ore = getRandomOre(
      {
        ...pick,
        luck:
          (stats?.luck || 0) +
          (streak?.luckAdd || 0),
      },
      biome,
    );

    if (!ore) {
      return m.reply(
        "_❌ No encontraste minerales_",
      );
    }

    ore.price = Math.floor(
      ore.price *
        (streak?.mult || 1),
    );

    mc.miningPending = [ore];
    mc.lastMineTime = now;
    mc.streak =
      (mc.streak || 0) + 1;

    db.markDirty("users");

    return send(
      sock,
      m,
      `*⛏️ MINANDO...*

🗺️ Bioma:
${biomes?.[biome]?.name || biome}

Mineral:
${ore.name}

Rareza:
${rc(ore.rarity)}

💰 ${formatMoney(ore.price)}

📦 x${ore.stack}

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

    const ores =
      mc.miningPending;

    let total = 0;
    let exp = 0;

    for (const ore of ores) {
      total += ore.price || 0;

      exp += Math.max(
        5,
        Math.floor(
          (ore.price || 0) / 50,
        ),
      );
    }

    mc.inventory.push(...ores);

    mc.blocksMined += ores.reduce(
      (a, b) =>
        a + (b.stack || 1),
      0,
    );

    mc.totalEarned =
      (mc.totalEarned || 0) +
      total;

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

⭐ ${exp} EXP

🧱 ${
        ores.length
      } minerales guardados`,
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

  if (
    sub === "inv" ||
    sub === "inventory"
  ) {
    if (
      !mc.inventory ||
      mc.inventory.length === 0
    ) {
      return m.reply(
        "_🎒 Inventario vacío_",
      );
    }

    let txt =
      "*🎒 INVENTARIO*\n\n";

    let total = 0;

    for (const item of mc.inventory) {
      txt += `${item.name}

📦 x${item.stack}

💰 ${formatMoney(
        item.price,
      )}

\n`;

      total += item.price || 0;
    }

    txt += `\n🏦 Valor Total:
${formatMoney(total)}`;

    return send(sock, m, txt);
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

⬆️ Nivel:
${mc.level}

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
${mc.prestige}

🪓 Pico:
${mc.usedPickaxe}`,
    );
  }
}

export {
  pluginConfig as config,
  handler,
};
