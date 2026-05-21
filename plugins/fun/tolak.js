import { getDatabase } from "../../src/lib/ourin-database.js";
import { saluranCtx } from "../../src/lib/ourin-context.js";
const pluginConfig = {
  name: "tolak",
  alias: ["reject", "no", "gaktau"],
  category: "fun",
  description: "Rechazar una declaracion de alguien",
  usage: ".tolak @tag",
  example: ".tolak @628xxx",
  isOwner: false,
  isPremium: false,
  isGroup: true,
  isPrivate: false,
  cooldown: 5,
  energi: 0,
  isEnabled: true,
};

const rejectionQuotes = [
  "Paciencia, algo mejor llegara! 🌟",
  "Que aun no sea tu destino no significa que no exista 💪",
  "Sigue adelante! Hay muchos peces en el mar! 🐟",
  "Ten paciencia, el amor verdadero llegara 💕",
  "No pierdas el animo, sigue adelante! 🔥",
  "Un rechazo puede ser el inicio del exito 💪",
  "Aun hay muchas oportunidades ahi afuera! ✨",
  "Seguro hay alguien mas compatible para ti! 🌈",
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
        `> Responde el mensaje de declaracion + \`${m.prefix}tolak\`\n` +
        `> O \`${m.prefix}tolak @tag\``,
    );
  }

  if (shooterJid === m.sender) {
    return m.reply(`❌ *ɢᴀɢᴀʟ*\n\n> No puedes rechazarte a ti mismo!`);
  }

  if (shooterJid === m.botNumber) {
    return m.reply(`❌ *ɢᴀɢᴀʟ*\n\n> El bot no tiene corazon para ser rechazado!`);
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

  delete shooterData.fun.pasangan;
  delete shooterData.fun.tembakTarget;
  delete myData.fun.pasangan;

  if (!shooterData.fun.ditolakCount) shooterData.fun.ditolakCount = 0;
  shooterData.fun.ditolakCount++;

  db.setUser(shooterJid, shooterData);
  db.setUser(m.sender, myData);

  const sessionKey = `${m.chat}_${m.sender}`;
  if (global.tembakSessions?.[sessionKey]) {
    delete global.tembakSessions[sessionKey];
  }

  const quote =
    rejectionQuotes[Math.floor(Math.random() * rejectionQuotes.length)];

  await m.react("💔");
  const ctx = saluranCtx();
  ctx.mentionedJid = [m.sender, shooterJid];

  await m.reply(
    `💔 *RECHAZADO, PACIENCIA* @${shooterJid.split("@")[0]}\n\n` +
      `@${m.sender.split("@")[0]} rechazo a @${shooterJid.split("@")[0]} como pareja\n\n` +
      `Paciencia, aun hay muchas personas mas! 😢`,
    { contextInfo: ctx },
  );
}

export { pluginConfig as config, handler };
