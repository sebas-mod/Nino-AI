const pluginConfig = {
  name: ["buatsaluran", "createsaluran", "createnewsletter"],
  alias: [],
  category: "owner",
  description: "Crear canal/newsletter nuevo",
  usage: ".buatsaluran <nombre>|<descripcion>",
  example: ".buatsaluran Info Bot|Ultima actualizacion de nuestro bot",
  isOwner: true,
  cooldown: 5,
  energi: 0,
  isEnabled: true,
};

async function handler(m, { sock }) {
  const text = m.text?.trim() || "";
  const pipeIdx = text.indexOf("|");

  let name, description;
  if (pipeIdx === -1) {
    name = text;
    description = "";
  } else {
    name = text.substring(0, pipeIdx).trim();
    description = text.substring(pipeIdx + 1).trim();
  }

  if (!name || name.length < 2) {
    return m.reply(
      "📢 *ʙᴜᴀᴛ sᴀʟᴜʀᴀɴ*\n\n" +
        "> `.buatsaluran Nombre del canal`\n" +
        "> `.buatsaluran Nombre|Descripcion`\n\n" +
        "📝 Ejemplo:\n" +
        "> `.buatsaluran Info Bot`\n" +
        "> `.buatsaluran Info Bot|Ultima actualizacion de nuestro bot`",
    );
  }

  try {
    const result = await sock.newsletterCreate(name, description || undefined);
    const saluranId = result?.id || result?.thread_metadata?.id || "unknown";
    const saluranName = result?.name || name;
    await m.react("✅");
    return m.reply(
      `📢 *sᴀʟᴜʀᴀɴ ᴅɪʙᴜᴀᴛ*\n\n` +
        `> Nombre: ${saluranName}\n` +
        (description ? `> Deskripsi: ${description}\n` : "") +
        `> ID: ${saluranId}\n` +
        `> Subscribers: ${result?.subscribers || 0}\n\n` +
        `_Saluran ini bisa dikonfigurasi di config.saluran.id_`,
    );
  } catch (err) {
    return m.reply(`❌ Fallo: crear canal: ${err.message}`);
  }
}

export { pluginConfig as config, handler };
