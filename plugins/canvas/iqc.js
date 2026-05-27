import axios from 'axios'
import te from '../../src/lib/ourin-error.js'
import moment from 'moment-timezone'

const pluginConfig = {
    name: 'iqc',
    alias: ['iqchat', 'iphonechat'],
    category: 'canvas',
    description: 'Crea una imagen de chat estilo iPhone',
    usage: '.iqc <texto>',
    example: '.iqc Hola linda',
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
        return m.reply(`📱 *ɪǫᴄ ᴄʜᴀᴛ*\n\n> Ingresa texto para el chat\n\n\`Ejemplo: ${m.prefix}iqc Hola linda\``)
    }
    
    m.react('🕕')
    
    try {
        const now = new Date()
        const time = moment(now).tz("Asia/Jakarta").format("HH:mm")

        await sock.sendMedia(m.chat, `https://brat.siputzx.my.id/iphone-quoted?time=${encodeURIComponent(time)}&messageText=${encodeURIComponent(text)}`, null, m, {
            type: 'image',
        })
        
        m.react('✅')
        
    } catch (error) {
        m.react('☢')
        m.reply(te(m.prefix, m.command, m.pushName))
    }
}

export { pluginConfig as config, handler }
