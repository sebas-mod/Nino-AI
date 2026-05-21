import { scSearch } from "./soundcloud.js";
import scdl from "../../src/scraper/soundclouddl.js";
import te from "../../src/lib/ourin-error.js";

const pluginConfig = {
  name: "playsoundcloud",
  alias: ["playsc"],
  category: "search",
  description: "Buscar y descargar canciones desde SoundCloud",
  usage: ".playsc título",
  example: ".playsc Only We Know",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 15,
  energi: 2,
  isEnabled: true,
};

async function handler(m, { args, sock }) {
  if (!args[0]) {
    let txt = `🎶 *PLAY SOUNDCLOUD* 🎶\n\n`;
    txt += `Hola. ¿Quieres escuchar una canción de SoundCloud? Puedo buscarla y descargarla en formato MP3.\n\n`;
    txt += `*Modo de uso:*\n`;
    txt += `👉 \`${m.prefix}playsc <título de canción>\`\n\n`;
    txt += `*Ejemplo:*\n`;
    txt += `\`${m.prefix}playsc Only We Know\``;
    return m.reply(txt);
  }

  await m.react("🕕");

  try {
    const searchResults = await scSearch(args.join(" "));
    if (!searchResults.length) {
      return m.reply(`❌ No encontré la canción. Prueba con otro título. 😭`);
    }

    const track = searchResults[0];
    const downloadInfo = await scdl(track.url);
    let contentTxt = `🎵 *Título :* ${downloadInfo.title}\n`;
    contentTxt += `👤 *Subido por :* ${downloadInfo.uploader}\n`;
    contentTxt += `⏱️ *Duración :* ${downloadInfo.duration}\n`;
    contentTxt += `👁️ *Vistas :* ${downloadInfo.views}\n`;
    contentTxt += `❤️ *Me gusta :* ${downloadInfo.likes}\n`;
    contentTxt += `📦 *Tamaño :* ${downloadInfo.size}`;

    let txt = `🎉 *¡CANCIÓN DESCARGADA CORRECTAMENTE!* 🎉\n\n`;
    txt += contentTxt.trim().split("\n").map(line => `${line}`).join("\n");
    txt += `\n\n`;
    txt += `_Enviando audio MP3, espera un momento._ 🎶`;

    await sock.sendMedia(m.chat, downloadInfo.thumbnail || track.artwork, txt.trim(), m, { type: "image" });
    await sock.sendMedia(m.chat, downloadInfo.download_url, downloadInfo.title, m, { type: "audio" });

    await m.react("✅");
  } catch (e) {
    m.reply(`❌ No se pudo descargar la canción. 😭\nError: ${e.message}`);
  }
}

export { pluginConfig as config, handler };
