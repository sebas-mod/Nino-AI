import { getDatabase } from "../../src/lib/ourin-database.js";
import config from "../../config.js";

function getRegistrationContextInfo() {
  const saluranId = config.saluran?.id || "120363400911374213@newsletter";
  const saluranName = config.saluran?.name || config.bot?.name || "Nino AI";

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

function toDateKey(value) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getRegistrationStats(db) {
  const users = Object.values(db.getAllUsers() || {});
  const todayKey = toDateKey(new Date());

  return {
    totalRegistered: users.filter((user) => user?.isRegistered).length,
    registeredToday: users.filter(
      (user) =>
        toDateKey(user?.lastRegisteredAt || user?.registeredAt) === todayKey,
    ).length,
    unregisteredToday: users.filter(
      (user) => toDateKey(user?.unregisteredAt) === todayKey,
    ).length,
    activeSessions: Object.keys(global.registrationSessions || {}).length,
  };
}

const pluginConfig = {
  name: "sistemdaftar",
  alias: ["regmode", "wajibdaftar", "togglereg"],
  category: "owner",
  description: "Gestionar registro obligatorio y estadisticas de registro",
  usage: ".sistemdaftar <on/off/stats>",
  example: ".sistemdaftar stats",
  isOwner: true,
  isPremium: false,
  isGroup: false,
  isPrivate: false,

  cooldown: 5,
  energi: 0,
  isEnabled: true,
};

async function handler(m, { sock }) {
  const db = getDatabase();
  const args = m.text?.trim() || "";
  const normalizedArgs = args.toLowerCase();

  const currentStatus =
    db.setting("registrationRequired") ?? config.registration?.enabled ?? false;
  const stats = getRegistrationStats(db);

  if (!normalizedArgs) {
    return m.reply(
      `⚙️ *sɪsᴛᴇᴍ ᴅᴀꜰᴛᴀʀ*\n\n` +
        `Status: ${currentStatus ? "✅ ON (Registro obligatorio)" : "❌ OFF"}\n\n` +
        `*Statistik:*\n` +
        `> Total registered: *${stats.totalRegistered}*\n` +
        `> Register dias ini: *${stats.registeredToday}*\n` +
        `> Unreg dias ini: *${stats.unregisteredToday}*\n` +
        `> Sesiones activas: *${stats.activeSessions}*\n\n` +
        `*Usage:*\n` +
        `> \`${m.prefix}sistemdaftar on\` - Exigir registro\n` +
        `> \`${m.prefix}sistemdaftar off\` - Desactivar registro obligatorio\n` +
        `> \`${m.prefix}sistemdaftar stats\` - Lihat statistik\n\n` +
        `> Si esta ON, el usuario debe \`${m.prefix}daftar\` antes de usar comandos`,
    );
  }

  if (normalizedArgs === "stats") {
    await sock.sendMessage(
      m.chat,
      {
        text:
          `📊 *sᴛᴀᴛɪsᴛɪᴋ ᴅᴀꜰᴛᴀʀ*\n\n` +
          `Status sistem: ${currentStatus ? "✅ ON (Registro obligatorio)" : "❌ OFF"}\n\n` +
          `╭┈┈⬡「 📈 *sᴛᴀᴛs* 」\n` +
          `┃ Total registered: *${stats.totalRegistered}*\n` +
          `┃ Register dias ini: *${stats.registeredToday}*\n` +
          `┃ Unreg dias ini: *${stats.unregisteredToday}*\n` +
          `┃ Sesiones activas: *${stats.activeSessions}*\n` +
          `╰┈┈┈┈┈┈┈┈⬡`,
        contextInfo: getRegistrationContextInfo(),
      },
      { quoted: m },
    );

    await m.react("📊");
    return;
  }

  if (
    normalizedArgs === "on" ||
    normalizedArgs === "1" ||
    normalizedArgs === "true"
  ) {
    db.setting("registrationRequired", true);
    await db.save();

    await sock.sendMessage(
      m.chat,
      {
        text:
          `✅ *sɪsᴛᴇᴍ ᴅᴀꜰᴛᴀʀ ᴅɪᴀᴋᴛɪꜰᴋᴀɴ!*\n\n` +
          `Ahora los usuarios deben registrarse antes de usar comandos!\n\n` +
          `> Comando: \`${m.prefix}daftar\``,
        contextInfo: getRegistrationContextInfo(),
      },
      { quoted: m },
    );

    await m.react("✅");
    return;
  }

  if (
    normalizedArgs === "off" ||
    normalizedArgs === "0" ||
    normalizedArgs === "false"
  ) {
    db.setting("registrationRequired", false);
    await db.save();

    await sock.sendMessage(
      m.chat,
      {
        text:
          `❌ *sɪsᴛᴇᴍ ᴅᴀꜰᴛᴀʀ ᴅɪɴᴏɴᴀᴋᴛɪꜰᴋᴀɴ!*\n\n` +
          `El usuario no necesita registrarse para usar comandos.`,
        contextInfo: getRegistrationContextInfo(),
      },
      { quoted: m },
    );

    await m.react("❌");
    return;
  }

  return m.reply(
    `❌ Opcion no valida!\n\n> Usa: \`on\`, \`off\`, o \`stats\``,
  );
}

export { pluginConfig as config, handler };
