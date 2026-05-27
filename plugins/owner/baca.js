const pluginConfig = {
  name: ["baca", "read", "markread"],
  alias: [],
  category: "owner",
  description: "Marcar mensaje como leido",
  usage: ".baca",
  example: ".baca",
  isOwner: true,
  cooldown: 3,
  energi: 0,
  isEnabled: true,
};

async function handler(m, { sock }) {
  try {
    await sock.readMessages([m.key]);
    await m.react("✅");
    return m.reply("📖 *Mensaje marcado como leido*");
  } catch (err) {
    return m.reply(`❌ Fallidos: ${err.message}`);
  }
}

export { pluginConfig as config, handler };
