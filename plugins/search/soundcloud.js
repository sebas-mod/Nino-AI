import { load } from "cheerio";
import fetch from "node-fetch";

const pluginConfig = {
  name: "soundcloud",
  alias: ["scsearch", "scs"],
  category: "search",
  description: "Buscar canciones en SoundCloud",
  usage: ".soundcloud título",
  example: ".soundcloud Only We Know",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 5,
  energi: 1,
  isEnabled: true,
};

async function scSearch(q) {
  const url = "https://m.soundcloud.com/search?q=" + encodeURIComponent(q);
  const res = await fetch(url, {
    headers: {
      "user-agent": "Mozilla/5.0",
    },
  });
  const html = await res.text();
  const $ = load(html);
  const jsonText = $("#__NEXT_DATA__").text();
  if (!jsonText) return [];
  const json = JSON.parse(jsonText);

  const tracks = json.props.pageProps.initialStoreState.entities.tracks;
  if (!tracks) return [];

  const result = Object.values(tracks)
    .filter((v) => v && v.data && v.data.title)
    .map((v) => {
      const d = v.data;
      return {
        id: d.id || "-",
        title: d.title || "-",
        url: d.permalink_url || "-",
        user_id: d.user_id || "-",
        artwork: d.artwork_url || null,
        duration: d.duration || "-",
        plays: d.playback_count || "-",
        likes: d.likes_count || "-",
        comments: d.comment_count || "-",
        reposts: d.reposts_count || "-",
        created_at: d.created_at || "-",
      };
    });

  return result;
}

async function handler(m, { args, sock }) {
  if (!args[0]) {
    let txt = `🎵 *BÚSQUEDA SOUNDCLOUD* 🎵\n\n`;
    txt += `Hola. ¿Qué canción quieres buscar hoy?\n\n`;
    txt += `*Modo de uso:*\n`;
    txt += `👉 \`${m.prefix}soundcloud <título de canción>\`\n\n`;
    txt += `*Ejemplo:*\n`;
    txt += `\`${m.prefix}soundcloud Only We Know\``;
    return m.reply(txt);
  }

  await m.react("🕕");

  try {
    const data = await scSearch(args.join(" "));
    if (!data.length) {
      return m.reply(`❌ No encontré la canción. Prueba con otro título. 😭`);
    }
    let thumb = data.find((v) => v.artwork)?.artwork || null;
    let txt = `🎧 *RESULTADOS DE BÚSQUEDA SOUNDCLOUD* 🎧\n\n`;
    let contentTxt = "";
    const limit = Math.min(data.length, 5);
    for (let i = 0; i < limit; i++) {
      contentTxt += `🎵 *Título :* ${data[i].title}\n`;
      contentTxt += `🔗 *URL :* ${data[i].url}\n`;
      contentTxt += `👁️ *Vistas :* ${data[i].plays}\n`;
      contentTxt += `❤️ *Me gusta :* ${data[i].likes}\n`;
      contentTxt += `💬 *Comentarios :* ${data[i].comments}\n`;
      contentTxt += `🔁 *Reposts :* ${data[i].reposts}`;
      if (i < limit - 1) contentTxt += `\n\n`;
    }
    txt += contentTxt.trim().split("\n").map(line => line.trim() ? `${line}` : ``).join("\n");
    txt += `\n\n`;
    txt += `Si quieres descargar la canción, usa \`${m.prefix}playsc\`. 😉`;
    if (thumb) {
      await sock.sendMedia(m.chat, thumb, txt.trim(), m, { type: "image" });
    } else {
      await m.reply(txt.trim());
    }
    await m.react("✅");
  } catch (e) {
    m.reply(`❌ Ocurrió un error del sistema.\nError: ${e.message}`);
  }
}

export { pluginConfig as config, handler, scSearch };
