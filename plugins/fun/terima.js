import { getDatabase } from "../../src/lib/ourin-database.js";
import * as timeHelper from "../../src/lib/ourin-time.js";
import { saluranCtx } from "../../src/lib/ourin-context.js";
const pluginConfig = {
  name: "terima",
  alias: ["accept", "yes"],
  category: "fun",
  description: "Aceptar una declaracion de alguien",
  usage: ".terima @tag",
  example: ".terima @628xxx",
  isOwner: false,
  isPremium: false,
  isGroup: true,
  isPrivate: false,
  cooldown: 5,
  energi: 0,
  isEnabled: true,
};

const celebrationQuotes = [
  "Que duren hasta el altar! 💍",
  "De amigos a amor, que bonito! 💕",
  "El amor esta en el aire! 💖",
  "Metas de pareja detectadas! 💑",
  "No olviden invitar a la boda! 💒",
  "Felicidades por empezar esta vida juntos! 🥰",
  "La quimica es muy fuerte! 🔥",
  "Pareja hecha en el cielo! ✨",
];

async function handler(m, { sock }) {
  const db = getDatabase();

  let shooterJid = null;

  if (m.quoted) {
    shooterJid = m.quoted.sender;
  } else if (m.mentionedJid?.[0]) {
    shooterJid = m.mentionedJid[0];
  }

  if (!shooterJid) {
    const sessions = global.tembakSessions || {};
    const mySession = Object.entries(sessions).find(
      ([key, val]) => val.target === m.sender && val.chat === m.chat,
    );

    if (mySession) {
      shooterJid = mySession[1].shooter;
    }
  }

  if (!shooterJid) {
    return m.reply(
      `⚠️ *ᴄᴀʀᴀ ᴘᴀᴋᴀɪ*\n\n` +
        `> Responde el mensaje de declaracion + \`${m.prefix}terima\`\n` +
        `> O \`${m.prefix}terima @tag\``,
    );
  }

  if (shooterJid === m.sender) {
    return m.reply(`❌ *ɢᴀɢᴀʟ*\n\n> No puedes aceptarte a ti mismo!`);
  }

  if (shooterJid === m.botNumber) {
    return m.reply(`❌ *ɢᴀɢᴀʟ*\n\n> El bot no puede tener pareja!`);
  }

  let shooterData = db.getUser(shooterJid) || {};
  let myData = db.getUser(m.sender) || {};

  if (!shooterData.fun) shooterData.fun = {};
  if (!myData.fun) myData.fun = {};

  if (
    shooterData.fun.pasangan !== m.sender &&
    shooterData.fun.tembakTarget !== m.sender
  ) {
    return m.reply(
      `❌ *ᴛɪᴅᴀᴋ ᴍᴇɴᴇᴍʙᴀᴋ*\n\n` +
        `> @${shooterJid.split("@")[0]} no se te esta declarando`,
      { mentions: [shooterJid] },
    );
  }

  shooterData.fun.pasangan = m.sender;
  shooterData.fun.jadiPacar = Date.now();
  delete shooterData.fun.tembakTarget;
  myData.fun.pasangan = shooterJid;
  myData.fun.jadiPacar = Date.now();

  if (!shooterData.fun.terimaCount) shooterData.fun.terimaCount = 0;
  shooterData.fun.terimaCount++;

  db.setUser(shooterJid, shooterData);
  db.setUser(m.sender, myData);

  const sessionKey = `${m.chat}_${m.sender}`;
  if (global.tembakSessions?.[sessionKey]) {
    delete global.tembakSessions[sessionKey];
  }

  const quote =
    celebrationQuotes[Math.floor(Math.random() * celebrationQuotes.length)];
  const dateStr = timeHelper.formatFull("dddd, DD MMMM YYYY");

  await m.react("💕");
  const ctx = saluranCtx();
  ctx.mentionedJid = [m.sender, shooterJid];

  await m.reply(
    `💕 *ACEPTADO!* @${shooterJid.split("@")[0]}\n\n` +
      `@${m.sender.split("@")[0]} y @${shooterJid.split("@")[0]} ahora son pareja oficialmente\n\n` +
      `Que duren mucho y sean felices 💍`,
    { contextInfo: ctx },
  );
}

export { pluginConfig as config, handler };
