import FormData from "form-data";
import fetch from "node-fetch";
import mime from "mime-types";
import { fileTypeFromBuffer } from "file-type";
import { downloadMediaMessage, getContentType, generateWAMessageFromContent, proto, generateWAMessage } from "ourin";
import te from "../../src/lib/ourin-error.js";
import uploadImage from "../../src/scraper/imgdrop.js";
import config from "../../config.js";

const pluginConfig = {
  name: "tourl",
  alias: ["upload", "catbox", "url"],
  category: "tools",
  description: "Sube medios a múltiples hosts y obtiene URL",
  usage: ".tourl (responde/envía medio)",
  example: ".tourl",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 10,
  energi: 1,
  isEnabled: true,
};

const termaiKey = "AIzaBj7z2z3xBjsk";
const termaiDomain = "https://c.termai.cc";

async function detectExt(buffer, fallback = "bin") {
  try {
    const type = await fileTypeFromBuffer(buffer);
    return type?.ext || fallback;
  } catch {
    return fallback;
  }
}

async function uploadToCatbox(buffer, filename) {
  const form = new FormData();
  form.append("reqtype", "fileupload");
  form.append("fileToUpload", buffer, {
    filename,
    contentType: mime.lookup(filename) || "application/octet-stream",
  });

  const res = await fetch("https://catbox.moe/user/api.php", {
    method: "POST",
    body: form,
    headers: form.getHeaders(),
    timeout: 30000,
  });

  if (!res.ok) throw new Error("Catbox falló");
  const url = await res.text();
  if (!url.startsWith("http")) throw new Error("Invalid response");
  return { host: "Catbox", url, expires: "Permanent" };
}

async function uploadToLitterbox(buffer, filename) {
  const form = new FormData();
  form.append("reqtype", "fileupload");
  form.append("time", "72h");
  form.append("fileToUpload", buffer, {
    filename,
    contentType: mime.lookup(filename) || "application/octet-stream",
  });

  const res = await fetch(
    "https://litterbox.catbox.moe/resources/internals/api.php",
    {
      method: "POST",
      body: form,
      headers: form.getHeaders(),
      timeout: 30000,
    },
  );

  if (!res.ok) throw new Error("Litterbox falló");
  const url = await res.text();
  if (!url.startsWith("http")) throw new Error("Invalid response");
  return { host: "Litterbox", url, expires: "72 jam" };
}

async function uploadTo0x0_alt(buffer, filename) {
  const form = new FormData();
  form.append("file", buffer, {
    filename,
    contentType: mime.lookup(filename) || "application/octet-stream",
  });

  const res = await fetch("https://0x0.st", {
    method: "POST",
    body: form,
    headers: form.getHeaders(),
    timeout: 30000,
  });

  if (!res.ok) throw new Error("Uguu falló");
  const data = await res.json();
  if (!data?.data?.url) throw new Error("Invalid response");

  return { host: "Uguu", url: data.files[0].url, expires: "60 menit" };
}

async function uploadToImgDrop(buffer, filename) {
  const data = await uploadImage(buffer, filename);
  if (!data.status || !data.url) throw new Error("ImgDrop falló");
  return { host: "ImgDrop", url: data.url, expires: "Desconocido" };
}

async function uploadToQuax(buffer, filename) {
  const form = new FormData();
  form.append("file", buffer, {
    filename,
    contentType: mime.lookup(filename) || "application/octet-stream",
  });

  const res = await fetch("https://qu.ax/upload.php", {
    method: "POST",
    body: form,
    headers: form.getHeaders(),
    timeout: 60000,
  });

  if (!res.ok) throw new Error("Qu.ax falló");
  const data = await res.json();

  if (!data?.success || !Array.isArray(data.files) || !data.files[0]?.url) {
    throw new Error("Invalid response");
  }

  return { host: "Qu.ax", url: data.files[0].url, expires: "Permanent" };
}

async function uploadToTermai(buffer) {
  const ext = await detectExt(buffer, "bin");
  const form = new FormData();
  form.append("file", buffer, { filename: `file.${ext}` });

  const res = await fetch(`${termaiDomain}/api/upload?key=${termaiKey}`, {
    method: "POST",
    body: form,
    headers: form.getHeaders(),
    timeout: 120000,
  });

  if (!res.ok) throw new Error("Termai falló");
  const data = await res.json();

  if (!data?.status || !data?.path) {
    throw new Error("Invalid response");
  }

  return { host: "Termai", url: data.path, expires: "Desconocido" };
}

const UPLOADERS = [
  { name: "ImgDrop", fn: uploadToImgDrop },
  { name: "Catbox", fn: uploadToCatbox },
  { name: "Litterbox", fn: uploadToLitterbox },
  { name: "0x0_Backup", fn: uploadTo0x0_alt },
  { name: "Qu.ax", fn: uploadToQuax },
  { name: "Termai", fn: uploadToTermai },
];

