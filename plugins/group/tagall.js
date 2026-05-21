import {
  getParticipantJid,
  getParticipantJids,
} from "../../src/lib/ourin-lid.js";
import te from "../../src/lib/ourin-error.js";
const pluginConfig = {
  name: "tagall",
  alias: ["all", "everyone"],
  category: "group",
  description: "Etiqueta a todos los miembros del grupo",
  usage: ".tagall <mensaje>",
  example: ".tagall Halo semua!",
  isOwner: false,
  isPremium: false,
  isGroup: true,
  isPrivate: false,
  cooldown: 30,
  energi: 0,
  isEnabled: true,
  isAdmin: true,
  isBotAdmin: false,
};

async function handler(m, { sock }) {
  const text = m.text || "Tag All Miembros";

  try {
    const groupMeta = m.groupMetadata;
    const participants = groupMeta.participants || [];

    if (participants.length === 0) {
      await m.reply(`❌ *ɢᴀɢᴀʟ*\n\n> No hay miembro di grupo ini.`);
      return;
    }

    const targetParticipants = participants.filter((participant) => {
      return getParticipantJid(participant) !== m.sender;
    });

    if (targetParticipants.length === 0) {
      await m.reply(`❌ *ɢᴀɢᴀʟ*\n\n> No hay miembro lain yang bisa di-tag.`);
      return;
    }

    const mentions = getParticipantJids(targetParticipants);
    const miembroList = targetParticipants
      .map((participant) => `@${getParticipantJid(participant).split("@")[0]}`)
      .join("\n")
      .trim();

    await m.reply(
      `*Mensaje:* ${text}\n\n` +
        `\`\`\`━━━ ${targetParticipants.length} MEMBER TOTAL ━━━\`\`\`\n` +
        miembroList,
      { mentions: mentions },
    );
  } catch (error) {
    m.reply(te(m.prefix, m.command, m.pushName));
  }
}

export { pluginConfig as config, handler };
