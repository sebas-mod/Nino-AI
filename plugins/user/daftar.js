import fs from "fs";
import path from "path";
import { getDatabase } from "../../src/lib/ourin-database.js";
import {
  getCachedJid,
  isLid,
  isLidConverted,
  lidToJid,
} from "../../src/lib/ourin-lid.js";
import config from "../../config.js";

const pluginConfig = {
  name: "daftar",
  alias: ["register", "reg"],
  category: "user",
  description: "Regístrate como usuario del bot mediante una sesión interactiva",
  usage: ".daftar",
  example: ".daftar",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 10,
  energi: 0,
  isEnabled: true,
  skipRegistration: true,
};

if (!global.registrationSessions) global.registrationSessions = {};

const SESSION_TIMEOUT = 300000;
const DEFAULT_REWARDS = { koin: 30000, energi: 300, exp: 300000 };
const REGISTRATION_IMAGE_CANDIDATES = [
  path.join(process.cwd(), "assets", "images", "ourin-daftar.jpg"),
  path.join(process.cwd(), "assets", "images", "ourin.jpg"),
];

function getRegistrationContextInfo() {
  const saluranId = config.saluran?.id || "120363400911374213@newsletter";
  const saluranName = config.saluran?.name || config.bot?.name || "Ourin-AI";

  return {
    forwardingScore: 9999,
    isForwarded: true,
    forwardedNewsletterMessageInfo: {
      newsletterJid: saluranId,
      newsletterName: saluranName,
      serverMessageId: 127,
    },
  };
}

function getRegistrationRequired(db) {
  return (
    db.setting("registrationRequired") ?? config.registration?.enabled ?? false
  );
}

function getRegistrationRewards() {
  return config.registration?.rewards || DEFAULT_REWARDS;
}

function getRegistrationImage() {
  for (const filePath of REGISTRATION_IMAGE_CANDIDATES) {
    if (fs.existsSync(filePath)) {
      return fs.readFileSync(filePath);
    }
  }

  return null;
}

