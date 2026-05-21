import axios from 'axios'
import te from '../../src/lib/ourin-error.js'
const pluginConfig = {
    name: 'spamngl',
    alias: [],
    category: 'tools',
    description: 'Enviar NGL Spam',
    usage: '.spamngl <url> | <text> | <jumlah>',
    example: '.spamngl https://ngl.link/xxxx | hai | 10',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

async function handler(m, { sock }) {
    const text = m.text?.split('|')
    const [ link, kata, jumlah ] = text
    if(!link) return m.reply(`*¿DÓNDE ESTÁ EL LINK NGL?*\nEjemplo: \`${m?.prefix}spamngl https://ngl.link/xxxx | hai | 10`)
    if(!kata) return m.reply(`*¿DÓNDE ESTÁ EL TEXTO?*\n\nEjemplo: \`${m?.prefix}spamngl https://ngl.link/xxxx | hai | 10`)
    if(!jumlah) return m.reply(`*¿DÓNDE ESTÁ LA CANTIDAD?*\n\nEjemplo: \`${m?.prefix}spamngl https://ngl.link/xxxx | hai | 10`)
    if(isNaN(jumlah)) return m.reply(`*LA CANTIDAD DEBE SER UN NÚMERO*\n\nEjemplo: \`${m?.prefix}spamngl https://ngl.link/xxxx | hai | 10`)
    m.react('🎴')
    
    try {
        for(let i = 0; i < jumlah; i++) {
            axios.get(`https://api.cuki.biz.id/api/tools/sendngl?apikey=cuki-x&link=${encodeURIComponent(link)}&text=${encodeURIComponent(kata)}`, {
                timeout: 30000
            })
            await new Promise(resolve => setTimeout(resolve, 4000))
        }
        await m.react('✅')
        await sock.sendMessage(m.chat, {
            text: `✅ *DONE*\n\nSpam de mensajes NGL enviado correctamente!\nObjetivo: ${link}\nMensaje: ${kata} (${jumlah}x)`
        }, { quoted: m })
        
    } catch (error) {
        m.react('☢')
        m.reply(te(m.prefix, m.command, m.pushName))
    }
}

export { pluginConfig as config, handler }