/**
 * Nama Plugin: Play
 * Pembuat Code: Zann
 * Adaptado: YO SOY YO API
 * Endpoint: https://yososyyo-api-ofc.onrender.com/api/youtube
 */

import axios from "axios";
import ytdl, { fallbackToMp3Buffer } from "../../src/scraper/ytdl.js";

const API_KEY = "Sebas-Md-2004";
const API_URL = "https://yososyyo-api-ofc.onrender.com/api/youtube";

const pluginConfig = {
  name: "play2",
  alias: ["playaudio"],
  category: "search",
  description: "Reproducir musica desde YouTube",
  usage: ".play2 <query>",
  example: ".play2 gura",
  cooldown: 15,
  energi: 1,
  isEnabled: true,
};

async function searchYoutube(query) {
  const { data } = await axios.get(API_URL, {
    params: {
      q: query,
      apiKey: API_KEY,
    },
    timeout: 30000,
  });

  if (!data?.status || !data?.result?.url) {
    throw new Error(data?.message || "No se encontraron resultados");
  }

  return {
    title: data.result.title || "Video encontrado",
    url: data.result.url,
    thumbnail: data.result.thumbnail || data.result.image || null,
    creator: data.creator || "sebas MD",
  };
}

async function getPlayAudioDownload(url) {
  try {
    const { data } = await axios.get(
      `https://api.nexray.eu.cc/downloader/v1/ytmp3?url=${encodeURIComponent(url)}`,
      { timeout: 45000 },
    );

    const download = data?.result?.url;
    const title = data?.result?.title;

    if (download) {
      return { download, title };
    }
  } catch {}

  const fallback = await ytdl(url, "mp3");
  if (fallback?.status && fallback?.dl) {
    return { download: fallback.dl, title: fallback.title, isFallback: true };
  }

  throw new Error(fallback?.mess || "No se pudo obtener la URL del audio");
}

async function handler(m, { sock, text }) {
  const query = text?.trim() || m.text?.trim();

  if (!query) {
    return m.reply(`🎵 *PLAY*\n\n> Ejemplo:\n\`${m.prefix}play gura\``);
  }

  m.react("🕐");

  try {
    const video = await searchYoutube(query);

    let info = `🎵 *REPRODUCIENDO AHORA*\n\n`;
    info += `📌 *Titulo:* ${video.title}\n`;
    info += `🔗 ${video.url}\n\n`;
    info += `_⏳ Enviando audio, espera un momento..._`;

    await sock.sendPreview(
      m.chat,
      {
        caption: info,
        url: video.url,
        title: video.title,
        description: "Video de YouTube",
        image: video.thumbnail,
        previewType: 1,
      },
      { quoted: m },
    );

    const audio = await getPlayAudioDownload(video.url);
    const fileName = `${audio.title || video.title || "audio"}.mp3`;

    if (audio.isFallback) {
      const mp3Buffer = await fallbackToMp3Buffer(audio.download);
      await sock.sendMessage(
        m.chat,
        {
          audio: mp3Buffer,
          mimetype: "audio/mpeg",
          ptt: false,
          fileName,
        },
        { quoted: m },
      );
    } else {
      await sock.sendMedia(m.chat, audio.download, video.title, m, {
        type: "audio",
      });
    }

    m.react("✅");
  } catch (err) {
    console.error("[Play]", err);
    m.react("😭");
    m.reply(
      "La funcion para reproducir musica tiene problemas. Intenta de nuevo mas tarde y evita hacer spam.",
    );
  }
}

export { pluginConfig as config, handler };
