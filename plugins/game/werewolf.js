import { getDatabase } from "../../src/lib/ourin-database.js";
/**
 * 🐺 WEREWOLF GAME
 * Social deduction game for WhatsApp
 *
 * Based on reference: RTXZY-MD-pro/lib/werewolf.js
 * Enhanced for Nino AI
 */
import config from "../../config.js";
import fs from "fs";
import path from "path";
import te from "../../src/lib/ourin-error.js";
const pluginConfig = {
  name: "werewolf",
  alias: ["ww", "wwgc"],
  category: "game",
  description: "Juega Werewolf con otros jugadores",
  usage: ".ww <create|join|start|vote|player|exit|delete>",
  example: ".ww create",
  isOwner: false,
  isPremium: false,
  isGroup: true,
  isPrivate: false,
  cooldown: 5,
  energi: 0,
  isEnabled: true,
};

if (!global.werewolfGames) global.werewolfGames = {};

let thumbWW = null;
let thumbNight = null;
let thumbDia = null;
let thumbWin = null;

try {
  const assetsPath = path.join(process.cwd(), "assets", "images");
  if (fs.existsSync(path.join(assetsPath, "ourin-games.jpg"))) {
    thumbWW = fs.readFileSync(path.join(assetsPath, "ourin-games.jpg"));
  }
  if (fs.existsSync(path.join(assetsPath, "ourin.jpg"))) {
    thumbNight = fs.readFileSync(path.join(assetsPath, "ourin.jpg"));
    thumbDia = fs.readFileSync(path.join(assetsPath, "ourin.jpg"));
  }
  if (fs.existsSync(path.join(assetsPath, "ourin-winner.jpg"))) {
    thumbWin = fs.readFileSync(path.join(assetsPath, "ourin-winner.jpg"));
  }
} catch (e) {
  console.log("[WW] Failed to load thumbnails:", e.message);
}

const ROLS = {
  werewolf: {
    emoji: "🐺",
    name: "Werewolf",
    team: "wolf",
    desc: "Mata aldeanos cada noche",
  },
  seer: {
    emoji: "🔮",
    name: "Vidente",
    team: "village",
    desc: "Mira el rol de un jugador cada noche",
  },
  guardian: {
    emoji: "🛡️",
    name: "Guardian",
    team: "village",
    desc: "Protege a un jugador cada noche",
  },
  sorcerer: {
    emoji: "🧙",
    name: "Hechicero",
    team: "wolf",
    desc: "Descubre quien es el Vidente",
  },
  villager: {
    emoji: "👨‍🌾",
    name: "Aldeano",
    team: "village",
    desc: "Debate y vota contra los werewolf",
  },
};

const WIN_REWARD = { koin: 5000, exp: 1000 };
const MIN_JUGADORS = 4;
const MAX_JUGADORS = 15;
const PHASE_DURATION = {
  night: 60000, // 60 seconds
  day: 90000, // 90 seconds
};

function wwCtx(mentions) {
  const saluranId = config.saluran?.id || "120363400911374213@newsletter";
  const saluranName = config.saluran?.name || config.bot?.name || "Nino AI";
  return {
    forwardingScore: 9999,
    isForwarded: true,
    mentionedJid: mentions,
    forwardedNewsletterMessageInfo: {
      newsletterJid: saluranId,
      newsletterName: saluranName,
      serverMessageId: 127,
    },
  };
}

async function sendWW(sock, jid, text, title, body, thumbBuffer, mentions) {
  const msgId = await sock.sendPreview(
    jid,
    {
      caption: `${config.info.website} ${text}`,
      url: `${config.info.website}`,
      title: title || "🐺 WEREWOLF",
      description: body || "Juego de deduccion social!",
      jpegThumbnail: thumbBuffer || thumbWW,
      previewType: 0,
    },
    { contextInfo: wwCtx(mentions) },
  );
  return { key: { id: msgId, remoteJid: jid, fromMe: true } };
}

// Generate roles based on player count
function generateRols(playerCount) {
  const roles = [];

  // Rol distribution based on player count (from reference)
  if (playerCount === 4) {
    roles.push("werewolf", "seer", "guardian", "villager");
  } else if (playerCount === 5) {
    roles.push("werewolf", "seer", "guardian", "villager", "villager");
  } else if (playerCount === 6) {
    roles.push(
      "werewolf",
      "werewolf",
      "seer",
      "guardian",
      "villager",
      "villager",
    );
  } else if (playerCount === 7) {
    roles.push(
      "werewolf",
      "werewolf",
      "seer",
      "guardian",
      "villager",
      "villager",
      "villager",
    );
  } else if (playerCount === 8) {
    roles.push(
      "werewolf",
      "werewolf",
      "seer",
      "guardian",
      "villager",
      "villager",
      "villager",
      "villager",
    );
  } else if (playerCount === 9) {
    roles.push(
      "werewolf",
      "werewolf",
      "seer",
      "guardian",
      "sorcerer",
      "villager",
      "villager",
      "villager",
      "villager",
    );
  } else if (playerCount === 10) {
    roles.push(
      "werewolf",
      "werewolf",
      "seer",
      "guardian",
      "sorcerer",
      "villager",
      "villager",
      "villager",
      "villager",
      "villager",
    );
  } else if (playerCount === 11) {
    roles.push(
      "werewolf",
      "werewolf",
      "seer",
      "guardian",
      "guardian",
      "sorcerer",
      "villager",
      "villager",
      "villager",
      "villager",
      "villager",
    );
  } else if (playerCount >= 12) {
    roles.push(
      "werewolf",
      "werewolf",
      "seer",
      "guardian",
      "guardian",
      "sorcerer",
    );
    while (roles.length < playerCount) roles.push("villager");
  }

  // Shuffle roles
  for (let i = roles.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [roles[i], roles[j]] = [roles[j], roles[i]];
  }

  return roles;
}

