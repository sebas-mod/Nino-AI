import { getDatabase } from "../../src/lib/ourin-database.js";
const pluginConfig = {
  name: "setgoodbye",
  alias: ["customgoodbye"],
  category: "group",
  description: "Establece un mensaje de despedida personalizado",
  usage: ".setgoodbye <mensaje>",
  example: ".setgoodbye Bye {user}, sampai jumpa lagi!",
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
  const text = m.text || m.args.join(" ");

  if (!text) {
    return m.reply(
      `📝 *sᴇᴛ ɢᴏᴏᴅʙʏᴇ*\n\n` +
        `╭┈┈⬡「 📋 *ᴘʟᴀᴄᴇʜᴏʟᴅᴇʀ* 」\n` +
        `┃ ◦ \`{user}\` - Nombre miembro\n` +
        `┃ ◦ \`{number}\` - Nomor miembro\n` +
        `┃ ◦ \`{group}\` - Nombre grupo\n` +
        `┃ ◦ \`{desc}\` - Deskripsi grupo\n` +
        `┃ ◦ \`{count}\` - Quedan miembro\n` +
        `┃ ◦ \`{owner}\` - Nombre owner grupo\n` +
        `┃ ◦ \`{date}\` - Tanggal (DD/MM/YYYY)\n` +
        `┃ ◦ \`{time}\` - Tiempo (HH:mm WIB)\n` +
        `┃ ◦ \`{day}\` - Hari (Senin, Selasa, dll)\n` +
        `┃ ◦ \`{bot}\` - Nombre bot\n` +
        `┃ ◦ \`{prefix}\` - Prefix bot\n` +
        `╰┈┈⬡\n\n` +
        `\`Ejemplo:\`\n` +
        `\`${m.prefix}setgoodbye Bye {user}! 👋\`\n` +
        `\`Sampai jumpa lagi pada {day}, {date}\``,
    );
  }

  db.setGroup(m.chat, { goodbyeMsg: text, goodbye: true, leave: true });
  db.save();

  m.react("✅");

  await m.reply(
    `✅ Goodbye correctamente di set menjadi *${text}*\nMau reset? ketik ${m.prefix}resetgoodbye`,
  );
}

export { pluginConfig as config, handler };
