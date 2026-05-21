import {
  isToxic,
  handleToxicMessage,
  DEFAULT_TOXIC_WORDS,
} from "./antitoxic.js";
import config from "../../config.js";
import { getDatabase } from "../../src/lib/ourin-database.js";
import te from "../../src/lib/ourin-error.js";
import { saluranCtx } from "../../src/lib/ourin-context.js";
const pluginConfig = {
  name: "notifgantitag",
  alias: ["notiflabel", "notiftag", "labeltag"],
  category: "group",
  description: "Configura notificaciones de cambios de etiqueta/tag de miembros",
  usage: ".notifgantitag <on/off>",
  example: ".notifgantitag on",
  isGroup: true,
  isAdmin: true,
  cooldown: 5,
  energi: 0,
  isEnabled: true,
};
async function handler(m, { sock }) {
  const db = getDatabase();
  const args = m.args || [];
  const sub = args[0]?.toLowerCase();
  const sub2 = args[1]?.toLowerCase();
  const groupData = db.getGroup(m.chat) || {};
  const currentStatus = groupData.notifLabelChange === true;
  if (sub === "on" && sub2 === "all") {
    if (!m.isOwner) {
      return m.reply(`❌ Solo el owner yang bisa menggunse va a fitur ini!`);
    }
    m.react("🕕");
    try {
      const groups = await sock.groupFetchAllParticipating();
      const groupIds = Object.keys(groups);
      let count = 0;
      for (const groupId of groupIds) {
        db.setGroup(groupId, { notifLabelChange: true });
        count++;
      }
      m.react("✅");
      return m.reply(
        `✅ *ɴᴏᴛɪꜰ ʟᴀʙᴇʟ ɢʟᴏʙᴀʟ ᴏɴ*\n\n` +
          `> Notifikasi ganti label activado di *${count}* grupo!`,
      );
    } catch (err) {
      m.react("☢");
      return m.reply(te(m.prefix, m.command, m.pushName));
    }
  }
  if (sub === "off" && sub2 === "all") {
    if (!m.isOwner) {
      return m.reply(`❌ Solo el owner yang bisa menggunse va a fitur ini!`);
    }
    m.react("🕕");
    try {
      const groups = await sock.groupFetchAllParticipating();
      const groupIds = Object.keys(groups);
      let count = 0;
      for (const groupId of groupIds) {
        db.setGroup(groupId, { notifLabelChange: false });
        count++;
      }
      m.react("✅");
      return m.reply(
        `❌ *ɴᴏᴛɪꜰ ʟᴀʙᴇʟ ɢʟᴏʙᴀʟ ᴏꜰꜰ*\n\n` +
          `> Notifikasi ganti label desactivado di *${count}* grupo!`,
      );
    } catch (err) {
      m.react("☢");
      return m.reply(te(m.prefix, m.command, m.pushName));
    }
  }
  if (sub === "on") {
    if (currentStatus) {
      return m.reply(
        `⚠️ *ɴᴏᴛɪꜰ ʟᴀʙᴇʟ ᴀʟʀᴇᴀᴅʏ ᴀᴄᴛɪᴠᴇ*\n\n` +
          `> Estado: *✅ ON*\n` +
          `> Notifikasi ganti label ya activo di grupo ini.\n\n` +
          `_Usa \`${m.prefix}notifgantitag off\` para menonactivokan._`,
      );
    }
    db.setGroup(m.chat, { notifLabelChange: true });
    return m.reply(
      `✅ *ɴᴏᴛɪꜰ ʟᴀʙᴇʟ ᴀᴋᴛɪꜰ*\n\n` +
        `> Notifikasi perubahan label miembro correctamente activado!\n` +
        `> Bot se va a miembroitahu ketika ada miembro yang labelnya diganti.\n\n` +
        `_Ejemplo: Admin menambahkan tag "VIP" ke miembro_`,
    );
  }
  if (sub === "off") {
    if (!currentStatus) {
      return m.reply(
        `⚠️ *ɴᴏᴛɪꜰ ʟᴀʙᴇʟ ᴀʟʀᴇᴀᴅʏ ɪɴᴀᴄᴛɪᴠᴇ*\n\n` +
          `> Estado: *❌ OFF*\n` +
          `> Notifikasi ganti label ya nonactivo di grupo ini.\n\n` +
          `_Usa \`${m.prefix}notifgantitag on\` para mengactivokan._`,
      );
    }
    db.setGroup(m.chat, { notifLabelChange: false });
    return m.reply(
      `❌ *ɴᴏᴛɪꜰ ʟᴀʙᴇʟ ɴᴏɴᴀᴋᴛɪꜰ*\n\n` +
        `> Notifikasi perubahan label miembro correctamente desactivado.`,
    );
  }
  m.reply(
    `🏷️ *ɴᴏᴛɪꜰ ɢᴀɴᴛɪ ᴛᴀɢ/ʟᴀʙᴇʟ*\n\n` +
      `> Estado: *${currentStatus ? "✅ ON" : "❌ OFF"}*\n\n` +
      `\`\`\`━━━ ᴘɪʟɪʜᴀɴ ━━━\`\`\`\n` +
      `> \`${m.prefix}notifgantitag on\` → Activar\n` +
      `> \`${m.prefix}notifgantitag off\` → Desactivar\n` +
      `> \`${m.prefix}notifgantitag on all\` → Global ON (owner)\n` +
      `> \`${m.prefix}notifgantitag off all\` → Global OFF (owner)\n\n` +
      `> 📋 *Fitur ini se va a miembroitahu saat:*\n` +
      `> • Admin menambahkan label ke miembro\n` +
      `> • Admin eliminar label de miembro\n` +
      `> • Label miembro berubah`,
  );
}
async function handleLabelChange(msg, sock) {
  try {
    const db = getDatabase();
    const protocolMessage = msg.message?.protocolMessage;
    if (!protocolMessage) return false;
    if (protocolMessage.type !== 30) return false;
    const memberLabel = protocolMessage.memberLabel;
    if (!memberLabel) return false;
    const groupJid = msg.key.remoteJid;
    if (!groupJid?.endsWith("@g.us")) return false;
    const groupData = db.getGroup(groupJid) || {};
    const participant = msg.key.participant || msg.participant || "Unknown";
    const label = memberLabel.label || "";
    if (groupData.antitoxic && label && label.trim()) {
      try {
        const toxicWords = groupData.toxicWords || DEFAULT_TOXIC_WORDS;
        const toxicCheck = isToxic(label, toxicWords);
        if (toxicCheck.toxic) {
          await sock.sendText(
            groupJid,
            `Hei @${participant.split("@")[0]}, Tag kamu mengandung kata toxic !`,
            null,
            {
              mentions: [participant],
              contextInfo: {
                ...saluranCtx(),
                mentionedJid: [participant],
              },
            },
          );
          return true;
        }
      } catch {}
    }
    if (groupData.notifLabelChange !== true) return false;
    let groupMeta = null;
    try {
      groupMeta = await sock.groupMetadata(groupJid);
    } catch {}
    let notifText = "";
    if (label && label.trim()) {
      notifText = `🎉 @${participant.split("@")[0]} telah mengubah label menjadi *${label}*`;
    } else {
      notifText = `🥗 @${participant.split("@")[0]} telah eliminar label`;
    }
    console.log(notifText);
    await sock.sendText(groupJid, notifText, null, {
      mentions: [participant],
      contextInfo: {
        ...saluranCtx(),
        mentionedJid: [participant],
      },
    });
    return true;
  } catch (error) {
    console.error("[NotifLabelChange] Error:", error.message);
    return false;
  }
}
export { pluginConfig as config, handler, handleLabelChange };