// Get role description for PM
function getRolDescription(role, prefix = ".") {
  const descriptions = {
    werewolf:
      `🐺 *WEREWOLF*\n\n` +
      `Eres un depredador nocturno!\n\n` +
      `╭┈┈⬡「 📋 *INFO* 」\n` +
      `┃ 🎯 Objetivo: Mata a todos los aldeanos\n` +
      `┃ ⚔️ Habilidad: Mata a 1 jugador cada noche\n` +
      `┃ 🕐 Accion: Durante la noche\n` +
      `╰┈┈┈┈┈┈┈┈⬡\n\n` +
      `> Durante la noche, escribe:\n` +
      `> \`${prefix}wwkill <numero>\` por privado al bot`,
    seer:
      `🔮 *SEER*\n\n` +
      `Puedes ver la identidad de un jugador!\n\n` +
      `╭┈┈⬡「 📋 *INFO* 」\n` +
      `┃ 🎯 Objetivo: Ayuda a los aldeanos\n` +
      `┃ 🔮 Habilidad: Mira el rol de 1 jugador\n` +
      `┃ 🕐 Accion: Durante la noche\n` +
      `╰┈┈┈┈┈┈┈┈⬡\n\n` +
      `> Durante la noche, escribe:\n` +
      `> \`${prefix}wwsee <numero>\` por privado al bot`,
    guardian:
      `🛡️ *GUARDIAN*\n\n` +
      `Puedes proteger a un jugador!\n\n` +
      `╭┈┈⬡「 📋 *INFO* 」\n` +
      `┃ 🎯 Objetivo: Protege a los aldeanos\n` +
      `┃ 🛡️ Habilidad: Protege a 1 jugador\n` +
      `┃ 🕐 Accion: Durante la noche\n` +
      `╰┈┈┈┈┈┈┈┈⬡\n\n` +
      `> Durante la noche, escribe:\n` +
      `> \`${prefix}wwprotect <numero>\` por privado al bot`,
    sorcerer:
      `🧙 *SORCERER*\n\n` +
      `Eres aliado de los Werewolf!\n\n` +
      `╭┈┈⬡「 📋 *INFO* 」\n` +
      `┃ 🎯 Objetivo: Ayuda a los Werewolf a ganar\n` +
      `┃ 🔍 Habilidad: Revisa si el objetivo es Vidente\n` +
      `┃ 🕐 Accion: Durante la noche\n` +
      `╰┈┈┈┈┈┈┈┈⬡\n\n` +
      `> Durante la noche, escribe:\n` +
      `> \`${prefix}wwsorcerer <numero>\` por privado al bot`,
    villager:
      `👨‍🌾 *VILLAGER*\n\n` +
      `Eres un aldeano comun!\n\n` +
      `╭┈┈⬡「 📋 *INFO* 」\n` +
      `┃ 🎯 Objetivo: Encuentra al Werewolf\n` +
      `┃ 🗳️ Habilidad: Vota durante el dia\n` +
      `┃ 🕐 Accion: Durante el dia\n` +
      `╰┈┈┈┈┈┈┈┈⬡\n\n` +
      `> Debate y vota al werewolf!\n` +
      `> \`${prefix}ww vote <numero>\` en el grupo`,
  };
  return descriptions[role] || "Rol desconocido";
}

