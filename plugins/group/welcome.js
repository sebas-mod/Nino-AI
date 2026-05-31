import moment from "moment-timezone";
import config from "../../config.js";
import { getDatabase } from "../../src/lib/ourin-database.js";
import { resolveAnyLidToJid } from "../../src/lib/ourin-lid.js";
import te from "../../src/lib/ourin-error.js";
import { saluranCtx } from "../../src/lib/ourin-context.js";

function resolvePlaceholders(
  template,
  username,
  groupName,
  groupDesc,
  memberCount,
  groupOwner,
  prefix,
) {
  const now = moment().tz("America/Buenos_Aires");

  return template
    .replace(/{user}/gi, `@${username}`)
    .replace(/{number}/gi, username)
    .replace(/{group}/gi, groupName || "Grupo")
    .replace(/{desc}/gi, groupDesc || "")
    .replace(/{count}/gi, memberCount?.toString() || "0")
    .replace(/{owner}/gi, groupOwner || "Sebas MD")
    .replace(/{date}/gi, now.format("DD/MM/YYYY"))
    .replace(/{time}/gi, now.format("HH:mm"))
    .replace(/{day}/gi, now.format("dddd"))
    .replace(/{bot}/gi, config.bot?.name || "Nino AI")
    .replace(/{prefix}/gi, prefix);
}

const pluginConfig = {
  name: "welcome",
  alias: ["wc"],
  category: "group",
  description: "Configura el mensaje de bienvenida del grupo",
  usage: ".welcome <on/off>",
  example: ".welcome on",
  isOwner: false,
  isPremium: false,
  isGroup: true,
  isPrivate: false,
  isAdmin: true,
  cooldown: 5,
  energi: 0,
  isEnabled: true,
};

async function buildWelcomeMessage(
  participant,
  groupName,
  groupDesc,
  memberCount,
  customMsg = null,
  groupOwner = "",
  prefix = ".",
) {
  const username = participant?.split("@")[0] || "Usuario";

  if (customMsg) {
    return resolvePlaceholders(
      customMsg,
      username,
      groupName,
      groupDesc,
      memberCount,
      groupOwner,
      prefix,
    );
  }

  let msg = `🌸 *𝐁𝐢𝐞𝐧𝐯𝐞𝐧𝐢𝐝𝐨 𝐚 𝐍𝐢𝐧𝐨 𝐀𝐈* 🌸\n\n`;
  msg += `Hola *@${username}*, acabas de entrar al grupo.\n\n`;
  msg += `📌 *𝐈𝐧𝐟𝐨 𝐝𝐞𝐥 𝐠𝐫𝐮𝐩𝐨*\n`;
  msg += `> 🏠 *Nombre:* ${groupName || "Grupo"}\n`;
  msg += `> 👥 *Miembros:* ${memberCount}\n`;
  msg += `> 📅 *Fecha:* ${moment().tz("America/Buenos_Aires").format("DD/MM/YYYY")}\n`;

  if (groupDesc) {
    msg += `\n📝 *Descripción*\n> ${groupDesc.slice(0, 120)}${groupDesc.length > 120 ? "..." : ""}\n`;
  }

  msg += `\n✨ Respeta las reglas, participa y no entres en modo fantasma.\n`;
  msg += `\n_by Nino AI🌸_`;

  return msg;
}

function createWelcomeImageUrl() {
  const params = new URLSearchParams({
    width: "1280",
    height: "720",
    backgroundUrl: "https://imagenes-one.vercel.app/fondo-nino-AI.jpg",
    profileUrl: "https://imagenes-one.vercel.app/perfil-nino-AI.jpg",
    profileSize: "230",
    profileX: "640",
    profileY: "130",
    borderColor: "#ff0066",
    borderWidth: "8",

    text1: "Bienvenido Usuario",
    text1X: "640",
    text1Y: "350",
    text1Size: "60",
    text1Color: "#f9f5f8",
    text1Font: "Arial",
    text1Bold: "true",
    text1Align: "center",

    text2: "Un nuevo miembro ha llegado",
    text2X: "640",
    text2Y: "410",
    text2Size: "30",
    text2Color: "#0d0d0d",
    text2Font: "Arial",
    text2Bold: "false",
    text2Align: "center",

    apiKey: "Sebas-Md-2004",
  });

  return `https://yosoyyo-api-ofc.onrender.com/api/image/welcome-banner?${params.toString()}`;
}

