import crypto from "crypto";
import config, { getOwnerName } from "../../config.js";
import { getDatabase } from "../../src/lib/ourin-database.js";
import {
  proto,
  generateWAMessageFromContent,
  prepareWAMessageMedia,
} from "ourin";
const pluginConfig = {
  name: "owner",
  alias: ["creator", "dev", "developer"],
  category: "main",
  description: "Muestra contacto del owner del bot",
  usage: ".owner",
  example: ".owner",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 10,
  energi: 0,
  isEnabled: true,
};

async function handler(m, { sock, config: botConfig }) {
  const db = getDatabase();
  const ownerType = db.setting("ownerType") || 1;
  const configOwners = botConfig.owner?.number || [];
  const dbOwners = db.data.owner || [];
  const ownerNumbers = [...new Set([...configOwners, ...dbOwners])];
  const botName = botConfig.bot?.name || "Nino AI";

  if (ownerType === 2) {
    const carouselCards = [];

    for (const number of ownerNumbers) {
      const cleanNumber = number.replace(/[^0-9]/g, "");
      const jid = cleanNumber + "@s.whatsapp.net";
      const ownerName = getOwnerName(number);

      let cardMedia = null;
      try {
        const ppUrl = await sock.profilePictureUrl(jid, "image");
        cardMedia = await prepareWAMessageMedia(
          { image: { url: ppUrl } },
          { upload: sock.waUploadToServer },
        );
      } catch {}

      carouselCards.push(
        proto.Message.InteractiveMessage.fromObject({
          header: proto.Message.InteractiveMessage.Header.fromObject({
            title: ownerName,
            hasMediaAttachment: !!cardMedia,
            ...(cardMedia || {}),
          }),
          body: proto.Message.InteractiveMessage.Body.fromObject({
            text: `Reglas:\n- No hagas spam\n- No hagas videollamadas/llamadas sin permiso\n- No lo uses para bugs/baneos`,
          }),
          footer: proto.Message.InteractiveMessage.Footer.fromObject({
            text: botName,
          }),
          nativeFlowMessage:
            proto.Message.InteractiveMessage.NativeFlowMessage.fromObject({
              buttons: [
                {
                  name: "cta_url",
                  buttonParamsJson: JSON.stringify({
                    display_text: "💬 Chatear con Owner",
                    url: `https://wa.me/${cleanNumber}`,
                  }),
                },
              ],
            }),
        }),
      );
    }

    const msg = await generateWAMessageFromContent(
      m.chat,
      {
        viewOnceMessage: {
          message: {
            messageContextInfo: {
              messageSecret: crypto.randomBytes(32),
            },
            interactiveMessage: proto.Message.InteractiveMessage.fromObject({
              body: proto.Message.InteractiveMessage.Body.fromObject({
                text: `Hola *${m.pushName}*\n\nQuieres saber quien es el owner de este bot?\n\nAbajo esta el owner de nuestro bot: ${botName}`,
              }),
              footer: proto.Message.InteractiveMessage.Footer.fromObject({
                text: botName,
              }),
              header: proto.Message.InteractiveMessage.Header.fromObject({
                title: "Informacion del owner",
                hasMediaAttachment: false,
              }),
              carouselMessage:
                proto.Message.InteractiveMessage.CarouselMessage.fromObject({
                  cards: carouselCards,
                  messageVersion: 1,
                  carouselCardType: 1,
                }),
            }),
          },
        },
      },
      { userJid: m.sender, quoted: m.raw },
    );
    await sock.relayMessage(m.chat, msg.message, {
      messageId: msg.key.id,
    });
  } else if (ownerType === 3) {
    const contacts = [];

    for (const number of ownerNumbers) {
      const cleanNumber = number.replace(/[^0-9]/g, "");

      const vcard = `BEGIN:VCARD\nVERSION:3.0\nFN:${getOwnerName(number)} (Owner ${botName})\nTEL;type=CELL;type=VOICE;waid=${cleanNumber}:+${cleanNumber}\nEND:VCARD`;

      contacts.push({ vcard });
    }

    await sock.sendMessage(
      m.chat,
      {
        contacts: {
          displayName: `${botName} Owners`,
          contacts,
        },
      },
      { quoted: m.raw },
    );
  } else {
    const ownerText = `👑 *ᴏᴡɴᴇʀ ɪɴꜰᴏʀᴍᴀᴛɪᴏɴ*\n\n╭┈┈⬡「 📋 *ᴅᴇᴛᴀɪʟ* 」\n┃ ㊗ ɴᴀᴍᴀ: *${ownerNumbers.map((n) => getOwnerName(n)).join(", ")}*\n┃ ㊗ ʙᴏᴛ: *${botName}*\n┃ ㊗ sᴛᴀᴛᴜs: *🟢 En linea*\n╰┈┈⬡\n\n> _Si tienes preguntas o problemas,_\n> _contacta al owner de arriba!_\n> _📞 Tarjeta de contacto abajo._`;

    await m.reply(ownerText);

    for (const number of ownerNumbers) {
      const cleanNumber = number.replace(/[^0-9]/g, "");

      const vcard = `BEGIN:VCARD\nVERSION:3.0\nFN:${getOwnerName(number)} (Owner ${botName})\nTEL;type=CELL;type=VOICE;waid=${cleanNumber}:+${cleanNumber}\nEND:VCARD`;

      await sock.sendMessage(
        m.chat,
        {
          contacts: {
            displayName: getOwnerName(number),
            contacts: [{ vcard }],
          },
        },
        { quoted: m.raw },
      );
    }
  }
}

export { pluginConfig as config, handler };
