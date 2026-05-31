import axios from 'axios';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { pipeline } from 'stream/promises';
import { yt2mate, savetube, ytSearch } from '../../src/lib/ytscrapers.js';

const TMP_DIR = path.join(process.cwd(), 'tmp');
if (!fs.existsSync(TMP_DIR)) fs.mkdirSync(TMP_DIR, { recursive: true });

const WHATSAPP_VIDEO_LIMIT = 100 * 1024 * 1024;
const userRequests = new Set();

const pluginConfig = {
  name: 'play2',
  alias: ['video'],
  category: 'descargas',
  description: 'Buscar en YouTube y elegir audio o video',
  usage: '.play2 <busqueda>',
  example: '.play2 never gonna give you up',
  cooldown: 15,
  energi: 1,
  isEnabled: true
};

async function downloadToFile(url, filePath, referer = 'https://vidssave.com/') {
  const response = await axios.get(url, {
    responseType: 'stream',
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      Referer: referer
    }
  });

  await pipeline(response.data, fs.createWriteStream(filePath));
}

async function ytdl(url) {
  try {
    const res = await axios.post(
      'https://api.vidssave.com/api/contentsite_api/media/parse',
      new URLSearchParams({
        auth: '20250901majwlqo',
        domain: 'api-ak.vidssave.com',
        origin: 'cache',
        link: url
      }).toString(),
      {
        headers: {
          'user-agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Mobile Safari/537.36',
          'content-type': 'application/x-www-form-urlencoded',
          origin: 'https://vidssave.com',
          referer: 'https://vidssave.com/'
        }
      }
    );

    if (!res.data?.data) return null;
    const { title, thumbnail, duration, resources } = res.data.data;
    if (!Array.isArray(resources)) return null;

    return {
      title,
      thumbnail,
      duration,
      formats: resources.map((resource) => ({
        type: resource.type,
        quality: resource.quality,
        format: resource.format,
        size: resource.size,
        url: resource.download_url
      }))
    };
  } catch (error) {
    console.error('Error en ytdl helper:', error.message);
    return null;
  }
}

function cleanTitle(title) {
  return String(title || 'audio').replace(/[^\w\s-]/g, '').trim() || 'audio';
}

function buildInfo(video) {
  return [
    '*Nino play*',
    '',
    `Titulo: ${video.title}`,
    `Canal: ${video.author?.name || 'Desconocido'}`,
    `Duracion: ${video.timestamp || '0:00'}`,
    `Link: ${video.url}`,
    '',
    'Elige si quieres recibir audio o video.'
  ].join('\n');
}

async function sendChoiceButtons(m, sock, video, prefix) {
  const buttons = [
    {
      name: 'quick_reply',
      buttonParamsJson: JSON.stringify({
        display_text: 'Audio',
        id: `${prefix}play2 audio ${video.title}`
      })
    },
    {
      name: 'quick_reply',
      buttonParamsJson: JSON.stringify({
        display_text: 'Video',
        id: `${prefix}play2 video ${video.title}`
      })
    }
  ];

  const caption = buildInfo(video);
  if (typeof sock.sendButton === 'function' && video.image) {
    return sock.sendButton(m.chat, video.image || null, caption, m, {
      buttons,
      footer: 'Audio o video',
      type: 'image'
    });
  }

  const message = {
    caption,
    footer: 'Audio o video',
    interactiveButtons: buttons
  };
  if (video.image) message.image = { url: video.image };
  else message.text = caption;
  return sock.sendMessage(m.chat, message, { quoted: m });
}

async function downloadVideo(video, filePath) {
  if (video.download?.mp4) {
    try {
      console.log('Trying yosoyyo-api video...');
      await downloadToFile(video.download.mp4, filePath);
      return true;
    } catch (err) {
      console.error('yosoyyo-api video error:', err.message);
    }
  }

  try {
    console.log('Trying vidssave video...');
    const data = await ytdl(video.url);
    const videoFormat = data?.formats?.find((f) => f?.type === 'video' && f?.format === 'mp4') ||
      data?.formats?.find((f) => f?.format === 'mp4');
    if (videoFormat?.url) {
      await downloadToFile(videoFormat.url, filePath, 'https://vidssave.com/');
      return true;
    }
  } catch (err) {
    console.error('Vidssave video failed:', err.message);
  }

  try {
    console.log('Trying yt2mate video...');
    const res = await yt2mate(video.url, 'mp4');
    if (res?.download) {
      await downloadToFile(res.download, filePath, 'https://v1.y2mate.nu/');
      return true;
    }
  } catch (err) {
    console.error('yt2mate video error:', err.message);
  }

  try {
    console.log('Trying savetube video...');
    const res = await savetube(video.url);
    if (res?.status && res.videos?.length > 0) {
      const videoFormat = res.videos.find((v) => v.quality === '360') || res.videos[0];
      if (videoFormat?.url) {
        await downloadToFile(videoFormat.url, filePath, 'https://save-tube.com/');
        return true;
      }
    }
  } catch (err) {
    console.error('savetube video error:', err.message);
  }

  return false;
}

