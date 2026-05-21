import {
  biomes,
  pickaxes,
  pickEnchants,
  mobData,
  UPGRADES,
  GACHA_POOL,
  GACHA_PITY_LIMIT,
  SMELT_RECIPES,
  CRAFT_RECIPES,
  JACKPOT_POOLS,
} from "./ourin-minecraft-data.js";

function formatMoney(n = 0) {
  const num = Number(n);
  if (!Number.isFinite(num)) return "0";

  const suffixes = ["", "K", "M", "B", "T", "Qa", "Qi", "Sx", "Sp", "Oc", "No", "Dc"];

  if (Math.abs(num) < 1000) return num.toString();

  let tier = Math.floor(Math.log10(Math.abs(num)) / 3);
  tier = Math.min(tier, suffixes.length - 1);

  const scale = 10 ** (tier * 3);
  return `${(num / scale).toFixed(2).replace(/\.00$/, "")}${suffixes[tier]}`;
}

function parseAmount(text = "0") {
  const units = {
    K: 1e3,
    M: 1e6,
    B: 1e9,
    T: 1e12,
    QA: 1e15,
    QI: 1e18,
  };

  const match = String(text)
    .trim()
    .toUpperCase()
    .match(/^([\d.,]+)([A-Z]*)$/);

  if (!match) return NaN;

  let value = parseFloat(match[1].replace(/,/g, ""));

  if (units[match[2]]) {
    value *= units[match[2]];
  }

  return Math.floor(value);
}

class MinecraftUser {
  constructor(data = {}) {
    this.money = data.money ?? 500;
    this.level = data.level ?? 1;
    this.exp = data.exp ?? 0;
    this.expToNextLevel = data.expToNextLevel ?? 120;

    this.usedPickaxe = data.usedPickaxe ?? "woodpick";

    this.pickaxes = data.pickaxes ?? {
      woodpick: {
        ...pickaxes.woodpick,
      },
    };

    this.currentBiome = data.currentBiome ?? "plains";

    this.inventory = data.inventory ?? [];
    this.oreFound = data.oreFound ?? [];

    this.mobKills = data.mobKills ?? 0;
    this.totalEarned = data.totalEarned ?? 0;

    this.gachaTickets = data.gachaTickets ?? 0;
    this.gachaPity = data.gachaPity ?? 0;

    this.prestigeTokens = data.prestigeTokens ?? 0;
    this.prestige = data.prestige ?? 0;

    this.luckUpgrade = data.luckUpgrade ?? 0;
    this.speedUpgrade = data.speedUpgrade ?? 0;
    this.fortuneUpgrade = data.fortuneUpgrade ?? 0;
    this.combatUpgrade = data.combatUpgrade ?? 0;

    this.lastDaily = data.lastDaily ?? null;
    this.dailyStreak = data.dailyStreak ?? 0;

    this.miningPending = data.miningPending ?? [];
    this.travelFound = data.travelFound ?? ["plains"];

    this.streak = data.streak ?? 0;
    this.lastMineTime = data.lastMineTime ?? 0;

    this.hp = data.hp ?? 20;
    this.maxHp = data.maxHp ?? 20;

    this.atk = data.atk ?? 4;
    this.def = data.def ?? 0;

    this.combatWins = data.combatWins ?? 0;
    this.combatLosses = data.combatLosses ?? 0;

    this.blocksMined = data.blocksMined ?? 0;
    this.achievements = data.achievements ?? [];

    this.smeltQueue = data.smeltQueue ?? [];
  }

  toObject() {
    return { ...this };
  }
}

function getOrCreateMCUser(db, sender) {
  const cleanJid = sender.split("@")[0];

  if (!db.db.data.users[cleanJid]) {
    db.setUser(sender);
  }

  const user = db.db.data.users[cleanJid];

  if (!user.minecraft) {
    user.minecraft = new MinecraftUser().toObject();
    db.markDirty("users");
  }

  user.minecraft.pickaxes ??= {
    woodpick: { ...pickaxes.woodpick },
  };

  user.minecraft.pickaxes.woodpick ??= {
    ...pickaxes.woodpick,
  };

  user.minecraft.travelFound ??= ["plains"];
  user.minecraft.achievements ??= [];

  return user;
}

