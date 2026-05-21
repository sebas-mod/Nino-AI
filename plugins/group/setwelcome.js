import { getDatabase } from "../../src/lib/ourin-database.js";
const pluginConfig = {
  name: "setwelcome",
  alias: ["customwelcome"],
  category: "group",
  description: "Establece un mensaje de bienvenida personalizado",
  usage: ".setwelcome <mensaje>",
  example: ".setwelcome Halo {user}, selamat datang di {group}!",
  isOwner: false,
  isPremium: false,
  isGroup: true,
  isPrivate: false,
  isAdmin: true,
  cooldown: 5,
  energi: 0,
  isEnabled: true,
};

async function handler(m, { sock }) {
  const db = getDatabase();
  const text = m.fullArgs?.trim() || m.args.join(" ");

  if (!text) {
    return m.reply(
      `📝 *sᴇᴛ ᴡᴇʟᴄᴏᴍᴇ*\n\n` +
        `╭┈┈⬡「 📋 *ᴘʟᴀᴄᴇʜᴏʟᴅᴇʀ* 」\n` +
        `┃ ◦ \`{user}\` - Nombre miembro\n` +
        `┃ ◦ \`{number}\` - Nomor miembro\n` +
        `┃ ◦ \`{group}\` - Nombre grupo\n` +
        `┃ ◦ \`{desc}\` - Deskripsi grupo\n` +
        `┃ ◦ \`{count}\` - Jumlah miembro\n` +
        `┃ ◦ \`{owner}\` - Nombre owner grupo\n` +
        `┃ ◦ \`{date}\` - Tanggal (DD/MM/YYYY)\n` +
        `┃ ◦ \`{time}\` - Tiempo (HH:mm WIB)\n` +
        `┃ ◦ \`{day}\` - Hari (Senin, Selasa, dll)\n` +
        `┃ ◦ \`{bot}\` - Nombre bot\n` +
        `┃ ◦ \`{prefix}\` - Prefix bot\n` +
        `╰┈┈⬡\n\n` +
        `\`Ejemplo:\`\n` +
        `\`${m.prefix}setwelcome Halo {user}! 👋\`\n` +
        `\`Selamat datang di {group} pada {day}, {date}\``,
    );
  }

  db.setGroup(m.chat, { welcomeMsg: text, welcome: true });
  db.save();

  m.react("✅");

  await m.reply(
    `✅ Welcome correctamente di set menjadi *${text}*\nMau reset? ketik ${m.prefix}resetwelcome`,
  );
}

export { pluginConfig as config, handler };
