import { DaFont } from "../../src/scraper/dafont.js";

if (!global.dafontSessions) global.dafontSessions = {};

const SESSION_TIMEOUT = 120000;

function getSessionKey(jid) {
  return String(jid || "").replace(/[^0-9]/g, "") || String(jid).toLowerCase();
}

function getSession(jid) {
  const key = getSessionKey(jid);
  return global.dafontSessions[key] || null;
}

function setSession(jid, data) {
  const key = getSessionKey(jid);
  clearSession(jid);
  global.dafontSessions[key] = {
    data,
    chat: null,
    startedAt: Date.now(),
    timeout: setTimeout(() => {
      delete global.dafontSessions[key];
    }, SESSION_TIMEOUT),
  };
  return global.dafontSessions[key];
}

function clearSession(jid) {
  const key = getSessionKey(jid);
  const session = global.dafontSessions[key];
  if (session?.timeout) clearTimeout(session.timeout);
  delete global.dafontSessions[key];
}

const pluginConfig = {
  name: "dafont",
  alias: ["font", "daffont", "carifont"],
  category: "tools",
  description: "Busca y descarga fuentes desde DaFont",
  usage: ".dafont <nombre fuente>",
  example: ".dafont arial",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 10,
  energi: 1,
  isEnabled: true,
};

async function handler(m, { sock }) {
  const text = m.args.join(" ");
  if (!text) {
    m.react("❌");
    return m.reply(
      `🔤 *DaFont Search*\n\n` +
        `Busca fuentes en DaFont y luego responde con el número para descargarlas.\n\n` +
        `*USO:*\n` +
        `> *${m.prefix}dafont <nombre fuente>*\n\n` +
        `*CONTOH:*\n` +
        `> *${m.prefix}dafont arial*\n` +
        `> *${m.prefix}dafont horror*\n\n` +
        `_Cuando aparezca la lista, responde al mensaje del bot con el número de la fuente para descargarla_`
    );
  }

  m.react("🕕");

  try {
    const result = await DaFont(text);

    if (!result.status) {
      m.react("☢");
      return m.reply(`❌ *Error de DaFont*\n\n> ${result.error}`);
    }

    const items = result.results.slice(0, 10);

    let txt = `🔤 *DaFont — ${result.count} Fuentes encontradas*\n\n`;
    txt += `> Búsqueda: *${text}*\n\n`;

    items.forEach((v, i) => {
      txt += `*${i + 1}.* ${v.name}\n`;
      txt += `   ├ 👤 Autor: ${v.author}\n`;
      txt += `   ├ 📥 Descargas: ${v.downloads || "-"}\n`;
      txt += `   └ 📜 Licencia: ${v.license || "-"}\n`;
    });

    txt += `\n_Responde a este mensaje con el número de la fuente para descargar el archivo_`;

    const session = setSession(m.sender, items);
    session.chat = m.chat;

    await m.reply(txt);
    m.react("✅");
  } catch (e) {
    console.error(e);
    m.react("☢");
    m.reply("❌ No se pudo buscar la fuente, intenta de nuevo más tarde");
  }
}

async function dafontAnswerHandler(m, sock) {
  const session = getSession(m.sender);
  if (!session) return false;
  if (m.chat !== session.chat) return false;

  const text = (m.body || m.text || "").trim();
  const index = parseInt(text) - 1;

  if (isNaN(index) || index < 0 || index >= session.data.length) return false;

  const v = session.data[index];

  let detail = `🔤 *${v.name}*\n\n` +
    `> 👤 Autor: ${v.author}\n` +
    `> 📥 Descargas: ${v.downloads || "-"}\n` +
    `> 📜 Licencia: ${v.license || "-"}`;

  if (v.preview) {
    await sock.sendMedia(m.chat, v.preview, detail, m, { type: "image" });
  } else {
    await m.reply(detail);
  }

  if (v.download) {
    await sock.sendMessage(
      m.chat,
      {
        document: { url: v.download },
        fileName: v.name + ".zip",
        mimetype: "application/zip",
      },
      { quoted: m },
    );
  }

  clearSession(m.sender);
  return true;
}

export { pluginConfig as config, handler, dafontAnswerHandler, clearSession };
