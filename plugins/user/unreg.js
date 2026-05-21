import { getDatabase } from "../../src/lib/ourin-database.js";
import config from "../../config.js";
const pluginConfig = {
  name: "unreg",
  alias: ["unregister", "hapusdaftar"],
  category: "user",
  description: "Elimina tus datos de registro del bot",
  usage: ".unreg",
  example: ".unreg",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 30,
  energi: 0,
  isEnabled: true,
};

async function handler(m, { sock }) {
  const db = getDatabase();
  const user = db.getUser(m.sender);

  if (!user?.isRegistered) {
    return m.reply(
      `❌ Todavía no estás registrado!\n\n` + `> Regístrate con \`${m.prefix}daftar\``,
    );
  }

  const saluranId = config.saluran?.id || "120363400911374213@newsletter";
  const saluranName = config.saluran?.name || config.bot?.name || "Ourin-AI";
  const unregisteredAt = new Date().toISOString();

  db.setUser(m.sender, {
    isRegistered: false,
    regName: null,
    regAge: null,
    regGender: null,
    unregisteredAt,
  });

  await db.save();

  await sock.sendMessage(
    m.chat,
    {
      text:
        `✅ *ᴜɴʀᴇɢɪsᴛᴇʀ ʙᴇʀʜᴀsɪʟ!*\n\n` +
        `Tus datos de registro fueron eliminados.\n\n` +
        `> Para registrarte otra vez: \`${m.prefix}daftar\``,
      contextInfo: {
        forwardingScore: 9999,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
          newsletterJid: saluranId,
          newsletterName: saluranName,
          serverMessageId: 127,
        },
      },
    },
    { quoted: m },
  );

  m.react("✅");
}

export { pluginConfig as config, handler };
