import { getDatabase } from "../../src/lib/ourin-database.js";
import { fetchGroupsSafe } from "../../src/lib/ourin-jpm-helper.js";
import { saluranCtx } from "../../src/lib/ourin-context.js";
import config from "../../config.js";
import te from "../../src/lib/ourin-error.js";

const pluginConfig = {
  name: "bcgc",
  alias: [
    "broadcastgc",
    "bcgroup",
    "jedabcgc",
    "delaybcgc",
    "setjedabcgc",
    "stopbcgc",
    "stopbroadcastgc",
  ],
  category: "owner",
  description:
    "Broadcast de mensajes a todos los grupos con soporte para todos los tipos de medios",
  usage: ".bcgc",
  isOwner: true,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 10,
  energi: 0,
  isEnabled: true,
};

function parseDelay(input) {
  if (!input) return null;
  const match = input.match(/^(\d+)(s|m|h|d)$/i);
  if (!match) return null;
  const val = parseInt(match[1]);
  const unit = match[2].toLowerCase();
  switch (unit) {
    case "s":
      return val * 1000;
    case "m":
      return val * 60 * 1000;
    case "h":
      return val * 60 * 60 * 1000;
    case "d":
      return val * 24 * 60 * 60 * 1000;
    default:
      return null;
  }
}

function formatDelay(ms) {
  if (ms >= 86400000) return `${(ms / 86400000).toFixed(0)} dias`;
  if (ms >= 3600000) return `${(ms / 3600000).toFixed(0)} jam`;
  if (ms >= 60000) return `${(ms / 60000).toFixed(0)} menit`;
  return `${(ms / 1000).toFixed(0)} detik`;
}

