import fs from "fs";
import path from "path";
import { getDatabase } from "../../src/lib/ourin-database.js";
import { getGroupMode } from "../group/botmode.js";
import te from "../../src/lib/ourin-error.js";
import config from "../../config.js";
import {
  resolveAnyLidToJid,
  isLidConverted,
  getCachedJid,
} from "../../src/lib/ourin-lid.js";

const pluginConfig = {
  name: "pushkontak",
  alias: [
    "puskontak",
    "push",
    "stoppush",
    "setjedapush",
    "pushkontak_start",
    "kelolapush",
    "autovcf_on",
    "autovcf_off",
    "kodeunik_on",
    "kodeunik_off",
    "vcftarget_private",
    "vcftarget_group",
    "skipadmin_on",
    "skipadmin_off",
  ],
  category: "pushkontak",
  description: "Enviar mensaje a todos los miembros del grupo + guardar contactos VCF automáticamente",
  usage: ".pushkontak",
  example: ".pushkontak",
  isOwner: true,
  isPremium: false,
  isGroup: true,
  isPrivate: false,
  cooldown: 10,
  energi: 0,
  isEnabled: true,
};

if (!global.pushkontakSessions) global.pushkontakSessions = {};

const SESSION_TIMEOUT = 300000;
const SERIAL_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

let cachedThumb = null;
let cachedDoc = null;
try {
  const imgPath = "./assets/images/ourin.jpg";
  if (fs.existsSync(imgPath)) cachedThumb = fs.readFileSync(imgPath);
  cachedDoc = fs.readFileSync("./package.json");
} catch {}

function serial(len) {
  let r = "";
  for (let i = 0; i < len; i++)
    r += SERIAL_CHARS[Math.floor(Math.random() * SERIAL_CHARS.length)];
  return r;
}

function buildVcf(contacts) {
  return contacts
    .map((jid) => {
      const num = jid.split("@")[0];
      return `BEGIN:VCARD\nVERSION:3.0\nFN:WA[${serial(2)}] ${num}\nTEL;type=CELL;type=VOICE;waid=${num}:+${num}\nEND:VCARD\n`;
    })
    .join("");
}

function resolveParticipants(metadata, botId, senderJid, skipAdmin = false) {
  return metadata.participants
    .filter((p) => {
      if (skipAdmin && (p.admin === "admin" || p.admin === "superadmin"))
        return false;
      return true;
    })
    .map((p) => {
      if (p.phoneNumber) return p.phoneNumber;
      if (p.jid && !p.jid.endsWith("@lid")) return p.jid;
      if (p.id && !p.id.endsWith("@lid")) return p.id;
      const resolved = resolveAnyLidToJid(p.jid || p.id, metadata.participants);
      if (resolved && !resolved.endsWith("@lid") && !isLidConverted(resolved))
        return resolved;
      const cached = getCachedJid(p.jid || p.id || p.lid || "");
      if (cached && !cached.endsWith("@lid") && !isLidConverted(cached))
        return cached;
      return null;
    })
    .filter((id) => id && id !== botId && !id.includes(senderJid));
}

function getSession(jid) {
  return global.pushkontakSessions[jid] || null;
}

function clearSession(jid) {
  const s = global.pushkontakSessions[jid];
  if (s?.timeout) clearTimeout(s.timeout);
  delete global.pushkontakSessions[jid];
}

function createSession(jid, chatJid) {
  clearSession(jid);
  const session = {
    step: "message",
    message: null,
    chatJid,
    promptId: null,
    startedAt: Date.now(),
    timeout: setTimeout(() => {
      delete global.pushkontakSessions[jid];
    }, SESSION_TIMEOUT),
  };
  global.pushkontakSessions[jid] = session;
  return session;
}

function nativeFlowMsg(m, title, buttons) {
  return {
    interactiveMessage: {
      title,
      footer: config.bot?.name || "Ourin-AI",
      image: cachedThumb,
      contextInfo: {
        mentionedJid: [m.sender],
        forwardingScore: 7,
        isForwarded: true,
      },
      nativeFlowMessage: {
        messageParamsJson: JSON.stringify({
          limited_time_offer: {
            text: config.bot?.name || "Ourin-AI",
            url: "",
            copy_code: "Push Contactos",
            expiration_time: Date.now() * 7,
          },
          bottom_sheet: {
            in_thread_buttons_limit: 2,
            divider_indices: [1, 2, 3, 4, 5, 999],
            list_title: "Push Contactos",
            button_title: "📢 Elegir función",
          },
          tap_target_configuration: {
            title: " X ",
            description: "bomboclard",
            canonical_url: "https://ourin.site",
            domain: "shop.example.com",
            button_index: 0,
          },
        }),
        buttons,
      },
    },
  };
}

