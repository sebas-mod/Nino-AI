import axios from 'axios'
import config from '../../config.js'
import { uploadTo0x0 } from '../../src/lib/ourin-tmpfiles.js'
import te from '../../src/lib/ourin-error.js'
const pluginConfig = {
    name: 'fakeff2',
    alias: ['fakefreefire2'],
    category: 'canvas',
    description: 'Crea una imagen de FF',
    usage: '.fakeff2 <texto>',
    example: '.fakeff2 nombre1',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 10,
    energi: 1,
    isEnabled: true
}

async function handler(m, { sock }) {
    const nama = m.text
    if(!nama) {
        return m.reply(`*FAKE FF 2*\n\n> Ejemplo: ${m.prefix}fakeff nombre1`)
    }
    m.react('🕕')
    
    try {
        await sock.sendMedia(m.chat, `https://api.ourin.my.id/api/fake-free-fire-2?text=${encodeURIComponent(nama)}&bg=random`, null, m, {
            type: 'image',
        })
        
        m.react('✅')
        
    } catch (error) {
        m.react('☢')
        m.reply(te(m.prefix, m.command, m.pushName))
    }
}

export { pluginConfig as config, handler }
