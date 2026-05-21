import generateCustomTTS from "../../src/scraper/topmedia.js";
import { getDatabase } from "../../src/lib/ourin-database.js";
import config from "../../config.js";
import axios from "axios";
import { exec } from "child_process";
import { promisify } from "util";
import fs from "fs";
import path from "path";
const execAsync = promisify(exec);

const pluginConfig = {
  name: "autoai",
  alias: ["aai"],
  category: "group",
  description:
    "Activa o desactiva respuestas automaticas de IA para el grupo con opcion de texto o voz",
  usage:
    ".autoai on/off --ourinmode=<character|custom> --logic=<custom instruction> --type=<text|voice>",
  example: ".autoai on --ourinmode=furina --type=voice",
  isOwner: false,
  isPremium: false,
  isGroup: true,
  isPrivate: false,
  cooldown: 5,
  energi: 0,
  isEnabled: true,
};

const characters = {
  furina: {
    name: "Furina",
    instruction:
      "Eres Furina de Genshin Impact. Habla de forma relajada pero elegante, un poco dramatica, a veces algo orgullosa pero siempre calida. No te extiendas demasiado; responde directo como en un chat normal. De vez en cuando puedes tocar temas de escenario o mar. No digas que eres una IA.",
  },
  zeta: {
    name: "Zeta",
    instruction:
      "Eres Zeta de Spy x Family. Habla de forma seria y tranquila, pero siempre algo sospechosa, como si olieras una conspiracion. Mantente natural, como una conversacion normal, breve y directa. No digas que eres una IA.",
  },
  kobo: {
    name: "Kobo Kanaeru",
    instruction:
      "Eres Kobo Kanaeru. Habla de forma relajada, alegre y un poco traviesa. Usa estilo de chat normal, sin extenderte demasiado. Puedes ser algo aleatoria o graciosa. No exageres con mayusculas ni emojis. No digas que eres una IA.",
  },
  elaina: {
    name: "Elaina",
    instruction:
      "Eres Elaina. Habla de forma suave, tranquila, segura y con un toque sutilmente narcisista. Responde breve, ordenado y directo como en un chat normal. No digas que eres una IA.",
  },
  waguri: {
    name: "Waguri",
    instruction:
      "Eres Waguri. Habla breve, algo fria pero en realidad atenta. Un poco tsundere, directa, como en un chat normal. No digas que eres una IA.",
  },
  bell409: {
    name: "Bell409",
    instruction: config.autoaiPersonas?.Bell409 || "",
  },
};
async function convertToOggOpus(inputPath) {
  const outputPath = inputPath.replace(/\.[^.]+$/, ".ogg");
  const cmd = `ffmpeg -y -i "${inputPath}" -c:a libopus -b:a 64k -ac 1 -ar 48000 "${outputPath}"`;

  try {
    await execAsync(cmd, { timeout: 60000 });
    if (fs.existsSync(outputPath)) {
      return outputPath;
    }
  } catch (e) {
    console.log("[AutoAI] FFmpeg error:", e.message);
  }
  return null;
}

