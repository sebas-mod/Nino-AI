import config from "../../config.js";
import { saluranCtx } from "../../src/lib/ourin-context.js";
import te from "../../src/lib/ourin-error.js";

const pluginConfig = {
  name: "join",
  alias: ["joingrupos", "joingroup", "gabung"],
  category: "owner",
  description: "El bot entra a grupos mediante link de invitacion y soporta responder mensajes que contengan link",
  usage: ".join <link> / .join (responde a un mensaje berisi link)",
  example: ".join https://chat.whatsapp.com/xxx",
  isOwner: true,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 10,
  energi: 0,
  isEnabled: true,
};

function extractAllInviteCodes(text) {
  if (!text) return [];
  const codes = [];
  const seen = new Set();

  const patterns = [
    /chat\.whatsapp\.com\/([a-zA-Z0-9]{20,})/gi,
    /invite\.whatsapp\.com\/([a-zA-Z0-9]{20,})/gi,
  ];

  for (const pattern of patterns) {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      const code = match[1];
      if (!seen.has(code)) {
        seen.add(code);
        codes.push(code);
      }
    }
  }

  return codes;
}

async function joinGroup(sock, inviteCode) {
  const groupInfo = await sock.groupGetInviteInfo(inviteCode);
  if (!groupInfo) return { success: false, error: "No dapat mengambil info grupos" };

  const botJid = sock.user?.id?.replace(/:.*@/, "@") || "";
  const isMember = groupInfo.participants?.some(
    (p) => p.id === botJid || p.id?.includes(sock.user?.id?.split(":")[0]),
  );

  if (isMember) {
    return {
      success: false,
      alreadyMember: true,
      subject: groupInfo.subject || "Desconocido",
    };
  }

  await sock.groupAcceptInvite(inviteCode);
  return {
    success: true,
    subject: groupInfo.subject || "Desconocido",
    members: groupInfo.size || groupInfo.participants?.length || 0,
    owner: groupInfo.owner?.split("@")[0] || "Desconocido",
  };
}

async function handler(m, { sock }) {
  const input = m.args.join(" ").trim();
  let sourceText = input;

  if (!input && m.quoted) {
    sourceText = m.quoted.body || m.quoted.text || m.quoted.contentText || "";
  }

  if (!sourceText) {
    return m.reply(
      `🔗 *Join Grup*\n\n` +
        `El bot entrara al grupo segun el link de invitacion que proporciones.\n\n` +
        `*PENGGUNAAN:*\n` +
        `> *${m.prefix}join <link>* — Join via link langsung\n` +
        `> *${m.prefix}join* (responde a un mensaje) — Entrar desde el link del mensaje respondido\n\n` +
        `*CONTOH:*\n` +
        `> *${m.prefix}join https://chat.whatsapp.com/xxx*\n` +
        `> Reply mensaje berisi link lalu escribe *${m.prefix}join*\n\n` +
        `_El bot detectara todos los links de grupo en el mensaje y entrara uno por uno_`
    );
  }

  const inviteCodes = extractAllInviteCodes(sourceText);

  if (inviteCodes.length === 0) {
    return m.reply(
      `❌ *No Ada Link Grup*\n\n` +
        `> El bot no encontro links de invitacion de grupo en ese mensaje.\n\n` +
        `*Formatos de link compatibles:*\n` +
        `> *https://chat.whatsapp.com/xxx*\n` +
        `> *https://invite.whatsapp.com/xxx*`
    );
  }

  m.react("🕕");

  if (inviteCodes.length === 1) {
    try {
      const result = await joinGroup(sock, inviteCodes[0]);

      if (result.alreadyMember) {
        m.react("❌");
        return m.reply(
          `❌ *Ya es miembro*\n\n> El bot ya esta en el grupo *${result.subject}*`
        );
      }

      if (!result.success) {
        m.react("❌");
        return m.reply(`❌ *Fallo: Join*\n\n> ${result.error}`);
      }

      m.react("✅");
      const ctx = saluranCtx();
      return m.reply(
        `✅ *Correcto: Join!*\n\n` +
          `> 🏠 Nombre: *${result.subject}*\n` +
          `> 👥 Member: *${result.members}*\n` +
          `> 👤 Owner: *${result.owner}*`,
        { contextInfo: ctx }
      );
    } catch (error) {
      m.react("❌");
      let errorMsg = error.message;
      if (errorMsg.includes("not-authorized")) errorMsg = "El link ya no es valido o expiro";
      else if (errorMsg.includes("gone")) errorMsg = "El grupo ya no existe";
      else if (errorMsg.includes("conflict")) errorMsg = "El bot ya es miembro";
      return m.reply(`❌ *Fallo: Join*\n\n> ${errorMsg}`);
    }
  }

  let resultText =
    `🔗 *Multi Join — ${inviteCodes.length} Link Terdeteksi*\n\n` +
    `El bot entrara a todos los grupos uno por uno.\n\n`;

  let successCount = 0;
  let alreadyCount = 0;
  let failedCount = 0;

  for (let i = 0; i < inviteCodes.length; i++) {
    try {
      const result = await joinGroup(sock, inviteCodes[i]);

      if (result.alreadyMember) {
        alreadyCount++;
        resultText += `*${i + 1}.* ${result.subject} — ⚠️ Ya es miembro\n`;
      } else if (result.success) {
        successCount++;
        resultText += `*${i + 1}.* ${result.subject} — ✅ Correcto: join\n`;
      } else {
        failedCount++;
        resultText += `*${i + 1}.* ${inviteCodes[i].substring(0, 12)}... — ❌ ${result.error}\n`;
      }
    } catch (error) {
      failedCount++;
      let errorMsg = error.message;
      if (errorMsg.includes("not-authorized")) errorMsg = "Link vencido";
      else if (errorMsg.includes("gone")) errorMsg = "El grupo no existe";
      else if (errorMsg.includes("conflict")) errorMsg = "Ya es miembro";
      resultText += `*${i + 1}.* ${inviteCodes[i].substring(0, 12)}... — ❌ ${errorMsg}\n`;
    }

    if (i < inviteCodes.length - 1) {
      await new Promise((r) => setTimeout(r, 2000));
    }
  }

  resultText +=
    `\n*Hasil:*\n` +
    `> ✅ Correctos: *${successCount}*\n` +
    `> ⚠️ Ya es miembro: *${alreadyCount}*\n` +
    `> ❌ Fallidos: *${failedCount}*\n` +
    `> 📊 Total: *${inviteCodes.length}*`;

  m.react(successCount > 0 ? "✅" : "❌");
  return m.reply(resultText);
}

export { pluginConfig as config, handler };
