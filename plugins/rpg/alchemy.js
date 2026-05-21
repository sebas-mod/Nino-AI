import { getDatabase } from "../../src/lib/ourin-database.js";
import { addExpWithLevelCheck } from "../../src/lib/ourin-level.js";

const pluginConfig = {
  name: "alchemy",
  alias: ["potion", "brew", "ramuan"],
  category: "rpg",
  description: "Crear pociones y brebajes con hierbas",
  usage: ".alchemy <potion>",
  example: ".alchemy healthpotion",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 60,
  energi: 1,
  isEnabled: true,
};

const POTIONS = {
  healthpotion: {
    name: "❤️ Pocion de Vida",
    materials: { herb: 3 },
    effect: "Restaura 50 HP",
    exp: 80,
    result: "healthpotion",
  },
  manapotion: {
    name: "💙 Pocion de Mana",
    materials: { herb: 2, flower: 1 },
    effect: "Restaura 50 Mana",
    exp: 90,
    result: "manapotion",
  },
  staminapotion: {
    name: "⚡ Pocion de Stamina",
    materials: { herb: 2, mushroom: 1 },
    effect: "Restaura 30 Stamina",
    exp: 100,
    result: "staminapotion",
  },
  strengthpotion: {
    name: "💪 Pocion de Fuerza",
    materials: { herb: 3, dragonscale: 1 },
    effect: "+20 ATK (5 minutos)",
    exp: 200,
    result: "strengthpotion",
  },
  defensepotion: {
    name: "🛡️ Pocion de Defensa",
    materials: { herb: 3, iron: 2 },
    effect: "+15 DEF (5 minutos)",
    exp: 180,
    result: "defensepotion",
  },
  luckpotion: {
    name: "🍀 Pocion de Suerte",
    materials: { herb: 5, diamond: 1 },
    effect: "+30% Tasa de Drop (10 minutos)",
    exp: 300,
    result: "luckpotion",
  },
  exppotion: {
    name: "✨ Pocion de EXP",
    materials: { herb: 4, gold: 2 },
    effect: "+50% EXP (15 minutos)",
    exp: 250,
    result: "exppotion",
  },
  antidote: {
    name: "💊 Antidoto",
    materials: { herb: 2 },
    effect: "Cura el veneno",
    exp: 50,
    result: "antidote",
  },
  elixir: {
    name: "🧪 Elixir",
    materials: { herb: 10, diamond: 2, gold: 5 },
    effect: "Restaura todo stats",
    exp: 500,
    result: "elixir",
  },
};

async function handler(m, { sock }) {
  const db = getDatabase();
  const user = db.getUser(m.sender);

  if (!user.inventory) user.inventory = {};
  if (!user.rpg) user.rpg = {};

  const args = m.args || [];
  const potionName = args[0]?.toLowerCase();

  if (!potionName) {
    let txt = `Hola alquimista! Quieres preparar que pocion hari esto? 🧙‍♂️🧪\n\n`;
    txt += `*Lista del libro de recetas de pociones:*\n`;

    for (const [key, pot] of Object.entries(POTIONS)) {
      const mats = Object.entries(pot.materials)
        .map(([m, qty]) => `${qty}x ${m}`)
        .join(", ");
      txt += `\n*${pot.name}*\n`;
      txt += `📦 Materiales: ${mats}\n`;
      txt += `💫 Efecto: ${pot.effect}\n`;
      txt += `👉 Escribe: \`.alchemy ${key}\`\n`;
    }
    txt += `\n💡 *Consejo:* Materiales herba puede tu recibistein de \`.garden\` o \`.dungeon\`! 🌱`;

    return m.reply(txt);
  }

  const potion = POTIONS[potionName];
  if (!potion) {
    return m.reply(`Va, eso racikan berbaha ! Resepn no hay en buku! 😂\nCek list ng bener paa \`.alchemy\` !`);
  }

  const missingMaterials = [];
  for (const [material, needed] of Object.entries(potion.materials)) {
    const have = user.inventory[material] || 0;
    if (have < needed) {
      missingMaterials.push(`• ${material}: ${have}/${needed}`);
    }
  }

  if (missingMaterials.length > 0) {
    return m.reply(`Espera, bahann aun no cukup para ngeracik *${potion.name}* ! 😭\n\nKekurannonn:\n${missingMaterials.join("\n")}\n\nJunta hierbas primero ! 🏃💨`);
  }

  await m.react("🧪");
  await m.reply(`Blubuk blubuk... BZZZZ! 🧪✨\nMezclando ingredientes para preparar *${potion.name}*... Cuidado, puede explotar! 💥`);
  await new Promise((r) => setTimeout(r, 3000));

  for (const [material, needed] of Object.entries(potion.materials)) {
    user.inventory[material] -= needed;
    if (user.inventory[material] <= 0) delete user.inventory[material];
  }

  user.inventory[potion.result] = (user.inventory[potion.result] || 0) + 1;

  await addExpWithLevelCheck(sock, m, db, user, potion.exp);
  db.save();

  await m.react("✅");
  return m.reply(
    `CLLINGGG!! POCION CREADA CON EXITO! 🎉🧪\n\n` +
      `Preparaste con exito:\n` +
      `📦 Item: *${potion.name}*\n` +
      `💫 Efecto: *${potion.effect}*\n` +
      `📈 EXP Alchemy: *+${potion.exp}*\n\n` +
      `Jannon enminum sekaligus kalau no quieres sakit perut! 😂`
  );
}

export { pluginConfig as config, handler };
