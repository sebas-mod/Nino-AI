import config from "../../config.js";
import te from "../../src/lib/ourin-error.js";
import { sendToolsPreview } from "../../src/lib/ourin-context.js";
const pluginConfig = {
  name: "lookup",
  alias: ["dnslookup", "dns", "whois"],
  category: "tools",
  description: "Consulta DNS para dominios",
  usage: ".lookup <domain>",
  example: ".lookup google.com",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 5,
  energi: 1,
  isEnabled: true,
};

async function handler(m, { sock }) {
  let domain = m.args?.[0];

  if (!domain) {
    return m.reply(
      `⚠️ *ᴄᴀʀᴀ ᴘᴀᴋᴀɪ*\n\n` +
        `> \`${m.prefix}lookup <domain>\`\n\n` +
        `> Ejemplo:\n` +
        `> \`${m.prefix}lookup google.com\``,
    );
  }

  domain = domain.replace(/^(https?:\/\/)?(www\.)?/, "").split("/")[0];

  if (
    !/^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]?(\.[a-zA-Z]{2,})+$/.test(domain)
  ) {
    return m.reply(`❌ *ғᴏʀᴍᴀᴛ ᴛɪᴅᴀᴋ ᴠᴀʟɪᴅ*\n\n> Ejemplo: \`google.com\``);
  }

  await m.react("🕕");
  await m.reply(`🕕 *ᴍᴇɴᴄᴀʀɪ ɪɴꜰᴏ ᴅᴏᴍᴀɪɴ...*`);

  try {
    const [dnsRes, whoisRes] = await Promise.allSettled([
      fetch(`https://api.hackertarget.com/dnslookup/?q=${domain}`).then((r) =>
        r.text(),
      ),
      fetch(`https://api.hackertarget.com/whois/?q=${domain}`).then((r) =>
        r.text(),
      ),
    ]);

    const dnsData = dnsRes.status === "fulfilled" ? dnsRes.value : null;
    const whoisData = whoisRes.status === "fulfilled" ? whoisRes.value : null;

    if (!dnsData && !whoisData) {
      await m.react("❌");
      return m.reply(`❌ *ɢᴀɢᴀʟ*\n\n> No se puede procesar el dominio`);
    }

    let text = `🔍 *ᴅɴs ʟᴏᴏᴋᴜᴘ*\n\n`;
    text += `> Domain: \`${domain}\`\n\n`;

    if (dnsData && !dnsData.includes("error")) {
      const lines = dnsData.split("\n").filter((l) => l.trim());
      const registros = {};

      lines.forEach((line) => {
        const parts = line.split(/\s+/);
        if (parts.length >= 2) {
          const type = parts[parts.length - 2] || "OTHER";
          const value = parts[parts.length - 1];
          if (!registros[type]) registros[type] = [];
          registros[type].push(value);
        }
      });

      text += `╭┈┈⬡「 📋 *ᴅɴs ʀᴇᴄᴏʀᴅs* 」\n`;
      if (registros["A"])
        text += `┃ 🅰️ A: ${registros["A"].slice(0, 3).join(", ")}\n`;
      if (registros["AAAA"])
        text += `┃ 🔢 AAAA: ${registros["AAAA"].slice(0, 2).join(", ")}\n`;
      if (registros["MX"])
        text += `┃ 📧 MX: ${registros["MX"].slice(0, 2).join(", ")}\n`;
      if (registros["NS"])
        text += `┃ 🌐 NS: ${registros["NS"].slice(0, 3).join(", ")}\n`;
      if (registros["TXT"])
        text += `┃ 📝 TXT: ${registros["TXT"].length} registros\n`;
      text += `╰┈┈┈┈┈┈┈┈⬡\n\n`;
    }

    if (whoisData && !whoisData.includes("error") && whoisData.length < 2000) {
      const registrar = whoisData.match(/Registrar:\s*(.+)/i)?.[1] || "-";
      const created = whoisData.match(/Creation Date:\s*(.+)/i)?.[1] || "-";
      const expires = whoisData.match(/Expir.*Date:\s*(.+)/i)?.[1] || "-";
      const nameservers =
        whoisData
          .match(/Name Server:\s*(.+)/gi)
          ?.slice(0, 2)
          .map((ns) => ns.split(":")[1]?.trim()) || [];

      text += `╭┈┈⬡「 📄 *ᴡʜᴏɪs* 」\n`;
      text += `┃ 🏢 Registrar: ${registrar.slice(0, 35)}\n`;
      text += `┃ 📅 Creado: ${created.slice(0, 20)}\n`;
      text += `┃ ⏰ Expira: ${expires.slice(0, 20)}\n`;
      if (nameservers.length > 0)
        text += `┃ 🌐 NS: ${nameservers.join(", ")}\n`;
      text += `╰┈┈┈┈┈┈┈┈⬡`;
    }

    await m.react("✅");
    await sendToolsPreview(sock, m.chat, text, "🔍 *ᴅɴs ʟᴏᴏᴋᴜᴘ*", domain, {
      quoted: m,
    });
  } catch (e) {
    await m.react("☢");
    m.reply(te(m.prefix, m.command, m.pushName));
  }
}

export { pluginConfig as config, handler };
