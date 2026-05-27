import { fileTypeFromBuffer } from "file-type";
import fs from "fs";
import path from "path";
import { config } from "../../config.js";
import te from "../../src/lib/ourin-error.js";
import { handleAntiSwGc } from "../../src/lib/ourin-group-protection.js";
import { saluranCtx } from "../../src/lib/ourin-context.js";
const botConfig = config;

function buildSyntheticSwGcRawMessage(sock, remoteJid, content, messageId) {
  const botJid = sock.user?.id?.split(":")[0] + "@s.whatsapp.net";
  const innerMessage = content.text
    ? {
        extendedTextMessage: {
          text: content.text,
          contextInfo: {
            isGroupStatus: true,
            statusSourceType: 4,
          },
        },
      }
    : content.image
      ? {
          imageMessage: {
            caption: content.caption || "",
            contextInfo: {
              isGroupStatus: true,
              statusSourceType: 0,
            },
          },
        }
      : content.video
        ? {
            videoMessage: {
              caption: content.caption || "",
              contextInfo: {
                isGroupStatus: true,
                statusSourceType: 1,
              },
            },
          }
        : content.audio
          ? {
              audioMessage: {
                mimetype: content.mimetype || "audio/mpeg",
                ptt: Boolean(content.ptt),
                contextInfo: {
                  isGroupStatus: true,
                  statusSourceType: 3,
                },
              },
            }
          : {
              extendedTextMessage: {
                text: "",
                contextInfo: {
                  isGroupStatus: true,
                  statusSourceType: 4,
                },
              },
            };

  return {
    key: {
      remoteJid,
      fromMe: true,
      id: messageId,
      participant: botJid,
    },
    message: {
      groupStatusMessageV2: {
        message: innerMessage,
      },
    },
    messageTimestamp: Math.floor(Date.now() / 1000),
  };
}

const pluginConfig = {
  name: "swgc",
  alias: ["statusgrupos", "swgroup", "groupstory", "toswgc"],
  category: "owner",
  description: "Publicar estado/historia de grupo en el grupo elegido (borde verde)",
  usage: ".swgc <texto> o responde a un medio",
  example: ".swgc Hola a todos!",
  isOwner: true,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 10,
  energi: 0,
  isEnabled: true,
};

const pendingSwgc = new Map();

async function sendGroupStatus(sock, jid, content) {
  return await sock.sendMessage(jid, { groupStatusMessage: content });
}