async function handler(m) {
  const db = getDatabase();
  const args = m.args || [];
  const fullArgs = m.fullArgs || "";

  if (!m.isGroup) {
    return m.reply(`❌ Esta funcion es solo para grupos!`);
  }

  if (!m.isAdmin && !m.isOwner) {
    return m.reply(`❌ Solo admins pueden usar esta funcion!`);
  }

  if (!db.db.data.autoai) db.db.data.autoai = {};
  if (!db.db.data.autoai_personas) db.db.data.autoai_personas = {};
  if (!db.db.data.autoai_global) db.db.data.autoai_global = { enabled: false };

  const subcmd = args[0]?.toLowerCase();

  if (subcmd === "tambahpersona") {
    if (!m.isOwner)
      return m.reply(`❌ Solo el owner puede agregar personas!`);
    const personaArgs = fullArgs
      .replace(/^tambahpersona\s*/i, "")
      .split("|")
      .map((s) => s.trim());
    if (personaArgs.length < 2 || !personaArgs[0] || !personaArgs[1])
      return m.reply(
        `❌ Formato incorrecto!\n\n> .autoai tambahpersona nama | instruction\n\n> Ejemplo: .autoai tambahpersona nexa | kamu adalah nexa ai, ...`,
      );
    const pName = personaArgs[0].toLowerCase().replace(/\s+/g, "_");
    const pInstruction = personaArgs.slice(1).join("|").trim();
    if (characters[pName])
      return m.reply(
        `❌ El nombre "${pName}" ya esta usado por una persona integrada!\n\n> Elige otro nombre`,
      );
    db.db.data.autoai_personas[pName] = {
      name: personaArgs[0],
      instruction: pInstruction,
      createdBy: m.sender,
      createdAt: new Date().toISOString(),
    };
    db.save();
    return m.reply(
      `✅ *Persona agregada*\n\n> Nombre: ${personaArgs[0]}\n> Key: ${pName}\n> Logic: ${pInstruction.substring(0, 80)}${pInstruction.length > 80 ? "..." : ""}\n\n> Usa: .autoai on --ourinmode=${pName}`,
    );
  }

  if (subcmd === "hapuspersona") {
    if (!m.isOwner)
      return m.reply(`❌ Solo el owner puede eliminar personas!`);
    const pKey = (args[1] || "").toLowerCase().trim();
    if (!pKey)
      return m.reply(
        `❌ Formato incorrecto!\n\n> .autoai hapuspersona <nama>\n\n> Ejemplo: .autoai hapuspersona nexa`,
      );
    if (!db.db.data.autoai_personas[pKey])
      return m.reply(
        `❌ Persona "${pKey}" no se encontro!\n\n> Escribe .autoai listpersona para ver la lista`,
      );
    delete db.db.data.autoai_personas[pKey];
    db.save();
    return m.reply(`✅ Persona "${pKey}" se elimino correctamente`);
  }

  if (subcmd === "enablecommand" || subcmd === "enablecmd") {
    if (!m.isAdmin && !m.isOwner)
      return m.reply(`❌ Solo admins pueden configurar esto!`);
    const cfg = db.db.data.autoai[m.chat];
    if (!cfg?.enabled) return m.reply(`❌ AutoAI aun no esta activo en este grupo!`);
    if (cfg.enableCommands)
      return m.reply(`ℹ️ *Comandos ya habilitados*

> Los usuarios pueden seguir usando comandos aunque AutoAI este activo`);
    cfg.enableCommands = true;
    db.save();
    return m.reply(
      `✅ *ᴇɴᴀʙʟᴇ ᴄᴏᴍᴍᴀɴᴅ*

` +
        `> Los usuarios ahora pueden usar comandos aunque AutoAI este activo
` +
        `> Bot tetap merespon saat di-tag/reply

` +
        `_Usa ${m.prefix}autoai disablecommand para desactivar_`,
    );
  }

  if (subcmd === "disablecommand" || subcmd === "disablecmd") {
    if (!m.isAdmin && !m.isOwner)
      return m.reply(`❌ Solo admins pueden configurar esto!`);
    const cfg = db.db.data.autoai[m.chat];
    if (!cfg?.enabled) return m.reply(`❌ AutoAI aun no esta activo en este grupo!`);
    if (!cfg.enableCommands)
      return m.reply(`ℹ️ *Comandos ya deshabilitados*

> Todos los comandos (excepto owner) estan bloqueados mientras AutoAI este activo`);
    cfg.enableCommands = false;
    db.save();
    return m.reply(
      `🔒 *ᴅɪsᴀʙʟᴇ ᴄᴏᴍᴍᴀɴᴅ*

` +
        `> Todos los comandos (excepto owner) estan bloqueados mientras AutoAI este activo
` +
        `> El bot solo responde cuando lo etiquetan o responden

` +
        `_Usa ${m.prefix}autoai enablecommand para volver a activar_`,
    );
  }

  if (subcmd === "listpersona") {
    const builtIn = Object.entries(characters)
      .map(([k, v]) => `  ▸ ${k} - ${v.name}`)
      .join("\n");
    const customEntries = Object.entries(db.db.data.autoai_personas);
    const custom = customEntries.length
      ? customEntries
          .map(
            ([k, v]) =>
              `  ▸ ${k} - ${v.name} (${v.instruction.substring(0, 40)}${v.instruction.length > 40 ? "..." : ""})`,
          )
          .join("\n")
      : "  ▸ (aun no hay personas personalizadas)";
    let txt = `🤖 *ᴅᴀғᴛᴀʀ ᴘᴇʀsᴏɴᴀ*\n\n`;
    txt += `*Bawaan:*\n${builtIn}\n\n`;
    txt += `*Custom:*\n${custom}\n\n`;
    txt += `*Global:* ${db.db.data.autoai_global.enabled ? "✅ Aktif" : "❌ Nonactivo"}\n\n`;
    txt += `> .autoai on --ourinmode=<key>\n`;
    txt += `> .autoai tambahpersona nama | logic\n`;
    txt += `> .autoai hapuspersona nama\n`;
    txt += `> .autoai global on/off`;
    return m.reply(txt);
  }

  if (subcmd === "global") {
    if (!m.isOwner) return m.reply(`❌ Solo el owner puede alternar el modo global!`);
    const globalMode = (args[1] || "").toLowerCase();
    if (!["on", "off"].includes(globalMode))
      return m.reply(
        `❌ Formato incorrecto!\n\n> .autoai global on/off\n\n> Global actual: ${db.db.data.autoai_global.enabled ? "✅ Aktif" : "❌ Nonactivo"}`,
      );
    if (globalMode === "on") {
      const modeMatch = fullArgs.match(/--ourinmode=(\w+)/i);
      const typeMatch = fullArgs.match(/--type=(text|voice)/i);
      const logicMatch = fullArgs.match(
        /--logic=(.+?)(?=\s+--(?:ourinmode|type|logic)|$)/i,
      );
      const charKey = modeMatch ? modeMatch[1].toLowerCase() : null;
      const responseType = typeMatch ? typeMatch[1].toLowerCase() : "text";
      const customLogic = logicMatch ? logicMatch[1].trim() : null;

      let instruction = "";
      let characterName = "Global";
      let character = "global";

      if (charKey === "custom" && customLogic) {
        instruction = customLogic;
        character = "custom";
        characterName = "Custom";
      } else if (charKey && characters[charKey]) {
        instruction = characters[charKey].instruction;
        character = charKey;
        characterName = characters[charKey].name;
      } else if (charKey && db.db.data.autoai_personas[charKey]) {
        instruction = db.db.data.autoai_personas[charKey].instruction;
        character = charKey;
        characterName = db.db.data.autoai_personas[charKey].name;
      } else if (!charKey) {
        const existingGlobal = db.db.data.autoai_global;
        if (existingGlobal.instruction) {
          instruction = existingGlobal.instruction;
          character = existingGlobal.character || "global";
          characterName = existingGlobal.characterName || "Global";
        } else {
          return m.reply(
            `❌ Aun no hay una persona global configurada!\n\n> .autoai global on --ourinmode=furina\n> .autoai global on --ourinmode=custom --logic=...`,
          );
        }
      } else {
        const charList = [
          ...Object.keys(characters),
          ...Object.keys(db.db.data.autoai_personas),
          "custom",
        ].join(", ");
        return m.reply(`❌ Karakter no valido!\n\n> Tersedia: ${charList}`);
      }

      db.db.data.autoai_global = {
        enabled: true,
        character,
        characterName,
        instruction,
        responseType,
      };
      db.save();
      return m.reply(
        `🌐 *ᴀᴜᴛᴏ ᴀɪ ɢʟᴏʙᴀʟ ᴅɪᴀᴋᴛɪғᴋᴀɴ*\n\n` +
          `╭┈┈⬡「 📋 *ɪɴғᴏ* 」\n` +
          `┃ 🎭 Karakter: *${characterName}*\n` +
          `┃ 📢 Response: *${responseType === "voice" ? "🎤 Voice Note" : "💬 Text"}*\n` +
          `╰┈┈┈┈┈┈┈┈⬡\n\n` +
          `> ℹ️ AutoAI activo en todos los grupos\n` +
          `> ℹ️ Los grupos que ya tienen configuracion mantienen la suya\n` +
          `> ℹ️ Escribe *.autoai global off* para desactivar`,
      );
    } else {
      db.db.data.autoai_global.enabled = false;
      db.save();
      return m.reply(
        `🌐 *ᴀᴜᴛᴏ ᴀɪ ɢʟᴏʙᴀʟ ᴅɪɴᴏɴᴀᴋᴛɪғᴋᴀɴ*\n\n> AutoAI solo esta activo en los grupos configurados`,
      );
    }
  }

  const mode = subcmd;
  const modeMatch = fullArgs.match(/--ourinmode=(\w+)/i);
  const typeMatch = fullArgs.match(/--type=(text|voice)/i);
  const logicMatch = fullArgs.match(
    /--logic=(.+?)(?=\s+--(?:ourinmode|type|logic)|$)/i,
  );
  const charKey = modeMatch ? modeMatch[1].toLowerCase() : null;
  const responseType = typeMatch ? typeMatch[1].toLowerCase() : "text";
  const customLogic = logicMatch ? logicMatch[1].trim() : null;

  if (!mode || !["on", "off"].includes(mode)) {
    const charList = Object.entries(characters)
      .map(([key, val]) => `> ${key} - ${val.name}`)
      .join("\n");
    const customP = Object.entries(db.db.data.autoai_personas);
    const customList = customP.length
      ? customP.map(([k, v]) => `> ${k} - ${v.name} (custom)`).join("\n")
      : "";
    let txt = `🤖 *ᴀᴜᴛᴏ ᴀɪ*\n\n`;
    txt += `> Activa o desactiva la respuesta automatica de AI\n\n`;
    txt += `*Uso:*\n`;
    txt += `> .autoai on --ourinmode=<karakter|custom> --type=<text|voice>\n`;
    txt += `> .autoai off\n`;
    txt += `> .autoai tambahpersona nama | logic\n`;
    txt += `> .autoai hapuspersona nama\n`;
    txt += `> .autoai listpersona\n`;
    txt += `> .autoai global on/off\n`;
    txt += `> .autoai enablecommand / disablecommand\n\n`;
    txt += `*Karakter bawaan:*\n${charList}\n`;
    if (customList) txt += `\n*Karakter custom:*\n${customList}\n`;
    txt += `\n*Global:* ${db.db.data.autoai_global.enabled ? "✅ Aktif" : "❌ Nonactivo"}\n\n`;
    txt += `*Response Type:*\n`;
    txt += `> text - Reply con text biasa\n`;
    txt += `> voice - Reply con voice note (TTS)\n\n`;
    txt += `*Ejemplo:*\n`;
    txt += `> .autoai on --ourinmode=furina --type=text\n`;
    txt += `> .autoai on --ourinmode=custom --logic=kamu adalah nexa ai\n`;
    txt += `> .autoai tambahpersona nexa | kamu adalah nexa ai\n`;
    txt += `> .autoai global on --ourinmode=furina`;
    return m.reply(txt);
  }

  if (mode === "off") {
    db.db.data.autoai[m.chat] = { enabled: false };
    db.save();
    const globalStatus = db.db.data.autoai_global?.enabled
      ? `\n\n> ℹ️ Global sigue activo, pero este grupo esta excluido\n> ℹ️ Escribe *.autoai global off* para desactivar global`
      : "";
    return m.reply(
      `🤖 *ᴀᴜᴛᴏ ᴀɪ ᴅɪɴᴏɴᴀᴋᴛɪғᴋᴀɴ*\n\n> Auto AI para este grupo se desactivo\n> Todos los comandos vuelven a estar activos${globalStatus}`,
    );
  }

  if (!charKey) {
    const charList = [
      ...Object.keys(characters),
      ...Object.keys(db.db.data.autoai_personas),
      "custom",
    ].join(", ");
    return m.reply(
      `❌ Karakter no valido!\n\n> Personajes disponibles: ${charList}\n\n> Ejemplo: .autoai on --ourinmode=furina --type=voice\n> Custom: .autoai on --ourinmode=custom --logic=kamu adalah nexa ai`,
    );
  }

  if (charKey === "custom") {
    if (!customLogic) {
      return m.reply(
        `❌ El modo custom requiere --logic!\n\n> Ejemplo: .autoai on --ourinmode=custom --logic=kamu adalah nexa ai, ...`,
      );
    }
    db.db.data.autoai[m.chat] = {
      enabled: true,
      character: "custom",
      characterName: "Custom",
      instruction: customLogic,
      responseType: responseType,
      enableCommands: false,
      sessions: {},
      activatedBy: m.sender,
      activatedAt: new Date().toISOString(),
    };
    db.save();
    let txt = `🤖 *ᴀᴜᴛᴏ ᴀɪ ᴅɪᴀᴋᴛɪғᴋᴀɴ*\n\n`;
    txt += `╭┈┈⬡「 📋 *ɪɴғᴏ* 」\n`;
    txt += `┃ 🎭 Karakter: *Custom*\n`;
    txt += `┃ 🧠 Logic: ${customLogic.substring(0, 100)}${customLogic.length > 100 ? "..." : ""}\n`;
    txt += `┃ 📢 Response: *${responseType === "voice" ? "🎤 Voice Note" : "💬 Text"}*\n`;
    txt += `┃ 👤 Activado por: @${m.sender.split("@")[0]}\n`;
    txt += `╰┈┈┈┈┈┈┈┈⬡\n\n`;
    txt += `> ℹ️ Todos los comandos (excepto owner) estan desactivados\n`;
    txt += `> ℹ️ El bot responde cuando lo responden o etiquetan\n`;
    txt +=
      responseType === "voice" ? `> ℹ️ Respuesta en forma de nota de voz\n` : "";
    txt += `> ℹ️ Escribe *.autoai off* para desactivar`;
    return m.reply(txt, { mentions: [m.sender] });
  }

  const customPersona = db.db.data.autoai_personas[charKey];
  if (customPersona) {
    db.db.data.autoai[m.chat] = {
      enabled: true,
      character: charKey,
      characterName: customPersona.name,
      instruction: customPersona.instruction,
      responseType: responseType,
      enableCommands: false,
      sessions: {},
      activatedBy: m.sender,
      activatedAt: new Date().toISOString(),
    };
    db.save();
    let txt = `🤖 *ᴀᴜᴛᴏ ᴀɪ ᴅɪᴀᴋᴛɪғᴋᴀɴ*\n\n`;
    txt += `╭┈┈⬡「 📋 *ɪɴғᴏ* 」\n`;
    txt += `┃ 🎭 Karakter: *${customPersona.name}* (custom)\n`;
    txt += `┃ 📢 Response: *${responseType === "voice" ? "🎤 Voice Note" : "💬 Text"}*\n`;
    txt += `┃ 👤 Activado por: @${m.sender.split("@")[0]}\n`;
    txt += `╰┈┈┈┈┈┈┈┈⬡\n\n`;
    txt += `> ℹ️ Todos los comandos (excepto owner) estan desactivados\n`;
    txt += `> ℹ️ El bot responde cuando lo responden o etiquetan\n`;
    txt +=
      responseType === "voice" ? `> ℹ️ Respuesta en forma de nota de voz\n` : "";
    txt += `> ℹ️ Escribe *.autoai off* para desactivar`;
    return m.reply(txt, { mentions: [m.sender] });
  }

  if (!characters[charKey]) {
    const charList = [
      ...Object.keys(characters),
      ...Object.keys(db.db.data.autoai_personas),
      "custom",
    ].join(", ");
    return m.reply(
      `❌ Karakter no valido!\n\n> Personajes disponibles: ${charList}\n\n> Ejemplo: .autoai on --ourinmode=furina --type=voice`,
    );
  }

  db.db.data.autoai[m.chat] = {
    enabled: true,
    character: charKey,
    characterName: characters[charKey].name,
    instruction: characters[charKey].instruction,
    responseType: responseType,
    enableCommands: false,
    sessions: {},
    activatedBy: m.sender,
    activatedAt: new Date().toISOString(),
  };
  db.save();

  let txt = `🤖 *ᴀᴜᴛᴏ ᴀɪ ᴅɪᴀᴋᴛɪғᴋᴀɴ*\n\n`;
  txt += `╭┈┈⬡「 📋 *ɪɴғᴏ* 」\n`;
  txt += `┃ 🎭 Karakter: *${characters[charKey].name}*\n`;
  txt += `┃ 📢 Response: *${responseType === "voice" ? "🎤 Voice Note" : "💬 Text"}*\n`;
  txt += `┃ 👤 Activado por: @${m.sender.split("@")[0]}\n`;
  txt += `╰┈┈┈┈┈┈┈┈⬡\n\n`;
  txt += `> ℹ️ Todos los comandos (excepto owner) estan desactivados\n`;
  txt += `> ℹ️ El bot responde cuando lo responden o etiquetan\n`;
  txt +=
    responseType === "voice" ? `> ℹ️ Respuesta en forma de nota de voz\n` : "";
  txt += `> ℹ️ Escribe *.autoai off* para desactivar`;

  await m.reply(txt, { mentions: [m.sender] });
}