async function handler(m, { sock }) {
  const db = getDatabase();
  const args = m.args || [];
  const action = args[0]?.toLowerCase();
  const target = args[1];
  const ww = global.werewolfGames;
  const prefix = m.prefix || config.command?.prefix || ".";

  const commands = {
    create: async () => {
      if (ww[m.chat]) {
        const game = ww[m.chat];
        if (game.status === "waiting") {
          return m.reply(
            `❌ *YA HAY UNA SALA*\n\n` +
              `La sala todavia esta esperando jugadores\n` +
              `Escribe \`${prefix}ww join\` para unirte\n` +
              `Host: @${game.owner.split("@")[0]}`,
            { mentions: [game.owner] },
          );
        }
        return m.reply(`❌ Hay un juego en curso! Espera hasta que termine.`);
      }

      // Check if player already in another sala
      const existingSala = Object.entries(ww).find(([chatId, sala]) =>
        sala.players.some((p) => p.id === m.sender),
      );
      if (existingSala) {
        return m.reply(`❌ Todavia estas en una partida en otro grupo!`);
      }

      // Create new game sala
      ww[m.chat] = {
        sala: m.chat,
        owner: m.sender,
        status: "waiting",
        day: 0,
        phase: "lobby",
        players: [
          {
            id: m.sender,
            number: 1,
            role: null,
            alive: true,
            voted: false,
            skillUsed: false,
          },
        ],
        dead: [],
        votes: {},
        nightActions: {
          kill: null,
          protect: null,
          see: null,
          sorcerer: null,
        },
        createdAt: Date.now(),
        timeout: null,
      };

      await m.react("🐺");
      await m.reply(
        `🐺 *WEREWOLF GAME*\n\n` +
          `Sala creada correctamente!\n\n` +
          `╭┈┈⬡「 📋 *INFO DE SALA* 」\n` +
          `┃ 👑 Host: @${m.sender.split("@")[0]}\n` +
          `┃ 👥 Jugadores: 1/${MAX_JUGADORS}\n` +
          `┃ ⏱️ Minimo: ${MIN_JUGADORS} jugadores\n` +
          `╰┈┈┈┈┈┈┈┈⬡\n\n` +
          `╭┈┈⬡「 🎮 *COMO JUGAR* 」\n` +
          `┃ ➕ \`${prefix}ww join\` - Unirse\n` +
          `┃ ▶️ \`${prefix}ww start\` - Iniciar (host)\n` +
          `┃ 👥 \`${prefix}ww player\` - Lista de jugadores\n` +
          `┃ 🚪 \`${prefix}ww exit\` - Salir\n` +
          `╰┈┈┈┈┈┈┈┈⬡`,
        { mentions: [m.sender] },
      );
    },

    join: async () => {
      if (!ww[m.chat]) {
        return m.reply(
          `❌ Todavia no hay sala!\n> Escribe \`${prefix}ww create\` para crear una sala`,
        );
      }

      if (ww[m.chat].status !== "waiting") {
        return m.reply(`❌ El juego ya empezo! Espera la siguiente ronda.`);
      }

      if (ww[m.chat].players.length >= MAX_JUGADORS) {
        return m.reply(`❌ La sala esta llena! (Maximo ${MAX_JUGADORS} jugadores)`);
      }

      if (ww[m.chat].players.some((p) => p.id === m.sender)) {
        return m.reply(`❌ Ya estas unido!`);
      }

      const existingSala = Object.entries(ww).find(
        ([chatId, sala]) =>
          chatId !== m.chat && sala.players.some((p) => p.id === m.sender),
      );
      if (existingSala) {
        return m.reply(`❌ Todavia estas en una partida en otro grupo!`);
      }

      ww[m.chat].players.push({
        id: m.sender,
        number: ww[m.chat].players.length + 1,
        role: null,
        alive: true,
        voted: false,
        skillUsed: false,
      });

      const playerList = ww[m.chat].players
        .map((p, i) => `${i + 1}. @${p.id.split("@")[0]}`)
        .join("\n");

      const canStart = ww[m.chat].players.length >= MIN_JUGADORS;

      await m.react("✅");
      await m.reply(
          `✅ *JUGADOR UNIDO*\n\n` +
          `@${m.sender.split("@")[0]} entro!\n\n` +
          `╭┈┈⬡「 👥 *LISTA DE JUGADORES* 」\n` +
          `${playerList
            .split("\n")
            .map((l) => `┃ ${l}`)
            .join("\n")}\n` +
          `╰┈┈┈┈┈┈┈┈⬡\n\n` +
          `Total: ${ww[m.chat].players.length}/${MIN_JUGADORS} (min)\n` +
          (canStart
            ? `✅ Ya pueden empezar! \`${prefix}ww start\``
            : `🕕 Faltan ${MIN_JUGADORS - ww[m.chat].players.length} jugadores mas`),
        { mentions: ww[m.chat].players.map((p) => p.id) },
      );
    },

    start: async () => {
      if (!ww[m.chat]) {
        return m.reply(`❌ Todavia no hay sala!`);
      }

      if (ww[m.chat].status !== "waiting") {
        return m.reply(`❌ El juego ya esta en curso!`);
      }

      if (ww[m.chat].owner !== m.sender && !config.isOwner?.(m.sender)) {
        return m.reply(`❌ Solo el host puede iniciar el juego!`);
      }

      if (ww[m.chat].players.length < MIN_JUGADORS) {
        return m.reply(
          `❌ Minimo ${MIN_JUGADORS} jugadores!\n> Ahora hay: ${ww[m.chat].players.length} jugadores`,
        );
      }

      // Generate and assign roles
      const roles = generateRols(ww[m.chat].players.length);
      ww[m.chat].players.forEach((p, i) => {
        p.role = roles[i];
      });

      ww[m.chat].status = "playing";
      ww[m.chat].day = 1;
      ww[m.chat].phase = "night";

      // Send role to each player via PM
      for (const player of ww[m.chat].players) {
        try {
          await sendWW(
            sock,
            player.id,
            getRolDescription(player.role, prefix),
            `${ROLS[player.role].emoji} ${ROLS[player.role].name}`,
            "Tu rol!",
          );
        } catch (e) {
          console.log(`[WW] Failed to send role to ${player.id}:`, e.message);
        }
      }

      // Build player list
      const playerList = ww[m.chat].players
        .map((p, i) => `${i + 1}. @${p.id.split("@")[0]}`)
        .join("\n");

      // Count roles
      const roleCount = {};
      ww[m.chat].players.forEach((p) => {
        roleCount[p.role] = (roleCount[p.role] || 0) + 1;
      });
      const roleInfo = Object.entries(roleCount)
        .map(
          ([role, count]) =>
            `${ROLS[role].emoji} ${ROLS[role].name}: ${count}`,
        )
        .join("\n");

      await m.react("🌙");
      await m.reply(
        `🐺 *JUEGO INICIADO!*\n\n` +
          `🌙 *Noche 1*\n\n` +
          `╭┈┈⬡「 👥 *JUGADORES* 」\n` +
          `${playerList
            .split("\n")
            .map((l) => `┃ ${l}`)
            .join("\n")}\n` +
          `╰┈┈┈┈┈┈┈┈⬡\n\n` +
          `╭┈┈⬡「 🎭 *ROLES* 」\n` +
          `${roleInfo
            .split("\n")
            .map((l) => `┃ ${l}`)
            .join("\n")}\n` +
          `╰┈┈┈┈┈┈┈┈⬡\n\n` +
          `📩 Revisa tu chat privado para ver tu rol!\n` +
          `🌙 Los werewolf cazan...\n` +
          `⏱️ Tiempo de noche: ${PHASE_DURATION.night / 1000} segundos`,
        { mentions: ww[m.chat].players.map((p) => p.id) },
      );

      // Send night skill prompts to special roles
      await sendNightPrompts(m.chat, sock, prefix);

      // Set timeout for night phase
      ww[m.chat].timeout = setTimeout(() => {
        processNightActions(m.chat, sock, db, prefix);
      }, PHASE_DURATION.night);
    },

    vote: async () => {
      if (!ww[m.chat] || ww[m.chat].status !== "playing") {
        return m.reply(`❌ No hay ningun juego activo!`);
      }

      if (ww[m.chat].phase !== "day") {
        return m.reply(
          `❌ Ahora no es momento de votar!\n> Fase: ${ww[m.chat].phase === "night" ? "🌙 Noche" : ww[m.chat].phase}`,
        );
      }

      const player = ww[m.chat].players.find((p) => p.id === m.sender);
      if (!player) {
        return m.reply(`❌ No eres jugador en este juego!`);
      }

      if (!player.alive) {
        return m.reply(`❌ Ya estas muerto! No puedes votar.`);
      }

      if (player.voted) {
        return m.reply(`❌ Ya votaste! Espera el resultado de la votacion.`);
      }

      if (!target) {
        const aliveJugadors = ww[m.chat].players.filter((p) => p.alive);
        const list = aliveJugadors
          .map((p) => `${p.number}. @${p.id.split("@")[0]}`)
          .join("\n");
        return m.reply(
          `🗳️ *VOTACION*\n\n` +
            `Elige a quien quieres eliminar:\n\n` +
            `${list}\n\n` +
            `Escribe: \`${prefix}ww vote <numero>\``,
          { mentions: aliveJugadors.map((p) => p.id) },
        );
      }

      const targetNum = parseInt(target);
      if (isNaN(targetNum)) {
        return m.reply(
          `❌ Ingresa el numero del jugador! Ejemplo: \`${prefix}ww vote 2\``,
        );
      }

      const targetJugador = ww[m.chat].players.find(
        (p) => p.number === targetNum,
      );
      if (!targetJugador) {
        return m.reply(`❌ Jugador numero ${targetNum} no encontrado!`);
      }

      if (!targetJugador.alive) {
        return m.reply(`❌ Ese jugador ya esta muerto!`);
      }

      player.voted = true;
      ww[m.chat].votes[targetJugador.id] =
        (ww[m.chat].votes[targetJugador.id] || 0) + 1;

      const aliveJugadors = ww[m.chat].players.filter((p) => p.alive);
      const votedCount = aliveJugadors.filter((p) => p.voted).length;

      await m.react("🗳️");
      await m.reply(
        `🗳️ *VOTO REGISTRADO*\n\n` +
          `@${m.sender.split("@")[0]} ➜ @${targetJugador.id.split("@")[0]}\n\n` +
          `Progreso: ${votedCount}/${aliveJugadors.length}`,
        { mentions: [m.sender, targetJugador.id] },
      );

      // Check if all votes are in
      if (votedCount >= aliveJugadors.length) {
        if (ww[m.chat].timeout) clearTimeout(ww[m.chat].timeout);
        await executeVoto(m.chat, sock, db, prefix);
      }
    },

    player: async () => {
      if (!ww[m.chat]) {
        return m.reply(`❌ No hay juego en esta sala!`);
      }

      const playerList = ww[m.chat].players
        .map((p, i) => {
          const status = p.alive
            ? "✅"
            : `☠️ (${ROLS[p.role]?.name || "Desconocido"})`;
          return `${p.number}. @${p.id.split("@")[0]} ${status}`;
        })
        .join("\n");

      const phaseEmoji =
        ww[m.chat].phase === "night"
          ? "🌙"
          : ww[m.chat].phase === "day"
            ? "☀️"
            : "🕕";

      await m.reply(
        `🐺 *WEREWOLF - STATUS*\n\n` +
          `╭┈┈⬡「 📊 *INFO DEL JUEGO* 」\n` +
          `┃ 📅 Dia: ${ww[m.chat].day}\n` +
          `┃ ${phaseEmoji} Fase: ${ww[m.chat].phase}\n` +
          `┃ 👤 Vivos: ${ww[m.chat].players.filter((p) => p.alive).length}\n` +
          `┃ ☠️ Muertos: ${ww[m.chat].dead.length}\n` +
          `╰┈┈┈┈┈┈┈┈⬡\n\n` +
          `╭┈┈⬡「 👥 *JUGADORES* 」\n` +
          `${playerList
            .split("\n")
            .map((l) => `┃ ${l}`)
            .join("\n")}\n` +
          `╰┈┈┈┈┈┈┈┈⬡`,
        { mentions: ww[m.chat].players.map((p) => p.id) },
      );
    },

    exit: async () => {
      if (!ww[m.chat]) {
        return m.reply(`❌ No hay juego en esta sala!`);
      }

      const playerIdx = ww[m.chat].players.findIndex((p) => p.id === m.sender);
      if (playerIdx === -1) {
        return m.reply(`❌ No estas en este juego!`);
      }

      if (ww[m.chat].status === "playing") {
        return m.reply(`❌ No puedes salir mientras el juego esta en curso!`);
      }

      ww[m.chat].players.splice(playerIdx, 1);
      ww[m.chat].players.forEach((p, i) => (p.number = i + 1));

      if (ww[m.chat].players.length === 0) {
        if (ww[m.chat].timeout) clearTimeout(ww[m.chat].timeout);
        delete ww[m.chat];
        return m.reply(`🗑️ Sala eliminada porque quedo vacia.`);
      }

      // Transfer host if owner left
      if (ww[m.chat].owner === m.sender && ww[m.chat].players.length > 0) {
        ww[m.chat].owner = ww[m.chat].players[0].id;
        await m.reply(
          `👋 @${m.sender.split("@")[0]} salio.\n` +
            `👑 Nuevo host: @${ww[m.chat].owner.split("@")[0]}`,
          { mentions: [m.sender, ww[m.chat].owner] },
        );
      } else {
        await m.reply(`👋 @${m.sender.split("@")[0]} salio del juego.`, {
          mentions: [m.sender],
        });
      }
    },

    delete: async () => {
      if (!ww[m.chat]) {
        return m.reply(`❌ No hay juego en esta sala!`);
      }

      const isOwner = ww[m.chat].owner === m.sender;
      const isBotOwner = config.isOwner?.(m.sender);

      if (!isOwner && !isBotOwner) {
        return m.reply(`❌ Solo el host o el owner del bot puede eliminarlo!`);
      }

      if (ww[m.chat].timeout) clearTimeout(ww[m.chat].timeout);
      delete ww[m.chat];

      await m.react("🗑️");
      await m.reply(`🗑️ Juego eliminado!`);
    },
  };

  // Show help if no action
  if (!action || !commands[action]) {
    return m.reply(
      `🐺 *WEREWOLF GAME*\n\n` +
        `Juego social para encontrar al Werewolf!\n\n` +
        `╭┈┈⬡「 🎮 *COMANDOS* 」\n` +
        `┃ 🆕 \`${prefix}ww create\` - Crear sala\n` +
        `┃ ➕ \`${prefix}ww join\` - Unirse\n` +
        `┃ ▶️ \`${prefix}ww start\` - Iniciar (host)\n` +
        `┃ 🗳️ \`${prefix}ww vote <no>\` - Voto\n` +
        `┃ 👥 \`${prefix}ww player\` - Lista de jugadores\n` +
        `┃ 🚪 \`${prefix}ww exit\` - Salir\n` +
        `┃ 🗑️ \`${prefix}ww delete\` - Eliminar sala\n` +
        `╰┈┈┈┈┈┈┈┈⬡\n\n` +
        `╭┈┈⬡「 🎭 *ROLES* 」\n` +
        `┃ 🐺 Werewolf - Mata aldeanos\n` +
        `┃ 🧙 Hechicero - Busca al Vidente\n` +
        `┃ 🔮 Vidente - Mira roles\n` +
        `┃ 🛡️ Guardian - Protege\n` +
        `┃ 👨‍🌾 Aldeano - Vota contra el werewolf\n` +
        `╰┈┈┈┈┈┈┈┈⬡\n\n` +
        `Min: ${MIN_JUGADORS} jugadores | Max: ${MAX_JUGADORS} jugadores`,
    );
  }

  try {
    await commands[action]();
  } catch (error) {
    console.error("[WEREWOLF ERROR]", error);
    m.reply(te(m.prefix, m.command, m.pushName));
  }
}