async function downloadAudio(video, filePath) {
  if (video.download?.mp3) {
    try {
      console.log('Trying yosoyyo-api audio...');
      await downloadToFile(video.download.mp3, filePath);
      return true;
    } catch (err) {
      console.error('yosoyyo-api audio error:', err.message);
    }
  }

  try {
    console.log('Trying yt2mate audio...');
    const res = await yt2mate(video.url, 'mp3');
    if (res?.download) {
      await downloadToFile(res.download, filePath, 'https://v1.y2mate.nu/');
      return true;
    }
  } catch (err) {
    console.error('yt2mate audio error:', err.message);
  }

  try {
    console.log('Trying savetube audio...');
    const res = await savetube(video.url);
    if (res?.status && res.audios?.length > 0) {
      const audioFormat = res.audios.find((a) => String(a.quality) === '128') || res.audios[0];
      if (audioFormat?.url) {
        await downloadToFile(audioFormat.url, filePath, 'https://save-tube.com/');
        return true;
      }
    }
  } catch (err) {
    console.error('savetube audio error:', err.message);
  }

  try {
    console.log('Trying vidssave audio...');
    const data = await ytdl(video.url);
    const audioFormat = data?.formats?.find((f) => f?.type === 'audio') ||
      data?.formats?.find((f) => f?.format === 'mp3' || f?.format === 'm4a');
    if (audioFormat?.url) {
      await downloadToFile(audioFormat.url, filePath, 'https://vidssave.com/');
      return true;
    }
  } catch (err) {
    console.error('Vidssave audio failed:', err.message);
  }

  return false;
}

async function handler(m, { sock, args, text, prefix }) {
  console.log('\nPLAY2:', m.sender);

  const firstArg = (args[0] || '').toLowerCase();
  const mode = m.command === 'video' ? 'video' : ['audio', 'video'].includes(firstArg) ? firstArg : null;
  const query = mode && m.command !== 'video'
    ? args.slice(1).join(' ').trim()
    : (text || args.join(' ')).trim();

  if (!query) {
    return sock.sendMessage(
      m.chat,
      { text: `Usa: ${prefix}play2 nombre de video` },
      { quoted: m }
    );
  }

  try {
    await sock.sendMessage(m.chat, { react: { text: '⏳', key: m.key } });

    const search = await ytSearch(query);
    const video = search.videos[0];
    if (!video) throw new Error('Sin resultados');

    if (!mode) {
      await sendChoiceButtons(m, sock, video, prefix);
      await sock.sendMessage(m.chat, { react: { text: '✅', key: m.key } });
      return;
    }

    if (userRequests.has(m.sender)) {
      return sock.sendMessage(
        m.chat,
        { text: 'Ya tienes una descarga en proceso.' },
        { quoted: m }
      );
    }

    userRequests.add(m.sender);
    const randomId = crypto.randomBytes(8).toString('hex');
    const extension = mode === 'audio' ? 'mp3' : 'mp4';
    const filePath = path.join(TMP_DIR, `${randomId}.${extension}`);

    try {
      const success = mode === 'audio'
        ? await downloadAudio(video, filePath)
        : await downloadVideo(video, filePath);

      if (!success || !fs.existsSync(filePath) || fs.statSync(filePath).size === 0) {
        throw new Error(`No se pudo descargar el ${mode} o el archivo esta vacio (0kb).`);
      }

      const safeTitle = cleanTitle(video.title);
      if (mode === 'audio') {
        await sock.sendMessage(
          m.chat,
          {
            audio: { url: filePath },
            mimetype: 'audio/mpeg',
            ptt: false,
            fileName: `${safeTitle}.mp3`
          },
          { quoted: m }
        );
      } else if (fs.statSync(filePath).size < WHATSAPP_VIDEO_LIMIT) {
        await sock.sendMessage(
          m.chat,
          { video: { url: filePath }, mimetype: 'video/mp4', caption: video.title },
          { quoted: m }
        );
      } else {
        await sock.sendMessage(
          m.chat,
          {
            document: { url: filePath },
            mimetype: 'video/mp4',
            fileName: `${safeTitle}.mp4`
          },
          { quoted: m }
        );
      }

      await sock.sendMessage(m.chat, { react: { text: '✅', key: m.key } });
    } finally {
      try {
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      } catch (err) {
        console.error('Error cleaning up file in play2.js:', err);
      }
      userRequests.delete(m.sender);
    }
  } catch (err) {
    console.log('ERROR PLAY2:', err.message);
    await sock.sendMessage(m.chat, { react: { text: '❌', key: m.key } });

    const errorMsg = err.code === 'ENOSPC'
      ? '*ERROR:* No queda espacio en el servidor para procesar esta descarga.'
      : `Error: ${err.message}`;
    await sock.sendMessage(m.chat, { text: errorMsg }, { quoted: m });
  }
}

export { pluginConfig as config, handler };