async function sendVcf(sock, ownerJid, contacts, groupName) {
  const tmpDir = path.join(process.cwd(), "tmp");
  if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });
  const vcfPath = path.join(tmpDir, `pushkontak_${Date.now()}.vcf`);
  fs.writeFileSync(vcfPath, buildVcf(contacts), "utf8");
  await sock.sendMessage(ownerJid, {
    document: fs.readFileSync(vcfPath),
    fileName: `Contactos_${groupName || "Grupo"}_${contacts.length}.vcf`,
    mimetype: "text/vcard",
    caption:
      `💾 *GUARDADO AUTOMÁTICO DE CONTACTOS*\n\n` +
      `📊 *Total:* ${contacts.length} contactos\n` +
      `👥 *Grupo:* ${groupName || "Desconocido"}\n\n` +
      `📱 _Importa este archivo en tu teléfono para guardar todos los contactos_`,
  });
  try {
    fs.unlinkSync(vcfPath);
  } catch {}
}

async function handleStop(m) {
  if (!global.statuspush) {
    return m.reply(
      `❌ *ERROR*\n\n🚫 *No hay ningún push de contactos en ejecución actualmente*`,
    );
  }
  global.stoppush = true;
  m.react("⏹️");
  return m.reply(
    `⏹️ *PUSH DETENIDO*\n\n✅ *El proceso de push de contactos se detendrá pronto*`,
  );
}

function getPushSettings(db) {
  return {
    autoVcf: db.setting("pushAutoVcf") !== false,
    kodeUnik: db.setting("pushKodeUnik") !== false,
    vcfTarget: db.setting("pushVcfTarget") || "private",
    skipAdmin: db.setting("pushSkipAdmin") === true,
    jeda: db.setting("jedaPush") || 5000,
  };
}