// Send night skill prompts to players
async function sendNightPrompts(chatId, sock, prefix) {
  const ww = global.werewolfGames;
  if (!ww[chatId]) return;

  const game = ww[chatId];
  const aliveJugadors = game.players.filter((p) => p.alive);

  // Build player list for prompts
  let playerListNormal = "";
  let playerListWerewolf = "";

  aliveJugadors.forEach((p) => {
    playerListNormal += `(${p.number}) @${p.id.split("@")[0]}\n`;
    const roleTag =
      p.role === "werewolf" || p.role === "sorcerer"
        ? ` [${ROLS[p.role].name}]`
        : "";
    playerListWerewolf += `(${p.number}) @${p.id.split("@")[0]}${roleTag}\n`;
  });

  const mentions = aliveJugadors.map((p) => p.id);

  // Send prompts based on role
  for (const player of aliveJugadors) {
    try {
      let text = "";

      switch (player.role) {
        case "werewolf":
          text =
            `🐺 *NOCHE*\n\n` +
            `Hora de cazar! Elige un objetivo:\n\n` +
            `${playerListWerewolf}\n` +
            `> Escribe \`${prefix}wwkill <numero>\` para matar`;
          break;
        case "seer":
          text =
            `🔮 *NOCHE*\n\n` +
            `De quien quieres ver el rol?\n\n` +
            `${playerListNormal}\n` +
            `> Escribe \`${prefix}wwsee <numero>\` para ver el rol`;
          break;
        case "guardian":
          text =
            `🛡️ *NOCHE*\n\n` +
            `A quien quieres proteger?\n\n` +
            `${playerListNormal}\n` +
            `> Escribe \`${prefix}wwprotect <numero>\` para proteger`;
          break;
        case "sorcerer":
          text =
            `🧙 *NOCHE*\n\n` +
            `Descubre quien es el Vidente!\n\n` +
            `${playerListWerewolf}\n` +
            `> Escribe \`${prefix}wwsorcerer <numero>\` para revisar`;
          break;
        case "villager":
          text =
            `👨‍🌾 *NOCHE*\n\n` +
            `Como aldeano, ten cuidado.\n` +
            `Tal vez seas el proximo objetivo.\n\n` +
            `${playerListNormal}`;
          break;
      }

      if (text) {
        await sendWW(
          sock,
          player.id,
          text,
          "🌙 NOCHE",
          "Usa tu habilidad!",
          thumbNight,
          mentions,
        );
      }
    } catch (e) {
      console.log(`[WW] Failed to send prompt to ${player.id}:`, e.message);
    }
  }
}

