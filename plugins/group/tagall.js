import {
  getParticipantJid,
  getParticipantJids,
} from "../../src/lib/ourin-lid.js";
import te from "../../src/lib/ourin-error.js";

const pluginConfig = {
  name: "todos",
  alias: ["all", "everyone"],
  category: "group",
  description: "Etiqueta a todos los miembros del grupo",
  usage: ".todos <mensaje>",
  example: ".todos Hola a todos!",
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
  const text = m.text || "Nino AI los invoca🌸";

  try {
    const groupMeta = m.groupMetadata;
    const participants = groupMeta.participants || [];

    if (participants.length === 0) {
      await m.reply(`❌ *ERROR*\n\n> No hay miembros en este grupo.`);
      return;
    }

    const targetParticipants = participants.filter((participant) => {
      return getParticipantJid(participant) !== m.sender;
    });

    if (targetParticipants.length === 0) {
      await m.reply(`❌ *ERROR*\n\n> No hay otros miembros para etiquetar.`);
      return;
    }

    const mentions = getParticipantJids(targetParticipants);
    const miembroList = targetParticipants
      .map((participant) => `🌸 @${getParticipantJid(participant).split("@")[0]}`)
      .join("\n")
      .trim();

    await m.reply(
      `*Nino AI los invoca*\n\n` +
        `*Participantes:* ${targetParticipants.length}\n\n` +
        `${miembroList}\n\n` +
        `https://chat.whatsapp.com/GmFsmsfQm18GGnfRwMeYgQ\n\n` +
        `by Nino AI🌸`,
      { mentions: mentions },
    );
  } catch (error) {
    m.reply(te(m.prefix, m.command, m.pushName));
  }
}

export { pluginConfig as config, handler };