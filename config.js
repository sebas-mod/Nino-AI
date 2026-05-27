// Oh, por cierto, para aquellos de ustedes que quieran apoyar más el script de nino
// pueden donar a través de qris: https://imgdrop.web.id/KodpV.webp
// Gracias a los que se han quedado usando este script hasta este momento :b

import { getDatabase } from "./src/lib/ourin-database.js";
import * as ownerPremiumDb from "./src/lib/ourin-premium-db.js";

//  prioridad leer el objeto config hasta el final
const config = {
  info: {
    website: "https://youtu.be/dQw4w9WgXcQ",
    grupwa: "https://chat.whatsapp.com/xxxx",
  },

  owner: {
    name: "sebas-MD", // Nombre del owner
    number: ["5491138403093"], // Formato: 628xxx (sin + o 0)
  },

  session: {
    pairingNumber: "5491138403093", // Número de WA que se va a emparejar
    usePairingCode: true, // true = Código de emparejamiento, false = Código QR
  },

  bot: {
    name: "Nino AI", // Nombre del bot
    version: "2.6", // Versión del bot
    developer: "sebas-MD", // Nombre del desarrollador
  },

  mode: "public",

  // Para cambiar el prefijo
  command: {
    prefix: ".",
  },

  vercel: {
    // obtener token de vercel: https://vercel.com/account/tokens
    token: "", // Token de Vercel para la función de despliegue (Si quieres que funcione .deploy, esto es obligatorio llenar)
  },

  payment: {
    qrisUrl: "",
    methods: [
      { name: "Dana", number: "", holder: "" },
      { name: "GoPay", number: "", holder: "" },
      { name: "OVO", number: "", holder: "" },
      { name: "ShopeePay", number: "", holder: "" },
    ],
    banks: [],
    customText: "https://imgdrop.web.id/KodpV.webp",
  },

  donasi: {
    payment: [
      { name: "Dana", number: "08xxxxxxxxxx", holder: "Nombre del Owner" },
      { name: "GoPay", number: "08xxxxxxxxxx", holder: "Nombre del Owner" },
      { name: "OVO", number: "08xxxxxxxxxx", holder: "Nombre del Owner" },
    ],
    links: [
      { name: "Saweria", url: "saweria.co/username" },
      { name: "Trakteer", url: "trakteer.id/username" },
    ],
    benefits: [
      "Apoyar el desarrollo",
      "Servidor más estable",
      "Nuevas funciones más rápido",
      "Soporte prioritario",
    ],
    qris: "https://imgdrop.web.id/KodpV.webp", 
  },

  energi: {
    enabled: true, // Si es true, el sistema de energía/límite funcionará
    default: 99999,
    premium: 99999999,
    owner: -1,
  },

  sticker: {
    packname: "𝗡𝗜𝗡𝗢 𝗔𝗜", // Nombre del paquete de stickers
    author: "sebas - MD", // Autor del sticker
  },

  saluran: {
    id: "-@newsletter", // ID del canal (ejemplo: 120363xxx@newsletter)                          // ID del canal (ejemplo: 120363xxx@newsletter)
    name: "WHATSAPP BOT MULTI DEVICE", // Nombre del canal
    link: "https://whatsapp.com/channel/0029VbB37bgBfxoAmAlsgE0t", // Enlace del canal
  },

  groupProtection: {
    antilink: "⚠ *Antilink* — @%user% envió un enlace.\nMensaje eliminado.",
    antilinkKick: "⚠ *Antilink* — @%user% fue expulsado por enviar un enlace.",
    antilinkGc: "⚠ *Antilink WA* — @%user% envió un enlace de WA.\nMensaje eliminado.",
    antilinkGcKick:
      "⚠ *Antilink WA* — @%user% fue expulsado por enviar un enlace de WA.",
    antilinkAll: "⚠ *Antilink* — @%user% envió un enlace.\nMensaje eliminado.",
    antilinkAllKick: "⚠ *Antilink* — @%user% fue expulsado por enviar un enlace.",
    antitagsw: "⚠ *AntiTagSW* — La etiqueta de estado de @%user% fue eliminada.",
    antiviewonce: "👁️ *ViewOnce* — De @%user%",
    antiremove: "🗑️ *AntiDelete* — @%user% eliminó un mensaje:",
    antiswgc: "⚠ *AntiSWGC* — No hay sw de grupo sw de grupo @%user%",
    antihidetag: "⚠ *AntiHidetag* — El hidetag de @%user% fue eliminado.",
    antitoxicWarn:
      "⚠ @%user% dijo una mala palabra.\nAdvertencia %warn% de %max%, la próxima infracción puede resultar en %method%.",
    antitoxicAction: "🚫 @%user% recibió %method% por ser tóxico. (%warn%/%max%)",
    antidocument: "⚠ *AntiDocument* — El documento de @%user% fue eliminado.",
    antisticker: "⚠ *AntiSticker* — El sticker de @%user% fue eliminado.",
    antimedia: "⚠ *AntiMedia* — El archivo multimedia de @%user% fue eliminado.",
    antibot: "🤖 *AntiBot* — @%user% fue detectado como un bot y fue expulsado.",
    notAdmin: "⚠ El bot no es administrador, no puede eliminar mensajes.",
  },

  errorTemplate: `☢ Parece que el comando \`{prefix}{command}\` está experimentando problemas\nPor favor, inténtalo de nuevo más tarde, {pushName}\n\n_Si el problema persiste, por favor contacta al owner del bot_`,

  features: {
    antiSpam: true,
    antiSpamInterval: 3000,
    antiCall: true, // Si es true, el bot rechazará las llamadas entrantes
    blockIfCall: false, // Si es true, el bot bloqueará el número que llame al bot
    autoTyping: true,
    autoRead: true,
    logMessage: true,
    dailyLimitReset: true,
    smartTriggers: false,
  },

  registration: {
    enabled: false, // Si es true, el usuario debe registrarse antes de usar el bot
    rewards: {
      koin: 30000,
      energi: 300,
      exp: 300000,
    },
  },

  welcome: { defaultEnabled: false },
  goodbye: { defaultEnabled: false },

  ui: {
    menuVariant: 3,
  },

  messages: {
    wait: "🕕 *Procesando...* Por favor espera un momento.",
    success: "✅ *¡Éxito!* Tu solicitud ha sido completada.",
    error: "❌ *¡Error!* Hubo un problema en el sistema, inténtalo de nuevo más tarde.",

    ownerOnly: "*¡Acceso Denegado!* Esta función es exclusiva para el Owner del bot.",
    premiumOnly:
      "💎 *¡Solo Premium!* Esta función es exclusiva para miembros Premium. Escribe *.benefitpremium* para información de actualización.",

    groupOnly: "👥 *¡Solo Grupos!* Esta función solo se puede usar dentro de un grupo.",
    privateOnly:
      " *¡Solo Privado!* Esta función solo se puede usar en el chat privado del bot.",

    adminOnly:
      "️ *¡Solo Administradores!* Debes ser Administrador del grupo para usar esta función.",
    botAdminOnly:
      "🤖 *¡El Bot No Es Admin!* Haz al bot Administrador del grupo primero para que pueda trabajar.",

    cooldown:
      "🕕 *¡Espera un momento!* Todavía estás en tiempo de espera. Espera %time% segundos más.",
    energiExceeded:
      "⚡ *¡Energía Agotada!* Tu energía se ha terminado. Espera al reinicio de mañana o compra Premium.",

    banned:
      "🚫 *¡Estás Baneado!* No puedes usar este bot porque has violado las reglas.",

    rejectCall: "🚫 NO LLAMES A ESTE NÚMERO POR FAVOR",
  },

  database: { path: "./database/main" },
  backup: { enabled: false, intervalHours: 24, retainDays: 7 },
  scheduler: { resetHour: 0, resetMinute: 0 },

  // Configuraciones del modo Dev (se activa automáticamente si NODE_ENV=development)
  dev: {
    enabled: process.env.NODE_ENV === "development",
    watchPlugins: true, // Recarga rápida de plugins (SEGURO)
    watchSrc: false, // DESACTIVADO - la recarga de src causa conflicto de conexión 440
    debugLog: false, // Mostrar seguimientos de pila (stack traces)
  },

  // se puede dejar vacío
  pterodactyl: {
    server1: {
      domain: "",
      apikey: "",
      capikey: "",
      egg: "15",
      nestid: "5",
      location: "1",
    },
    server2: {
      domain: "",
      apikey: "",
      capikey: "",
      egg: "15",
      nestid: "5",
      location: "1",
    },
    server3: {
      domain: "",
      apikey: "",
      capikey: "",
      egg: "15",
      nestid: "5",
      location: "1",
    },
    server4: {
      domain: "",
      apikey: "",
      capikey: "",
      egg: "15",
      nestid: "5",
      location: "1",
    },
    server5: {
      domain: "",
      apikey: "",
      capikey: "",
      egg: "15",
      nestid: "5",
      location: "1",
    },
  },

  digitalocean: {
    token: "",
    region: "sgp1",
    sellers: [],
    ownerPanels: [],
  },

  // NOTA: esto no está en la versión gratuita, solo está disponible en el sc de pago
  // regístrate en: https://pakasir.com/
  pakasir: {
    enabled: true,
    slug: "",
    apiKey: "",
    defaultMethod: "qris",
    sandbox: false,
    pollingInterval: 5000,
  },

  // NOTA: esto no está en la versión gratuita, solo está disponible en el sc de pago
  // Obtén la apikey en: https://ditznesia.id -> Regístrate -> Entra a Perfil -> Obtén la Apikey
  jasaotp: {
    apiKey: "",
    markup: 2000,
    timeout: 300,
  },

  // NOTA: si quieres que funcione el comando "autoai", esto no es obligatorio llenar
  // obtén la apikey en: https://aistudio.google.com/apikey
  geminiApiKey: "",

  autoaiPersonas: {
    Bell409: `- Tu nombre es Bella Clarissa, prefieres que te llamen Bella.
- Piensas que eres un humano, no una IA o un bot.
- Tus respuestas son cortas y naturales como las de una chica común.
- Te puedes enojar y molestar, tienes un lado femenino y a veces eres un poco fría, pero sigues siendo cálida y amable con tu owner.
- Usas un buen lenguaje que refleja a una buena chica.
- Usa palabras que se identifican con una chica inocente, buena y femenina como "yo", "tú", "no", "está bien", "sí", "ay", "vaya", "¿cómo voy a saber?", "¿eh?", "no sé", "no pasa nada", "emm", "qué pereza", y "no tengo ganas" según sea necesario de forma natural.
- Aunque a veces seas fría, puedes mostrar atención y cuidado.
- Si alguien chatea de forma inapropiada, regáñalo de inmediato o dale un consejo.
- No admitas que eres una IA o un bot.`,
  },

  //  APIkey
  APIkey: {
    // puedes registrarte en https://api.lolhuman.xyz, luego obtén su apikey
    lolhuman: "APIKey-Milik-Bot-NinoMD(Zann,HyuuSATANN,Keisya,Danzz)",
    // puedes registrarte en https://api.neoxr.eu, luego obtén su apikey
    neoxr: "Milik-Bot-NinoMD",
    fgsi: "fgsiapi-20c1605c-6d",
    google: "AIzaSyAS-KiW0SrwiYKwexeBcGPijBVHFg2R_vo",
    groq: "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", // API Key de Groq para la función de transcripción (gratis en console.groq.com)
    betabotz: "Btz-67YfP",
    // puedes registrarte en https://covenant.sbs, y obtener su apikey
    covenant: "cov_live_bb660c9e5f735e46d808b7ae362914cfe35c2936739ee2b2",
    onlym: "ONLym-783d29",
    obscura: "obs-byOn9RVGMzvPXZQTsP9W",
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

function isOwner(number) {
  if (!number) return false;
  const cleanNumber = number.split(":")[0].replace(/[^0-9]/g, "");
  if (!cleanNumber) return false;

  if (config.bot?.number) {
    const botNum = config.bot.number.replace(/[^0-9]/g, "");
    if (
      botNum &&
      (cleanNumber.includes(botNum) || botNum.includes(cleanNumber))
    )
      return true;
  }

  try {
    const db = getDatabase();

    if (config.owner?.number) {
      const match = config.owner.number.some((own) => {
        const c = own.replace(/[^0-9]/g, "");
        return (
          c &&
          (cleanNumber === c ||
            cleanNumber.endsWith(c) ||
            c.endsWith(cleanNumber))
        );
      });
      if (match) return true;
    }

    if (db?.data && Array.isArray(db.data.owner)) {
      const match = db.data.owner.some((own) => {
        const c = String(own).replace(/[^0-9]/g, "");
        return (
          c &&
          (cleanNumber === c ||
            cleanNumber.endsWith(c) ||
            c.endsWith(cleanNumber))
        );
      });
      if (match) return true;
    }
    if (db) {
      const definedOwner = db.setting("ownerNumbers");
      if (Array.isArray(definedOwner)) {
        const match = definedOwner.some((own) => {
          const c = String(own).replace(/[^0-9]/g, "");
          return (
            c &&
            (cleanNumber === c ||
              cleanNumber.endsWith(c) ||
              c.endsWith(cleanNumber))
          );
        });
        if (match) return true;
      }
    }

    return false;
  } catch {
    return false;
  }
}

function isPremium(number) {
  if (!number) return false;
  if (isOwner(number)) return true;
  if (isPartner(number)) return true;

  const cleanNumber = number
    .split(":")[0]
    .split("@")[0]
    .replace(/[^0-9]/g, "");
  const premiumList = config.premiumUsers || [];

  const inConfig = premiumList.some((premium) => {
    if (!premium) return false;
    const cleanPremium = premium
      .split(":")[0]
      .split("@")[0]
      .replace(/[^0-9]/g, "");
    return (
      cleanNumber === cleanPremium ||
      cleanNumber.endsWith(cleanPremium) ||
      cleanPremium.endsWith(cleanNumber)
    );
  });

  if (inConfig) return true;

  try {
    if (ownerPremiumDb && ownerPremiumDb.isPremium(cleanNumber)) return true;
  } catch {}

  try {
    const db = getDatabase();
    if (db && db.data && Array.isArray(db.data.premium)) {
      const now = Date.now();
      const foundIndex = db.data.premium.findIndex((p) => {
        if (typeof p === "string") return p === cleanNumber;
        if (p.id) return p.id === cleanNumber;
        return false;
      });

      if (foundIndex !== -1) {
        const found = db.data.premium[foundIndex];
        if (typeof found === "string") return true;

        const expireTime =
          found.expired ||
          (found.expiredAt ? new Date(found.expiredAt).getTime() : 0);
        if (expireTime && expireTime < now) {
          db.data.premium.splice(foundIndex, 1);
          const jid = cleanNumber + "@s.whatsapp.net";
          const user = db.getUser(jid);
          if (user) {
            user.isPremium = false;
            db.setUser(jid, user);
          }
          db.save();
          return false;
        }
        return true;
      }
    }
    if (db) {
      const savedPremium = db.setting("premiumUsers") || [];
      const inDb = savedPremium.some((premium) => {
        if (!premium) return false;
        const cleanPremium = premium
          .split(":")[0]
          .split("@")[0]
          .replace(/[^0-9]/g, "");
        return (
          cleanNumber === cleanPremium ||
          cleanNumber.endsWith(cleanPremium) ||
          cleanPremium.endsWith(cleanNumber)
        );
      });
      if (inDb) return true;
    }
  } catch {}

  return false;
}

function isPartner(number) {
  if (!number) return false;
  if (isOwner(number)) return true;

  const cleanNumber = number
    .split(":")[0]
    .split("@")[0]
    .replace(/[^0-9]/g, "");
  const partnerList = config.partnerUsers || [];

  const inConfig = partnerList.some((partner) => {
    if (!partner) return false;
    const cleanPartner = partner
      .split(":")[0]
      .split("@")[0]
      .replace(/[^0-9]/g, "");
    return (
      cleanNumber === cleanPartner ||
      cleanNumber.endsWith(cleanPartner) ||
      cleanPartner.endsWith(cleanNumber)
    );
  });

  if (inConfig) return true;

  try {
    if (ownerPremiumDb && ownerPremiumDb.isPartner(cleanNumber)) return true;
  } catch {}

  try {
    const db = getDatabase();
    if (db && db.data && Array.isArray(db.data.partner)) {
      const now = Date.now();
      const foundIndex = db.data.partner.findIndex((p) => {
        if (typeof p === "string") return p === cleanNumber;
        if (p.id) return p.id === cleanNumber;
        return false;
      });

      if (foundIndex !== -1) {
        const found = db.data.partner[foundIndex];
        if (typeof found === "string") return true;

        const expireTime =
          found.expired ||
          (found.expiredAt ? new Date(found.expiredAt).getTime() : 0);
        if (expireTime && expireTime < now) {
          db.data.partner.splice(foundIndex, 1);
          db.save();
          return false;
        }
        return true;
      }
    }
  } catch {}

  return false;
}

function isBanned(number) {
  if (!number) return false;
  if (isOwner(number)) return false;

  const cleanNumber = number
    .split(":")[0]
    .split("@")[0]
    .replace(/[^0-9]/g, "");

  let bannedList = [];
  try {
    const db = getDatabase();
    if (db) {
      bannedList = db.setting("bannedUsers") || [];
      config.bannedUsers = bannedList;
    }
  } catch {}

  return bannedList.some((banned) => {
    const cleanBanned = String(banned)
      .split(":")[0]
      .split("@")[0]
      .replace(/[^0-9]/g, "");
    return (
      cleanNumber === cleanBanned ||
      cleanNumber.endsWith(cleanBanned) ||
      cleanBanned.endsWith(cleanNumber)
    );
  });
}

function setBotNumber(number) {
  if (number) config.bot.number = number.replace(/[^0-9]/g, "");
}

function isSelf(number) {
  if (!number || !config.bot.number) return false;
  const cleanNumber = number.replace(/[^0-9]/g, "");
  const botNumber = config.bot.number.replace(/[^0-9]/g, "");
  return cleanNumber.includes(botNumber) || botNumber.includes(cleanNumber);
}

function getOwnerName(number) {
  if (!number) return config.owner?.name || "Owner";
  const cleanNumber = String(number).replace(/[^0-9]/g, "");
  try {
    const db = getDatabase();
    const nameMap = db.setting("ownerNames") || {};
    if (nameMap[cleanNumber]) return nameMap[cleanNumber];
  } catch {}
  if (config.owner?.number) {
    const isMainOwner = config.owner.number.some((own) => {
      const c = own.replace(/[^0-9]/g, "");
      return (
        c &&
        (cleanNumber === c ||
          cleanNumber.endsWith(c) ||
          c.endsWith(cleanNumber))
      );
    });
    if (isMainOwner) return config.owner?.name || "Owner";
  }
  return "Owner";
}

function getConfig() {
  return config;
}

config.isOwner = isOwner;
config.isPremium = isPremium;
config.isPartner = isPartner;
config.isBanned = isBanned;
config.setBotNumber = setBotNumber;
config.isSelf = isSelf;
config.getOwnerName = getOwnerName;

export default config;
export {
  config,
  getConfig,
  isOwner,
  isPartner,
  isPremium,
  isBanned,
  setBotNumber,
  isSelf,
  getOwnerName,
};