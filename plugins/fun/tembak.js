import { getDatabase } from "../../src/lib/ourin-database.js";
import { saluranCtx } from "../../src/lib/ourin-context.js";
const pluginConfig = {
  name: "tembak",
  alias: ["nembak", "propose"],
  category: "fun",
  description: "Declararse a alguien para tener una relacion",
  usage: ".tembak @tag",
  example: ".tembak @628xxx",
  isOwner: false,
  isPremium: false,
  isGroup: true,
  isPrivate: false,
  cooldown: 30,
  energi: 1,
  isEnabled: true,
};

if (!global.tembakSessions) global.tembakSessions = {};

const SESSION_TIMEOUT = 3600000;
const romanticQuotes = [
  "No soy piloto, pero puedo hacer que tu corazon vuele alto conmigo 💕",
  "Sabes por que me gusta la lluvia? Porque es como tu, refresca el corazon 🌧️",
  "Tu eres la razon por la que sonrio sin motivo 😊",
  "Si fueras una estrella, yo quisiera ser el cielo que siempre te acompana ✨",
  "No necesito GPS, porque mi corazon ya apunta hacia ti 💘",
  "Sabes la diferencia entre tu y el cafe? El cafe me despierta, tu no me dejas dormir de tanto pensarte ☕",
  "Me prestas tu corazon? Prometo cuidarlo para siempre 💖",
  "Si el amor fuera una cancion, tu serias su melodia mas hermosa 🎵",
  "Necesito 3 cosas: el Sol, la Luna y a ti. El Sol para el dia, la Luna para la noche, y tu para siempre 🌙",
  "Eres la ultima pieza que necesito para completar mi vida 🧩",
];

async function handler(m, { sock }) {
  const db = getDatabase();
  const args = m.args || [];

  let targetJid = null;

  if (m.quoted) {
    targetJid = m.quoted.sender;
  } else if (m.mentionedJid?.[0]) {
    targetJid = m.mentionedJid[0];
  } else if (args[0]) {
    let num = args[0].replace(/[^0-9]/g, "");
    if (num.length > 5 && num.length < 20) {
      targetJid = num + "@s.whatsapp.net";
    }
  }

  if (!targetJid) {
    return m.reply(
      `⚠️ *ᴄᴀʀᴀ ᴘᴀᴋᴀɪ*\n\n` +
        `> \`${m.prefix}tembak @tag\`\n\n` +
        `> Ejemplo:\n` +
        `> \`${m.prefix}tembak @628xxx\`\n` +
        `> Responde un mensaje + \`${m.prefix}tembak\``,
    );
  }

  if (targetJid === m.sender) {
    return m.reply(`No puedes declararte a ti mismo!`);
  }

  if (targetJid === m.botNumber) {
    return m.reply(`El bot no puede tener pareja!`);
  }

  let senderData = db.getUser(m.sender) || {};
  let targetData = db.getUser(targetJid) || {};

  if (!senderData.fun) senderData.fun = {};
  if (!targetData.fun) targetData.fun = {};

  if (senderData.fun.pasangan) {
    const partnerData = db.getUser(senderData.fun.pasangan);
    if (partnerData?.fun?.pasangan === m.sender) {
      return m.reply(
        `❌ *sᴜᴅᴀʜ ᴘᴜɴʏᴀ ᴘᴀsᴀɴɢᴀɴ*\n\n` +
          `Tu pareja: @${senderData.fun.pasangan.split("@")[0]}\n` +
          `Termina primero con ${partnerData.name} usando: \`${m.prefix}putus\``,
        { mentions: [senderData.fun.pasangan] },
      );
    }
  }

  if (targetData.fun.pasangan && targetData.fun.pasangan !== m.sender) {
    const targetPartner = db.getUser(targetData.fun.pasangan);
    if (targetPartner?.fun?.pasangan === targetJid) {
      return m.reply(
        `💔 *ᴅɪᴀ sᴜᴅᴀʜ ᴘᴀᴄᴀʀᴀɴ*\n\n` +
          `Su pareja: @${targetData.fun.pasangan.split("@")[0]}`,
        { mentions: [targetData.fun.pasangan] },
      );
    }
  }

  if (
    targetData.fun.tembakTarget === m.sender ||
    targetData.fun.pasangan === m.sender
  ) {
    senderData.fun.pasangan = targetJid;
    targetData.fun.pasangan = m.sender;

    db.setUser(m.sender, senderData);
    db.setUser(targetJid, targetData);

    delete global.tembakSessions[`${m.chat}_${targetJid}`];

    await m.react("💕");
    return m.reply(
      `💕 *OFICIALMENTE JUNTOS :3*\n\n` +
        `@${m.sender.split("@")[0]} y @${targetJid.split("@")[0]} ahora son pareja oficialmente!\n\n` +
        `Que duren mucho! 💍`,
      { mentions: [m.sender, targetJid] },
    );
  }

  senderData.fun.tembakTarget = targetJid;
  if (!senderData.fun.tembakCount) senderData.fun.tembakCount = 0;
  senderData.fun.tembakCount++;
  db.setUser(m.sender, senderData);

  global.tembakSessions[`${m.chat}_${targetJid}`] = {
    shooter: m.sender,
    target: targetJid,
    chat: m.chat,
    timestamp: Date.now(),
  };

  await m.react("💘");

  const ctx = saluranCtx();
  ctx.mentionedJid = [targetJid, m.sender];
  const sentMsg = await m.reply(
      `💘 *ALGUIEN SE DECLARO*\n\n` +
      `Hola @${targetJid.split("@")[0]}, @${m.sender.split("@")[0]} se te declaro\n\n` +
      `⏱️ Valido por *1 hora* desde ahora\n` +
      `usa: \`${m.prefix}terima\` / \`${m.prefix}tolak\``,
    { contextInfo: ctx },
  );

  if (sentMsg?.key?.id) {
    global.tembakSessions[`${m.chat}_${targetJid}`].messageId = sentMsg.key.id;
  }
}