async function handler(m, { sock }) {
  const db = getDatabase();
  const command = m.command?.toLowerCase() || "";
  const input = m.fullArgs?.trim() || m.text?.trim() || "";

  if (command === "stopbcgc" || command === "stopbroadcastgc") {
    if (!global.statusBcgc) {
      return m.reply(`❌ No hay broadcast grup yang sedang berjalan.`);
    }
    global.stopBcgc = true;
    m.react("⏹️");
    return m.reply(
      `⏹️ *Broadcast de grupos detenido*\n\n> El proceso de broadcast se esta deteniendo...`,
    );
  }

  if (
    command === "jedabcgc" ||
    command === "delaybcgc" ||
    command === "setjedabcgc"
  ) {
    return handleSetDelay(m, db, input);
  }

  if (input.toLowerCase() === "on") {
    db.setting("bcgcEnabled", true);
    return m.reply(
      `✅ *Broadcast de grupos activado*\n\n> Ahora puedes enviar broadcasts a todos los grupos.`,
    );
  }

  if (input.toLowerCase() === "off") {
    db.setting("bcgcEnabled", false);
    return m.reply(
      `✅ *Broadcast de grupos desactivado*\n\n> El broadcast de grupos fue apagado.`,
    );
  }

  if (!input && !m.quoted) {
    const enabled = db.setting("bcgcEnabled");
    const jeda = db.setting("jedaBcgc") || 5000;
    return m.reply(
      `📢 *Broadcast Grup*\n\n` +
        `Envia mensajes a todos los grupos a la vez con un solo comando.\n\n` +
        `*Status saat ini:*\n` +
        `> Broadcast: *${enabled ? "✅ Activo" : "❌ Inactivo"}*\n` +
        `> Jeda: *${formatDelay(jeda)}* (*${jeda}ms*)\n\n` +
        `*PENGGUNAAN:*\n` +
        `> *${m.prefix}bcgc on* — Activokan broadcast\n` +
        `> *${m.prefix}bcgc off* — Inactivokan broadcast\n` +
        `> *${m.prefix}bcgc <pesan>* — Enviar broadcast de texto\n` +
        `> *${m.prefix}bcgc* (reply foto/video/audio/dokumen) — Enviar con medio\n` +
        `> *${m.prefix}bcgc* (reply pesan teks) — Enviar el contenido del mensaje respondido\n\n` +
        `*JEDA:*\n` +
        `> *${m.prefix}jedabcgc 5s* — Set jeda 5 detik\n` +
        `> *${m.prefix}jedabcgc 2m* — Set jeda 2 menit\n\n` +
        `*STOP:*\n` +
        `> *${m.prefix}stopbcgc* — Hentikan broadcast yang berjalan`,
    );
  }

  if (global.statusBcgc) {
    return m.reply(
      `❌ *Broadcast Sedang Berjalan*\n\n> Escribe *${m.prefix}stopbcgc* untuk menghentikan terlebih dahulu.`,
    );
  }

  const enabled = db.setting("bcgcEnabled");
  if (!enabled) {
    return m.reply(
      `❌ *Broadcast aun no activo*\n\n> Escribe *${m.prefix}bcgc on* primero para activarlo.`,
    );
  }

  m.react("📢");

  try {
    let mediaBuffer = null;
    let mediaType = null;
    let text = input || "";
    const qmsg = m.quoted || m;

    if (!text && m.quoted) {
      text = m.quoted.body || m.quoted.text || m.quoted.contentText || "";
    }

    if (qmsg.isImage) {
      try {
        mediaBuffer = await qmsg.download();
        mediaType = "image";
      } catch {}
    } else if (qmsg.isVideo) {
      try {
        mediaBuffer = await qmsg.download();
        mediaType = "video";
      } catch {}
    } else if (qmsg.isAudio || qmsg.mimetype?.startsWith("audio")) {
      try {
        mediaBuffer = await qmsg.download();
        mediaType = "audio";
      } catch {}
    } else if (qmsg.isSticker) {
      try {
        mediaBuffer = await qmsg.download();
        mediaType = "sticker";
      } catch {}
    } else if (
      qmsg.isDocument ||
      (qmsg.mimetype && !qmsg.mimetype.startsWith("text/plain"))
    ) {
      try {
        mediaBuffer = await qmsg.download();
        mediaType = "document";
      } catch {}
    }

    if (!text && !mediaBuffer) {
      m.react("❌");
      return m.reply(
        `❌ *No hay contenido*\n\n` +
          `Envia primero un mensaje, foto, audio, video o documento.\n\n` +
          `*Cara yang benar:*\n` +
          `1. Envia texto/foto/video/audio/documento\n` +
          `2. Reply pesan tersebut dengan *${m.prefix}bcgc*\n` +
          `3. El bot hara broadcast a todos los grupos`,
      );
    }

    const allGroups = await fetchGroupsSafe(sock);
    let groupIds = Object.keys(allGroups);

    const blacklist = db.setting("jpmBlacklist") || [];
    const blCount = groupIds.filter((id) => blacklist.includes(id)).length;
    groupIds = groupIds.filter((id) => !blacklist.includes(id));

    if (groupIds.length === 0) {
      m.react("❌");
      return m.reply(
        `❌ *No hay grupos*\n\n> El bot no encontro grupos disponibles como destino${blCount > 0 ? ` (${blCount} grupos en blacklist)` : ""}`,
      );
    }

    const jeda = db.setting("jedaBcgc") || 5000;
    const ctx = saluranCtx();

    await m.reply(
      `📢 *Broadcast de grupos iniciado*\n\n` +
        `> 📝 Pesan: *${text.substring(0, 50)}${text.length > 50 ? "..." : ""}*\n` +
        `> 📷 Media: *${mediaBuffer ? mediaType : "No hay"}*\n` +
        `> 👥 Target: *${groupIds.length}* grup\n` +
        `> ⏱️ Jeda: *${formatDelay(jeda)}*\n` +
        `> 📊 Estimacion: *${Math.ceil((groupIds.length * jeda) / 60000)} menit*\n\n` +
        `_Enviando a todos los grupos..._`,
    );

    global.statusBcgc = true;
    let success = 0;
    let failed = 0;

    for (const gid of groupIds) {
      if (global.stopBcgc) {
        delete global.stopBcgc;
        delete global.statusBcgc;
        await m.reply(
          `⏹️ *Broadcast de grupos detenido*\n\n` +
            `> ✅ Correctos: *${success}*\n` +
            `> ❌ Fallidos: *${failed}*\n` +
            `> ⏸️ Restante: *${groupIds.length - success - failed}*`,
        );
        return;
      }

      try {
        if (mediaType === "sticker") {
          await sock.sendMessage(
            gid,
            { sticker: mediaBuffer, contextInfo: ctx },
            { quoted: m },
          );
        } else if (mediaType === "audio") {
          await sock.sendMessage(
            gid,
            {
              audio: mediaBuffer,
              mimetype: qmsg.mimetype || "audio/mpeg",
              ptt: qmsg.ptt || false,
              contextInfo: ctx,
            },
            { quoted: m },
          );
        } else if (mediaType === "document") {
          await sock.sendMessage(
            gid,
            {
              document: mediaBuffer,
              mimetype: qmsg.mimetype || "application/octet-stream",
              fileName: qmsg.fileName || "file",
              caption: text || undefined,
              contextInfo: ctx,
            },
            { quoted: m },
          );
        } else if (mediaBuffer) {
          await sock.sendMessage(
            gid,
            {
              [mediaType]: mediaBuffer,
              caption: text,
              contextInfo: ctx,
            },
            { quoted: m },
          );
        } else {
          await sock.sendMessage(
            gid,
            { text, contextInfo: ctx },
            { quoted: m },
          );
        }
        success++;
      } catch {
        failed++;
      }

      await new Promise((r) => setTimeout(r, jeda));
    }

    delete global.statusBcgc;
    m.react("✅");
    await m.reply(
      `✅ *Broadcast de grupos completado!*\n\n` +
        `> ✅ Correctos: *${success}*\n` +
        `> ❌ Fallidos: *${failed}*\n` +
        `> 📊 Total: *${groupIds.length}*`,
    );
  } catch (e) {
    delete global.statusBcgc;
    m.react("☢");
    m.reply(te(m.prefix, m.command, m.pushName));
  }
}

