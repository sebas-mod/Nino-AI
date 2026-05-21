import config from "../../config.js";
import te from "../../src/lib/ourin-error.js";

const pluginConfig = {
  name: "confess",
  alias: ["confession", "menfess", "anonim"],
  category: "fun",
  description: "Envia un mensaje anonimo a alguien",
  usage: ".confess numero|mensaje",
  example: ".confess 6281234567890|Hola, me gustas!",
  isOwner: false,
  isPremium: true,
  isGroup: false,
  isPrivate: false,
  cooldown: 60,
  energi: 1,
  isEnabled: true,
};

if (!global.confessData) global.confessData = new Map();

async function handler(m, { sock }) {
  const input = m.fullArgs?.trim() || m.text?.trim();

  if (!input || !input.includes("|")) {
    let txt = `💌 *SERVICIO MENFESS ANONIMO* 💌\n\n`;
    txt += `Quieres enviar un mensaje secreto a tu crush o a un amigo sin que sepan quien eres? Claro que si!\n\n`;
    txt += `*Como usar:*\n`;
    txt += `👉 \`${m.prefix}confess numero|mensaje\`\n\n`;
    txt += `*Ejemplo:*\n`;
    txt += `> \`${m.prefix}confess 6281234567890|Hola, me encanta tu sonrisa!\`\n\n`;
    txt += `> 🤫 _Tranquilo, tu identidad esta 100% segura y en secreto!_`;
    return m.reply(txt);
  }

  const [rawNumber, ...messageParts] = input.split("|");
  const message = messageParts.join("|").trim();

  if (!rawNumber || !message) {
    return m.reply(`El formato esta mal! 😅\n\nPrueba asi: \`${m.prefix}confess numero|mensaje\``);
  }

  let targetNumber = rawNumber.trim().replace(/[^0-9]/g, "");

  if (targetNumber.startsWith("0")) {
    targetNumber = "62" + targetNumber.slice(1);
  }

  if (targetNumber.length < 10 || targetNumber.length > 15) {
    return m.reply(`Hmm, el numero de destino que ingresaste no parece valido! 🤔`);
  }

  const targetJid = targetNumber + "@s.whatsapp.net";
  const senderNumber = m.sender.split("@")[0];

  if (targetNumber === senderNumber) {
    return m.reply(`No puedes enviarte un menfess a ti mismo. Mandaselo a otra persona! 😂`);
  }

  try {
    const [onWa] = await sock.onWhatsApp(targetNumber);
    if (!onWa?.exists) {
      return m.reply(`El numero \`${targetNumber}\` no esta registrado en WhatsApp! 😔`);
    }
  } catch (e) {}

  if (message.length < 5) {
    return m.reply(`El mensaje es demasiado corto! Minimo 5 caracteres para que tenga sentido. 📝`);
  }

  if (message.length > 1000) {
    return m.reply(`El mensaje es demasiado largo! Maximo 1000 caracteres para que sea facil de leer. 📜`);
  }

  const confessText = `💌 *TIENES UN MENSAJE SECRETO!* 💌\n\n` +
    `Shh.. Alguien te envio un mensaje en secreto:\n\n` +
    `💬 *Contenido del mensaje:*\n` +
    `\`\`\`${message}\`\`\`\n\n` +
    `> 🔒 _Este mensaje fue enviado de forma anonima (la identidad del remitente esta oculta)._\n` +
    `> ✉️ _Puedes responder este mensaje! Solo haz *REPLY* al mensaje!_`;

  try {
    const sentMsg = await sock.sendMessage(targetJid, {
      text: confessText,
      contextInfo: {
        forwardingScore: 99,
        isForwarded: true,
      },
    });

    global.confessData.set(sentMsg.key.id, {
      senderJid: m.sender,
      senderChat: m.chat,
      targetJid: targetJid,
      createdAt: Date.now(),
    });

    setTimeout(() => {
      global.confessData.delete(sentMsg.key.id);
    }, 24 * 60 * 60 * 1000);

    let successTxt = `✅ *MENFESS ENVIADO CORRECTAMENTE!* ✅\n\n`;
    successTxt += `> 📱 Enviado a: \`${targetNumber}\`\n`;
    successTxt += `> 🔒 Tu identidad esta segura!\n\n`;
    successTxt += `> _Si responde el mensaje, lo reenviare aqui directamente! Tranquilo_ 😉`;
    await m.reply(successTxt);
  } catch (error) {
    m.reply(te(m.prefix, m.command, m.pushName));
  }
}

async function replyHandler(m, { sock }) {
  if (!m.quoted) return false;

  const quotedId = m.quoted?.id || m.quoted?.key?.id;
  if (!quotedId) return false;

  const confessInfo = global.confessData.get(quotedId);
  if (!confessInfo) return false;

  if (m.sender !== confessInfo.targetJid) return false;

  const replyMessage = m.body?.trim();
  if (!replyMessage) return false;

  const saluranId = config.saluran?.id || "120363400911374213@newsletter";
  const saluranName = config.saluran?.name || config.bot?.name || "Ourin-AI";

  const replyText = `💌 *TIENES UNA RESPUESTA DEL MENFESS!* 💌\n\n` +
    `La persona a la que enviaste el menfess acaba de responder:\n\n` +
    `💬 *Contenido de la respuesta:*\n` +
    `\`\`\`${replyMessage}\`\`\`\n\n` +
    `> 🔒 _Tranquilo, tu identidad sigue segura!_`;

  try {
    await sock.sendMessage(confessInfo.senderChat, {
      text: replyText,
      contextInfo: {
        forwardingScore: 9999,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
          newsletterJid: saluranId,
          newsletterName: saluranName,
          serverMessageId: 127,
        },
      },
    });

    await sock.sendMessage(m.chat, {
      text: `✅ Listo! Ya envie tu respuesta al remitente secreto.`,
    });

    global.confessData.delete(quotedId);
    return true;
  } catch (error) {
    return false;
  }
}

export { pluginConfig as config, handler, replyHandler };
