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
  description: 'Descargar video desde YouTube',
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

async function handler(m, { sock, args, text }) {
  console.log('\nPLAY2:', m.sender);

  const query = (text || args.join(' ')).trim();
  if (!query) {
    return sock.sendMessage(
      m.chat,
      { text: 'Usa: .play2 nombre de video' },
      { quoted: m }
    );
  }

  if (userRequests.has(m.sender)) {
    return sock.sendMessage(
      m.chat,
      { text: 'Ya tienes una descarga en proceso.' },
      { quoted: m }
    );
  }

  userRequests.add(m.sender);
  let videoPath;

  try {
    await sock.sendMessage(m.chat, { react: { text: '⏳', key: m.key } });

    const search = await ytSearch(query);
    const video = search.videos[0];
    if (!video) throw new Error('Sin resultados');

    const caption = `Video: ${video.title}\nDuracion: ${video.timestamp}\n\nProcesando...`;
    if (video.image?.trim()) {
      await sock.sendMessage(
        m.chat,
        { image: { url: video.image }, caption },
        { quoted: m }
      );
    } else {
      await sock.sendMessage(m.chat, { text: caption }, { quoted: m });
    }

    const randomId = crypto.randomBytes(8).toString('hex');
    videoPath = path.join(TMP_DIR, `${randomId}.mp4`);
    let success = false;

    if (video.download?.mp4) {
      try {
        console.log('Trying yosoyyo-api...');
        await downloadToFile(video.download.mp4, videoPath);
        success = true;
      } catch (err) {
        console.error('yosoyyo-api error:', err.message);
      }
    }

    if (!success) {
      try {
        console.log('Trying vidssave...');
        const data = await ytdl(video.url);
        const videoFormat = data?.formats?.find((f) => f?.type === 'video' && f?.format === 'mp4') ||
          data?.formats?.find((f) => f?.format === 'mp4');
        if (videoFormat?.url) {
          await downloadToFile(videoFormat.url, videoPath, 'https://vidssave.com/');
          success = true;
        }
      } catch (err) {
        console.error('Vidssave failed:', err.message);
      }
    }

    if (!success) {
      try {
        console.log('Trying yt2mate...');
        const res = await yt2mate(video.url, 'mp4');
        if (res?.download) {
          await downloadToFile(res.download, videoPath, 'https://v1.y2mate.nu/');
          success = true;
        }
      } catch (err) {
        console.error('yt2mate error:', err.message);
      }
    }

    if (!success) {
      try {
        console.log('Trying savetube...');
        const res = await savetube(video.url);
        if (res?.status && res.videos?.length > 0) {
          const videoFormat = res.videos.find((v) => v.quality === '360') || res.videos[0];
          if (videoFormat?.url) {
            await downloadToFile(videoFormat.url, videoPath, 'https://save-tube.com/');
            success = true;
          }
        }
      } catch (err) {
        console.error('savetube error:', err.message);
      }
    }

    if (!success || !fs.existsSync(videoPath) || fs.statSync(videoPath).size === 0) {
      throw new Error('No se pudo descargar el video o el archivo esta vacio (0kb).');
    }

    const fileSizeInBytes = fs.statSync(videoPath).size;
    const safeTitle = video.title.replace(/[^\w\s-]/g, '').trim() || 'video';

    if (fileSizeInBytes < WHATSAPP_VIDEO_LIMIT) {
      await sock.sendMessage(
        m.chat,
        { video: { url: videoPath }, mimetype: 'video/mp4', caption: video.title },
        { quoted: m }
      );
    } else {
      await sock.sendMessage(
        m.chat,
        {
          document: { url: videoPath },
          mimetype: 'video/mp4',
          fileName: `${safeTitle}.mp4`
        },
        { quoted: m }
      );
    }

    await sock.sendMessage(m.chat, { react: { text: '✅', key: m.key } });
  } catch (err) {
    console.log('ERROR PLAY2:', err.message);
    await sock.sendMessage(m.chat, { react: { text: '❌', key: m.key } });

    const errorMsg = err.code === 'ENOSPC'
      ? '*ERROR:* No queda espacio en el servidor para procesar esta descarga.'
      : `Error: ${err.message}`;
    await sock.sendMessage(m.chat, { text: errorMsg }, { quoted: m });
  } finally {
    try {
      if (videoPath && fs.existsSync(videoPath)) fs.unlinkSync(videoPath);
    } catch (err) {
      console.error('Error cleaning up file in play2.js:', err);
    }
    userRequests.delete(m.sender);
  }
}

export { pluginConfig as config, handler };