// Process accion nocturnas
async function processNightActions(chatId, sock, db, prefix) {
  const ww = global.werewolfGames;
  if (!ww[chatId] || ww[chatId].phase !== "night") return;

  let killTarget = ww[chatId].nightActions.kill;
  const protectTarget = ww[chatId].nightActions.protect;

  let nightReport = `☀️ *MANANA ${ww[chatId].day}*\n\n`;

  // Process kill if not protected
  if (killTarget && killTarget !== protectTarget) {
    const victim = ww[chatId].players.find((p) => p.id === killTarget);
    if (victim && victim.alive) {
      victim.alive = false;
      ww[chatId].dead.push(victim);
      nightReport += `☠️ @${victim.id.split("@")[0]} fue encontrado muerto!\n`;
      nightReport += `> Rol: ${ROLS[victim.role].emoji} ${ROLS[victim.role].name}\n\n`;
    }
  } else if (killTarget && killTarget === protectTarget) {
    nightReport += `🛡️ El Guardian protegió al objetivo!\n`;
    nightReport += `> No hubo victimas esta noche.\n\n`;
  } else {
    nightReport += `🌅 Una noche tranquila...\n`;
    nightReport += `> No hubo victimas.\n\n`;
  }

  // Check win condition
  const winner = checkWinner(chatId);
  if (winner) {
    await sendWW(
      sock,
      chatId,
      nightReport,
      "☀️ DIA",
      "Llego la manana...",
      thumbDia,
      ww[chatId].players.map((p) => p.id),
    );
    await endGame(chatId, sock, db, winner);
    return;
  }

  // Change phase to day
  ww[chatId].phase = "day";
  ww[chatId].votes = {};
  ww[chatId].nightActions = {
    kill: null,
    protect: null,
    see: null,
    sorcerer: null,
  };
  ww[chatId].players.forEach((p) => {
    p.voted = false;
    p.skillUsed = false;
  });

  const aliveJugadors = ww[chatId].players.filter((p) => p.alive);
  const playerList = aliveJugadors
    .map((p) => `${p.number}. @${p.id.split("@")[0]}`)
    .join("\n");

  nightReport += `╭┈┈⬡「 👥 *JUGADORES VIVOS* 」\n`;
  nightReport += `${playerList
    .split("\n")
    .map((l) => `┃ ${l}`)
    .join("\n")}\n`;
  nightReport += `╰┈┈┈┈┈┈┈┈⬡\n\n`;
  nightReport += `> 🗳️ Hora de votar!\n`;
  nightReport += `> Escribe \`${prefix}ww vote <numero>\`\n`;
  nightReport += `> ⏱️ Tiempo: ${PHASE_DURATION.day / 1000} segundos`;

  await sendWW(
    sock,
    chatId,
    nightReport,
    "☀️ DIA",
    "Hora de votar!",
    thumbDia,
    ww[chatId].players.map((p) => p.id),
  );

  ww[chatId].timeout = setTimeout(() => {
    executeVoto(chatId, sock, db, prefix);
  }, PHASE_DURATION.day);
}

