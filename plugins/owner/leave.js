import config from "../../config.js";
import te from "../../src/lib/ourin-error.js";
const pluginConfig = {
  name: "leave",
  alias: ["leavegrupos", "leavegroup", "keluar", "bye"],
  category: "owner",
  description: "Bot salir del grupo",
  usage: ".leave [link]",
  example: ".leave",
  isOwner: true,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 10,
  energi: 0,
  isEnabled: true,
};

function extractInviteCode(text) {
  const patterns = [
    /chat\.whatsapp\.com\/([a-zA-Z0-9]{20,})/i,
    /wa\.me\/([a-zA-Z0-9]{20,})/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) return match[1];
  }

  return null;
}

async function handler(m, { sock }) {
  const input = m.args.join(" ").trim();

  let targetGroupJid = null;
  let groupName = "";

  if (!input && m.isGroup) {
    targetGroupJid = m.chat;
    try {
      const meta = m.groupMetadata;
      groupName = meta.subject || "Grup ini";
    } catch {
      groupName = "Grup ini";
    }
  } else if (input) {
    const inviteCode = await extractInviteCode(input);

    if (!inviteCode) {
      return m.reply(`❌ *ꜰᴀʟʟᴏ*\n\n> Link de invitacion no valido`);
    }

    try {
      const groupInfo = await sock.groupGetInviteInfo(inviteCode);
      targetGroupJid = groupInfo.id;
      groupName = groupInfo.subject || "Desconocido";
    } catch (error) {
      return m.reply(
        `❌ *ꜰᴀʟʟᴏ*\n\n> No se puede obtener informacion del grupo desde el link`,
      );
    }
  } else {
    return m.reply(
      `🚪 *ʟᴇᴀᴠᴇ ɢʀᴜᴘ*\n\n` +
        `╭┈┈⬡「 📋 *ᴍᴏᴅᴏ ᴅᴇ ᴜꜱᴏ* 」\n` +
        `┃ ◦ Di grupos: \`.leave\`\n` +
        `┃ ◦ Via link: \`.leave <link>\`\n` +
        `╰┈┈⬡\n\n` +
        `\`Ejemplo: ${m.prefix}leave https://chat.whatsapp.com/xxx\``,
    );
  }

  if (!targetGroupJid) {
    return m.reply(`❌ *ꜰᴀʟʟᴏ*\n\n> Grupo no encontrado`);
  }

  await m.react("🕕");

  try {
    global.sewaLeaving = true;

    const saluranId = config.saluran?.id || "120363400911374213@newsletter";
    const saluranName = config.saluran?.name || config.bot?.name || "Nino AI";

    if (m.isGroup && targetGroupJid === m.chat) {
      await sock.sendMessage(m.chat, {
        text:
          `👋 *ɢᴏᴏᴅʙʏᴇ*\n\n` +
          `> El bot saldra de este grupo.\n` +
          `> Gracias por usar el bot!`,
        contextInfo: {
          forwardingScore: 9999,
          isForwarded: true,
          forwardedNewsletterMessageInfo: {
            newsletterJid: saluranId,
            newsletterName: saluranName,
            serverMessageId: 127,
          },
        },
      });
    }

    await sock.groupLeave(targetGroupJid);

    global.sewaLeaving = false;

    if (!m.isGroup || targetGroupJid !== m.chat) {
      await m.react("✅");
      await m.reply(
        `✅ *ʙᴇʀʜᴀsɪʟ ᴋᴇʟᴜᴀʀ*\n\n` + `> El bot salio de: *${groupName}*`,
      );
    }
  } catch (error) {
    global.sewaLeaving = false;
    await m.react("☢");
    await m.reply(te(m.prefix, m.command, m.pushName));
  }
}

export { pluginConfig as config, handler };
