import { f } from '../../src/lib/ourin-http.js'
import config from '../../config.js'
import te from '../../src/lib/ourin-error.js'
const pluginConfig = {
    name: 'anime-gen',
    alias: ['animegen', 'aianimegen', 'genai-anime'],
    category: 'ai',
    description: 'Genera arte anime con IA desde un prompt',
    usage: '.anime-gen <prompt>',
    example: '.anime-gen chica, colores vibrantes, sonriendo',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 30,
    energi: 1,
    isEnabled: true
}

async function handler(m, { sock }) {
    const prompt = m.text
    
    if (!prompt) {
        return m.reply(
            `🎨 *ᴀɴɪᴍᴇ ᴀʀᴛ ɢᴇɴᴇʀᴀᴛᴏʀ*\n\n` +
            `> Genera imágenes anime con IA desde un prompt.\n\n` +
            `*ᴄᴀʀᴀ ᴘᴀᴋᴀɪ:*\n` +
            `> \`${m.prefix}anime-gen <descripción>\`\n\n` +
            `*ᴄᴏɴᴛᴏʜ:*\n` +
            `> \`${m.prefix}anime-gen chica, colores vibrantes, sonriendo, cabello degradado amarillo y rosa\`\n` +
            `> \`${m.prefix}anime-gen chico, estética oscura, cabello plateado, ojos rojos\`\n\n` +
            `*ᴛɪᴘs:*\n` +
            `> • Usa inglés para mejores resultados\n` +
            `> • Cuanto más detallado el prompt, mejor el resultado\n` +
            `> • Agrega estilo: vibrant, dark, pastel, etc.`
        )
    }
    
    m.react('🕕')

    try {
        const NEOXR_APIKEY = config.APIkey?.neoxr || 'Milik-Bot-OurinMD'
        const apiUrl = `https://api.neoxr.eu/api/ai-anime?q=${encodeURIComponent(prompt)}&apikey=${NEOXR_APIKEY}`
        
        const data = await f(apiUrl)
        
        if (!data?.status || !data?.data?.url) {
            m.react('❌')
            return m.reply('❌ *ɢᴀɢᴀʟ*\n\n> No se pudo generar la imagen. Inténtalo más tarde.')
        }
        
        const result = data.data  
        await sock.sendMedia(m.chat, result.url, null, m, {
            type: 'image'
        })
        m.react('✅')
    } catch (error) {
        m.react('☢')
        if (error.code === 'ECONNABORTED') {
            m.reply('⏱️ *ᴛɪᴍᴇᴏᴜᴛ*\n\n> La solicitud tardó demasiado. Inténtalo de nuevo.')
        } else {
            m.reply(te(m.prefix, m.command, m.pushName))
        }
    }
}

export { pluginConfig as config, handler }