// Execute vote results
async function executeVoto(chatId, sock, db, prefix) {
  const ww = global.werewolfGames;
  if (!ww[chatId] || ww[chatId].phase !== "day") return;

  let maxVotos = 0;
  let eliminated = null;
  let isTie = false;

  for (const [playerId, votes] of Object.entries(ww[chatId].votes)) {
    if (votes > maxVotos) {
      maxVotos = votes;
      eliminated = playerId;
      isTie = false;
    } else if (votes === maxVotos && maxVotos > 0) {
      isTie = true;
    }
  }

  let resultText = `⚖️ *RESULTADO DE VOTACION*\n\n`;

  if (isTie || maxVotos === 0) {
    resultText += `🤷 Nadie fue eliminado!\n`;
    resultText += `> ${isTie ? "Votacion empatada!" : "Nadie voto."}\n\n`;
  } else if (eliminated) {
    const player = ww[chatId].players.find((p) => p.id === eliminated);
    if (player) {
      player.alive = false;
      ww[chatId].dead.push(player);

      resultText += `⚰️ @${eliminated.split("@")[0]} fue eliminado!\n`;
      resultText += `> Rol: ${ROLS[player.role].emoji} ${ROLS[player.role].name}\n`;
      resultText += `> Votos: ${maxVotos}\n\n`;
    }
  }

  // Check win condition
  const winner = checkWinner(chatId);
  if (winner) {
    await sendWW(
      sock,
      chatId,
      resultText,
      "⚖️ VOTACION",
      "Resultado de votacion",
      thumbDia,
      eliminated ? [eliminated] : [],
    );
    await endGame(chatId, sock, db, winner);
    return;
  }

  // Change to night phase
  ww[chatId].phase = "night";
  ww[chatId].day++;
  ww[chatId].nightActions = {
    kill: null,
    protect: null,
    see: null,
    sorcerer: null,
  };
  ww[chatId].players.forEach((p) => {
    p.voted = false;
    p.skillUsed = false;
  });

  resultText += `🌙 *NOCHE ${ww[chatId].day}*\n\n`;
  resultText += `> Los werewolf cazan...\n`;
  resultText += `> Rols especiales, usen sus habilidades por privado!\n`;
  resultText += `> ⏱️ Tiempo: ${PHASE_DURATION.night / 1000} segundos`;

  await sendWW(
    sock,
    chatId,
    resultText,
    "🌙 NOCHE",
    "Los werewolf cazan...",
    thumbNight,
    eliminated ? [eliminated] : [],
  );

  // Send night prompts
  await sendNightPrompts(chatId, sock, prefix);

  ww[chatId].timeout = setTimeout(() => {
    processNightActions(chatId, sock, db, prefix);
  }, PHASE_DURATION.night);
}

