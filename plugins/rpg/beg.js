import { getDatabase } from "../../src/lib/ourin-database.js";
import { addExpWithLevelCheck } from "../../src/lib/ourin-level.js";
const pluginConfig = {
  name: "beg",
  alias: ["ngemis", "minta"],
  category: "rpg",
  description: "Peenr limosna para conseguir monedas",
  usage: ".beg",
  example: ".beg",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 60,
  energi: 0,
  isEnabled: true,
};

async function handler(m, { sock }) {
  const db = getDatabase();
  const user = db.getUser(m.sender);

  if (!user.rpg) user.rpg = {};

  await m.reply("🙏 *sᴇᴅᴀɴɢ ᴍᴇɴɢᴇᴍɪs...*");
  await new Promise((r) => setTimeout(r, 2000));

  const responses = [
    { success: true, money: 500, exp: 10, msg: "Una persona generosa te dio dinero!" },
    { success: true, money: 1000, exp: 20, msg: "Recibiste propina de una buena persona!" },
    { success: true, money: 2000, exp: 50, msg: "WOW! Ada sultan ng kasihan!" },
    { success: false, money: 0, exp: 0, msg: "Tidak hay ng peduli..." },
    { success: false, money: 0, exp: 0, msg: "Orang-orang mennobaikanmu..." },
    { success: true, money: 100, exp: 5, msg: "Recibiste monedas del bolsillo de alguien!" },
    { success: false, money: -500, exp: 0, msg: "Tu malah enrampok pengemis lain!" },
  ];

  const result = responses[Math.floor(Math.random() * responses.length)];

  if (result.money > 0) {
    user.koin = (user.koin || 0) + result.money;
    if (result.exp > 0) {
      await addExpWithLevelCheck(sock, m, db, user, result.exp);
    }
  } else if (result.money < 0) {
    user.koin = Math.max(0, (user.koin || 0) + result.money);
  }

  db.save();

  let txt = "";
  if (result.success && result.money > 0) {
    txt = `🙏 *ɴɢᴇᴍɪs sᴜᴋsᴇs*\n\n> ${result.msg}\n> 💰 Recibido: *+Rp ${result.money.toLocaleString("id-ID")}*`;
    if (result.exp > 0) txt += `\n> 🚄 EXP: *+${result.exp}*`;
  } else if (result.money < 0) {
    txt = `😭 *ɴɢᴇᴍɪs ɢᴀɢᴀʟ*\n\n> ${result.msg}\n> 💸 Perdido: *Rp ${Math.abs(result.money).toLocaleString("id-ID")}*`;
  } else {
    txt = `😢 *ɴɢᴇᴍɪs ɢᴀɢᴀʟ*\n\n> ${result.msg}`;
  }

  await m.reply(txt);
}

export { pluginConfig as config, handler };