async function answerHandler(m, sock) {
  if (!m.body) return false;

  const text = m.body.trim().toLowerCase();
  if (text !== "terima" && text !== "tolak") return false;
  if (!m.quoted) return false;

  const db = getDatabase();

  const allSessions = Object.entries(global.tembakSessions || {}).filter(
    ([key, val]) => val.target === m.sender && val.chat === m.chat,
  );

  if (allSessions.length === 0) return false;

  const validSession = allSessions.find(([key, val]) => {
    return Date.now() - val.timestamp < 3600000;
  });

  if (!validSession) return false;

  const [sessKey, sessData] = validSession;

  if (text === "terima") {
    let shooterData = db.getUser(sessData.shooter) || {};
    let targetData = db.getUser(m.sender) || {};

    if (!shooterData.fun) shooterData.fun = {};
    if (!targetData.fun) targetData.fun = {};

    shooterData.fun.pasangan = m.sender;
    targetData.fun.pasangan = sessData.shooter;

    db.setUser(sessData.shooter, shooterData);
    db.setUser(m.sender, targetData);

    delete global.tembakSessions[sessKey];

    await m.react("💕");
    await m.reply(
      `💕 *ACEPTADO!* @${sessData.shooter.split("@")[0]}\n\n` +
        `@${m.sender.split("@")[0]} y @${sessData.shooter.split("@")[0]} ahora son pareja oficialmente\n\n` +
        `Que duren mucho y sean felices 💍`,
      { mentions: [m.sender, sessData.shooter] },
    );

    return true;
  }

  if (text === "tolak") {
    let shooterData = db.getUser(sessData.shooter) || {};
    let targetData = db.getUser(m.sender) || {};

    if (!shooterData.fun) shooterData.fun = {};
    if (!targetData.fun) targetData.fun = {};

    delete shooterData.fun.pasangan;
    delete shooterData.fun.tembakTarget;
    delete targetData.fun.pasangan;

    db.setUser(sessData.shooter, shooterData);
    db.setUser(m.sender, targetData);

    delete global.tembakSessions[sessKey];

    await m.react("💔");
    await m.reply(
      `💔 *RECHAZADO, PACIENCIA* @${sessData.shooter.split("@")[0]}\n\n` +
        `@${m.sender.split("@")[0]} rechazo a @${sessData.shooter.split("@")[0]} como pareja\n\n` +
        `Paciencia, aun hay muchas personas mas! 😢`,
      { mentions: [m.sender, sessData.shooter] },
    );
    return true;
  }

  return false;
}

export { pluginConfig as config, handler, answerHandler };