async function handleKelola(m, sock) {
  const db = getDatabase();
  const s = getPushSettings(db);
  const p = m.prefix;

  const buttons = [
    {
      name: "single_select",
      buttonParamsJson: JSON.stringify({ has_multiple_buttons: true }),
    },
    {
      name: "single_select",
      buttonParamsJson: JSON.stringify({
        title: "⚙️ Gestionar Push Contactos",
        sections: [
          {
            title: "💾 Auto VCF",
            highlight_label: s.autoVcf ? "ON" : "OFF",
            rows: [
              {
                title: `${s.autoVcf ? "🔴" : "🟢"} Auto VCF: ${s.autoVcf ? "Desactivar" : "Activar"}`,
                id: `${p}${s.autoVcf ? "autovcf_off" : "autovcf_on"}`,
                description: "Guardar contactos en VCF automáticamente después del push",
              },
            ],
          },
          {
            title: "🔑 Código único",
            highlight_label: s.kodeUnik ? "ON" : "OFF",
            rows: [
              {
                title: `${s.kodeUnik ? "🔴" : "🟢"} Código único: ${s.kodeUnik ? "Desactivar" : "Activar"}`,
                id: `${p}${s.kodeUnik ? "kodeunik_off" : "kodeunik_on"}`,
                description: "Agregar un código aleatorio al final del mensaje",
              },
            ],
          },
          {
            title: "📱 Destino VCF",
            highlight_label: s.vcfTarget === "private" ? "Privado" : "Grupo",
            rows: [
              {
                title: `${s.vcfTarget === "private" ? "✅" : "⬜"} Enviar al chat privado`,
                id: `${p}vcftarget_private`,
                description: "El VCF se envía al chat privado del owner",
              },
              {
                title: `${s.vcfTarget === "group" ? "✅" : "⬜"} Enviar al chat del grupo`,
                id: `${p}vcftarget_group`,
                description: "El VCF se envía al chat del grupo",
              },
            ],
          },
          {
            title: "👑 Omitir admins",
            highlight_label: s.skipAdmin ? "ON" : "OFF",
            rows: [
              {
                title: `${s.skipAdmin ? "🔴" : "🟢"} Omitir admins: ${s.skipAdmin ? "Desactivar" : "Activar"}`,
                id: `${p}${s.skipAdmin ? "skipadmin_off" : "skipadmin_on"}`,
                description: "Omitir administradores del grupo durante el push",
              },
            ],
          },
          {
            title: "⏱️ Pausa del push",
            highlight_label: `${(s.jeda / 1000).toFixed(0)}s`,
            rows: [
              {
                title: "⚡ 3 segundos",
                id: `${p}setjedapush 3000`,
                description: "Rápido, mayor riesgo de ban",
              },
              {
                title: "🔄 5 segundos",
                id: `${p}setjedapush 5000`,
                description: "Normal, recomendado",
              },
              {
                title: "🛡️ 10 segundos",
                id: `${p}setjedapush 10000`,
                description: "Seguro contra ban",
              },
              {
                title: "🐢 15 segundos",
                id: `${p}setjedapush 15000`,
                description: "Muy seguro",
              },
            ],
          },
        ],
        has_multiple_buttons: true,
      }),
    },
    {
      name: "quick_reply",
      buttonParamsJson: JSON.stringify({
        display_text: "📢 Iniciar push",
        id: `${p}pushkontak_start`,
      }),
    },
  ];

  return sock.sendMessage(
    m.chat,
    nativeFlowMsg(
      m,
      `⚙️ *GESTIONAR PUSH CONTACTOS*

` +
        `📋 *CONFIGURACIÓN ACTUAL*\n\n` +
        `💾 Auto VCF: *${s.autoVcf ? "✅ ON" : "❌ OFF"}*\n` +
        `🔑 Código único: *${s.kodeUnik ? "✅ ON" : "❌ OFF"}*\n` +
        `📱 Destino VCF: *${s.vcfTarget === "private" ? "Privado" : "Grupo"}*\n` +
        `👑 Omitir admins: *${s.skipAdmin ? "✅ ON" : "❌ OFF"}*\n` +
        `⏱️ Pausa: *${s.jeda}ms (${(s.jeda / 1000).toFixed(1)}s)*\n\n` +
        `📌 *Elige una opción de abajo para cambiar la configuración*`,
      buttons,
    ),
    { quoted: m },
  );
}

async function handleSettingToggle(m, settingKey, label, onVal, offVal) {
  const db = getDatabase();
  const cmd = m.command?.toLowerCase();
  const isOn = cmd.endsWith("_on");
  db.setting(settingKey, isOn ? onVal : offVal);
  m.react(isOn ? "✅" : "🔴");
  await m.reply(
    `${isOn ? "✅" : "🔴"} *${label} ${isOn ? "ACTIVADO" : "DESACTIVADO"}*

` + `⚙️ *${label}:* ${isOn ? "ON" : "OFF"}`,
  );
}