async function handleSetDelay(m, db, input) {
  const current = db.setting("jedaBcgc") || 5000;

  if (!input) {
    return m.reply(
      `⏱️ *Pausa del broadcast de grupos*\n\n` +
        `Configura la pausa entre envios de mensajes a cada grupo.\n` +
        `Semakin lama jeda, semakin aman dari spam detection.\n\n` +
        `> Jeda saat ini: *${formatDelay(current)}* (*${current}ms*)\n\n` +
        `*CARA PAKAI:*\n` +
        `> *${m.prefix}jedabcgc <angka><satuan>*\n\n` +
        `*SATUAN:*\n` +
        `> *s* — detik • *m* — menit • *h* — jam • *d* — dias\n\n` +
        `*CONTOH:*\n` +
        `> *${m.prefix}jedabcgc 5s* → 5 detik\n` +
        `> *${m.prefix}jedabcgc 2m* → 2 menit\n` +
        `> *${m.prefix}jedabcgc 1h* → 1 jam`,
    );
  }

  const ms = parseDelay(input);
  if (!ms || ms < 1000) {
    return m.reply(`❌ Format salah. Ejemplo: *5s*, *2m*, *1h*, *1d*`);
  }

  db.setting("jedaBcgc", ms);
  return m.reply(
    `✅ *Pausa del broadcast de grupos cambiada*\n\n` +
      `> Antes: *${formatDelay(current)}* (*${current}ms*)\n` +
      `> Sekarang: *${formatDelay(ms)}* (*${ms}ms*)\n\n` +
      `> Estimasi 100 grup: *${Math.ceil((100 * ms) / 60000)} menit*`,
  );
}

export { pluginConfig as config, handler };
