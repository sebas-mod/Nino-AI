import * as timeHelper from "../../src/lib/ourin-time.js";
import { getDatabase } from "../../src/lib/ourin-database.js";
import config from "../../config.js";
import {
  getTodaySchedule,
  extractPrayerTimes,
  searchKota,
} from "../../src/lib/ourin-sholat-api.js";
import te from "../../src/lib/ourin-error.js";
import { saluranCtx } from "../../src/lib/ourin-context.js";
const pluginConfig = {
  name: "autosholat",
  alias: ["sholat", "autoadzan"],
  category: "owner",
  description:
    "Alternar recordatorio automatico de horarios de oracion con audio adzan y cierre de grupo",
  usage: ".autosholat on/off/status/kota <nama>",
  example: ".autosholat on",
  isOwner: true,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 5,
  energi: 0,
  isEnabled: true,
};
const AUDIO_ADZAN = "https://media.vocaroo.com/mp3/1ofLT2YUJAjQ";
async function handler(m, { sock, db }) {
  const args = m.args[0]?.toLowerCase();
  const database = getDatabase();
  if (!args || args === "status") {
    const status = database.setting("autoSholat") ? "✅ Activo" : "❌ Inactivo";
    const closeGroup = database.setting("autoSholatCloseGroup")
      ? "✅ Ya"
      : "❌ Tidak";
    const duration = database.setting("autoSholatDuration") || 5;
    const kotaSetting = database.setting("autoSholatKota") || {
      id: "1301",
      nama: "KOTA JAKARTA",
    };
    let jadwalText = "";
    try {
      const jadwalData = await getTodaySchedule(kotaSetting.id);
      const times = extractPrayerTimes(jadwalData);
      for (const [nama, waktu] of Object.entries(times)) {
        jadwalText += `┃ ${nama.charAt(0).toUpperCase() + nama.slice(1)}: \`${waktu}\`\n`;
      }
    } catch {
      jadwalText = "┃ _Fallo: memuat jadwal_\n";
    }
    return m.reply(
      `🕌 *ᴀᴜᴛᴏ sʜᴏʟᴀᴛ*\n\n` +
        `╭┈┈⬡「 📋 *sᴛᴀᴛᴜs* 」\n` +
        `┃ 🔔 ᴀᴜᴛᴏ sʜᴏʟᴀᴛ: ${status}\n` +
        `┃ 🔒 ᴛᴜᴛᴜᴘ ɢʀᴜᴘ: ${closeGroup}\n` +
        `┃ ⏱️ ᴅᴜʀᴀsɪ: \`${duration}\` menit\n` +
        `┃ 📍 ᴋᴏᴛᴀ: \`${kotaSetting.nama}\`\n` +
        `╰┈┈⬡\n\n` +
        `╭┈┈⬡「 🕐 *ᴊᴀᴅᴡᴀʟ ʜᴀʀɪ ɪɴɪ* 」\n` +
        jadwalText +
        `╰┈┈⬡\n\n` +
        `> *Penggunaan:*\n` +
        `> \`${m.prefix}autosholat on\` - Activokan\n` +
        `> \`${m.prefix}autosholat off\` - Inactivokan\n` +
        `> \`${m.prefix}autosholat close on/off\` - Alternar cierre del grupo\n` +
        `> \`${m.prefix}autosholat duration <menit>\` - Definir duracion del cierre\n` +
        `> \`${m.prefix}autosholat kota <nama>\` - Definir ubicacion\n\n` +
        `> _Sumber: myquran.com (real-time)_`,
    );
  }
  if (args === "on") {
    database.setting("autoSholat", true);
    await m.react("✅");
    const kota = database.setting("autoSholatKota") || { nama: "KOTA JAKARTA" };
    return m.reply(
      `✅ *ᴀᴜᴛᴏ sʜᴏʟᴀᴛ ᴅɪᴀᴋᴛɪꜰᴋᴀɴ*\n\n` +
        `> Pengingat waktu sholat aktif\n` +
        `> El audio adzan se enviara a todos los grupos\n` +
        `> Lokasi: ${kota.nama} (real-time)`,
    );
  }
  if (args === "off") {
    database.setting("autoSholat", false);
    await m.react("❌");
    return m.reply(`❌ *ᴀᴜᴛᴏ sʜᴏʟᴀᴛ ᴅɪɴᴏɴᴀᴋᴛɪꜰᴋᴀɴ*`);
  }
  if (args === "close") {
    const subArg = m.args[1]?.toLowerCase();
    if (subArg === "on") {
      database.setting("autoSholatCloseGroup", true);
      await m.react("🔒");
      return m.reply(
        `🔒 *ᴛᴜᴛᴜᴘ ɢʀᴜᴘ ᴅɪᴀᴋᴛɪꜰᴋᴀɴ*\n\n> El grupo se cerrara durante el horario de oracion`,
      );
    }
    if (subArg === "off") {
      database.setting("autoSholatCloseGroup", false);
      await m.react("🔓");
      return m.reply(
        `🔓 *ᴛᴜᴛᴜᴘ ɢʀᴜᴘ ᴅɪɴᴏɴᴀᴋᴛɪꜰᴋᴀɴ*\n\n> El grupo no se cerrara durante el horario de oracion`,
      );
    }
    return m.reply(
      `❌ *ꜰᴀʟʟᴏ*\n\n> Usa: \`${m.prefix}autosholat close on/off\``,
    );
  }
  if (args === "duration") {
    const duration = parseInt(m.args[1]);
    if (isNaN(duration) || duration < 1 || duration > 60) {
      return m.reply(`❌ *ꜰᴀʟʟᴏ*\n\n> La duracion debe estar entre 1 y 60 minutos`);
    }
    database.setting("autoSholatDuration", duration);
    await m.react("⏱️");
    return m.reply(
      `⏱️ *ᴅᴜʀᴀsɪ ᴅɪsᴇᴛ*\n\n> El grupo se cerrara \`${duration}\` menit durante el horario de oracion`,
    );
  }
  if (args === "kota") {
    const kotaName = m.args.slice(1).join(" ").trim();
    if (!kotaName) {
      return m.reply(
        `❌ *ꜰᴀʟʟᴏ*\n\n> Usa: \`${m.prefix}autosholat kota Jakarta\``,
      );
    }
    await m.react("🔍");
    try {
      const result = await searchKota(kotaName);
      if (!result) {
        return m.reply(`❌ Ciudad "${kotaName}" no encontrada`);
      }
      database.setting("autoSholatKota", {
        id: result.id,
        nama: result.lokasi,
      });
      await m.react("📍");
      return m.reply(
        `📍 *ʟᴏᴋᴀsɪ ᴅɪsᴇᴛ*\n\n` +
          `> Kota: *${result.lokasi}*\n\n` +
          `> El horario de oracion seguira esta ubicacion`,
      );
    } catch (e) {
      await m.reply(te(m.prefix, m.command, m.pushName));
    }
  }
  return m.reply(
    `❌ *ᴀᴄᴛɪᴏɴ ᴛɪᴅᴀᴋ ᴠᴀʟɪᴅ*\n\n> Usa: \`on\`, \`off\`, \`close on/off\`, \`duration <menit>\`, \`kota <nama>\``,
  );
}
async function runAutoSholat(sock) {
  const db = getDatabase();
  if (!db.setting("autoSholat")) return;
  const kotaSetting = db.setting("autoSholatKota") || {
    id: "1301",
    nama: "KOTA JAKARTA",
  };
  let times;
  try {
    const jadwalData = await getTodaySchedule(kotaSetting.id);
    times = extractPrayerTimes(jadwalData);
  } catch {
    return;
  }
  const JADWAL = {
    subuh: times.subuh,
    dzuhur: times.dzuhur,
    ashar: times.ashar,
    maghrib: times.maghrib,
    isya: times.isya,
  };
  const timeNow = timeHelper.getCurrentTimeString();
  if (!global.autoSholatLock) global.autoSholatLock = {};
  for (const [sholat, waktu] of Object.entries(JADWAL)) {
    if (waktu === "-") continue;
    if (timeNow === waktu && !global.autoSholatLock[sholat]) {
      global.autoSholatLock[sholat] = true;
      try {
        global.isFetchingGroups = true;
        const groupsObj = await sock.groupFetchAllParticipating();
        global.isFetchingGroups = false;
        const groupList = Object.keys(groupsObj);
        const saluranId = config.saluran?.id || "120363400911374213@newsletter";
        const saluranName =
          config.saluran?.name || config.bot?.name || "Ourin-AI";
        const closeGroup = db.setting("autoSholatCloseGroup") || false;
        const duration = db.setting("autoSholatDuration") || 5;
        const ImagenSuasana = {
          subuh: "https://files.cloudkuimages.guru/images/61c43a618c30.jpg",
          dzuhur: "https://files.cloudkuimages.guru/images/57b4f4639bc3.jpg",
          ashar: "https://files.cloudkuimages.guru/images/e6c4e032aa53.webp",
          maghrib: "https://files.cloudkuimages.guru/images/da65b383dea6.webp",
          isya: "https://files.cloudkuimages.guru/images/e35488beb40c.jpg",
        };
        const contextInfo = {
          forwardingScore: 9999,
          isForwarded: true,
          forwardedNewsletterMessageInfo: {
            newsletterJid: saluranId,
            newsletterName: saluranName,
            serverMessageId: 127,
          },
        };
        for (const jid of groupList) {
          const groupData = db.data?.groups?.[jid] || {};
          if (groupData.notifSholat === false) continue;
          try {
            const caption =
              `🕌 *ᴡᴀᴋᴛᴜ sʜᴏʟᴀᴛ ${sholat.toUpperCase()}*\n\n` +
              `> Waktu: \`${waktu} WIB\`\n` +
              `> Lokasi: \`${kotaSetting.nama}\`\n` +
              `> Ayo tunaikan sholat! 🤲\n\n` +
              (closeGroup ? `> _Grup ditutup ${duration} menit_` : "");
            await sock.sendMessage(jid, {
              audio: { url: AUDIO_ADZAN },
              mimetype: "audio/mpeg",
              ptt: false,
              contextInfo: saluranCtx(),
            });
            if (closeGroup) {
              await sock.groupSettingUpdate(jid, "announcement");
            }
            await new Promise((res) => setTimeout(res, 500));
          } catch (e) {
            console.log(`[AutoSholat] Fallo: kirim ke ${jid}:`, e.message);
          }
        }
        if (closeGroup) {
          setTimeout(
            async () => {
              for (const jid of groupList) {
                try {
                  await sock.groupSettingUpdate(jid, "not_announcement");
                  await sock.sendMessage(jid, {
                    text: `✅ Grup dibuka kembali setelah sholat ${sholat}.`,
                    contextInfo,
                  });
                  await new Promise((res) => setTimeout(res, 600));
                } catch (e) {
                  console.log(
                    `[AutoSholat] Fallo: buka grup ${jid}:`,
                    e.message,
                  );
                }
              }
              console.log(`[AutoSholat] Semua grup dibuka kembali`);
            },
            duration * 60 * 1000,
          );
        }
        console.log(
          `[AutoSholat] Pengingat ${sholat} terkirim ke ${groupList.length} grup`,
        );
      } catch (error) {
        global.isFetchingGroups = false;
        console.error("[AutoSholat] Error:", error.message);
      }
      setTimeout(
        () => {
          delete global.autoSholatLock[sholat];
        },
        2 * 60 * 1000,
      );
    }
  }
}
export { pluginConfig as config, handler, runAutoSholat, AUDIO_ADZAN };
