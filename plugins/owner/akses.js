import { getDatabase } from "../../src/lib/ourin-database.js";
import ms from "ms";
const pluginConfig = {
  name: "akses",
  alias: [
    "addakses",
    "delakses",
    "listakses",
    "addaccess",
    "delaccess",
    "listaccess",
  ],
  category: "owner",
  description: "Grant temporary/permanent command access to users",
  usage: ".addakses <cmd> <duration> <user>",
  example: ".addakses addowner 30d @user",
  isOwner: true,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 0,
  energi: 0,
  isEnabled: true,
};

async function handler(m, { sock, plugins }) {
  const db = getDatabase();
  const cmd = m.command.toLowerCase();
  const isAdd = ["addakses", "addaccess"].includes(cmd);
  const isDel = ["delakses", "delaccess"].includes(cmd);
  const isList = ["listakses", "listaccess"].includes(cmd);
  let target = m.mentionedJid?.[0];
  if (!target && m.quoted) target = m.quoted.sender;
  if (!target && m.args.length > 0) {
    for (const arg of m.args) {
      if (/^\d{5,15}$/.test(arg)) {
        target = arg + "@s.whatsapp.net";
        break;
      } else if (/^@\d+/.test(arg)) {
        target = arg.replace("@", "") + "@s.whatsapp.net";
        break;
      }
    }
  }
  let commandTarget = null;
  let durationTarget = null;
  if (isAdd) {
    if (!target)
      return m.reply(
        `❌ *Target no valido*\n\nEtiqueta al usuario / responde el chat / escribe el numero objetivo`,
      );
    const cleanArgs = m.args.filter(
      (a) => !a.includes("@") && !/^\d{10,}$/.test(a),
    );
    if (cleanArgs.length < 2) {
      return m.reply(
        `⚠️ *Format Salah*\n\n` +
          `Format: \`${m.prefix}addakses <command> <duracion> <target>\`\n\n` +
          `*Ejemplo:*\n` +
          `> \`${m.prefix}addakses addowner 30d @user\` (30 Hari)\n` +
          `> \`${m.prefix}addakses unban permanent @user\` (Selamanya)\n\n` +
          `*Duraciones compatibles:* 1h, 1d, 30d, 1y`,
      );
    }
    commandTarget = cleanArgs[0].toLowerCase();
    durationTarget = cleanArgs[1].toLowerCase();
  }

  const user = db.getUser(target) || {};
  if (!user.access) user.access = [];
  if (isList) {
    if (!target) target = m.sender;
    const targetData = db.getUser(target) || {};
    const accessList = targetData.access || [];
    const now = Date.now();
    const activeAccess = accessList.filter(
      (a) => a.expired === null || a.expired > now,
    );
    if (activeAccess.length !== accessList.length) {
      targetData.access = activeAccess;
      db.setUser(target, targetData);
    }

    if (activeAccess.length === 0) {
      return m.reply(
        `📊 *ᴜsᴇʀ ᴀᴄᴄᴇss*\n\nTarget: @${target.split("@")[0]}\nEstado: *No tiene acceso especial*`,
        {
          mentions: sock.parseMention(`@${target.split("@")[0]}`),
        },
      );
    }

    let txt = `📊 *ᴜsᴇʀ ᴀᴄᴄᴇss*\n\n`;
    txt += `Target: @${target.split("@")[0]}\n`;
    txt += `Total: *${activeAccess.length}* commands\n`;
    txt += `━━━━━━━━━━━━━━━\n\n`;

    activeAccess.forEach((acc, i) => {
      let expiredTxt = "♾️ Permanent";
      if (acc.expired) {
        const timeLeft = acc.expired - now;
        if (timeLeft > 0) {
          expiredTxt = "🕕 " + ms(timeLeft, { long: true });
        } else {
          expiredTxt = "🔴 Expired";
        }
      }

      txt += `${i + 1}. *${acc.cmd}*\n`;
      txt += `   └ ${expiredTxt}\n`;
    });

    return m.reply(txt, { mentions: [target] });
  }
  if (isAdd) {
    let expiredTime = null;
    if (durationTarget !== "permanent" && durationTarget !== "perm") {
      try {
        const durationMs = ms(durationTarget);
        if (!durationMs)
          return m.reply(`❌ Formato de duracion incorrecto! Usa: 1h, 1d, 30d`);
        expiredTime = Date.now() + durationMs;
      } catch {
        return m.reply(`❌ Formato de duracion no reconocido!`);
      }
    }

    const existingIdx = user.access.findIndex((a) => a.cmd === commandTarget);
    if (existingIdx !== -1) {
      user.access[existingIdx].expired = expiredTime;
      db.setUser(target, user);
      return m.reply(
        `✅ *ᴀᴋsᴇs ᴅɪᴘᴇʀʙᴀʀᴜɪ*\n\n` +
          `Command: \`${commandTarget}\`\n` +
          `Duracion: *${durationTarget}*\n` +
          `Target: @${target.split("@")[0]}`,
      );
    }
    user.access.push({
      cmd: commandTarget,
      expired: expiredTime,
    });

    // console.log('[DEBUG AddAccess] Saving user with access:', JSON.stringify(user.access))
    db.setUser(target, user);
    // console.log('[DEBUG AddAccess] After save:', JSON.stringify(db.getUser(target)?.access))

    await m.reply(
      `✅ *ᴀᴋsᴇs ᴅɪʙᴇʀɪᴋᴀɴ*\n\n` +
        `┃ 🔑 ᴄᴍᴅ: \`${commandTarget}\`\n` +
        `┃ ⏱️ ᴅᴜʀᴀsɪ: *${durationTarget}*\n` +
        `┃ 👤 ᴛᴀʀɢᴇᴛ: @${target.split("@")[0]}\n`,
      { mentions: [target] },
    );
  }
  if (isDel) {
    if (!target) return m.reply(`❌ Etiqueta al usuario al que quieres quitarle el acceso!`);
    const now = Date.now();
    const activeAccess = user.access.filter(
      (a) => a.expired === null || a.expired > now,
    );
    let specificCmd = m.args.find((a) => !a.includes("@") && !/^\d+$/.test(a));
    if (specificCmd) {
      specificCmd = specificCmd.toLowerCase();
      const idx = user.access.findIndex((a) => a.cmd === specificCmd);
      if (idx === -1)
        return m.reply(`❌ El usuario no tiene acceso al comando \`${specificCmd}\``);

      user.access.splice(idx, 1);
      db.setUser(target, user);
      return m.reply(
        `✅ Acceso \`${specificCmd}\` revocado correctamente de @${target.split("@")[0]}`,
      );
    }

    if (activeAccess.length === 0) {
      return m.reply(`⚠️ Este usuario no tiene acceso a ningun comando.`);
    }
    const rows = activeAccess.map((acc) => {
      const exp = acc.expired ? ms(acc.expired - now) : "Permanent";
      return {
        title: `Quitar: ${acc.cmd}`,
        description: `Duracion restante: ${exp}`,
        id: `${m.prefix}delakses ${acc.cmd} ${target}`,
      };
    });
    const listMessage = {
      text: `🔓 *REVOCAR ACCESO*\n\nElige el acceso de comando que quieres quitar de @${target.split("@")[0]}`,
      title: "Manage Access",
      buttonText: "PILIH COMMAND",
      sections: [
        {
          title: "Active Access List",
          rows: rows,
        },
      ],
    };

    return sock.sendMessage(m.chat, listMessage, { quoted: m });
  }
}

export { pluginConfig as config, handler };