// Check win condition
function checkWinner(chatId) {
  const ww = global.werewolfGames;
  if (!ww[chatId]) return null;

  const aliveJugadors = ww[chatId].players.filter((p) => p.alive);
  const wolves = aliveJugadors.filter((p) => ROLS[p.role]?.team === "wolf");
  const villagers = aliveJugadors.filter(
    (p) => ROLS[p.role]?.team === "village",
  );

  if (wolves.length === 0) return "village";
  if (wolves.length >= villagers.length) return "wolf";

  return null;
}

// End game and give rewards
async function endGame(chatId, sock, db, winner) {
  const ww = global.werewolfGames;
  if (!ww[chatId]) return;

  if (ww[chatId].timeout) clearTimeout(ww[chatId].timeout);

  const winningEquipo = winner === "wolf" ? "wolf" : "village";
  const winningJugadors = ww[chatId].players.filter(
    (p) => ROLS[p.role]?.team === winningEquipo,
  );

  // Give rewards to winners
  for (const player of winningJugadors) {
    try {
      db.updateKoin(player.id, WIN_REWARD.koin);
      const user = db.getUser(player.id);
      if (user) {
        user.exp = (user.exp || 0) + WIN_REWARD.exp;
        db.setUser(player.id, user);
      }
    } catch (e) {
      console.log(`[WW] Failed to give reward to ${player.id}:`, e.message);
    }
  }

  const allJugadors = ww[chatId].players
    .map((p) => {
      const status = p.alive ? "✅" : "☠️";
      const isWinner = winningJugadors.some((w) => w.id === p.id) ? "🏆" : "";
      return `${status} @${p.id.split("@")[0]} - ${ROLS[p.role].emoji} ${ROLS[p.role].name} ${isWinner}`;
    })
    .join("\n");

  const endText =
    `🎉 *FIN DEL JUEGO!*\n\n` +
    `${winner === "wolf" ? "🐺 *GANAN LOS WEREWOLF!*" : "👨‍🌾 *GANAN LOS ALDEANOS!*"}\n\n` +
    `╭┈┈⬡「 👥 *TODOS LOS JUGADORES* 」\n` +
    `${allJugadors
      .split("\n")
      .map((l) => `┃ ${l}`)
      .join("\n")}\n` +
    `╰┈┈┈┈┈┈┈┈⬡\n\n` +
    `╭┈┈⬡「 🎁 *RECOMPENSAS* 」\n` +
    `┃ 💰 +${WIN_REWARD.koin.toLocaleString()} Koin\n` +
    `┃ ⭐ +${WIN_REWARD.exp.toLocaleString()} EXP\n` +
    `╰┈┈┈┈┈┈┈┈⬡\n\n` +
    `> GG WP! Jugar otra vez? \`${config.command?.prefix || "."}ww create\``;

  await sendWW(
    sock,
    chatId,
    endText,
    "🏆 FIN DEL JUEGO",
    `${winner === "wolf" ? "Werewolf" : "Aldeanos"} ganan!`,
    thumbWin,
    ww[chatId].players.map((p) => p.id),
  );

  delete ww[chatId];
}

