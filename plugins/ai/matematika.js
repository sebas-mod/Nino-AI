import { f } from '../../src/lib/ourin-http.js'
import te from '../../src/lib/ourin-error.js'
import axios from 'axios'
import config from '../../config.js'
const pluginConfig = {
    name: 'matematika',
    alias: ['mathgpt', 'math', 'mathsolver'],
    category: 'ai',
    description: 'IA para resolver problemas de matemáticas',
    usage: '.matematika <problema> o responde a una imagen del problema',
    example: '.matematika ¿cuánto es 2+2?',
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
        return m.reply(`📐 *ᴍᴀᴛʜ ɢᴘᴛ*\n\n> Ingresa un problema de matemáticas\n\n\`Ejemplo: ${m.prefix}matematika ¿cuánto es 2+2?\``)
    }
    
    m.react('🕕')
    
    try {
        let url = `https://api.covenant.sbs/api/ai/mathgpt?question=${encodeURIComponent(text || 'solve this')}`
        const data = await axios.get(url, {
            headers: {
                'x-api-key': config.APIkey.covenant
            }
        })

        const answer = data.data.data.result
        
        m.react('✅')
        await m.reply(`${answer}`)
        
    } catch (error) {
        m.react('☢')
        m.reply(te(m.prefix, m.command, m.pushName))
    }
}

export { pluginConfig as config, handler }