async function handleSetJeda(m, sock) {
  const db = getDatabase();
  const val = parseInt(m.args[1] || m.args[0]);

  if (!val || isNaN(val)) {
    const current = db.setting("jedaPush") || 5000;
    const buttons = [
      {
        name: "single_select",
        buttonParamsJson: JSON.stringify({ has_multiple_buttons: true }),
      },
      {
        name: "single_select",
        buttonParamsJson: JSON.stringify({
          title: "⏱️ Elegir pausa",
          sections: [
            {
              title: "⏱️ Recomendación de pausa para Push Contactos",
              highlight_label: "Recomendado",
              rows: [
                {
                  title: "⚡ 3 segundos (rápido)",
                  id: `${m.prefix}setjedapush 3000`,
                  description: "Mayor riesgo de ban",
                },
                {
                  title: "🔄 5 segundos (normal)",
                  id: `${m.prefix}setjedapush 5000`,
                  description: "Recomendado para uso general",
                },
                {
                  title: "🛡️ 10 segundos (seguro)",
                  id: `${m.prefix}setjedapush 10000`,
                  description: "Lo más seguro contra el riesgo de ban",
                },
                {
                  title: "🐢 15 segundos (muy seguro)",
                  id: `${m.prefix}setjedapush 15000`,
                  description: "Para grupos grandes de 500+ miembros",
                },
                {
                  title: "🏔️ 30 segundos (máximo)",
                  id: `${m.prefix}setjedapush 30000`,
                  description: "La pausa más larga",
                },
              ],
            },
          ],
          has_multiple_buttons: true,
        }),
      },
    ];
    return sock.sendMessage(
      m.chat,
      nativeFlowMsg(
        m,
        `⏱️ *CONFIGURAR PAUSA DEL PUSH CONTACTOS*\n\n` +
          `📋 *Configura el intervalo entre envíos de mensajes*\n\n` +
          `⏱️ *Pausa actual:* ${current}ms (${(current / 1000).toFixed(1)} segundos)\n\n` +
          `*USO:*\n` +
          `📝 *${m.prefix}setjedapush <milisegundos>* — Cambiar la pausa del push\n\n` +
          `*EXPLICACIÓN:*\n` +
          `1. La pausa es el tiempo de espera entre cada mensaje enviado a cada miembro\n` +
          `2. Cuanto menor sea la pausa, más rápido terminará el push, pero aumenta el riesgo de ban\n` +
          `3. Recomendación mínima: *3000ms* (3 segundos) para mayor seguridad\n` +
          `4. Valor máximo: *30000ms* (30 segundos)\n\n` +
          `📌 *Elige una pausa desde los botones de abajo o escríbela manualmente*`,
        buttons,
      ),
      { quoted: m },
    );
  }

  if (val < 1000 || val > 30000) {
    return m.reply(`❌ *ERROR*\n\n🚫 *La pausa debe estar entre 1000ms y 30000ms*`);
  }

  db.setting("jedaPush", val);
  m.react("✅");
  return m.reply(
    `✅ *PAUSA CAMBIADA*\n\n` +
      `⏱️ *Nueva pausa:* ${val}ms (${(val / 1000).toFixed(1)} segundos)`,
  );
}

