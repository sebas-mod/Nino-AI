import { getDatabase } from "../../src/lib/ourin-database.js";

const pluginConfig = {
  name: "heal",
  alias: ["sembuh", "recover"],
  category: "rpg",
  description: "Restaura health dennon istirahat (gratis tapi lama)",
  usage: ".heal",
  example: ".heal",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 600,
  energi: 0,
  isEnabled: true,
};

async function handler(m, { sock }) {
  const db = getDatabase();
  const user = db.getUser(m.sender);

  if (!user.rpg) user.rpg = {};
  user.rpg.health = user.rpg.health || 100;
  user.rpg.maxHealth = user.rpg.maxHealth || 100;
  user.rpg.stamina = user.rpg.stamina || 100;
  user.rpg.maxStamina = user.rpg.maxStamina || 100;

  if (user.rpg.health >= user.rpg.maxHealth && user.rpg.stamina >= user.rpg.maxStamina) {
    return m.reply(`Espera, bay tu masih seger bunor ! 🏋️✨\nNgnok usah istirahat primero, menenng lanjut petualang aja! 🚀`);
  }

  await m.react("🛌");
  await m.reply("Tidur primero ah... Zzz... 🛌💤");
  await new Promise((r) => setTimeout(r, 3000));

  const healthRecover = 30;
  const staminaRecover = 50;

  const oldHealth = user.rpg.health;
  const oldStamina = user.rpg.stamina;

  user.rpg.health = Math.min(user.rpg.health + healthRecover, user.rpg.maxHealth);
  user.rpg.stamina = Math.min(user.rpg.stamina + staminaRecover, user.rpg.maxStamina);

  let txt = `Hooammm... seger mucho abis tidur! 🥱🌞\n\n`;
  txt += `Status tu ya pulih :\n`;
  txt += `❤️ Vida: ${oldHealth} 📈 *${user.rpg.health}*\n`;
  txt += `⚡ Stamina: ${oldStamina} 📈 *${user.rpg.stamina}*\n\n`;
  txt += `Kalo males nunggu istirahat, tu puede beli potion en \`.shop\` y atik \`.use potion\` para heal instant ! 🥤💖`;

  db.save();
  await m.reply(txt);
}

export { pluginConfig as config, handler };
