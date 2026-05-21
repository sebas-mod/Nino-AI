
import config from '../../config.js'
import te from '../../src/lib/ourin-error.js'

const pluginConfig = {
    name: 'brathd',
    alias: ['brathdsticker', 'brathds'],
    category: 'sticker',
    description: 'Crea un sticker brat HD',
    usage: '.brathd <texto>',
    example: '.brathd hola mundo',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 10,
    energi: 1,
    isEnabled: true
}

async function handler(m, { sock }) {
    const text = m.text
    
    if (!text) {
        return m.reply(`🖼️ *ʙʀᴀᴛ ʜᴅ sᴛɪᴄᴋᴇʀ*\n\n> Ingresa el texto\n\n\`Ejemplo: ${m.prefix}brathd hola mundo\``)
    }
    
    m.react('🕕')
    
    try {
        const url = `https://api.ourin.my.id/api/brat-hd?text=${encodeURIComponent(text)}`
        await sock.sendImageAsSticker(m.chat, url, m, {
            packname: config.sticker.packname,
            author: config.sticker.author
        })
        m.react('✅')
    } catch (error) {
        m.react('☢')
        m.reply(te(m.prefix, m.command, m.pushName))
    }
}

export { pluginConfig as config, handler }