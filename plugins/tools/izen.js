import fetch from "node-fetch";
import te from "../../src/lib/ourin-error.js";

const pluginConfig = {
  name: "izen",
  alias: ["skiplink", "izen"],
  category: "tools",
  description: "Bypass de shortlink / skiplink usando izen",
  usage: ".izen link",
  example: ".izen https://sfl.gl/xxxxx",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 5,
  energi: 1,
  isEnabled: true,
};

async function handler(m, { args, sock }) {
  if (!args[0]) {
    let txt = `🔗 *SKIPLINK BYPASS* 🔗\n\n`;
    txt += `Hola, ¿tienes un enlace complicado con anuncios? Te ayudo a saltarlo para ir directo al destino final.\n\n`;
    txt += `*Modo de uso:*\n`;
    txt += `👉 \`${m.prefix}izen <link>\`\n\n`;
    txt += `*Ejemplo:*\n`;
    txt += `👉 \`${m.prefix}izen https://sfl.gl/xxxxx\``;
    return m.reply(txt);
  }

  await m.react("⏳");
  
  try {
    const res = await fetch(`https://anabot.my.id/api/tools/izenLOL?url=${encodeURIComponent(args[0])}&apikey=freeApikey`);
    const json = await res.json();
    
    if (!json.data?.result?.result) {
       return m.reply("❌ No se pudo saltar ese enlace. Prueba con otro.");
    }
    
    let txt = `✅ *¡ENLACE SALTADO CORRECTAMENTE!* ✅\n\n`;
    txt += `*Enlace original:* \n`;
    txt += `🔗 ${args[0]}\n\n`;
    txt += `*Resultado del bypass:* \n`;
    txt += `🚀 ${json.data.result.result}\n\n`;
    txt += `Espero que te ayude. ✨`;
    
    await m.reply(txt);
    await m.react("✅");
  } catch (e) {
    m.reply(`❌ Lo siento, ocurrió un error del sistema. 😭\nError: ${e.message}`);
  }
}

export { pluginConfig as config, handler };
