import { getDatabase } from "../../src/lib/ourin-database.js";
import { saluranCtx } from "../../src/lib/ourin-context.js";

const pluginConfig = {
  name: "anticulik",
  alias: ["antikidnap", "antiileng", "anticulikgc"],
  category: "group",
  description: "El bot sale automaticamente del grupo si lo agregan sin permiso",
  usage: ".anticulik on/off",
  example: ".anticulik on",
  isOwner: true,
  isPremium: false,
  isGroup: true,
  isPrivate: false,
  cooldown: 5,
  energi: 0,
  isEnabled: true,
};

async function handler(m, { sock }) {
  const db = getDatabase();
  const option = m.text?.toLowerCase()?.trim();

  if (!option) {
    const groupData = db.getGroup(m.chat) || {};
    const status = groupData.anticulik || "off";

    return m.reply(
      `🛡️ *Anti Culik*\n\n` +
        `El bot saldra automaticamente del grupo si lo agrega una persona desconocida sin permiso.\n\n` +
        `*STATUS:*\n` +
        `> Mode: *${status === "on" ? "Aktif ✅" : "Nonactivo ❌"}*\n\n` +
        `*PENGGUNAAN:*\n` +
        `> *${m.prefix}anticulik on* — Activar\n` +
        `> *${m.prefix}anticulik off* — Desactivar\n\n` +
        `_Si esta activo, el bot solo puede unirse mediante *${m.prefix}join* o agregado por el owner_`
    );
  }

  if (option === "on") {
    db.setGroup(m.chat, { anticulik: "on" });
    const ctx = saluranCtx();
    return m.reply(
      `🛡️ *Anti Culik Aktif*\n\n` +
        `> El bot saldra automaticamente si lo agregan sin permiso\n` +
        `> La unica forma en que el bot puede unirse: *${m.prefix}join* oleh owner\n\n` +
        `_El miembro que agregue el bot recibira una advertencia_`,
      { contextInfo: ctx }
    );
  }

  if (option === "off") {
    db.setGroup(m.chat, { anticulik: "off" });
    return m.reply(
      `🛡️ *Anti Culik Nonactivo*\n\n` +
        `> El bot no saldra automaticamente si lo agregan al grupo\n` +
        `> Cualquiera puede agregar el bot al grupo`
    );
  }

  return m.reply(
    `❌ *Opcion no valida*\n\n> Usa *${m.prefix}anticulik on* o *${m.prefix}anticulik off*`
  );
}

async function handleAntiCulik(event, sock, db) {
  if (event.action !== "add") return false;

  const botNumber =
    sock.user?.id?.split(":")[0] || sock.user?.id?.split("@")[0];
  const botLid = sock.user?.id;

  const isBotAdded = (event.participants || []).some((p) => {
    const rJid = typeof p === "object" && p !== null ? p.phoneNumber || p.id : p;
    if (typeof rJid !== "string") return false;
    const pNum = rJid.split("@")[0].split(":")[0];
    return (
      pNum === botNumber ||
      rJid === botLid ||
      rJid.includes(botNumber)
    );
  });

  if (!isBotAdded) return false;

  const groupData = db.getGroup(event.id) || {};
  if (groupData.anticulik !== "on") return false;

  const inviter = event.author || "";
  const ownerNumbers = (global.owner || []).map((o) =>
    typeof o === "string" ? o.split("@")[0] : o
  );
  const inviterNum = inviter.split("@")[0].split(":")[0];

  const isOwnerInviter =
    inviterNum === botNumber ||
    ownerNumbers.includes(inviterNum) ||
    inviter === botLid;

  if (isOwnerInviter) return false;

  const inviterMention = inviter
    ? `@${inviter.split("@")[0]}`
    : "seseorang";

  await sock.sendMessage(event.id, {
    text:
      `🛡️ *Anti Culik*\n\n` +
      `Minimal izin dulu ya bang, jangan asal culik 🗿\n\n` +
      `> Bot agregado por ${inviterMention} sin permiso\n` +
      `> El bot saldra de este grupo\n\n` +
      `_Contacta al owner para agregar el bot de la forma correcta_`,
    contextInfo: saluranCtx(),
    mentionedJid: inviter ? [inviter] : [],
  });

  await new Promise((r) => setTimeout(r, 2000));
  await sock.groupLeave(event.id);
  return true;
}

export { pluginConfig as config, handler, handleAntiCulik };