async function handlePush(m, sock) {
  const db = getDatabase();
  const groupMode = getGroupMode(m.chat, db);

  if (groupMode !== "pushkontak" && groupMode !== "all") {
    const buttons = [
      {
        name: "quick_reply",
        buttonParamsJson: JSON.stringify({
          display_text: "🔓 Activar modo Pushkontak",
          id: `${m.prefix}botmode pushkontak`,
        }),
      },
    ];
    return sock.sendMessage(
      m.chat,
      nativeFlowMsg(
        m,
        `❌ *MODO INCORRECTO*\n\n` +
          `🔒 *Este grupo aún no está en modo pushkontak*\n\n` +
          `*CÓMO ACTIVARLO:*\n` +
          `1. Pulsa el botón de abajo para activar el modo pushkontak\n` +
          `2. Cuando cambie el modo, repite el comando push contactos`,
        buttons,
      ),
      { quoted: m },
    );
  }

  const text = m.text?.trim();

  if (text) {
    return startPush(m, sock, text);
  }

  const s = getPushSettings(db);
  const buttons = [
    {
      name: "single_select",
      buttonParamsJson: JSON.stringify({ has_multiple_buttons: true }),
    },
    {
      name: "single_select",
      buttonParamsJson: JSON.stringify({
        title: "📋 Elegir función",
        sections: [
          {
            title: "📢 Acciones",
            highlight_label: "Push Contactos",
            rows: [
              {
                title: "📢 Iniciar push (sesión de entrada)",
                id: `${m.prefix}pushkontak_start`,
                description: "Ingresa el mensaje y envíalo a todos los miembros",
              },
              {
                title: "⏹️ Detener push",
                id: `${m.prefix}stoppush`,
                description: "Detener el push que está en ejecución",
              },
            ],
          },
          {
            title: "⚙️ Gestión rápida",
            highlight_label: "Config",
            rows: [
              {
                title: "⚙️ Gestionar Push Contactos",
                id: `${m.prefix}kelolapush`,
                description: `VCF:${s.autoVcf ? "ON" : "OFF"} | Código:${s.kodeUnik ? "ON" : "OFF"} | Pausa:${(s.jeda / 1000).toFixed(0)}s`,
              },
              {
                title: "⏱️ Configurar pausa del push",
                id: `${m.prefix}setjedapush`,
                description: `Pausa actual: ${s.jeda}ms`,
              },
            ],
          },
        ],
        has_multiple_buttons: true,
      }),
    },
    {
      name: "quick_reply",
      buttonParamsJson: JSON.stringify({
        display_text: "⚙️ Gestionar",
        id: `${m.prefix}kelolapush`,
      }),
    },
    {
      name: "quick_reply",
      buttonParamsJson: JSON.stringify({
        display_text: "📢 Iniciar push",
        id: `${m.prefix}pushkontak_start`,
      }),
    },
  ];
  return sock.sendMessage(
    m.chat,
    nativeFlowMsg(
      m,
        `📢 *PUSH CONTACTOS*\n\n` +
        `📋 *Enviar un mensaje automáticamente a todos los miembros del grupo + guardar contactos en un archivo VCF*\n\n` +
        `*USO:*\n` +
        `📝 *${m.prefix}pushkontak <mensaje>* — Push directo con mensaje\n` +
        `📢 *${m.prefix}pushkontak* — Abrir menú interactivo\n` +
        `⏹️ *${m.prefix}stoppush* — Detener el push que está en ejecución\n` +
        `⏱️ *${m.prefix}setjedapush <ms>* — Configurar pausa entre envíos\n\n` +
        `*FLUJO DE USO:*\n` +
        `1. Asegúrate de que el grupo esté en modo pushkontak: *${m.prefix}botmode pushkontak*\n` +
        `2. Escribe *${m.prefix}pushkontak* y elige "Iniciar push" en el menú\n` +
        `3. El bot te pedirá que ingreses el mensaje que quieres enviar respondiendo al mensaje\n` +
        `4. Después de confirmar, el bot enviará el mensaje a cada miembro uno por uno\n` +
        `5. A cada mensaje se le agregará un código único para que WhatsApp lo detecte como diferente\n` +
        `6. Al finalizar, el bot enviará automáticamente un archivo VCF con todos los contactos de los miembros\n\n` +
        `*INFO:*\n` +
        `📋 *CONFIGURACIÓN*\n\n` +
        `💾 Auto VCF: *${s.autoVcf ? "✅ ON" : "❌ OFF"}*\n` +
        `🔑 Código único: *${s.kodeUnik ? "✅ ON" : "❌ OFF"}*\n` +
        `📱 Destino VCF: *${s.vcfTarget === "private" ? "Privado" : "Grupo"}*\n` +
        `👑 Omitir admins: *${s.skipAdmin ? "✅ ON" : "❌ OFF"}*\n` +
        `⏱️ Pausa: *${s.jeda}ms (${(s.jeda / 1000).toFixed(1)}s)*\n\n` +
        `🔑 *Acceso:* Solo owner`,
      buttons,
    ),
    { quoted: m },
  );
}

async function handleStartSession(m, sock) {
  const db = getDatabase();
  const groupMode = getGroupMode(m.chat, db);

  if (groupMode !== "pushkontak" && groupMode !== "all") {
    return m.reply(
      `❌ *ERROR*\n\n🔒 *Activa primero el modo pushkontak*\n\n📝 *${m.prefix}botmode pushkontak*`,
    );
  }

  if (global.statuspush) {
    return m.reply(
      `❌ *ERROR*\n\n🔄 *El push de contactos está en ejecución*\n\n⏹️ *Escribe* ${m.prefix}stoppush *para detenerlo*`,
    );
  }

  if (getSession(m.sender)) {
    return m.reply(
      `📝 *La sesión de push ya está activa*\n\n📩 *Responde al mensaje anterior con el mensaje que quieres enviar por push*\n\n❌ *O responde* \`batal\` *para cancelar*`,
    );
  }

  const session = createSession(m.sender, m.chat);

  const sent = await m.reply(
    `📢 *SESIÓN DE PUSH CONTACTOS*\n\n` +
      `📝 *Paso 1/2 — Ingresar mensaje*\n\n` +
      `🔤 *Envía el mensaje que quieres mandar por push a todos los miembros*\n\n` +
      `📩 *Responde a este mensaje con el texto que quieres enviar*\n\n` +
      `❌ *Responde* \`batal\` *para cancelar la sesión*`,
  );

  session.promptId = sent?.key?.id || null;
  m.react("📝");
}

