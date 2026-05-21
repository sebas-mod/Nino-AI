import te from "../../src/lib/ourin-error.js";
import config from "../../config.js";
import videoenhancer from "../../src/scraper/hdvid.js";

const pluginConfig = {
  name: "hdvid",
  alias: ["hdvideo", "enhancevid", "hdv"],
  category: "tools",
  description: "Mejora la calidad de un video a HD con IA",
  usage: ".hdvid (responde a un video)",
  example: ".hdvid",
  isOwner: false,
  isPremium: true,
  isGroup: false,
  isPrivate: false,
  cooldown: 120,
  energi: 3,
  isEnabled: true,
};

async function handler(m, { sock }) {
  let isVideoMessage = m.isVideo || (m.quoted && m.quoted.type === "videoMessage");
  let isDocumentMessage = (m.type === "documentMessage" && m.message?.documentMessage?.mimetype?.startsWith("video")) || (m.quoted && m.quoted.type === "documentMessage" && m.quoted.message?.documentMessage?.mimetype?.startsWith("video"));

  if (!isVideoMessage && !isDocumentMessage) {
    let txt = `📹 *HD VIDEO ENHANCER* 📹\n\n`;
    txt += `Hola, ¿tienes un video borroso? Puedo ayudarte a convertirlo en HD.\n\n`;
    txt += `*Modo de uso:*\n`;
    txt += `👉 Envía un video (o documento de video) con el caption \`${m.prefix}hdvid\`\n`;
    txt += `👉 O responde a un video (o documento de video) con \`${m.prefix}hdvid\`\n\n`;
    txt += `⚠️ _Función premium, el proceso puede tardar entre 30 y 120 segundos según el tamaño._`;
    return m.reply(txt);
  }

  await m.react("🕕");

  try {
    const videoBuffer = (await m?.quoted?.download?.()) || (await m.download?.());

    if (!videoBuffer || videoBuffer.length === 0) {
      await m.react("❌");
      return m.reply(`❌ *ERROR*\n\nNo se pudo descargar el video. Intenta enviarlo de nuevo.`);
    }

    if (videoBuffer.length > 50 * 1024 * 1024) {
      await m.react("❌");
      return m.reply(`❌ *ARCHIVO DEMASIADO GRANDE*\n\nLo siento, el tamaño máximo del video es 50 MB.`);
    }

    await m.reply(`🎞️ *PROCESO DE MEJORA INICIADO* 🎞️\n\nTu video está siendo procesado por IA para convertirlo en HD. ✨\nTiempo estimado: 30-120 segundos, por favor espera.`);

    const result = await videoenhancer(videoBuffer, {
      filename: `hdvid-${Date.now()}.mp4`,
      apiKey: config.APIkey?.fgsi,
      pollIntervalMs: 3000,
      timeoutMs: 10 * 60 * 1000,
    });

    await sock.sendMedia(m.chat, result.resultUrl, `✨ *PROCESO COMPLETADO* ✨\n\nAquí está el video resultante, mucho más fluido y en HD. 😍`, m, {
      type: "video",
      mimetype: "video/mp4",
      fileName: `HDVID-${Date.now()}.mp4`,
    });

    await m.react("✅");
  } catch (err) {
    console.log(err);
    await m.react("❌");
    await m.reply(`❌ Lo siento, no se pudo mejorar el video. 😭`);
  }
}

export { pluginConfig as config, handler };