async function generateVoiceResponse(text, sock, chatId, quotedMsg) {
  const tempDir = path.join(process.cwd(), "temp");
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }

  try {
    const audioUrl = await generateCustomTTS(null, text);

    const audioRes = await axios.get(audioUrl, {
      responseType: "arraybuffer",
      timeout: 30000,
    });

    const mp3Path = path.join(tempDir, `tts_${Date.now()}.mp3`);
    fs.writeFileSync(mp3Path, Buffer.from(audioRes.data));

    const oggPath = await convertToOggOpus(mp3Path);

    if (oggPath && fs.existsSync(oggPath)) {
      const audioBuffer = fs.readFileSync(oggPath);

      await sock.sendMessage(
        chatId,
        {
          audio: audioBuffer,
          mimetype: "audio/ogg; codecs=opus",
          ptt: true,
        },
        { quoted: quotedMsg },
      );

      fs.unlinkSync(mp3Path);
      fs.unlinkSync(oggPath);

      return true;
    } else {
      const audioBuffer = fs.readFileSync(mp3Path);

      await sock.sendMessage(
        chatId,
        {
          audio: audioBuffer,
          mimetype: "audio/mpeg",
          ptt: true,
        },
        { quoted: quotedMsg },
      );

      fs.unlinkSync(mp3Path);

      return true;
    }
  } catch (e) {
    console.log("[AutoAI Voice] Error:", e.message);
    return false;
  }
}

export { pluginConfig as config, handler, characters, generateVoiceResponse };
