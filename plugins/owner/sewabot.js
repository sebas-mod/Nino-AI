import { getDatabase } from "../../src/lib/ourin-database.js";
import fs from "fs";
import te from "../../src/lib/ourin-error.js";
import { saluranCtx } from "../../src/lib/ourin-context.js";
const pluginConfig = {
  name: "sewabot",
  alias: ["sewa"],
  category: "owner",
  description: "Activar y gestionar el sistema de alquiler del bot",
  usage: ".sewabot <on/off/leave/status>",
  example: ".sewabot on",
  isOwner: true,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 5,
  energi: 0,
  isEnabled: true,
};
const pendingConfirmations = new Map();
async function handler(m, { sock }) {
  const db = getDatabase();
  const args = m.text?.trim()?.toLowerCase();
  if (!db.db.data.sewa) {
    db.db.data.sewa = { enabled: false, groups: {} };
    db.db.write();
  }
  const currentStatus = db.db.data.sewa.enabled;
  const sewaGroups = Object.keys(db.db.data.sewa.groups || {});
  if (!args || args === "status") {
    return m.reply(
      `🔧 *SISTEM SEWA BOT*\n\n` +
        `Estado: *${currentStatus ? "✅ ACTIVO" : "❌ NONACTIVO"}*\n` +
        `Grupos registrados: *${sewaGroups.length}*\n\n` +
        `*COMANDOS DISPONIBLES:*\n` +
        `• *${m.prefix}sewabot on* — Activar sistema de alquiler\n` +
        `• *${m.prefix}sewabot off* — Desactivar sistema de alquiler\n` +
        `• *${m.prefix}sewabot leave* — Salir de todos los grupos fuera de whitelist\n\n` +
        `*GESTIONAR ALQUILER:*\n` +
        `• *${m.prefix}addsewa <link> <duracion>* — Agregar grupo + auto join\n` +
        `• *${m.prefix}delsewa <link/id>* — Eliminar grupo de whitelist\n` +
        `• *${m.prefix}renewsewa <link/id> <duracion>* — Renovar alquiler\n` +
        `• *${m.prefix}listsewa* — Ver todos los grupos registrados\n` +
        `• *${m.prefix}checksewa* — Ver tiempo restante de alquiler (en el grupo)\n\n` +
        `*FORMATO DE DURACION:*\n` +
        `30i (minutos) \u2022 12h (horas) \u2022 7d (dias) \u2022 1m (meses) \u2022 1y (anos) \u2022 lifetime\n\n` +
        `*COMO FUNCIONA:*\n` +
        `1. Agrega el grupo con *${m.prefix}addsewa*\n` +
        `2. El bot entra automaticamente si usas link\n` +
        `3. Activar con *${m.prefix}sewabot on*\n` +
        `4. El bot saldra de todos los grupos no registrados\n` +
        `5. Sewa vencido → bot otomatis salir del grupo`,
    );
  }
  if (args === "off") {
    db.db.data.sewa.enabled = false;
    db.db.write();
    await m.react("✅");
    return m.reply(
      `✅ Sistema de alquiler desactivado\n\nEl bot no abandonara ningun grupo.`,
    );
  }
  if (args === "on") {
    const pending = pendingConfirmations.get(m.sender);
    if (
      pending &&
      pending.type === "sewabot_on" &&
      Date.now() - pending.timestamp < 60000
    ) {
      return m.reply(
        `🕕 Ya hay una solicitud pendiente\n\nEscribe *${m.prefix}sewabot confirm* para continuar\nEscribe *${m.prefix}sewabot cancel* para cancelar`,
      );
    }
    pendingConfirmations.set(m.sender, {
      type: "sewabot_on",
      timestamp: Date.now(),
    });
    setTimeout(() => {
      if (pendingConfirmations.get(m.sender)?.type === "sewabot_on")
        pendingConfirmations.delete(m.sender);
    }, 60000);
    return m.reply(
      `⚠️ *CONFIRMACION DE ACTIVACION DE ALQUILER*\n\n` +
        `Si se activa:\n` +
        `• ✅ ${sewaGroups.length} grupos en whitelist quedan seguros\n` +
        `• ❌ Todos los otros grupos seran abandonados!\n\n` +
        `Escribe *${m.prefix}sewabot confirm* para continuar\nEscribe *${m.prefix}sewabot cancel* para cancelar\n\n` +
        `💡 Asegurate de agregar grupos importantes a la whitelist con:\n*${m.prefix}addsewa <link grupos> <duracion>*`,
    );
  }
  if (args === "confirm" || args === "yes" || args === "y") {
    const pending = pendingConfirmations.get(m.sender);
    if (!pending || pending.type !== "sewabot_on") {
      return m.reply(
        `❌ No hay solicitudes pendientes\nEscribe *${m.prefix}sewabot on* primero`,
      );
    }
    pendingConfirmations.delete(m.sender);
    db.db.data.sewa.enabled = true;
    db.db.write();
    await m.react("🕕");
    await m.reply(`🕕 Sistema de alquiler activado, procesando auto-leave...`);
    try {
      global.isFetchingGroups = true;
      const allGroups = await sock.groupFetchAllParticipating();
      global.isFetchingGroups = false;
      const allGroupIds = Object.keys(allGroups);
      const unlistedGroups = allGroupIds.filter(
        (id) => !sewaGroups.includes(id),
      );
      let leftCount = 0;
      let failedCount = 0;
      for (const groupId of unlistedGroups) {
        try {
          await sock.sendText(
            groupId,
            `⛔ Este grupo no esta registrado en el sistema de alquiler.\nEl bot abandonara este grupo.\n\nContacta al owner para alquilar el bot.`,
            null,
            {
              contextInfo: saluranCtx(),
            },
          );
          await new Promise((r) => setTimeout(r, 2000));
          await sock.groupLeave(groupId);
          leftCount++;
          await new Promise((r) => setTimeout(r, 3000));
        } catch {
          failedCount++;
        }
      }
      await m.react("✅");
      return m.reply(
        `✅ *ALQUILER DEL BOT ACTIVO*\n\n` +
          `Grup whitelist: *${sewaGroups.length}*\n` +
          `Salio de: *${leftCount}* grupos\n` +
          `Fallidos: *${failedCount}* grupos`,
      );
    } catch (e) {
      await m.react("✅");
      return m.reply(te(m.prefix, m.command, m.pushName));
    }
  }
  if (args === "leave") {
    if (!currentStatus)
      return m.reply(`❌ Activa primero sewabot con *${m.prefix}sewabot on*`);
    await m.react("🕕");
    await m.reply(`🕕 Obteniendo lista de grupos...`);
    global.sewaLeaving = true;
    try {
      global.isFetchingGroups = true;
      const allGroups = await sock.groupFetchAllParticipating();
      global.isFetchingGroups = false;
      const allGroupIds = Object.keys(allGroups);
      const unlistedGroups = allGroupIds.filter(
        (id) => !sewaGroups.includes(id),
      );
      if (unlistedGroups.length === 0) {
        delete global.sewaLeaving;
        await m.react("✅");
        return m.reply(`✅ No hay grupos que deban abandonarse`);
      }
      await m.reply(
        `📊 Total: ${allGroupIds.length} grupos\nWhitelist: ${sewaGroups.length}\nSaldra de: ${unlistedGroups.length} grupos`,
      );
      let leftCount = 0;
      let failedCount = 0;
      for (const groupId of unlistedGroups) {
        try {
          await sock.sendText(
            groupId,
            `👋 Este grupo no esta registrado en el sistema de alquiler.\nEl bot abandonara este grupo.\n\nContacta al owner para alquilar el bot.`,
            null,
            {
              contextInfo: saluranCtx(),
            },
          );
          await new Promise((r) => setTimeout(r, 3000));
          await sock.groupLeave(groupId);
          leftCount++;
          await new Promise((r) => setTimeout(r, 5000));
        } catch {
          failedCount++;
        }
      }
      delete global.sewaLeaving;
      await m.react("✅");
      return m.reply(
        `✅ Finalizado\n\nCorrecto: salio de: *${leftCount}* grupos\nFallidos: *${failedCount}* grupos`,
      );
    } catch (e) {
      delete global.sewaLeaving;
      await m.react("☢");
      await m.reply(te(m.prefix, m.command, m.pushName));
    }
  }
  if (args === "cancel" || args === "no" || args === "n") {
    const pending = pendingConfirmations.get(m.sender);
    if (!pending || pending.type !== "sewabot_on")
      return m.reply(`❌ No hay solicitudes pendientes`);
    pendingConfirmations.delete(m.sender);
    await m.react("❌");
    return m.reply(
      `❌ Activacion cancelada\nAgrega primero grupos a la whitelist con *${m.prefix}addsewa*`,
    );
  }
  return m.reply(
    `❌ Comando no valido\n\nEscribe *${m.prefix}sewabot* para ver guia completa`,
  );
}
export { pluginConfig as config, handler, pendingConfirmations };