function normalizeRegistrationName(input) {
  return String(input || "")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeSessionText(input) {
  return String(input || "")
    .trim()
    .toLowerCase();
}

function shouldBypassRegistrationAnswer(m) {
  if (!m?.isCommand) return false;
  const command = String(m.command || "").toLowerCase();
  return ["daftar", "register", "reg", "bataldaftar"].includes(command);
}

function getRegistrationSessionKey(jid) {
  let normalized = String(jid || "").trim();
  if (!normalized) return "";
  if (isLid(normalized) || isLidConverted(normalized)) {
    normalized = getCachedJid(normalized) || lidToJid(normalized) || normalized;
  }
  const digits = normalized.replace(/[^0-9]/g, "");
  return digits || normalized.toLowerCase();
}

function getRegistrationSessionEntry(jid) {
  const sessionKey = getRegistrationSessionKey(jid);
  if (sessionKey && global.registrationSessions?.[sessionKey]) {
    return {
      key: sessionKey,
      session: global.registrationSessions[sessionKey],
    };
  }
  const legacyKey = String(jid || "").trim();
  if (legacyKey && global.registrationSessions?.[legacyKey]) {
    return { key: legacyKey, session: global.registrationSessions[legacyKey] };
  }
  return { key: sessionKey, session: null };
}

function clearRegistrationSession(jid) {
  const { key, session } = getRegistrationSessionEntry(jid);
  if (!session) return false;
  if (session.timeout) clearTimeout(session.timeout);
  delete global.registrationSessions[key];
  return true;
}

function createRegistrationSession(jid, chatJid) {
  const sessionKey = getRegistrationSessionKey(jid);
  clearRegistrationSession(sessionKey);

  const session = {
    step: "name",
    name: null,
    age: null,
    gender: null,
    chatJid,
    promptId: null,
    startedAt: Date.now(),
    timeout: setTimeout(() => {
      if (global.registrationSessions[sessionKey]) {
        delete global.registrationSessions[sessionKey];
      }
    }, SESSION_TIMEOUT),
  };

  global.registrationSessions[sessionKey] = session;
  return session;
}

function getQuotedMessageId(m) {
  return m.quoted?.id || m.quoted?.stanzaId || m.quoted?.key?.id || null;
}

function isReplyToSessionPrompt(m, session) {
  const quotedId = getQuotedMessageId(m);
  if (!session || m.chat !== session.chatJid || !m.quoted) return false;
  if (quotedId && session.promptId && quotedId === session.promptId)
    return true;
  if (m.quoted?.key?.fromMe) return true;
  return false;
}

async function sendRegistrationPrompt(sock, m, text, options = {}) {
  const image = options.useImage ? getRegistrationImage() : null;
  if (image) {
    return await sock.sendMessage(
      m.chat,
      {
        image,
        caption: text,
        contextInfo: getRegistrationContextInfo(),
      },
      { quoted: m },
    );
  } else {
    return await m.reply(text);
  }
}

function buildRewardPreview(user) {
  const rewards = getRegistrationRewards();

  if (user?.hasClaimedRegisterReward) {
    return `🎁 *Estado del bonus*\n> Ya reclamaste el bonus del primer registro\n> Registrarte otra vez no dará más recompensa`;
  }

  return `🎁 *Bonus de primer registro*\n> 💰 +${rewards.koin.toLocaleString("id-ID")} Koin\n> ⚡ +${rewards.energi} Energía\n> ⭐ +${rewards.exp.toLocaleString("id-ID")} EXP`;
}

function buildConfirmationRewardBlock(user) {
  const rewards = getRegistrationRewards();

  if (user?.hasClaimedRegisterReward) {
    return `╭┈┈⬡「 🎁 *ʙᴏɴᴜs* 」\n┃ El bonus del primer registro ya fue reclamado\n┃ Registrarte otra vez no dará más recompensa\n╰┈┈┈┈┈┈┈┈⬡`;
  }

  return `╭┈┈⬡「 🎁 *ʀᴇᴡᴀʀᴅs* 」\n┃ 💰 +${rewards.koin.toLocaleString("id-ID")} Koin\n┃ ⚡ +${rewards.energi} Energía\n┃ ⭐ +${rewards.exp.toLocaleString("id-ID")} EXP\n╰┈┈┈┈┈┈┈┈⬡`;
}

function buildSuccessRewardBlock(alreadyClaimedReward) {
  const rewards = getRegistrationRewards();

  if (alreadyClaimedReward) {
    return `╭┈┈⬡「 🎁 *ʙᴏɴᴜs* 」\n┃ El bonus de registro ya fue reclamado\n┃ No hay recompensa adicional esta vez\n╰┈┈┈┈┈┈┈┈⬡`;
  }

  return `╭┈┈⬡「 🎁 *ʀᴇᴡᴀʀᴅs* 」\n┃ 💰 +${rewards.koin.toLocaleString("id-ID")} Koin\n┃ ⚡ +${rewards.energi} Energía\n┃ ⭐ +${rewards.exp.toLocaleString("id-ID")} EXP\n╰┈┈┈┈┈┈┈┈⬡`;
}

function buildUserDataBlock(name, age, gender) {
  return (
    `╭┈┈⬡「 📋 *ᴅᴀᴛᴀ* 」\n` +
    `┃ 📛 Nombre: *${name || "-"}*\n` +
    `┃ 🎂 Edad: *${age ? `${age} años` : "-"}*\n` +
    `┃ 👤 Género: *${gender || "-"}*\n` +
    `╰┈┈┈┈┈┈┈┈⬡`
  );
}

function buildWelcomeMessage(user, registrationRequired, prefix) {
  const benefits = [
    `🗂️ Tus datos de cuenta quedan guardados más ordenadamente`,
    `${buildRewardPreview(user)}`,
  ];

  if (registrationRequired) {
    benefits.splice(
      1,
      0,
      `🔓 Después de registrarte podrás acceder a todos los comandos`,
    );
  }

  return (
    `👋 *sᴇʟᴀᴍᴀᴛ ᴅᴀᴛᴀɴɢ ᴅɪ ᴍᴇɴᴜ ᴅᴀꜰᴛᴀʀ*\n\n` +
    `✨ Al registrarte, tus datos estarán más seguros y la experiencia con el bot será más completa.\n\n` +
    `🌟 *Beneficios del registro*\n` +
    `${benefits.map((item) => `> ${item}`).join("\n")}\n\n` +
    `📝 *Pregunta 1/4*\n` +
    `> Cuál es tu nombre?\n\n` +
    `📌 *Debes responder a este mensaje*\n` +
    `> Para cancelar: responde \`batal\` o escribe \`${prefix}bataldaftar\``
  );
}

function buildConfirmationPrompt(session, user) {
  return (
    `✅ *ᴘᴇʀᴛᴀɴʏᴀᴀɴ 4/4*\n\n` +
    `Los siguientes datos son correctos?\n\n` +
    `${buildUserDataBlock(session.name, session.age, session.gender)}\n\n` +
    `${buildConfirmationRewardBlock(user)}\n\n` +
    `🛠️ Si algo está mal, puedes revisar cada parte.\n\n` +
    `*Responde este mensaje con:*\n` +
    `> \`ya\` para guardar\n` +
    `> \`revisi nama\` para cambiar el nombre\n` +
    `> \`revisi umur\` para cambiar la edad\n` +
    `> \`revisi gender\` para cambiar el género\n` +
    `> \`batal\` para cancelar`
  );
}

async function handler(m, { sock }) {
  const db = getDatabase();
  const user = db.getUser(m.sender);

  if (user?.isRegistered) {
    return m.reply(
      `✅ Ya estás registrado!\n\n` +
        `${buildUserDataBlock(user.regName, user.regAge, user.regGender)}\n\n` +
        `> Para quitar tu registro: \`${m.prefix}unreg\``,
    );
  }

  if (getRegistrationSessionEntry(m.sender).session) {
    return m.reply(
      `📝 Todavía hay una sesión de registro activa!\n\n` +
        `> Responde el último mensaje del bot para continuar\n` +
        `> O escribe: \`${m.prefix}bataldaftar\``,
    );
  }

  const session = createRegistrationSession(m.sender, m.chat);
  const sent = await sendRegistrationPrompt(
    sock,
    m,
    buildWelcomeMessage(user, getRegistrationRequired(db), m.prefix),
    { useImage: true },
  );

  session.promptId = sent?.key?.id || null;

  await m.react("📝");
}

async function registrationAnswerHandler(m, sock) {
  if (!m.body) return false;
  if (shouldBypassRegistrationAnswer(m)) return false;

  const { session } = getRegistrationSessionEntry(m.sender);
  if (!session) return false;
  if (m.chat !== session.chatJid) return false;

  const text = m.body.trim();
  const lowText = normalizeSessionText(text);
  const db = getDatabase();

  if (["batal", "cancel", "batalkan"].includes(lowText)) {
    clearRegistrationSession(m.sender);
    await m.reply(
      `❌ Registro cancelado.\n\n> Empieza otra vez con: \`${m.prefix}daftar\``,
    );
    return true;
  }

  if (session.step === "name") {
    const name = normalizeRegistrationName(text);

    if (name.length < 2 || name.length > 30) {
      await m.reply(`❌ El nombre debe tener entre 2 y 30 caracteres!`);
      return true;
    }

    session.name = name;
    session.step = "age";

    const sent = await sendRegistrationPrompt(
      sock,
      m,
      `🎂 *ᴘᴇʀᴛᴀɴʏᴀᴀɴ 2/4*\n\n` +
        `Hola *${name}* 👋\n\n` +
        `> Cuántos años tienes?\n\n` +
        `📌 La edad solo puede ser de *1 - 100* años\n` +
        `📩 Responde este mensaje con tu edad en números\n\n` +
        `> Ejemplo: \`17\``,
    );

    session.promptId = sent?.key?.id || session.promptId;
    return true;
  }

  if (session.step === "age") {
    const age = Number(text);

    if (!/^\d+$/.test(text) || Number.isNaN(age) || age < 1 || age > 100) {
      await m.reply(
        `❌ Edad no válida!\n\n> Ingresa una edad de *1 - 100* años`,
      );
      return true;
    }

    session.age = age;
    session.step = "gender";

    const sent = await sendRegistrationPrompt(
      sock,
      m,
      `� *ᴘᴇʀᴛᴀɴʏᴀᴀɴ 3/4*\n\n` +
        `> Elige una opción de género:\n\n` +
        `┃ � *Cowo* / *Cowok* / *Laki-laki* / *L*\n` +
        `┃ � *Cewe* / *Cewek* / *Perempuan* / *P*\n\n` +
        `📩 Responde este mensaje con tu respuesta`,
    );

    session.promptId = sent?.key?.id || session.promptId;
    return true;
  }

  if (session.step === "gender") {
    let gender = null;

    if (/^(laki[-\s]?laki|cowok?|cowo|l|male|pria)$/i.test(lowText)) {
      gender = "Laki-laki";
    } else if (/^(perempuan|cewek?|cewe|p|female|wanita)$/i.test(lowText)) {
      gender = "Perempuan";
    }

    if (!gender) {
      await m.reply(
        `❌ Género no válido!\n\n` +
          `> Responde con: *Cowo* / *Cowok* / *Laki-laki* / *L*\n` +
          `> O: *Cewe* / *Cewek* / *Perempuan* / *P*`,
      );
      return true;
    }

    session.gender = gender;
    session.step = "confirm";

    const user = db.getUser(m.sender) || {};
    const sent = await sendRegistrationPrompt(
      sock,
      m,
      buildConfirmationPrompt(session, user),
    );

    session.promptId = sent?.key?.id || session.promptId;
    return true;
  }

  if (session.step === "revise_name") {
    const name = normalizeRegistrationName(text);

    if (name.length < 2 || name.length > 30) {
      await m.reply(`❌ El nombre debe tener entre 2 y 30 caracteres!`);
      return true;
    }

    session.name = name;
    session.step = "confirm";

    const user = db.getUser(m.sender) || {};
    const sent = await sendRegistrationPrompt(
      sock,
      m,
      buildConfirmationPrompt(session, user),
    );

    session.promptId = sent?.key?.id || session.promptId;
    return true;
  }

  if (session.step === "revise_age") {
    const age = Number(text);

    if (!/^\d+$/.test(text) || Number.isNaN(age) || age < 1 || age > 100) {
      await m.reply(
        `❌ Edad no válida!\n\n> Ingresa una edad de *1 - 100* años`,
      );
      return true;
    }

    session.age = age;
    session.step = "confirm";

    const user = db.getUser(m.sender) || {};
    const sent = await sendRegistrationPrompt(
      sock,
      m,
      buildConfirmationPrompt(session, user),
    );

    session.promptId = sent?.key?.id || session.promptId;
    return true;
  }

  if (session.step === "revise_gender") {
    let gender = null;

    if (/^(laki[-\s]?laki|cowok?|cowo|l|male|pria)$/i.test(lowText)) {
      gender = "Laki-laki";
    } else if (/^(perempuan|cewek?|cewe|p|female|wanita)$/i.test(lowText)) {
      gender = "Perempuan";
    }

    if (!gender) {
      await m.reply(
        `❌ Género no válido!\n\n` +
          `> Responde con: *Cowo* / *Cowok* / *Laki-laki* / *L*\n` +
          `> O: *Cewe* / *Cewek* / *Perempuan* / *P*`,
      );
      return true;
    }

    session.gender = gender;
    session.step = "confirm";

    const user = db.getUser(m.sender) || {};
    const sent = await sendRegistrationPrompt(
      sock,
      m,
      buildConfirmationPrompt(session, user),
    );

    session.promptId = sent?.key?.id || session.promptId;
    return true;
  }

  if (session.step === "confirm") {
    if (["revisi nama", "ubah nama", "edit nama"].includes(lowText)) {
      session.step = "revise_name";

      const sent = await sendRegistrationPrompt(
        sock,
        m,
        `📛 *ʀᴇᴠɪsɪ ɴᴀᴍᴀ*\n\n` +
          `> Envía el nombre correcto.\n\n` +
          `📩 Responde este mensaje con tu nuevo nombre`,
      );

      session.promptId = sent?.key?.id || session.promptId;
      return true;
    }

    if (
      ["revisi umur", "ubah umur", "edit umur", "revisi usia"].includes(lowText)
    ) {
      session.step = "revise_age";

      const sent = await sendRegistrationPrompt(
        sock,
        m,
        `🎂 *ʀᴇᴠɪsɪ ᴜᴍᴜʀ*\n\n` +
          `> Envía la edad correcta.\n\n` +
          `📌 La edad solo puede ser de *1 - 100* años\n` +
          `📩 Responde este mensaje con tu nueva edad en números`,
      );

      session.promptId = sent?.key?.id || session.promptId;
      return true;
    }

    if (
      ["revisi gender", "ubah gender", "edit gender", "revisi jk"].includes(
        lowText,
      )
    ) {
      session.step = "revise_gender";

      const sent = await sendRegistrationPrompt(
        sock,
        m,
        `👤 *ʀᴇᴠɪsɪ ɢᴇɴᴅᴇʀ*\n\n` +
          `> Elige el género correcto.\n\n` +
          `┃ � *Cowo* / *Cowok* / *Laki-laki* / *L*\n` +
          `┃ 👧 *Cewe* / *Cewek* / *Perempuan* / *P*\n\n` +
          `📩 Responde este mensaje con tu respuesta`,
      );

      session.promptId = sent?.key?.id || session.promptId;
      return true;
    }

    if (
      ["revisi", "ulang", "reset", "ulangi", "edit", "ubah"].includes(lowText)
    ) {
      await m.reply(
        `❌ Revisi belum spesifik!\n\n` +
          `> Responde: \`revisi nama\`, \`revisi umur\`, o \`revisi gender\``,
      );
      return true;
    }

    if (!["ya", "y", "iya", "yes", "lanjut", "confirm"].includes(lowText)) {
      await m.reply(
        `❌ Respuesta no válida!\n\n> Responde: \`ya\`, \`revisi nama\`, \`revisi umur\`, \`revisi gender\`, o \`batal\``,
      );
      return true;
    }

    const currentUser = db.getUser(m.sender) || {};
    const rewards = getRegistrationRewards();
    const alreadyClaimedReward = Boolean(currentUser.hasClaimedRegisterReward);
    const now = new Date().toISOString();
    const registrationCount = Number(currentUser.registrationCount || 0) + 1;
    const finalName = session.name;
    const finalAge = session.age;
    const finalGender = session.gender;

    db.setUser(m.sender, {
      isRegistered: true,
      regName: finalName,
      regAge: finalAge,
      regGender: finalGender,
      registeredAt: currentUser.registeredAt || now,
      lastRegisteredAt: now,
      registrationCount,
      hasClaimedRegisterReward: true,
      unregisteredAt: null,
    });

    if (!alreadyClaimedReward) {
      db.updateKoin(m.sender, rewards.koin);
      db.updateEnergi(m.sender, rewards.energi);
      db.updateExp(m.sender, rewards.exp);
    }

    await db.save();
    clearRegistrationSession(m.sender);

    await sock.sendMessage(
      m.chat,
      {
        text:
          `🎉 *ᴘᴇɴᴅᴀꜰᴛᴀʀᴀɴ ʙᴇʀʜᴀsɪʟ!*\n\n` +
          `Bienvenido/a, *${finalName}*!\n\n` +
          `${buildUserDataBlock(finalName, finalAge, finalGender)}\n\n` +
          `${buildSuccessRewardBlock(alreadyClaimedReward)}\n\n` +
          `🚀 Ahora ya puedes usar el bot!`,
        contextInfo: getRegistrationContextInfo(),
      },
      { quoted: m },
    );

    await m.react("🎉");
    return true;
  }

  return false;
}

export {
  pluginConfig as config,
  handler,
  registrationAnswerHandler,
  clearRegistrationSession,
};