async function startPush(m, sock, text) {
  if (global.statuspush) {
    return m.reply(
      `❌ *ERROR*\n\n🔄 *El push de contactos está en ejecución*\n\n⏹️ *Escribe* ${m.prefix}stoppush *para detenerlo*`,
    );
  }

  m.react("📢");

  try {
    const db = getDatabase();
    const metadata = m.groupMetadata;
    const botId = sock.user.id.split(":")[0] + "@s.whatsapp.net";
    const s = getPushSettings(db);
    const participants = resolveParticipants(
      metadata,
      botId,
      m.sender,
      s.skipAdmin,
    );

    if (participants.length === 0) {
      m.react("❌");
      return m.reply(
        `❌ *ERROR*\n\n🚫 *No hay miembros a los que se les pueda enviar mensaje*`,
      );
    }

    const jedaPush = s.jeda;
    const estimasi = Math.ceil((participants.length * jedaPush) / 60000);

    const buttons = [
      {
        name: "quick_reply",
        buttonParamsJson: JSON.stringify({
          display_text: "⏹️ Detener push",
          id: `${m.prefix}stoppush`,
        }),
      },
    ];

    await sock.sendMessage(
      m.chat,
      nativeFlowMsg(
        m,
        `📢 *PUSH CONTACTOS INICIADO*\n\n` +
          `📝 *Mensaje:* ${text.substring(0, 80)}${text.length > 80 ? "..." : ""}\n` +
          `👥 *Objetivo:* ${participants.length} miembros\n` +
          `⏱️ *Pausa:* ${jedaPush}ms\n` +
          `📊 *Estimación:* ${estimasi} minutos\n` +
          `💾 *Auto VCF:* ${s.autoVcf ? "ON" : "OFF"} | 🔑 *Código único:* ${s.kodeUnik ? "ON" : "OFF"}\n\n` +
          `🔄 *Iniciando push...*`,
        buttons,
      ),
      { quoted: m },
    );

    global.statuspush = true;
    let success = 0;
    let failed = 0;
    const saved = [];

    for (const member of participants) {
      if (global.stoppush) {
        delete global.stoppush;
        delete global.statuspush;
        await m.reply(
          `⏹️ *PUSH DETENIDO*\n\n` +
            `✅ *Exitosos:* ${success}\n` +
            `❌ *Fallidos:* ${failed}\n` +
            `⏸️ *Restantes:* ${participants.length - success - failed}`,
        );
        if (saved.length > 0 && s.autoVcf) {
          const vcfTarget = s.vcfTarget === "group" ? m.chat : m.sender;
          await sendVcf(sock, vcfTarget, saved, metadata.subject);
        }
        return;
      }

      try {
        const msgText = s.kodeUnik ? `${text}\n\n#${serial(6)}` : text;
        await sock.sendMessage(member, { text: msgText });
        saved.push(member);
        success++;
      } catch {
        failed++;
      }

      await new Promise((r) => setTimeout(r, jedaPush));
    }

    delete global.statuspush;
    if (saved.length > 0 && s.autoVcf) {
      const vcfTarget = s.vcfTarget === "group" ? m.chat : m.sender;
      await sendVcf(sock, vcfTarget, saved, metadata.subject);
    }

    m.react("✅");

    const doneButtons = [
      {
        name: "quick_reply",
        buttonParamsJson: JSON.stringify({
          display_text: "📢 Repetir push",
          id: `${m.prefix}pushkontak_start`,
        }),
      },
    ];

    await sock.sendMessage(
      m.chat,
      nativeFlowMsg(
        m,
        `✅ *PUSH FINALIZADO*\n\n` +
          `✅ *Exitosos:* ${success}\n` +
          `❌ *Fallidos:* ${failed}\n` +
          `📊 *Total:* ${participants.length}\n` +
          `💾 *Contactos:* ${saved.length} guardados\n\n` +
          `📱 *El archivo VCF fue enviado al chat privado*`,
        doneButtons,
      ),
      { quoted: m },
    );
  } catch (error) {
    delete global.statuspush;
    m.react("☢");
    m.reply(te(m.prefix, m.command, m.pushName));
  }
}