async function sendWelcomeMessage(sock, groupJid, participant, groupMeta) {
  try {
    const db = getDatabase();
    const groupData = db.getGroup(groupJid);

    if (groupData?.welcome !== true) return false;

    const welcomeType = db.setting("welcomeType") || 1;

    const realParticipant = resolveAnyLidToJid(
      participant,
      groupMeta?.participants || [],
    );

    const memberCount = groupMeta?.participants?.length || 0;
    const groupName = groupMeta?.subject || "Grupo";
    const userName = realParticipant?.split("@")[0] || "Usuario";

    const text = await buildWelcomeMessage(
      realParticipant,
      groupMeta?.subject,
      groupMeta?.desc || groupMeta?.descOwner,
      memberCount,
      groupData?.welcomeMsg,
      groupMeta?.owner?.split("@")[0] || "",
      config.command?.prefix || ".",
    );

    if (welcomeType === 1) {
      const apiUrl = createWelcomeImageUrl();

      try {
        await sock.sendMessage(groupJid, {
          image: { url: apiUrl },
          caption: text,
          mentions: [realParticipant],
        });

        return true;
      } catch (e) {
        console.error("Welcome image error:", e.message);

        await sock.sendMessage(groupJid, {
          text:
            `⚠️ No pude generar la imagen de bienvenida.\n\n` +
            `Error: ${e.message}\n\n` +
            text,
          mentions: [realParticipant],
        });

        return true;
      }
    }

    if (welcomeType === 2) {
      await sock.sendMessage(groupJid, {
        text: `🌸 *Bienvenido @${userName}*\n\n${text}`,
        contextInfo: {
          ...saluranCtx(),
          mentionedJid: [realParticipant],
        },
      });

      return true;
    }

    await sock.sendMessage(groupJid, {
      text,
      mentions: [realParticipant],
    });

    return true;
  } catch (error) {
    console.error("Welcome Error:", error);
    return false;
  }
}

async function handler(m, { sock }) {
  const db = getDatabase();
  const args = m.args || [];
  const sub = args[0]?.toLowerCase();
  const sub2 = args[1]?.toLowerCase();

  const groupData = db.getGroup(m.chat) || {};
  const currentStatus = groupData.welcome === true;

  if (sub === "on" && sub2 === "all") {
    if (!m.isOwner) return m.reply(config.messages.ownerOnly);

    m.react("🕕");

    try {
      const groups = await sock.groupFetchAllParticipating();
      const groupIds = Object.keys(groups);
      let count = 0;

      for (const groupId of groupIds) {
        db.setGroup(groupId, { welcome: true });
        count++;
      }

      m.react("✅");

      return m.reply(
        `✅ *WELCOME GLOBAL ACTIVADO*\n\n` +
          `> Bienvenida activada en *${count}* grupos.`,
      );
    } catch (err) {
      m.react("☢");
      return m.reply(te(m.prefix, m.command, m.pushName));
    }
  }

  if (sub === "off" && sub2 === "all") {
    if (!m.isOwner) return m.reply(config.messages.ownerOnly);

    m.react("🕕");

    try {
      const groups = await sock.groupFetchAllParticipating();
      const groupIds = Object.keys(groups);
      let count = 0;

      for (const groupId of groupIds) {
        db.setGroup(groupId, { welcome: false });
        count++;
      }

      m.react("✅");

      return m.reply(
        `❌ *WELCOME GLOBAL DESACTIVADO*\n\n` +
          `> Bienvenida desactivada en *${count}* grupos.`,
      );
    } catch (err) {
      m.react("☢");
      return m.reply(te(m.prefix, m.command, m.pushName));
    }
  }

  if (sub === "on") {
    if (currentStatus) {
      return m.reply(
        `⚠️ *WELCOME YA ESTÁ ACTIVO*\n\n` +
          `> Estado: *✅ ON*\n` +
          `> La bienvenida ya está activa en este grupo.\n\n` +
          `_Usa \`${m.prefix}welcome off\` para desactivarla._`,
      );
    }

    db.setGroup(m.chat, { welcome: true });

    return m.reply(
      `✅ *WELCOME ACTIVADO*\n\n` +
        `> Mensaje de bienvenida activado correctamente.\n` +
        `> Los nuevos miembros serán recibidos automáticamente.\n\n` +
        `_Usa \`${m.prefix}setwelcome\` para personalizar el mensaje._`,
    );
  }

  if (sub === "off") {
    if (!currentStatus) {
      return m.reply(
        `⚠️ *WELCOME YA ESTÁ INACTIVO*\n\n` +
          `> Estado: *❌ OFF*\n` +
          `> La bienvenida ya está desactivada en este grupo.\n\n` +
          `_Usa \`${m.prefix}welcome on\` para activarla._`,
      );
    }

    db.setGroup(m.chat, { welcome: false });

    return m.reply(
      `❌ *WELCOME DESACTIVADO*\n\n` +
        `> Mensaje de bienvenida desactivado correctamente.\n` +
        `> Los nuevos miembros ya no serán recibidos automáticamente.`,
    );
  }

  return m.reply(
    `👋 *WELCOME SETTINGS*\n\n` +
      `> Estado: *${currentStatus ? "✅ ON" : "❌ OFF"}*\n\n` +
      `\`\`\`━━━ OPCIONES ━━━\`\`\`\n` +
      `> \`${m.prefix}welcome on\` → Activar\n` +
      `> \`${m.prefix}welcome off\` → Desactivar\n` +
      `> \`${m.prefix}welcome on all\` → Global ON, solo owner\n` +
      `> \`${m.prefix}welcome off all\` → Global OFF, solo owner\n` +
      `> \`${m.prefix}setwelcome\` → Personalizar mensaje\n` +
      `> \`${m.prefix}resetwelcome\` → Restaurar mensaje predeterminado`,
  );
}

export { pluginConfig as config, handler, sendWelcomeMessage };