function getRandomOre(pickaxe = {}, biomeKey = "plains") {
  const biomeData = biomes[biomeKey];
  if (!biomeData) return null;

  const oreList = biomeData.listOre || [];
  if (!oreList.length) return null;

  const enchant = pickaxe.enchant
    ? pickEnchants[pickaxe.enchant]
    : null;

  let luckBonus = pickaxe.luck || 0;

  if (enchant?.effect?.luck) {
    luckBonus *= enchant.effect.luck;
  }

  const rarityChance = {
    common: 1000,
    uncommon: 400 + luckBonus * 200,
    rare: 100 + luckBonus * 80,
    epic: 20 + luckBonus * 30,
    legendary: 5 + luckBonus * 15,
    mythic: 1 + luckBonus * 8,
    godly: 0.5 + luckBonus * 5,
    exotic: 0.3 + luckBonus * 4,
    secret: 1 + luckBonus * 10,
    extinct: 0.1 + luckBonus * 2,
    special: 0.05 + luckBonus,
  };

  const adjustedOreList = oreList.map((ore) => ({
    ...ore,
    adjChance: rarityChance[ore.rarity] || 1,
  }));

  const totalChance = adjustedOreList.reduce(
    (sum, ore) => sum + ore.adjChance,
    0,
  );

  let roll = Math.random() * totalChance;
  let chosen = adjustedOreList[0];

  for (const ore of adjustedOreList) {
    roll -= ore.adjChance;

    if (roll <= 0) {
      chosen = ore;
      break;
    }
  }

  let stack =
    chosen.minStack +
    Math.floor(
      Math.random() *
        (chosen.maxStack - chosen.minStack + 1),
    );

  if (enchant?.effect?.fortune) {
    stack = Math.ceil(stack * enchant.effect.fortune);
  }

  if (pickaxe.fortuneBonus) {
    stack = Math.ceil(stack * (1 + pickaxe.fortuneBonus));
  }

  let totalPrice = Math.round(chosen.avgValue * stack);

  if (pickaxe.sellMultiplier) {
    totalPrice = Math.round(
      totalPrice * (1 + pickaxe.sellMultiplier),
    );
  }

  if (enchant?.effect?.sellMultiplier) {
    totalPrice = Math.round(
      totalPrice * enchant.effect.sellMultiplier,
    );
  }

  return {
    name: chosen.name,
    rarity: chosen.rarity,
    type: "ore",
    stack,
    pricePerUnit: chosen.avgValue,
    price: totalPrice,
  };
}

function addPickExp(mcUser, pickKey, amount = 0) {
  const pick = mcUser.pickaxes?.[pickKey];

  if (!pick || pick.level >= pick.maxLevel) {
    return null;
  }

  pick.exp = (pick.exp || 0) + amount;

  let leveledUp = false;
  const increases = [];

  while (
    pick.exp >= pick.expToNextLevel &&
    pick.level < pick.maxLevel
  ) {
    pick.exp -= pick.expToNextLevel;
    pick.level++;

    pick.luck = Number((pick.luck + 0.01).toFixed(3));
    pick.speed = Number((pick.speed + 0.01).toFixed(3));
    pick.fortuneBonus = Number(
      (pick.fortuneBonus + 0.005).toFixed(4),
    );

    pick.expToNextLevel = Math.floor(
      pick.expToNextLevel * 1.5,
    );

    leveledUp = true;
    increases.push("Luck +1%, Speed +1%, Fortune +0.5%");
  }

  if (!leveledUp) return null;

  return `⛏️ Pickaxe ${pick.name} subió a nivel ${pick.level}\n✨ ${increases.join(", ")}`;
}

function addPlayerExp(mcUser, amount = 0) {
  mcUser.exp = (mcUser.exp || 0) + amount;

  let levelUp = false;

  while (
    mcUser.exp >= mcUser.expToNextLevel &&
    mcUser.level < 9999
  ) {
    mcUser.exp -= mcUser.expToNextLevel;

    mcUser.level++;

    mcUser.expToNextLevel = Math.floor(
      mcUser.expToNextLevel * 1.3,
    );

    mcUser.maxHp = 20 + Math.floor(mcUser.level * 2);
    mcUser.hp = mcUser.maxHp;
    mcUser.atk = 4 + Math.floor(mcUser.level * 0.5);

    levelUp = true;
  }

  return levelUp;
}

function getUpgradedStats(mcUser, pick) {
  const luckBonus = UPGRADES.luck.effect(mcUser.luckUpgrade || 0);
  const speedBonus = UPGRADES.speed.effect(mcUser.speedUpgrade || 0);
  const fortuneBonus = UPGRADES.fortune.effect(mcUser.fortuneUpgrade || 0);
  const combatBonus = UPGRADES.combat.effect(mcUser.combatUpgrade || 0);

  const prestigeBonus = (mcUser.prestige || 0) * 0.05;

  return {
    luck: (pick.luck || 0) + luckBonus + prestigeBonus,
    speed: Math.min((pick.speed || 0) + speedBonus, 0.98),
    fortune: (pick.fortuneBonus || 0) + fortuneBonus,
    sellMultiplier: pick.sellMultiplier || 0,
    combat: (mcUser.atk || 4) * (1 + combatBonus),
  };
}

function getStreakBonus(streak = 0) {
  if (streak >= 100) return { mult: 3.5, luckAdd: 0.15 };
  if (streak >= 50) return { mult: 2.5, luckAdd: 0.05 };
  if (streak >= 20) return { mult: 1.6 };
  if (streak >= 10) return { mult: 1.4, luckAdd: 0.05 };
  if (streak >= 5) return { mult: 1.25 };
  if (streak >= 3) return { mult: 1.1 };

  return { mult: 1 };
}

export {
  formatMoney,
  parseAmount,
  MinecraftUser,
  getOrCreateMCUser,
  getRandomOre,
  addPickExp,
  addPlayerExp,
  getUpgradedStats,
  getStreakBonus,
  JACKPOT_POOLS,
};