function getFileExtension(mimetype) {
  const mimeMap = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/gif": "gif",
    "image/webp": "webp",
    "video/mp4": "mp4",
    "video/3gpp": "3gp",
    "video/quicktime": "mov",
    "audio/mpeg": "mp3",
    "audio/ogg": "ogg",
    "audio/wav": "wav",
    "audio/mp4": "m4a",
    "application/pdf": "pdf",
    "application/zip": "zip",
  };
  return mimeMap[mimetype] || "bin";
}

async function handler(m, { sock }) {
  let media = null;
  let mimetype = null;
  let filename = "file";

  if (m.quoted?.message) {
    const type = getContentType(m.quoted.message);
    if (!type || type === "conversation" || type === "extendedTextMessage") {
      return m.reply("⚠️ Responde a un archivo (imagen/video/audio/documento).");
    }

    try {
      media = await downloadMediaMessage(
        { key: m.quoted.key, message: m.quoted.message },
        "buffer",
        {},
      );
      const content = m.quoted.message[type];
      mimetype = content?.mimetype || "application/octet-stream";
      filename = content?.fileName || `file.${getFileExtension(mimetype)}`;
    } catch (e) {
      return m.reply(te(m.prefix, m.command, m.pushName));
    }
  } else if (m.message) {
    const type = getContentType(m.message);
    if (!type || type === "conversation" || type === "extendedTextMessage") {
      let txt = `📤 *MEDIA UPLOADER* 📤\n\n`;
      txt += `Hola, ¿necesitas un enlace para tu media? Puedo subirlo a varios servidores gratuitos.\n\n`;
      txt += `*Modo de uso:*\n`;
      txt += `👉 Envía el medio con el caption \`${m.prefix}tourl\`\n`;
      txt += `👉 O responde a un medio existente con \`${m.prefix}tourl\``;
      return m.reply(txt);
    }

    try {
      media = await downloadMediaMessage(
        { key: m.key, message: m.message },
        "buffer",
        {},
      );
      const content = m.message[type];
      mimetype = content?.mimetype || "application/octet-stream";
      filename = content?.fileName || `file.${getFileExtension(mimetype)}`;
    } catch (e) {
      return m.reply(te(m.prefix, m.command, m.pushName));
    }
  }

  if (!media || media.length === 0) {
    return m.reply("❌ No se pudo leer el medio. Intenta enviarlo de nuevo.");
  }

  await m.react("🕕");

  const results = [];
  const failed = [];

  for (const uploader of UPLOADERS) {
    try {
      const result = await uploader.fn(media, filename);
      results.push(result);
    } catch (e) {
      failed.push(uploader.name);
    }
  }

  if (results.length === 0) {
    await m.react("❌");
    return m.reply(`❌ Todo falló durante la subida.\n\n> Falló en el servidor: ${failed.join(", ")}`);
  }

  let text = `🚀 *SUBIDA CORRECTA!* 🚀\n\n`;
  text += `El medio se subió correctamente al servidor. Elige un enlace y cópialo con el botón de abajo. ✨\n\n`;

  let contentTxt = "";
  results.forEach((r, i) => {
    const status = r.expires === "Permanent" ? "∞ Permanente" : r.expires;
    contentTxt += `☁️ *Server :* ${r.host}\n`;
    contentTxt += `⏳ *Expira :* ${status}\n`;
    contentTxt += `🔗 *Link :*\n`;
    contentTxt += `${r.url}`;
    if (i < results.length - 1) contentTxt += `\n\n`;
  });

  text += contentTxt.split("\n").map(line => `${line}`).join("\n");

  if (failed.length > 0) {
    text += `\n\n⚠️ _Nota: algo falló en el servidor: ${failed.join(", ")}_`;
  }

  try {
    let headerMedia = null;
    if (mimetype.startsWith('image') || mimetype.startsWith('video')) {
      const preMsg = await generateWAMessage(m.chat, { 
        [mimetype.startsWith('image') ? 'image' : 'video']: media 
      }, { userJid: sock.user.id });
      headerMedia = mimetype.startsWith('image') ? 
        { imageMessage: preMsg.message.imageMessage } : 
        { videoMessage: preMsg.message.videoMessage };
    }

    const msg = generateWAMessageFromContent(m.chat, {
      viewOnceMessage: {
        message: {
          messageContextInfo: {
            deviceListMetadata: {},
            deviceListMetadataVersion: 2
          },
          interactiveMessage: proto.Message.InteractiveMessage.create({
            body: proto.Message.InteractiveMessage.Body.create({ text: text }),
            footer: proto.Message.InteractiveMessage.Footer.create({ text: config.bot.name }),
            header: proto.Message.InteractiveMessage.Header.create({
              title: "T O U R L",
              hasMediaAttachment: !!headerMedia,
              ...headerMedia
            }),
            nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.create({
              buttons: results.slice(0, 5).map((r, i) => ({
                name: "cta_copy",
                buttonParamsJson: JSON.stringify({
                  display_text: `📋 Copiar enlace ${r.host}`,
                  id: `copy_${i}`,
                  copy_code: r.url
                })
              }))
            })
          })
        }
      }
    }, { quoted: m });

    await sock.relayMessage(m.chat, msg.message, { messageId: msg.key.id });
  } catch (err) {
    await m.reply(text);
  }

  await m.react("✅");
}

export { pluginConfig as config, handler };
