import axios from 'axios'
import config from '../../config.js'
import te from '../../src/lib/ourin-error.js'
const pluginConfig = {
    name: 'bratvid2',
    alias: ['bratv2'],
    category: 'sticker',
    description: 'Genera un video brat v2',
    usage: '.bratvid2 <texto>',
    example: '.bratvid2 hola mundo',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 10,
    energi: 1,
    isEnabled: true
}

async function handler(m, { sock }) {
    const text = m.args.join(' ')
    
    if (!text) {
        return m.reply(`🎬 *ʙʀᴀᴛ ᴠɪᴅᴇᴏ ᴠ2*\n\n> Ingresa el texto\n\n\`Ejemplo: ${m.prefix}bratvid2 hola mundo\``)
    }
    
    m.react('🕕')
    
    try {
        const url = `https://api-faa.my.id/faa/bratvid?text=${encodeURIComponent(text)}`
        await sock.sendVideoAsSticker(m.chat, url, m, {
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