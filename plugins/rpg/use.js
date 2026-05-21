import { getDatabase } from "../../src/lib/ourin-database.js";
const pluginConfig = {
  name: "use",
  alias: ["pake", "makan", "open"],
  category: "rpg",
  description: "Usar consumibles o abrir cajas",
  usage: ".use <item>",
  example: ".use potion",
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
  const user = db.getUser(m.sender);
  const args = m.args || [];
  const itemKey = args[0]?.toLowerCase();

  if (!itemKey) {
    return m.reply(
      `🎒 *ᴜsᴇ ɪᴛᴇᴍ*\n\n` +
        `*📋 *ᴜsᴀɢᴇ:*
\n` +
        `> > \`.use <nama_item>\`\n` +
        `> > Cek inventory: \`.inventory\`\n` +
        ``,
    );
  }

  user.inventory = user.inventory || {};
  user.rpg = user.rpg || {};
  user.rpg.health = user.rpg.health || 100;
  user.rpg.maxHealth = user.rpg.maxHealth || 100;
  user.rpg.mana = user.rpg.mana || 100;
  user.rpg.maxMana = user.rpg.maxMana || 100;
  user.rpg.stamina = user.rpg.stamina || 100;
  user.rpg.maxStamina = user.rpg.maxStamina || 100;

  const count = user.inventory[itemKey] || 0;

  if (count <= 0) {
    return m.reply(`❌ *ɪᴛᴇᴍ ᴛɪᴅᴀᴋ ᴀᴅᴀ*\n\n` + `> Tu no memiliki item *${itemKey}*!\n` + `> Cek inventory: \`.inventory\``);
  }

  let msg = "";

  switch (itemKey) {
    case "potion":
      if (user.rpg.health >= user.rpg.maxHealth) {
        return m.reply(`❤️ *ʜᴇᴀʟᴛʜ ᴘᴇɴᴜʜ*\n\n> Nwa tu sya penuh!`);
      }
      user.rpg.health = Math.min(user.rpg.health + 50, user.rpg.maxHealth);
      user.inventory[itemKey]--;
      msg = `🥤 *ɪᴛᴇᴍ ᴅɪɢᴜɴᴀᴋᴀɴ*\n\n> Tu meminum *Pocion de Vida*.\n> ❤️ Vida ahora: ${user.rpg.health}/${user.rpg.maxHealth}`;
      break;

    case "mpotion":
      if (user.rpg.mana >= user.rpg.maxMana) {
        return m.reply(`💧 *ᴍᴀɴᴀ ᴘᴇɴᴜʜ*\n\n> Mana tu sya penuh!`);
      }
      user.rpg.mana = Math.min(user.rpg.mana + 50, user.rpg.maxMana);
      user.inventory[itemKey]--;
      msg = `🧪 *ɪᴛᴇᴍ ᴅɪɢᴜɴᴀᴋᴀɴ*\n\n> Tu meminum *Pocion de Mana*.\n> 💧 Mana ahora: ${user.rpg.mana}/${user.rpg.maxMana}`;
      break;

    case "stamina":
      if (user.rpg.stamina >= user.rpg.maxStamina) {
        return m.reply(`⚡ *sᴛᴀᴍɪɴᴀ ᴘᴇɴᴜʜ*\n\n> Stamina tu sya penuh!`);
      }
      user.rpg.stamina = Math.min(user.rpg.stamina + 20, user.rpg.maxStamina);
      user.inventory[itemKey]--;
      msg = `⚡ *ɪᴛᴇᴍ ᴅɪɢᴜɴᴀᴋᴀɴ*\n\n> Tu meminum *Pocion de Stamina*.\n> ⚡ Stamina ahora: ${user.rpg.stamina}/${user.rpg.maxStamina}`;
      break;

    case "common":
    case "uncommon":
    case "mythic":
    case "legendary":
      user.inventory[itemKey]--;
      const rewardMoney = Math.floor(Math.random() * (itemKey === "legendary" ? 100000 : 10000)) + 1000;
      const rewardExp = Math.floor(Math.random() * (itemKey === "legendary" ? 5000 : 500)) + 100;

      user.koin = (user.koin || 0) + rewardMoney;
      db.updateExp(m.sender, rewardExp);

      msg = `🎁 *ᴄʀᴀᴛᴇ ᴅɪʙᴜᴋᴀ*\n\n` + `> Tu membuka *${itemKey} Caja*!\n` + `> 💰 Dinero: +Rp ${rewardMoney.toLocaleString("id-ID")}\n` + `> 🚄 EXP: +${rewardExp}`;
      break;

    default:
      return m.reply(`❌ *ɪᴛᴇᴍ ᴛɪᴅᴀᴋ ᴅᴀᴘᴀᴛ ᴅɪɢᴜɴᴀᴋᴀɴ*\n\n> Item *${itemKey}* no puede engunva a langsung.`);
  }

  db.save();
  await m.reply(msg);
}

export { pluginConfig as config, handler };