async function handler(m, { sock, db }) {
  const args = m.args || [];
  const text = m.text || "";

  if (args[0] === "--confirm" && args[1]) {
    const targetGroupId = args[1];
    const pendingData = pendingSwgc.get(m.sender);

    if (!pendingData) {
      await m.reply(
        `⚠️ *No hay data pending. Envia nuevamente el medio + .swgc*`,
      );
      return;
    }

    try {
      let groupName = "Grup";
      try {
        const meta = await sock.groupMetadata(targetGroupId);
        groupName = meta.subject;
      } catch (e) {}

      await m.react("🕕");

      const rawContent = pendingData.rawContent;
      let content = {};

      if (rawContent.image) {
        content = {
          image: rawContent.image,
          caption: rawContent.caption || "",
        };
      } else if (rawContent.video) {
        content = {
          video: rawContent.video,
          caption: rawContent.caption || "",
        };
      } else if (rawContent.audio) {
        content = {
          audio: rawContent.audio,
          mimetype: rawContent.mimetype || "audio/mpeg",
          ptt: rawContent.ptt || false,
        };
      } else if (rawContent.text) {
        content = { text: rawContent.text };
      }

      const sendResult = await sendGroupStatus(sock, targetGroupId, content);
      if (typeof sendResult === "string") {
        const syntheticRawMsg = buildSyntheticSwGcRawMessage(
          sock,
          targetGroupId,
          content,
          sendResult,
        );
        await handleAntiSwGc(syntheticRawMsg, sock, db);
      }

      const mediaType = pendingData.rawContent.text
        ? "Texto"
        : pendingData.rawContent.image
          ? "Imagen"
          : pendingData.rawContent.video
            ? "Video"
            : pendingData.rawContent.audio
              ? "Audio"
              : "Media";

      const successMsg = `✅ Correcto: up sw ke grupos ${groupName}`;

      await m.reply(successMsg);
      pendingSwgc.delete(m.sender);

      if (pendingData.tempFile && fs.existsSync(pendingData.tempFile)) {
        setTimeout(() => {
          try {
            fs.unlinkSync(pendingData.tempFile);
          } catch (e) {}
        }, 5000);
      }
    } catch (error) {
      await m.reply(
        `❌ *ᴇʀʀᴏʀ*\n\n` + `> Fallo: posting story.\n` + `> _${error.message}_`,
      );
    }
    return;
  }

  let rawContent = {};
  let buffer, ext, tempFile;
  const tempDir = path.join(process.cwd(), "temp");
  if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

  if (
    m.quoted &&
    (m.quoted.isImage ||
      m.quoted.isVideo ||
      m.quoted.isAudio ||
      m.quoted.mimetype?.startsWith("audio"))
  ) {
    try {
      buffer = await m.quoted.download();
      if (!buffer) {
        await m.reply(`❌ No se pudo obtener el medio.`);
        return;
      }
      const fileType = await fileTypeFromBuffer(buffer);
      ext = fileType?.ext || "bin";
      tempFile = path.join(tempDir, `swgc_${Date.now()}.${ext}`);
      fs.writeFileSync(tempFile, buffer);

      if (m.quoted.isImage) {
        rawContent.image = buffer;
        rawContent.caption = text || "";
      } else if (m.quoted.isVideo) {
        rawContent.video = buffer;
        rawContent.caption = text || "";
      } else if (m.quoted.isAudio || m.quoted.mimetype?.startsWith("audio")) {
        rawContent.audio = buffer;
        rawContent.mimetype =
          fileType?.mime || m.quoted.mimetype || "audio/mpeg";
        rawContent.ptt = m.quoted.msg?.ptt || false;
      }
    } catch (e) {
      await m.reply(te(m.prefix, m.command, m.pushName));
      return;
    }
  } else if (
    m.isImage ||
    m.isVideo ||
    m.isAudio ||
    m.mimetype?.startsWith("audio")
  ) {
    try {
      buffer = await m.download();
      if (!buffer) {
        await m.reply(`❌ No se pudo obtener el medio.`);
        return;
      }
      const fileType = await fileTypeFromBuffer(buffer);
      ext = fileType?.ext || "bin";
      tempFile = path.join(tempDir, `swgc_${Date.now()}.${ext}`);
      fs.writeFileSync(tempFile, buffer);

      if (m.isImage) {
        rawContent.image = buffer;
        rawContent.caption = text || "";
      } else if (m.isVideo) {
        rawContent.video = buffer;
        rawContent.caption = text || "";
      } else if (m.isAudio || m.mimetype?.startsWith("audio")) {
        rawContent.audio = buffer;
        rawContent.mimetype = fileType?.mime || m.mimetype || "audio/mpeg";
        rawContent.ptt = m.msg?.ptt || false;
      }
    } catch (e) {
      await m.reply(te(m.prefix, m.command, m.pushName));
      return;
    }
  } else if (text && text.trim()) {
    rawContent.text = text;
    rawContent.font = 0;
    rawContent.backgroundColor = "#128C7E";
  } else {
    await m.reply(
      `⚠️ *ᴍᴏᴅᴏ ᴅᴇ ᴜꜱᴏ*\n\n` +
        `> \`${m.prefix}swgc teks\` - Story teks\n` +
        `> Responde imagen/video/audio + \`${m.prefix}swgc\`\n` +
        `> Envia imagen/video + caption \`${m.prefix}swgc\``,
    );
    return;
  }

  pendingSwgc.set(m.sender, {
    rawContent: rawContent,
    tempFile: tempFile,
    timestamp: Date.now(),
  });

  try {
    global.isFetchingGroups = true;
    const groups = await sock.groupFetchAllParticipating();
    global.isFetchingGroups = false;
    const groupList = Object.entries(groups);

    if (groupList.length === 0) {
      await m.reply(`⚠️ *El bot no esta en ningun grupo.*`);
      return;
    }

    const groupRows = groupList.map(([id, meta]) => ({
      title: meta.subject || "Grupo desconocido",
      description: id,
      id: `${m.prefix}swgc --confirm ${id}`,
    }));

    const prefix = m.prefix || ".";
    const mediaType = rawContent.text
      ? "Texto"
      : rawContent.image
        ? "Imagen"
        : rawContent.video
          ? "Video"
          : rawContent.audio
            ? "Audio"
            : "Media";

    let thumbnail = null;
    try {
      thumbnail = fs.readFileSync("./assets/images/ourin2.jpg");
    } catch (e) {}

    await sock.sendMessage(m.chat, {
      text:
        `📋 *ᴘɪʟɪʜ ɢʀᴜᴘ ᴜɴᴛᴜᴋ ᴘᴏsᴛ sᴛᴏʀʏ*\n\n` +
        `> Media: *${mediaType}*\n` +
        `> Total de grupos: *${groupList.length}*\n\n` +
        `_Elige un grupo de la lista de abajo:_`,
      contextInfo: {
        ...saluranCtx(),
        forwardedNewsletterMessageInfo: {
          newsletterJid: botConfig?.saluran?.id,
          newsletterName: botConfig?.saluran?.name,
        },
      },
      footer: "OURIN MD",
      interactiveButtons: [
        {
          name: "single_select",
          buttonParamsJson: JSON.stringify({
            title: "🏠 Elegir grupo",
            sections: [
              {
                title: "Lista de grupos",
                rows: groupRows,
              },
            ],
          }),
        },
        {
          name: "quick_reply",
          buttonParamsJson: JSON.stringify({
            display_text: "❌ Cancelar",
            id: `${prefix}cancelswgc`,
          }),
        },
      ],
    });
  } catch (error) {
    await m.reply(
      `❌ *ᴇʀʀᴏʀ*\n\n` +
        `> No se pudo obtener la lista de grupos.\n` +
        `> _${error.message}_`,
    );
    if (tempFile && fs.existsSync(tempFile)) {
      try {
        fs.unlinkSync(tempFile);
      } catch (e) {}
    }
    pendingSwgc.delete(m.sender);
  }
}

export { pluginConfig as config, handler, sendGroupStatus, pendingSwgc };