async function pushkontakAnswerHandler(m, sock) {
  if (!m.body) return false;
  if (m.isCommand) return false;

  const session = getSession(m.sender);
  if (!session) return false;
  if (m.chat !== session.chatJid) return false;

  const text = m.body.trim();
  const lowText = text.toLowerCase();

  if (["batal", "cancel", "batalkan"].includes(lowText)) {
    clearSession(m.sender);
    await m.reply(
      `❌ *Sesión de push contactos cancelada*\n\n📢 *Escribe* ${m.prefix}pushkontak *para empezar de nuevo*`,
    );
    return true;
  }

  if (session.step === "message") {
    if (text.length < 1) {
      await m.reply(
        `❌ *El mensaje no puede estar vacío*\n\n📩 *Responde de nuevo con un mensaje válido*`,
      );
      return true;
    }

    session.message = text;
    session.step = "confirm";

    const db = getDatabase();
    const metadata = m.groupMetadata;
    const botId = sock.user.id.split(":")[0] + "@s.whatsapp.net";
    const s = getPushSettings(db);
    const participants = resolveParticipants(
      metadata,
      botId,
      m.sender,
      s.skipAdmin,
    );
    const jedaPush = s.jeda;
    const estimasi = Math.ceil((participants.length * jedaPush) / 60000);

    const sent = await m.reply(
      `✅ *PASO 2/2 — CONFIRMACIÓN*\n\n` +
        `📝 *Mensaje:* ${text.substring(0, 100)}${text.length > 100 ? "..." : ""}\n` +
        `👥 *Objetivo:* ${participants.length} miembros\n` +
        `⏱️ *Pausa:* ${jedaPush}ms\n` +
        `📊 *Estimación:* ${estimasi} minutos\n\n` +
        `*Responde a este mensaje con:*\n` +
        `✅ *ya* — Iniciar push ahora\n` +
        `📝 *ubah* — Cambiar el mensaje que quieres enviar\n` +
        `❌ *batal* — Cancelar sesión`,
    );

    session.promptId = sent?.key?.id || session.promptId;
    return true;
  }

  if (session.step === "confirm") {
    if (
      ["ya", "y", "iya", "yes", "lanjut", "confirm", "ok"].includes(lowText)
    ) {
      const pushMessage = session.message;
      clearSession(m.sender);
      await startPush(m, sock, pushMessage);
      return true;
    }

    if (["ubah", "edit", "ganti", "revisi"].includes(lowText)) {
      session.step = "message";
      const sent = await m.reply(
        `📝 *CAMBIAR MENSAJE*\n\n` +
          `🔤 *Envía el nuevo mensaje que quieres mandar por push*\n\n` +
          `📩 *Responde a este mensaje con el nuevo mensaje*\n\n` +
          `❌ *Responde* \`batal\` *para cancelar*`,
      );
      session.promptId = sent?.key?.id || session.promptId;
      return true;
    }

    await m.reply(
      `❌ *Respuesta no válida*\n\n📩 *Responde con:* \`ya\`, \`ubah\`, o \`batal\``,
    );
    return true;
  }

  return false;
}

async function handler(m, { sock }) {
  const cmd = m.command?.toLowerCase();
  if (cmd === "stoppush") return handleStop(m);
  if (cmd === "setjedapush") return handleSetJeda(m, sock);
  if (cmd === "pushkontak_start") return handleStartSession(m, sock);
  if (cmd === "kelolapush") return handleKelola(m, sock);
  if (cmd === "autovcf_on" || cmd === "autovcf_off")
    return handleSettingToggle(m, "pushAutoVcf", "Auto VCF", true, false);
  if (cmd === "kodeunik_on" || cmd === "kodeunik_off")
    return handleSettingToggle(m, "pushKodeUnik", "Código único", true, false);
  if (cmd === "vcftarget_private")
    return handleSettingToggle(
      m,
      "pushVcfTarget",
      "Destino VCF",
      "private",
      "private",
    );
  if (cmd === "vcftarget_group")
    return handleSettingToggle(
      m,
      "pushVcfTarget",
      "Destino VCF",
      "group",
      "group",
    );
  if (cmd === "skipadmin_on" || cmd === "skipadmin_off")
    return handleSettingToggle(m, "pushSkipAdmin", "Omitir admins", true, false);
  return handlePush(m, sock);
}

export { pluginConfig as config, handler, pushkontakAnswerHandler };