// Night action handler for PM commands
async function nightActionHandler(m, { sock }) {
  const db = getDatabase();
  const ww = global.werewolfGames;
  const prefix = m.prefix || config.command?.prefix || ".";

  // Find the game this player is in
  const chatId = Object.keys(ww).find(
    (id) =>
      ww[id].players.some((p) => p.id === m.sender && p.alive) &&
      ww[id].phase === "night",
  );

  if (!chatId) {
    return m.reply(
      `❌ No estas en una partida de werewolf o no es fase de noche!`,
    );
  }

  const game = ww[chatId];
  const player = game.players.find((p) => p.id === m.sender);
  if (!player || !player.alive) {
    return m.reply(`❌ Ya estas muerto o no eres jugador!`);
  }

  // Check if skill already used
  if (player.skillUsed) {
    return m.reply(`❌ Ya usaste tu habilidad esta noche!`);
  }

  const cmd = m.command?.toLowerCase();
  const targetNum = parseInt(m.args?.[0]);

  if (isNaN(targetNum)) {
    return m.reply(`❌ Ingresa el numero del objetivo! Ejemplo: \`${prefix}${cmd} 2\``);
  }

  const targetJugador = game.players.find(
    (p) => p.number === targetNum && p.alive,
  );
  if (!targetJugador) {
    return m.reply(`❌ Objetivo no valido o ya muerto!`);
  }

  // Process based on command and role
  if (cmd === "wwkill" && player.role === "werewolf") {
    if (targetJugador.role === "werewolf" || targetJugador.role === "sorcerer") {
      return m.reply(`❌ No puedes matar a alguien de tu equipo!`);
    }
    game.nightActions.kill = targetJugador.id;
    player.skillUsed = true;
    await m.reply(
      `🐺 *OBJETIVO ELEGIDO*\n\n` +
        `Target: @${targetJugador.id.split("@")[0]}\n` +
        `> Esperando a que termine la noche...`,
      { mentions: [targetJugador.id] },
    );
    return true;
  }

  if (cmd === "wwprotect" && player.role === "guardian") {
    game.nightActions.protect = targetJugador.id;
    player.skillUsed = true;
    await m.reply(
      `🛡️ *OBJETIVO PROTEGIDO*\n\n` +
        `Protegiendo: @${targetJugador.id.split("@")[0]}\n` +
        `> Esperando a que termine la noche...`,
      { mentions: [targetJugador.id] },
    );
    return true;
  }

  if (cmd === "wwsee" && player.role === "seer") {
    const roleInfo = ROLS[targetJugador.role];
    player.skillUsed = true;
    await m.reply(
      `🔮 *RESULTADO DE VISION*\n\n` +
        `@${targetJugador.id.split("@")[0]} es:\n` +
        `${roleInfo.emoji} *${roleInfo.name}*\n\n` +
        `> Equipo: ${roleInfo.team === "wolf" ? "🐺 Werewolf" : "👨‍🌾 Aldea"}`,
      { mentions: [targetJugador.id] },
    );
    return true;
  }

  if (cmd === "wwsorcerer" && player.role === "sorcerer") {
    const isSeer = targetJugador.role === "seer";
    player.skillUsed = true;
    await m.reply(
      `🧙 *RESULTADO DE INVESTIGACION*\n\n` +
        `@${targetJugador.id.split("@")[0]}\n` +
        `${isSeer ? "✅ *es VIDENTE!*" : "❌ *no es Vidente*"}\n\n` +
        `> Sigue ayudando a los Werewolf!`,
      { mentions: [targetJugador.id] },
    );
    return true;
  }

  // Wrong role for command
  return m.reply(
    `❌ No tienes esta habilidad!\n> Tu rol: ${ROLS[player.role]?.name || "Desconocido"}`,
  );
}

export { pluginConfig as config, handler, nightActionHandler, ROLS, sendWW };
